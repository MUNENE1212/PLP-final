const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  assignTechnician,
  updatePricing,
  addQACheckpoint,
  createDispute,
  resolveDispute,
  getBookingStats
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Stats route (before :id route to avoid conflicts)
router.get('/stats', protect, getBookingStats);

// Get all bookings
router.get('/', protect, getBookings);

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
  createBooking
);

// Get single booking
router.get('/:id', protect, getBooking);

// Update booking status
router.put(
  '/:id/status',
  protect,
  [
    body('status').notEmpty().withMessage('Status is required'),
    validate
  ],
  updateBookingStatus
);

// Assign technician
router.put(
  '/:id/assign-technician',
  protect,
  authorize('admin'),
  [
    body('technician').isMongoId().withMessage('Valid technician ID is required'),
    validate
  ],
  assignTechnician
);

// Update pricing
router.put(
  '/:id/pricing',
  protect,
  authorize('technician', 'admin'),
  updatePricing
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
  addQACheckpoint
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
  createDispute
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
  resolveDispute
);

module.exports = router;
