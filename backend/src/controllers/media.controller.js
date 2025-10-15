const mediaService = require('../services/media.service');

/**
 * @desc    Upload single image
 * @route   POST /api/v1/media/upload/image
 * @access  Private
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const options = {
      folder: req.body.folder || 'baitech/images'
    };

    const result = await mediaService.uploadImage(req.file, options);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image'
    });
  }
};

/**
 * @desc    Upload multiple images
 * @route   POST /api/v1/media/upload/images
 * @access  Private
 */
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const options = {
      folder: req.body.folder || 'baitech/images'
    };

    const results = await mediaService.uploadMultipleImages(req.files, options);

    res.status(201).json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images'
    });
  }
};

/**
 * @desc    Upload single video
 * @route   POST /api/v1/media/upload/video
 * @access  Private
 */
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }

    const options = {
      folder: req.body.folder || 'baitech/videos'
    };

    const result = await mediaService.uploadVideo(req.file, options);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading video'
    });
  }
};

/**
 * @desc    Upload mixed media (images and videos)
 * @route   POST /api/v1/media/upload/media
 * @access  Private
 */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one media file'
      });
    }

    const options = {
      folder: req.body.folder || 'baitech/media'
    };

    const results = await mediaService.uploadMedia(req.files, options);

    res.status(201).json({
      success: true,
      message: `${results.length} media files uploaded successfully`,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading media'
    });
  }
};

/**
 * @desc    Delete single file
 * @route   DELETE /api/v1/media/:publicId
 * @access  Private
 */
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Decode the public ID (it may be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await mediaService.deleteFile(decodedPublicId, resourceType);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting file'
    });
  }
};

/**
 * @desc    Delete multiple files
 * @route   POST /api/v1/media/delete-multiple
 * @access  Private
 */
exports.deleteMultipleFiles = async (req, res) => {
  try {
    const { publicIds, resourceType = 'image' } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of public IDs'
      });
    }

    const result = await mediaService.deleteMultipleFiles(publicIds, resourceType);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} files deleted successfully`,
      data: result
    });
  } catch (error) {
    console.error('Delete multiple files error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting files'
    });
  }
};

/**
 * @desc    Get file details
 * @route   GET /api/v1/media/:publicId/details
 * @access  Private
 */
exports.getFileDetails = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Decode the public ID
    const decodedPublicId = decodeURIComponent(publicId);

    const details = await mediaService.getFileDetails(decodedPublicId, resourceType);

    res.status(200).json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Get file details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching file details'
    });
  }
};

/**
 * @desc    Generate signed upload URL for direct client uploads
 * @route   POST /api/v1/media/generate-signature
 * @access  Private
 */
exports.generateUploadSignature = async (req, res) => {
  try {
    const { folder, resourceType } = req.body;

    const options = {
      folder: folder || `baitech/users/${req.user.id}`,
      ...(resourceType && { resource_type: resourceType })
    };

    const signature = mediaService.generateUploadSignature(options);

    res.status(200).json({
      success: true,
      data: signature
    });
  } catch (error) {
    console.error('Generate signature error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating upload signature'
    });
  }
};

/**
 * @desc    Get optimized image URL with transformations
 * @route   POST /api/v1/media/optimize-url
 * @access  Public
 */
exports.getOptimizedImageUrl = async (req, res) => {
  try {
    const { publicId, width, height, crop, quality, format } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const transformations = {};
    if (width) transformations.width = parseInt(width);
    if (height) transformations.height = parseInt(height);
    if (crop) transformations.crop = crop;
    if (quality) transformations.quality = quality;
    if (format) transformations.format = format;

    const optimizedUrl = mediaService.getOptimizedImageUrl(publicId, transformations);

    res.status(200).json({
      success: true,
      data: {
        url: optimizedUrl,
        transformations
      }
    });
  } catch (error) {
    console.error('Get optimized URL error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating optimized URL'
    });
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/v1/media/upload/profile-picture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const result = await mediaService.uploadProfilePicture(req.file);

    // Update user profile picture
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: result.url },
      { new: true }
    ).select('-password -twoFactorAuth');

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        ...result,
        user
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading profile picture'
    });
  }
};
