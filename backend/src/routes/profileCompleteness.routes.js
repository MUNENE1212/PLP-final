/**
 * Profile Completeness Routes
 *
 * Routes for managing technician profile completeness.
 * Includes score tracking, suggestions, and recalculation.
 */

const express = require('express');
const router = express.Router();

const {
  getCompleteness,
  recalculateCompleteness,
  getSuggestions,
  getMissingItems,
  getSectionCompleteness,
  getStatistics,
  batchRecalculate,
  getPublicCompleteness
} = require('../controllers/profileCompleteness.controller');

const { protect, authorize } = require('../middleware/auth');

// ===== PUBLIC ROUTES =====

/**
 * @route GET /api/v1/profile/completeness/public/:userId
 * @desc Get public profile completeness (limited data for badges)
 * @access Public
 */
router.get('/public/:userId', getPublicCompleteness);

// ===== PROTECTED ROUTES (Technician) =====

/**
 * @route GET /api/v1/profile/completeness
 * @desc Get user's completeness score
 * @access Private (Technician)
 */
router.get(
  '/',
  protect,
  getCompleteness
);

/**
 * @route POST /api/v1/profile/completeness/recalculate
 * @desc Recalculate completeness score
 * @access Private (Technician)
 */
router.post(
  '/recalculate',
  protect,
  recalculateCompleteness
);

/**
 * @route GET /api/v1/profile/completeness/suggestions
 * @desc Get suggestions for profile improvement
 * @access Private (Technician)
 */
router.get(
  '/suggestions',
  protect,
  getSuggestions
);

/**
 * @route GET /api/v1/profile/completeness/missing
 * @desc Get missing items checklist
 * @access Private (Technician)
 */
router.get(
  '/missing',
  protect,
  getMissingItems
);

/**
 * @route GET /api/v1/profile/completeness/sections/:section
 * @desc Get completeness by section
 * @access Private (Technician)
 */
router.get(
  '/sections/:section',
  protect,
  getSectionCompleteness
);

// ===== ADMIN ROUTES =====

/**
 * @route GET /api/v1/profile/completeness/admin/statistics
 * @desc Get completeness statistics
 * @access Private (Admin)
 */
router.get(
  '/admin/statistics',
  protect,
  authorize('admin'),
  getStatistics
);

/**
 * @route POST /api/v1/profile/completeness/admin/batch-recalculate
 * @desc Batch recalculate for multiple users
 * @access Private (Admin)
 */
router.post(
  '/admin/batch-recalculate',
  protect,
  authorize('admin'),
  batchRecalculate
);

module.exports = router;
