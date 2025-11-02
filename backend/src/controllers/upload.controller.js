const cloudinaryService = require('../services/cloudinary.service');
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

    // Upload to Cloudinary
    const fileData = {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    };

    // Upload with optimizations
    const uploadResult = await cloudinaryService.uploadOptimizedImage(
      fileData,
      'profile-pictures',
      {
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      }
    );

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
        publicId: uploadResult.publicId,
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

    // Upload all files to Cloudinary
    const fileDataArray = req.files.map(file => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));

    const uploadResults = await cloudinaryService.uploadMultipleFiles(
      fileDataArray,
      'posts'
    );

    // Format results
    const mediaUrls = uploadResults.map(result => ({
      url: result.url,
      publicId: result.publicId,
      type: result.resourceType === 'video' ? 'video' : 'image',
      width: result.width,
      height: result.height,
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

    // Upload files to Cloudinary
    const fileDataArray = req.files.map(file => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }));

    const uploadResults = await cloudinaryService.uploadMultipleFiles(
      fileDataArray,
      'bookings'
    );

    // Format results
    const photos = uploadResults.map(result => ({
      url: result.url,
      publicId: result.publicId,
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
 * Delete file from Cloudinary
 */
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    await cloudinaryService.deleteFile(publicId, resourceType);

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
    const isConfigured = cloudinaryService.isConfigured();

    res.status(200).json({
      success: true,
      data: {
        provider: 'cloudinary',
        configured: isConfigured,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
        hasCredentials: !!(process.env.CLOUDINARY_CLOUD_NAME &&
                           process.env.CLOUDINARY_API_KEY &&
                           process.env.CLOUDINARY_API_SECRET),
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
