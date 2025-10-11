const express = require('express');
const { body } = require('express-validator');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  releaseEscrow,
  processRefund,
  handleWebhook,
  getTransactionStats
} = require('../controllers/transaction.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Stats route
router.get('/stats', protect, getTransactionStats);

// Webhook route (public but verified by signature)
router.post('/webhook/:gateway', handleWebhook);

// Get all transactions
router.get('/', protect, getTransactions);

// Create transaction
router.post(
  '/',
  protect,
  [
    body('booking').isMongoId().withMessage('Valid booking ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('gateway')
      .isIn(['mpesa', 'stripe', 'cash', 'wallet'])
      .withMessage('Valid payment gateway is required'),
    validate
  ],
  createTransaction
);

// Get single transaction
router.get('/:id', protect, getTransaction);

// Release escrow
router.post('/:id/release-escrow', protect, authorize('admin'), releaseEscrow);

// Process refund
router.post(
  '/:id/refund',
  protect,
  authorize('admin'),
  [
    body('reason').notEmpty().withMessage('Refund reason is required'),
    validate
  ],
  processRefund
);

module.exports = router;
