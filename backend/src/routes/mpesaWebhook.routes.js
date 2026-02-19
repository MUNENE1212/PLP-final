/**
 * M-Pesa Webhook Routes
 *
 * Public endpoints for M-Pesa callbacks.
 * These endpoints are called by Safaricom's servers and do not require authentication.
 *
 * SECURITY:
 * - All callbacks are validated using the mpesaCallbackVerify middleware
 * - IP whitelisting is enforced in production
 * - Callback secret verification is required
 */

const express = require('express');
const router = express.Router();

const {
  stkPushCallback,
  b2cCallback,
  validationUrl,
  confirmationUrl,
  balanceCallback,
  testWebhook,
} = require('../controllers/mpesaWebhook.controller');

const {
  mpesaCallbackVerify,
  mpesaTimeoutVerify,
} = require('../middleware/mpesaVerify');

/**
 * @route   GET /api/v1/mpesa/webhooks/test
 * @desc    Test endpoint to verify webhook accessibility
 * @access  Public
 */
router.get('/test', testWebhook);

/**
 * @route   POST /api/v1/mpesa/webhooks/stk-callback
 * @desc    STK Push callback (called by Safaricom after customer completes payment)
 * @access  Public (M-Pesa servers only)
 * @security IP whitelist, callback secret, structure validation
 */
router.post('/stk-callback', mpesaCallbackVerify, stkPushCallback);

/**
 * @route   POST /api/v1/mpesa/webhooks/b2c-callback
 * @desc    B2C callback (called by Safaricom after technician payout)
 * @access  Public (M-Pesa servers only)
 * @security IP whitelist, callback secret, structure validation
 */
router.post('/b2c-callback', mpesaCallbackVerify, b2cCallback);

/**
 * @route   POST /api/v1/mpesa/webhooks/validation
 * @desc    Validation URL (called by M-Pesa before C2B payment)
 * @access  Public (M-Pesa servers only)
 * @note    Used to validate incoming C2B payments before they are processed
 */
router.post('/validation', validationUrl);

/**
 * @route   POST /api/v1/mpesa/webhooks/confirmation
 * @desc    Confirmation URL (called by M-Pesa after C2B payment)
 * @access  Public (M-Pesa servers only)
 * @note    Used to confirm successful C2B payments
 */
router.post('/confirmation', confirmationUrl);

/**
 * @route   POST /api/v1/mpesa/webhooks/balance-callback
 * @desc    Account balance callback (called by Safaricom after balance query)
 * @access  Public (M-Pesa servers only)
 */
router.post('/balance-callback', mpesaCallbackVerify, balanceCallback);

/**
 * @route   POST /api/v1/mpesa/webhooks/timeout
 * @desc    Timeout callback (called when a request times out)
 * @access  Public (M-Pesa servers only)
 */
router.post('/timeout', mpesaTimeoutVerify, (req, res) => {
  console.log('=== M-PESA TIMEOUT CALLBACK ===', {
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({
    ResultCode: 0,
    ResultDesc: 'Timeout received',
  });
});

module.exports = router;
