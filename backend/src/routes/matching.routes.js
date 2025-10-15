const express = require('express');
const { body, param } = require('express-validator');
const {
  findTechnicians,
  getMatching,
  getMyMatches,
  acceptMatch,
  rejectMatch,
  addMatchFeedback,
  getPreferences,
  updatePreferences,
  blockTechnician,
  unblockTechnician
} = require('../controllers/matching.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * POST /api/v1/matching/find-technicians
 * Find AI-matched technicians for a service request
 */
router.post(
  '/find-technicians',
  [
    body('serviceCategory')
      .isIn([
        'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
        'appliance_repair', 'hvac', 'locksmith', 'landscaping', 'roofing',
        'flooring', 'masonry', 'welding', 'pest_control', 'general_handyman', 'other'
      ])
      .withMessage('Valid service category is required'),
    body('location.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Location coordinates [longitude, latitude] are required'),
    body('location.coordinates.*')
      .isFloat()
      .withMessage('Coordinates must be numbers'),
    body('urgency')
      .optional()
      .isIn(['low', 'medium', 'high', 'emergency'])
      .withMessage('Invalid urgency level'),
    body('budget')
      .optional()
      .isNumeric()
      .withMessage('Budget must be a number'),
    validate
  ],
  findTechnicians
);

/**
 * GET /api/v1/matching/my-matches
 * Get user's active matches
 */
router.get('/my-matches', getMyMatches);

/**
 * GET /api/v1/matching/preferences
 * Get user's matching preferences
 */
router.get('/preferences', getPreferences);

/**
 * PUT /api/v1/matching/preferences
 * Update user's matching preferences
 */
router.put('/preferences', updatePreferences);

/**
 * GET /api/v1/matching/:id
 * Get specific matching details
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid matching ID is required'),
    validate
  ],
  getMatching
);

/**
 * POST /api/v1/matching/:id/accept
 * Accept a match and create booking
 */
router.post(
  '/:id/accept',
  [
    param('id').isMongoId().withMessage('Valid matching ID is required'),
    body('scheduledDate')
      .isISO8601()
      .withMessage('Valid scheduled date is required'),
    body('scheduledTime')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Valid time in HH:MM format is required'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('estimatedDuration')
      .optional()
      .isNumeric()
      .withMessage('Estimated duration must be a number'),
    validate
  ],
  acceptMatch
);

/**
 * POST /api/v1/matching/:id/reject
 * Reject a match
 */
router.post(
  '/:id/reject',
  [
    param('id').isMongoId().withMessage('Valid matching ID is required'),
    body('reason')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters'),
    validate
  ],
  rejectMatch
);

/**
 * POST /api/v1/matching/:id/feedback
 * Add feedback to a match
 */
router.post(
  '/:id/feedback',
  [
    param('id').isMongoId().withMessage('Valid matching ID is required'),
    body('helpful')
      .optional()
      .isBoolean()
      .withMessage('Helpful must be a boolean'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('accuracy')
      .optional()
      .isIn(['accurate', 'partially_accurate', 'inaccurate'])
      .withMessage('Invalid accuracy value'),
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Comment must be less than 500 characters'),
    validate
  ],
  addMatchFeedback
);

/**
 * POST /api/v1/matching/block/:technicianId
 * Block a technician from future matches
 */
router.post(
  '/block/:technicianId',
  [
    param('technicianId').isMongoId().withMessage('Valid technician ID is required'),
    body('reason')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters'),
    validate
  ],
  blockTechnician
);

/**
 * DELETE /api/v1/matching/block/:technicianId
 * Unblock a technician
 */
router.delete(
  '/block/:technicianId',
  [
    param('technicianId').isMongoId().withMessage('Valid technician ID is required'),
    validate
  ],
  unblockTechnician
);

module.exports = router;
