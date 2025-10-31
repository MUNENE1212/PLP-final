const express = require('express');
const { body } = require('express-validator');
const {
  initiateSTKPush,
  mpesaCallback,
  queryTransactionStatus,
  getPaymentHistory,
} = require('../controllers/mpesa.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   POST /api/v1/payments/mpesa/stkpush
 * @desc    Initiate M-Pesa STK Push payment
 * @access  Private (Customer/Corporate)
 */
router.post(
  '/stkpush',
  protect,
  authorize('customer', 'corporate'),
  [
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(254|0)[17]\d{8}$/)
      .withMessage('Invalid Kenyan phone number format'),
    body('bookingId')
      .isMongoId()
      .withMessage('Valid booking ID is required'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom((value) => value > 0)
      .withMessage('Amount must be greater than 0'),
    body('type')
      .optional()
      .isIn(['booking_fee', 'booking_payment', 'other'])
      .withMessage('Invalid payment type'),
    validate,
  ],
  initiateSTKPush
);

/**
 * @route   POST /api/v1/payments/mpesa/callback
 * @desc    M-Pesa callback endpoint (called by Safaricom)
 * @access  Public (No auth - called by M-Pesa servers)
 */
router.post('/callback', mpesaCallback);

/**
 * @route   GET /api/v1/payments/mpesa/status/:transactionId
 * @desc    Query M-Pesa transaction status
 * @access  Private
 */
router.get('/status/:transactionId', protect, queryTransactionStatus);

/**
 * @route   GET /api/v1/payments/mpesa/history
 * @desc    Get M-Pesa payment history
 * @access  Private
 */
router.get('/history', protect, getPaymentHistory);

module.exports = router;
