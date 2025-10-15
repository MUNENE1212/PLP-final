const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadMultipleImages,
  uploadVideo,
  uploadMedia,
  deleteFile,
  deleteMultipleFiles,
  getFileDetails,
  generateUploadSignature,
  getOptimizedImageUrl,
  uploadProfilePicture
} = require('../controllers/media.controller');
const { protect } = require('../middleware/auth');
const {
  uploadSingleImage,
  uploadMultipleImages: uploadMultipleImagesMiddleware,
  uploadSingleVideo,
  uploadMedia: uploadMediaMiddleware,
  uploadProfilePicture: uploadProfilePictureMiddleware,
  handleMulterError
} = require('../middleware/upload');

// ===== UPLOAD ROUTES =====

/**
 * @route   POST /api/v1/media/upload/image
 * @desc    Upload single image
 * @access  Private
 * @body    { folder: String (optional) }
 * @formData image: File (required)
 */
router.post(
  '/upload/image',
  protect,
  uploadSingleImage,
  handleMulterError,
  uploadImage
);

/**
 * @route   POST /api/v1/media/upload/images
 * @desc    Upload multiple images (up to 10)
 * @access  Private
 * @body    { folder: String (optional) }
 * @formData images: File[] (required, max 10 files)
 */
router.post(
  '/upload/images',
  protect,
  uploadMultipleImagesMiddleware,
  handleMulterError,
  uploadMultipleImages
);

/**
 * @route   POST /api/v1/media/upload/video
 * @desc    Upload single video
 * @access  Private
 * @body    { folder: String (optional) }
 * @formData video: File (required)
 */
router.post(
  '/upload/video',
  protect,
  uploadSingleVideo,
  handleMulterError,
  uploadVideo
);

/**
 * @route   POST /api/v1/media/upload/media
 * @desc    Upload mixed media (images and videos, up to 10 files)
 * @access  Private
 * @body    { folder: String (optional) }
 * @formData media: File[] (required, max 10 files)
 */
router.post(
  '/upload/media',
  protect,
  uploadMediaMiddleware,
  handleMulterError,
  uploadMedia
);

/**
 * @route   POST /api/v1/media/upload/profile-picture
 * @desc    Upload profile picture (updates user profile)
 * @access  Private
 * @formData profilePicture: File (required)
 */
router.post(
  '/upload/profile-picture',
  protect,
  uploadProfilePictureMiddleware,
  handleMulterError,
  uploadProfilePicture
);

// ===== DELETE ROUTES =====

/**
 * @route   DELETE /api/v1/media/:publicId
 * @desc    Delete single file from Cloudinary
 * @access  Private
 * @params  publicId: String (URL encoded Cloudinary public ID)
 * @query   resourceType: String (optional, default: 'image', values: 'image' | 'video')
 * @example DELETE /api/v1/media/baitech%2Fimages%2Ffile123?resourceType=image
 */
router.delete('/:publicId', protect, deleteFile);

/**
 * @route   POST /api/v1/media/delete-multiple
 * @desc    Delete multiple files from Cloudinary
 * @access  Private
 * @body    { publicIds: String[], resourceType: String (optional) }
 */
router.post('/delete-multiple', protect, deleteMultipleFiles);

// ===== INFO ROUTES =====

/**
 * @route   GET /api/v1/media/:publicId/details
 * @desc    Get file details from Cloudinary
 * @access  Private
 * @params  publicId: String (URL encoded Cloudinary public ID)
 * @query   resourceType: String (optional, default: 'image', values: 'image' | 'video')
 */
router.get('/:publicId/details', protect, getFileDetails);

// ===== UTILITY ROUTES =====

/**
 * @route   POST /api/v1/media/generate-signature
 * @desc    Generate signed upload URL for direct client uploads
 * @access  Private
 * @body    { folder: String (optional), resourceType: String (optional) }
 * @info    Use this to allow clients to upload directly to Cloudinary
 */
router.post('/generate-signature', protect, generateUploadSignature);

/**
 * @route   POST /api/v1/media/optimize-url
 * @desc    Generate optimized image URL with transformations
 * @access  Public
 * @body    { publicId: String, width: Number, height: Number, crop: String, quality: String, format: String }
 * @info    Useful for getting responsive image URLs
 */
router.post('/optimize-url', getOptimizedImageUrl);

module.exports = router;
