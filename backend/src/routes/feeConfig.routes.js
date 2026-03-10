/**
 * Fee Configuration Routes
 *
 * Routes for admin fee configuration management.
 * All routes require admin authentication.
 *
 * @module routes/feeConfig
 */

const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');
const {
  getFeeConfig,
  updateFeeConfig,
  previewFee,
  validateTiers,
} = require('../controllers/feeConfig.controller');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

/**
 * @route GET /api/v1/admin/fee-config
 * @desc Get current fee configuration
 * @access Admin
 */
router.get('/', getFeeConfig);

/**
 * @route PUT /api/v1/admin/fee-config
 * @desc Update fee configuration
 * @access Admin
 */
router.put(
  '/',
  [
    body('bookingFeeTiers')
      .optional()
      .isArray()
      .withMessage('bookingFeeTiers must be an array'),
    body('bookingFeeTiers.*.label')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Tier label is required'),
    body('bookingFeeTiers.*.minAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('minAmount must be a non-negative number'),
    body('bookingFeeTiers.*.maxAmount')
      .optional()
      .custom((value) => value === null || typeof value === 'number')
      .withMessage('maxAmount must be a number or null'),
    body('bookingFeeTiers.*.percentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Percentage must be between 0 and 100'),
    body('bookingFeeTiers.*.isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('defaultBookingFeePercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Default booking fee percentage must be between 0 and 100'),
    validate,
  ],
  updateFeeConfig
);

/**
 * @route POST /api/v1/admin/fee-config/calculate-preview
 * @desc Preview fee calculation for an amount
 * @access Admin
 */
router.post(
  '/calculate-preview',
  [
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a non-negative number'),
    validate,
  ],
  previewFee
);

/**
 * @route POST /api/v1/admin/fee-config/validate
 * @desc Validate tier configuration without saving
 * @access Admin
 */
router.post(
  '/validate',
  [
    body('bookingFeeTiers')
      .isArray()
      .withMessage('bookingFeeTiers must be an array'),
    validate,
  ],
  validateTiers
);

module.exports = router;
