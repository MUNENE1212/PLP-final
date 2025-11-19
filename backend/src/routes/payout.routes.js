const express = require('express');
const {
  getPendingPayouts,
  getPayoutDetails,
  processPayout,
  batchProcessPayouts,
  getMyPayouts,
} = require('../controllers/payout.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/payments/payouts
 * @desc    Get all pending payouts
 * @access  Private (Admin/Finance)
 */
router.get(
  '/',
  protect,
  authorize('admin', 'finance', 'support'),
  getPendingPayouts
);

/**
 * @route   GET /api/v1/payments/payouts/my-payouts
 * @desc    Get technician's payout history
 * @access  Private (Technician)
 */
router.get('/my-payouts', protect, authorize('technician'), getMyPayouts);

/**
 * @route   GET /api/v1/payments/payouts/:id
 * @desc    Get payout details
 * @access  Private (Admin/Finance/Technician)
 */
router.get('/:id', protect, getPayoutDetails);

/**
 * @route   POST /api/v1/payments/payouts/:id/process
 * @desc    Process a single payout
 * @access  Private (Admin/Finance)
 */
router.post(
  '/:id/process',
  protect,
  authorize('admin', 'finance'),
  processPayout
);

/**
 * @route   POST /api/v1/payments/payouts/batch
 * @desc    Batch process multiple payouts
 * @access  Private (Admin/Finance)
 */
router.post(
  '/batch',
  protect,
  authorize('admin', 'finance'),
  batchProcessPayouts
);

module.exports = router;
