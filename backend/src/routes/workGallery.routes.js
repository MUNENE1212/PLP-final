const express = require('express');
const { body } = require('express-validator');
const {
  addWorkGalleryImage,
  updateWorkGalleryImage,
  deleteWorkGalleryImage,
  reorderGalleryImages,
  getTechnicianGallery,
  setBeforeAfterPair,
  getMyGallery
} = require('../controllers/workGallery.controller');
const { protect, authorize } = require('../middleware/auth');
const { uploadWorkGalleryImage, handleMulterError } = require('../middleware/upload');
const { validate } = require('../middleware/validation');

const router = express.Router();

// ===== PUBLIC ROUTES =====

/**
 * @route   GET /api/v1/work-gallery/technician/:technicianId
 * @desc    Get technician's work gallery (public)
 * @access  Public
 */
router.get('/technician/:technicianId', getTechnicianGallery);

// ===== PRIVATE ROUTES =====

/**
 * @route   GET /api/v1/work-gallery/my-gallery
 * @desc    Get current user's work gallery
 * @access  Private (technician)
 */
router.get('/my-gallery', protect, authorize('technician'), getMyGallery);

/**
 * @route   POST /api/v1/work-gallery
 * @desc    Add work gallery image
 * @access  Private (technician)
 */
router.post(
  '/',
  protect,
  authorize('technician'),
  uploadWorkGalleryImage,
  handleMulterError,
  [
    body('category')
      .isIn(['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'])
      .withMessage('Invalid category'),
    body('caption')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Caption must be 500 characters or less'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Location must be 200 characters or less'),
    body('isBeforeAfter')
      .optional()
      .isBoolean()
      .withMessage('isBeforeAfter must be a boolean'),
    body('pairId')
      .optional()
      .isMongoId()
      .withMessage('Invalid pairId format'),
    validate
  ],
  addWorkGalleryImage
);

/**
 * @route   PUT /api/v1/work-gallery/:imageId
 * @desc    Update work gallery image metadata
 * @access  Private (technician)
 */
router.put(
  '/:imageId',
  protect,
  authorize('technician'),
  [
    body('caption')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Caption must be 500 characters or less'),
    body('category')
      .optional()
      .isIn(['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'])
      .withMessage('Invalid category'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Location must be 200 characters or less'),
    body('isBeforeAfter')
      .optional()
      .isBoolean()
      .withMessage('isBeforeAfter must be a boolean'),
    body('pairId')
      .optional()
      .isMongoId()
      .withMessage('Invalid pairId format'),
    validate
  ],
  updateWorkGalleryImage
);

/**
 * @route   DELETE /api/v1/work-gallery/:imageId
 * @desc    Delete work gallery image
 * @access  Private (technician)
 */
router.delete(
  '/:imageId',
  protect,
  authorize('technician'),
  deleteWorkGalleryImage
);

/**
 * @route   PUT /api/v1/work-gallery/reorder
 * @desc    Reorder work gallery images
 * @access  Private (technician)
 */
router.put(
  '/reorder',
  protect,
  authorize('technician'),
  [
    body('imageIds')
      .isArray({ min: 1, max: 5 })
      .withMessage('imageIds must be an array with 1-5 elements'),
    body('imageIds.*')
      .isMongoId()
      .withMessage('Each imageId must be a valid MongoDB ID'),
    validate
  ],
  reorderGalleryImages
);

/**
 * @route   POST /api/v1/work-gallery/before-after
 * @desc    Set before/after pair for images
 * @access  Private (technician)
 */
router.post(
  '/before-after',
  protect,
  authorize('technician'),
  [
    body('beforeId')
      .isMongoId()
      .withMessage('Invalid beforeId format'),
    body('afterId')
      .isMongoId()
      .withMessage('Invalid afterId format'),
    validate
  ],
  setBeforeAfterPair
);

module.exports = router;
