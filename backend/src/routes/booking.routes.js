const express = require('express');
const { body } = require('express-validator');

// Import modular controllers
const baseController = require('../controllers/booking.base.controller');
const statusController = require('../controllers/booking.status.controller');
const completionController = require('../controllers/booking.completion.controller');
const paymentController = require('../controllers/booking.payment.controller');
const offerController = require('../controllers/booking.offer.controller');
const miscController = require('../controllers/booking.misc.controller');

const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// ===== BASE ROUTES (CRUD Operations) =====

// Stats route (before :id route to avoid conflicts)
router.get('/stats', protect, baseController.getBookingStats);

// Get bookings pending completion response (Support)
router.get(
  '/pending-completion',
  protect,
  authorize('admin', 'support'),
  completionController.getPendingCompletions
);

// Get all bookings
router.get('/', protect, baseController.getBookings);

// Create booking
router.post(
  '/',
  protect,
  authorize('customer', 'corporate'),
  [
    body('serviceType').notEmpty().withMessage('Service type is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
    body('serviceLocation.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Valid coordinates are required'),
    body('serviceLocation.address').notEmpty().withMessage('Service address is required'),
    validate
  ],
  baseController.createBooking
);

// Get single booking
router.get('/:id', protect, baseController.getBooking);

// ===== STATUS MANAGEMENT ROUTES =====

// Technician updates status to en_route
router.post(
  '/:id/status/en-route',
  protect,
  authorize('technician'),
  statusController.updateToEnRoute
);

// Technician updates status to arrived
router.post(
  '/:id/status/arrived',
  protect,
  authorize('technician'),
  statusController.updateToArrived
);

// Technician updates status to in_progress
router.post(
  '/:id/status/in-progress',
  protect,
  authorize('technician'),
  statusController.updateToInProgress
);

// Technician requests completion (requires customer/support confirmation)
router.post(
  '/:id/status/request-complete',
  protect,
  authorize('technician'),
  statusController.requestCompletion
);

// Customer/Support confirms completion
router.post(
  '/:id/status/confirm-complete',
  protect,
  [
    body('approved').isBoolean().withMessage('Approved status is required'),
    validate
  ],
  statusController.confirmCompletion
);

// Pause job
router.post(
  '/:id/status/pause',
  protect,
  authorize('technician'),
  statusController.pauseJob
);

// Cancel booking
router.post(
  '/:id/cancel',
  protect,
  statusController.cancelBooking
);

// ===== COMPLETION WORKFLOW ROUTES (Support Follow-up) =====

// Support initiates follow-up
router.post(
  '/:id/followup/initiate',
  protect,
  authorize('admin', 'support'),
  completionController.initiateFollowUp
);

// Support logs contact attempt
router.post(
  '/:id/followup/log-contact',
  protect,
  authorize('admin', 'support'),
  [
    body('method').isIn(['call', 'sms', 'email', 'in_app']).withMessage('Valid contact method is required'),
    validate
  ],
  completionController.logContactAttempt
);

// Support completes job after follow-up
router.post(
  '/:id/followup/complete',
  protect,
  authorize('admin', 'support'),
  [
    body('outcome')
      .isIn(['customer_confirmed', 'customer_disputed', 'unreachable', 'auto_completed'])
      .withMessage('Valid outcome is required'),
    validate
  ],
  completionController.completeBySupport
);

// ===== BOOKING FEE ROUTES =====

// Get booking fee status
router.get(
  '/:id/booking-fee',
  protect,
  paymentController.getBookingFeeStatus
);

// Confirm booking fee payment
router.post(
  '/:id/booking-fee/confirm',
  protect,
  authorize('customer', 'corporate'),
  [
    body('transactionId').isMongoId().withMessage('Valid transaction ID is required'),
    validate
  ],
  paymentController.confirmBookingFee
);

// Release booking fee to technician
router.post(
  '/:id/booking-fee/release',
  protect,
  authorize('admin', 'support'),
  paymentController.releaseBookingFee
);

// Refund booking fee to customer
router.post(
  '/:id/booking-fee/refund',
  protect,
  authorize('admin', 'support'),
  [
    body('reason').notEmpty().withMessage('Refund reason is required'),
    validate
  ],
  paymentController.refundBookingFee
);

// ===== TECHNICIAN BOOKING ACTIONS (Accept/Reject/Counter Offer) =====

// Accept booking
router.post(
  '/:id/accept',
  protect,
  authorize('technician'),
  offerController.acceptBooking
);

// Reject booking
router.post(
  '/:id/reject',
  protect,
  authorize('technician'),
  offerController.rejectBooking
);

// Submit counter offer
router.post(
  '/:id/counter-offer',
  protect,
  authorize('technician'),
  [
    body('proposedAmount').isNumeric().withMessage('Valid proposed amount is required'),
    body('reason').notEmpty().withMessage('Reason for counter offer is required'),
    validate
  ],
  offerController.submitCounterOffer
);

// Respond to counter offer
router.post(
  '/:id/counter-offer/respond',
  protect,
  authorize('customer', 'corporate'),
  [
    body('accepted').isBoolean().withMessage('Accepted status is required'),
    validate
  ],
  offerController.respondToCounterOffer
);

// ===== MISC ROUTES (Disputes, QA, Pricing, Assignment) =====

// Assign technician
router.put(
  '/:id/assign-technician',
  protect,
  authorize('admin'),
  [
    body('technician').isMongoId().withMessage('Valid technician ID is required'),
    validate
  ],
  miscController.assignTechnician
);

// Update pricing
router.put(
  '/:id/pricing',
  protect,
  authorize('technician', 'admin'),
  miscController.updatePricing
);

// Add QA checkpoint
router.post(
  '/:id/qa-checkpoint',
  protect,
  authorize('technician'),
  [
    body('description').notEmpty().withMessage('Checkpoint description is required'),
    validate
  ],
  miscController.addQACheckpoint
);

// Create dispute
router.post(
  '/:id/dispute',
  protect,
  [
    body('reason').notEmpty().withMessage('Dispute reason is required'),
    body('description').notEmpty().withMessage('Dispute description is required'),
    validate
  ],
  miscController.createDispute
);

// Resolve dispute
router.put(
  '/:id/dispute/resolve',
  protect,
  authorize('admin'),
  [
    body('resolution')
      .isIn(['customer_favor', 'technician_favor', 'partial_refund', 'no_action'])
      .withMessage('Valid resolution is required'),
    body('resolutionNotes').notEmpty().withMessage('Resolution notes are required'),
    validate
  ],
  miscController.resolveDispute
);

module.exports = router;
