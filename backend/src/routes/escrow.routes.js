/**
 * Escrow Routes
 *
 * REST API routes for the platform escrow system.
 *
 * @module routes/escrow.routes
 */

const express = require('express');
const { body, query, param } = require('express-validator');

const escrowController = require('../controllers/escrow.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/v1/escrow/stats
 * @desc    Get escrow statistics
 * @access  Private (admin)
 */
router.get(
  '/stats',
  protect,
  authorize('admin'),
  escrowController.getEscrowStats
);

/**
 * @route   GET /api/v1/escrow/my-escrows
 * @desc    Get current user's escrows
 * @access  Private
 */
router.get(
  '/my-escrows',
  protect,
  [
    query('status').optional().isIn([
      'pending', 'funded', 'partial_release', 'released', 'refunded', 'disputed', 'cancelled'
    ]).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    validate
  ],
  escrowController.getMyEscrows
);

/**
 * @route   GET /api/v1/escrow
 * @desc    Get all escrows (admin/support)
 * @access  Private (admin, support)
 */
router.get(
  '/',
  protect,
  authorize('admin', 'support'),
  [
    query('status').optional().isIn([
      'pending', 'funded', 'partial_release', 'released', 'refuted', 'disputed', 'cancelled'
    ]).withMessage('Invalid status'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    validate
  ],
  escrowController.getAllEscrows
);

/**
 * @route   POST /api/v1/escrow
 * @desc    Create escrow (internal)
 * @access  Private (system, admin)
 */
router.post(
  '/',
  protect,
  authorize('admin', 'system'),
  [
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('customerId').isMongoId().withMessage('Valid customer ID is required'),
    body('technicianId').isMongoId().withMessage('Valid technician ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be positive'),
    body('milestones').optional().isArray().withMessage('Milestones must be an array'),
    validate
  ],
  escrowController.createEscrow
);

/**
 * @route   GET /api/v1/escrow/booking/:bookingId
 * @desc    Get escrow by booking ID
 * @access  Private
 */
router.get(
  '/booking/:bookingId',
  protect,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    validate
  ],
  escrowController.getEscrowByBooking
);

/**
 * @route   GET /api/v1/escrow/:id
 * @desc    Get escrow by ID
 * @access  Private
 */
router.get(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Valid escrow ID is required'),
    validate
  ],
  escrowController.getEscrow
);

/**
 * @route   POST /api/v1/escrow/:id/fund
 * @desc    Fund escrow (M-Pesa webhook)
 * @access  Private (webhook, system)
 */
router.post(
  '/:id/fund',
  protect,
  authorize('system', 'admin'),
  [
    param('id').isMongoId().withMessage('Valid escrow ID is required'),
    body('mpesaReference').notEmpty().withMessage('M-Pesa reference is required'),
    body('checkoutRequestID').optional().isString(),
    body('phoneNumber').optional().isString(),
    validate
  ],
  escrowController.fundEscrow
);

/**
 * @route   POST /api/v1/escrow/:id/release
 * @desc    Release escrow to technician
 * @access  Private (customer, admin, support)
 */
router.post(
  '/:id/release',
  protect,
  authorize('customer', 'corporate', 'admin', 'support'),
  [
    param('id').isMongoId().withMessage('Valid escrow ID is required'),
    body('notes').optional().isString(),
    body('mpesaReference').optional().isString(),
    validate
  ],
  escrowController.releaseEscrow
);

/**
 * @route   POST /api/v1/escrow/:id/release-milestone
 * @desc    Release milestone payment
 * @access  Private (customer, admin, support)
 */
router.post(
  '/:id/release-milestone',
  protect,
  authorize('customer', 'corporate', 'admin', 'support'),
  [
    param('id').isMongoId().withMessage('Valid escrow ID is required'),
    body('milestoneIndex').isInt({ min: 0 }).withMessage('Valid milestone index is required'),
    validate
  ],
  escrowController.releaseMilestone
);

/**
 * @route   POST /api/v1/escrow/:id/refund
 * @desc    Refund escrow to customer
 * @access  Private (admin, support)
 */
router.post(
  '/:id/refund',
  protect,
  authorize('admin', 'support'),
  [
    param('id').isMongoId().withMessage('Valid escrow ID is required'),
    body('reason').notEmpty().withMessage('Refund reason is required'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
    validate
  ],
  escrowController.refundEscrow
);

/**
 * @route   POST /api/v1/escrow/:id/dispute
 * @desc    Open dispute on escrow
 * @access  Private (customer, technician)
 */
router.post(
  '/:id/dispute',
  protect,
  [
    param('id').isMongoId().withMessage('Valid escrow ID is required'),
    body('reason').notEmpty().withMessage('Dispute reason is required'),
    body('description').optional().isString(),
    body('evidence').optional().isArray(),
    validate
  ],
  escrowController.openDispute
);

/**
 * @route   POST /api/v1/escrow/:id/resolve
 * @desc    Resolve dispute
 * @access  Private (admin)
 */
router.post(
  '/:id/resolve',
  protect,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Valid escrow ID is required'),
    body('resolution')
      .isIn(['customer_favor', 'technician_favor', 'split', 'no_action'])
      .withMessage('Valid resolution type is required'),
    body('splitRatio').optional().isObject(),
    body('splitRatio.customer').optional().isInt({ min: 0, max: 100 }),
    body('splitRatio.technician').optional().isInt({ min: 0, max: 100 }),
    body('notes').optional().isString(),
    validate
  ],
  escrowController.resolveDispute
);

/**
 * @route   POST /api/v1/escrow/process-auto-releases
 * @desc    Process auto-releases (cron job)
 * @access  Private (system, admin)
 */
router.post(
  '/process-auto-releases',
  protect,
  authorize('system', 'admin'),
  escrowController.processAutoReleases
);

module.exports = router;
