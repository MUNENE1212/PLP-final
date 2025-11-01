const googleDriveService = require('../services/googleDrive.service');
const multer = require('multer');
const User = require('../models/User');
const Post = require('../models/Post');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and videos only
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only image and video files are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

/**
 * Upload profile picture
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Upload to Google Drive
    const fileData = {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    };

    const uploadResult = await googleDriveService.uploadFile(fileData, 'profile-pictures');

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: uploadResult.url },
      { new: true, select: '-password' }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
        user: user,
      },
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile picture',
    });
  }
};

/**
 * Upload post media (images/videos)
 */
exports.uploadPostMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Upload all files to Google Drive
    const fileDataArray = req.files.map(file => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));

    const uploadResults = await googleDriveService.uploadMultipleFiles(
      fileDataArray,
      'post-media'
    );

    // Format results
    const mediaUrls = uploadResults.map(result => ({
      url: result.url,
      fileId: result.fileId,
      type: result.mimeType.startsWith('video/') ? 'video' : 'image',
    }));

    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        media: mediaUrls,
        count: mediaUrls.length,
      },
    });
  } catch (error) {
    console.error('Error uploading post media:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload media',
    });
  }
};

/**
 * Upload booking/work photos
 */
exports.uploadBookingPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const { bookingId } = req.params;

    // Upload files to Google Drive
    const fileDataArray = req.files.map(file => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));

    const uploadResults = await googleDriveService.uploadMultipleFiles(
      fileDataArray,
      `bookings/${bookingId}`
    );

    // Format results
    const photos = uploadResults.map(result => ({
      url: result.url,
      fileId: result.fileId,
      uploadedAt: new Date(),
      uploadedBy: req.user.id,
    }));

    res.status(200).json({
      success: true,
      message: 'Photos uploaded successfully',
      data: {
        photos: photos,
        count: photos.length,
      },
    });
  } catch (error) {
    console.error('Error uploading booking photos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload photos',
    });
  }
};

/**
 * Delete file from Google Drive
 */
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required',
      });
    }

    await googleDriveService.deleteFile(fileId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete file',
    });
  }
};

/**
 * Get upload configuration status
 */
exports.getUploadConfig = async (req, res) => {
  try {
    const isConfigured = googleDriveService.isConfigured();

    res.status(200).json({
      success: true,
      data: {
        provider: 'google-drive',
        configured: isConfigured,
        folderId: googleDriveService.folderId || 'NOT_SET',
        initialized: googleDriveService.initialized,
        hasCredentials: !!process.env.GOOGLE_CREDENTIALS_JSON || !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
        maxFileSize: '10MB',
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'],
      },
    });
  } catch (error) {
    console.error('Error getting upload config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload configuration',
    });
  }
};

// Export multer middleware for use in routes
exports.uploadSingle = upload.single('file');
exports.uploadMultiple = upload.array('files', 10); // Max 10 files
