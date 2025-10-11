const express = require('express');
const { body, param } = require('express-validator');
const {
  createTicket,
  getTickets,
  getTicket,
  addMessage,
  assignTicket,
  updateStatus,
  updatePriority,
  closeTicket,
  reopenTicket,
  escalateTicket,
  rateTicket,
  getStats,
  getDashboard,
  updateAvailability
} = require('../controllers/support.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Support agent routes
router.get('/dashboard', protect, authorize('support', 'admin'), getDashboard);
router.get('/stats', protect, authorize('support', 'admin'), getStats);
router.put('/availability', protect, authorize('support'), updateAvailability);

// Ticket routes
router.get('/tickets', protect, getTickets);

router.post(
  '/tickets',
  protect,
  [
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .isIn([
        'account',
        'booking',
        'payment',
        'technical',
        'billing',
        'complaint',
        'feature_request',
        'bug_report',
        'general',
        'other'
      ])
      .withMessage('Valid category is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    validate
  ],
  createTicket
);

router.get('/tickets/:id', protect, getTicket);

router.post(
  '/tickets/:id/messages',
  protect,
  [
    body('message').trim().notEmpty().withMessage('Message is required'),
    validate
  ],
  addMessage
);

router.put(
  '/tickets/:id/assign',
  protect,
  authorize('support', 'admin'),
  [
    body('agentId').isMongoId().withMessage('Valid agent ID is required'),
    validate
  ],
  assignTicket
);

router.put(
  '/tickets/:id/status',
  protect,
  authorize('support', 'admin'),
  [
    body('status')
      .isIn([
        'open',
        'assigned',
        'in_progress',
        'waiting_customer',
        'waiting_internal',
        'resolved',
        'closed',
        'reopened'
      ])
      .withMessage('Valid status is required'),
    validate
  ],
  updateStatus
);

router.put(
  '/tickets/:id/priority',
  protect,
  authorize('support', 'admin'),
  [
    body('priority')
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Valid priority is required'),
    validate
  ],
  updatePriority
);

router.put(
  '/tickets/:id/close',
  protect,
  authorize('support', 'admin'),
  [
    body('summary').trim().notEmpty().withMessage('Summary is required'),
    body('resolutionType')
      .isIn(['solved', 'workaround', 'duplicate', 'cannot_reproduce', 'wont_fix', 'other'])
      .withMessage('Valid resolution type is required'),
    validate
  ],
  closeTicket
);

router.put(
  '/tickets/:id/reopen',
  protect,
  [
    body('reason').trim().notEmpty().withMessage('Reason is required'),
    validate
  ],
  reopenTicket
);

router.put(
  '/tickets/:id/escalate',
  protect,
  authorize('support', 'admin'),
  [
    body('escalatedTo').isMongoId().withMessage('Valid user ID is required'),
    body('reason').trim().notEmpty().withMessage('Escalation reason is required'),
    validate
  ],
  escalateTicket
);

router.post(
  '/tickets/:id/rate',
  protect,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    validate
  ],
  rateTicket
);

module.exports = router;
