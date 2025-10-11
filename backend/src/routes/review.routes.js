const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  markHelpful,
  addResponse
} = require('../controllers/review.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getReviews);
router.get('/:id', optionalAuth, getReview);

// Protected routes
router.post(
  '/',
  protect,
  [
    body('booking').isMongoId().withMessage('Valid booking ID is required'),
    body('reviewee').isMongoId().withMessage('Valid reviewee ID is required'),
    body('rating')
      .isFloat({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('title').trim().notEmpty().withMessage('Review title is required'),
    body('comment').trim().notEmpty().withMessage('Review comment is required'),
    validate
  ],
  createReview
);

router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

router.post('/:id/helpful', protect, markHelpful);

router.post(
  '/:id/response',
  protect,
  [
    body('text').trim().notEmpty().withMessage('Response text is required'),
    validate
  ],
  addResponse
);

module.exports = router;
