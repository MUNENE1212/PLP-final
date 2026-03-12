/**
 * M-Pesa Webhook Controller
 *
 * Handles all M-Pesa callback endpoints for escrow integration:
 * - STK Push callbacks (customer payments)
 * - B2C callbacks (technician payouts)
 * - Account balance callbacks
 * - Validation and confirmation URLs
 *
 * SECURITY: All endpoints verify M-Pesa authenticity before processing.
 */

const mpesaService = require('../services/mpesa.service');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const User = require('../models/User');
const logger = require('../utils/logger') || console;

/**
 * @desc    STK Push callback handler for escrow funding
 * @route   POST /api/v1/mpesa/webhooks/stk-callback
 * @access  Public (Called by M-Pesa servers)
 */
exports.stkPushCallback = async (req, res) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection?.remoteAddress;

  try {
    logger.info('=== STK PUSH CALLBACK RECEIVED ===', {
      ip: clientIP,
      timestamp: new Date().toISOString(),
      hasBody: !!req.body,
    });

    // Validate callback structure
    if (!mpesaService.validateCallback(req.body)) {
      logger.error('Invalid STK Push callback structure', { body: req.body });
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback data',
      });
    }

    // Process the callback
    const result = mpesaService.handleSTKPushCallback(req.body);
    logger.info('STK Push callback processed', {
      checkoutRequestId: result.checkoutRequestId,
      success: result.success,
      resultCode: result.resultCode,
    });

    // Find the transaction
    const transaction = await Transaction.findOne({
      'mpesaDetails.checkoutRequestId': result.checkoutRequestId,
    });

    if (!transaction) {
      logger.error('Transaction not found for STK callback', {
        checkoutRequestId: result.checkoutRequestId,
      });
      // Still return success to M-Pesa to prevent retries
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    }

    // Idempotency guard: skip if already processed
    if (transaction.status === 'completed' || transaction.status === 'failed') {
      logger.warn('Duplicate STK callback — transaction already processed', {
        transactionId: transaction._id,
        status: transaction.status,
      });
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Update transaction based on result
    if (result.success) {
      // Payment successful - update transaction
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.mpesaDetails.mpesaReceiptNumber = result.mpesaReceiptNumber;
      transaction.mpesaDetails.transactionDate = result.transactionDate;
      transaction.mpesaDetails.phoneNumber = result.phoneNumber;
      transaction.mpesaDetails.resultCode = '0';
      transaction.mpesaDetails.resultDescription = result.resultDesc;
      transaction.externalTransactionId = result.mpesaReceiptNumber;

      // Mark escrow as funded if applicable
      if (transaction.escrow && transaction.escrow.held) {
        transaction.escrow.fundedAt = new Date();
      }

      await transaction.save();

      // Trigger escrow funding logic for booking
      await handleEscrowFunding(transaction, result);

      logger.info('STK Push payment completed successfully', {
        transactionId: transaction._id,
        mpesaReceipt: result.mpesaReceiptNumber,
        amount: result.amount,
      });
    } else {
      // Payment failed
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.failureReason = result.errorMessage || result.resultDesc;
      transaction.failureCode = result.resultCode?.toString();
      transaction.mpesaDetails.resultCode = result.resultCode?.toString();
      transaction.mpesaDetails.resultDescription = result.resultDesc;

      await transaction.save();

      logger.warn('STK Push payment failed', {
        transactionId: transaction._id,
        resultCode: result.resultCode,
        resultDesc: result.resultDesc,
      });
    }

    // Store webhook data for audit
    transaction.webhookData = {
      received: true,
      receivedAt: new Date(),
      rawData: req.body,
      verified: true,
      processingTime: Date.now() - startTime,
    };
    await transaction.save();

    // Respond to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  } catch (error) {
    logger.error('STK Push callback processing error', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    // Always return success to M-Pesa to prevent retries
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
};

/**
 * @desc    B2C callback handler for technician payouts
 * @route   POST /api/v1/mpesa/webhooks/b2c-callback
 * @access  Public (Called by M-Pesa servers)
 */
exports.b2cCallback = async (req, res) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection?.remoteAddress;

  try {
    logger.info('=== B2C CALLBACK RECEIVED ===', {
      ip: clientIP,
      timestamp: new Date().toISOString(),
      hasBody: !!req.body,
    });

    // Validate callback structure
    if (!mpesaService.validateB2CCallback(req.body)) {
      logger.error('Invalid B2C callback structure', { body: req.body });
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback data',
      });
    }

    // Process the callback
    const result = mpesaService.handleB2CCallback(req.body);
    logger.info('B2C callback processed', {
      conversationId: result.conversationId,
      success: result.success,
      resultCode: result.resultCode,
    });

    // Find the payout transaction
    const transaction = await Transaction.findOne({
      'mpesaDetails.conversationId': result.conversationId,
    }).populate('payee', 'firstName lastName email phoneNumber');

    if (!transaction) {
      logger.error('Transaction not found for B2C callback', {
        conversationId: result.conversationId,
      });
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    }

    // Idempotency guard: skip if already processed
    if (transaction.status === 'completed' || transaction.status === 'failed') {
      logger.warn('Duplicate B2C callback — transaction already processed', {
        transactionId: transaction._id,
        status: transaction.status,
      });
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Update transaction based on result
    if (result.success) {
      // Payout successful
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.mpesaDetails.transactionReceipt = result.transactionReceipt;
      transaction.mpesaDetails.transactionId = result.transactionId;
      transaction.mpesaDetails.resultCode = '0';
      transaction.mpesaDetails.resultDescription = result.resultDesc;
      transaction.externalTransactionId = result.transactionId;

      // Add B2C specific metadata
      if (!transaction.metadata) transaction.metadata = {};
      transaction.metadata.b2cRecipientIsRegistered = result.b2CRecipientIsRegisteredCustomer;
      transaction.metadata.transactionCompletedDateTime = result.transactionCompletedDateTime;
      transaction.metadata.receiverPartyPublicName = result.receiverPartyPublicName;

      // Mark escrow as released
      if (transaction.escrow) {
        transaction.escrow.releasedAt = new Date();
      }

      await transaction.save();

      // Handle escrow release logic
      await handleEscrowRelease(transaction, result);

      logger.info('B2C payout completed successfully', {
        transactionId: transaction._id,
        transactionReceipt: result.transactionReceipt,
        amount: result.transactionAmount,
        recipient: result.receiverPartyPublicName,
      });
    } else {
      // Payout failed
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.failureReason = result.errorMessage || result.resultDesc;
      transaction.failureCode = result.resultCode?.toString();
      transaction.mpesaDetails.resultCode = result.resultCode?.toString();
      transaction.mpesaDetails.resultDescription = result.resultDesc;

      await transaction.save();

      logger.warn('B2C payout failed', {
        transactionId: transaction._id,
        resultCode: result.resultCode,
        resultDesc: result.resultDesc,
      });
    }

    // Store webhook data
    transaction.webhookData = {
      received: true,
      receivedAt: new Date(),
      rawData: req.body,
      verified: true,
      processingTime: Date.now() - startTime,
    };
    await transaction.save();

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  } catch (error) {
    logger.error('B2C callback processing error', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
};

/**
 * @desc    Validation URL (called by M-Pesa before C2B payment)
 * @route   POST /api/v1/mpesa/webhooks/validation
 * @access  Public (Called by M-Pesa servers)
 */
exports.validationUrl = async (req, res) => {
  try {
    logger.info('=== M-PESA VALIDATION REQUEST ===', {
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    const { TransID, TransAmount, BillRefNumber, MSISDN } = req.body;

    // Validate: BillRefNumber must match an existing booking
    const booking = await Booking.findOne({ bookingNumber: BillRefNumber });

    if (!booking) {
      logger.warn('Validation rejected: no matching booking', {
        transId: TransID,
        billRef: BillRefNumber,
      });
      return res.status(200).json({
        ResultCode: 1,
        ResultDesc: 'Rejected - Invalid booking reference',
        ThirdPartyTransID: TransID,
      });
    }

    // Validate: booking must be in a payable state
    const payableStatuses = ['pending', 'matching', 'assigned', 'accepted', 'payment_pending'];
    if (!payableStatuses.includes(booking.status)) {
      logger.warn('Validation rejected: booking not in payable state', {
        transId: TransID,
        billRef: BillRefNumber,
        bookingStatus: booking.status,
      });
      return res.status(200).json({
        ResultCode: 1,
        ResultDesc: 'Rejected - Booking not in payable state',
        ThirdPartyTransID: TransID,
      });
    }

    // Validate: amount must match booking fee (1 KES tolerance for rounding)
    const expectedAmount = booking.bookingFee?.amount;
    if (expectedAmount != null) {
      const paidAmount = parseFloat(TransAmount);
      if (Math.abs(paidAmount - expectedAmount) > 1) {
        logger.warn('Validation rejected: amount mismatch', {
          transId: TransID,
          billRef: BillRefNumber,
          expected: expectedAmount,
          received: paidAmount,
        });
        return res.status(200).json({
          ResultCode: 1,
          ResultDesc: 'Rejected - Amount mismatch',
          ThirdPartyTransID: TransID,
        });
      }
    }

    logger.info('Validation accepted', {
      transId: TransID,
      billRef: BillRefNumber,
      amount: TransAmount,
    });
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
      ThirdPartyTransID: TransID,
    });
  } catch (error) {
    logger.error('Validation URL error', { error: error.message });
    // Reject on error — do not accept payments we cannot validate
    return res.status(200).json({
      ResultCode: 1,
      ResultDesc: 'Rejected - Validation error',
    });
  }
};

/**
 * @desc    Confirmation URL (called by M-Pesa after C2B payment)
 * @route   POST /api/v1/mpesa/webhooks/confirmation
 * @access  Public (Called by M-Pesa servers)
 */
exports.confirmationUrl = async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info('=== M-PESA CONFIRMATION RECEIVED ===', {
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    const { TransactionType, TransID, TransTime, TransAmount, BusinessShortCode, BillRefNumber, InvoiceNumber, OrgAccountBalance, ThirdPartyTransID, MSISDN, FirstName, MiddleName, LastName } = req.body;

    // Parse transaction date
    let transactionDate;
    if (TransTime) {
      const dateStr = TransTime.toString();
      if (dateStr.length === 14) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(8, 10);
        const minute = dateStr.substring(10, 12);
        const second = dateStr.substring(12, 14);
        transactionDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+03:00`);
      }
    }

    // Create or update transaction
    let transaction = await Transaction.findOne({
      'mpesaDetails.merchantRequestId': TransID,
    });

    if (!transaction) {
      // Try to find by bill reference number
      transaction = await Transaction.findOne({
        transactionNumber: BillRefNumber,
      });
    }

    if (transaction) {
      // Idempotency guard: skip if already processed
      if (transaction.status === 'completed') {
        logger.warn('Duplicate C2B confirmation — transaction already completed', {
          transactionId: transaction._id,
        });
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success', ThirdPartyTransID: TransID });
      }

      // Update existing transaction
      transaction.status = 'completed';
      transaction.completedAt = transactionDate || new Date();
      transaction.mpesaDetails = {
        ...transaction.mpesaDetails,
        mpesaReceiptNumber: TransID,
        transactionDate: transactionDate || new Date(),
        phoneNumber: MSISDN,
        resultCode: '0',
        resultDescription: 'C2B Payment confirmed',
      };
      transaction.externalTransactionId = TransID;

      // Update amount if not set
      if (!transaction.amount?.gross) {
        transaction.amount = {
          gross: parseFloat(TransAmount),
          net: parseFloat(TransAmount),
          currency: 'KES',
        };
      }

      await transaction.save();

      logger.info('C2B payment confirmed', {
        transactionId: transaction._id,
        transId: TransID,
        amount: TransAmount,
      });
    } else {
      logger.warn('No matching transaction found for C2B confirmation', {
        transId: TransID,
        billRef: BillRefNumber,
      });
    }

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success',
      ThirdPartyTransID: TransID,
    });
  } catch (error) {
    logger.error('Confirmation URL error', { error: error.message });
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  }
};

/**
 * @desc    Account balance callback handler
 * @route   POST /api/v1/mpesa/webhooks/balance-callback
 * @access  Public (Called by M-Pesa servers)
 */
exports.balanceCallback = async (req, res) => {
  try {
    logger.info('=== ACCOUNT BALANCE CALLBACK RECEIVED ===', {
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    const result = mpesaService.processAccountBalanceCallback(req.body);

    logger.info('Account balance processed', {
      success: result.success,
      balance: result.accountBalance,
    });

    // Store balance information (could be stored in a separate model)
    // For now, just log it

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  } catch (error) {
    logger.error('Balance callback error', { error: error.message });
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
};

/**
 * @desc    Test webhook endpoint (for development)
 * @route   GET /api/v1/mpesa/webhooks/test
 * @access  Public
 */
exports.testWebhook = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'M-Pesa webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    endpoints: {
      stkCallback: '/api/v1/mpesa/webhooks/stk-callback',
      b2cCallback: '/api/v1/mpesa/webhooks/b2c-callback',
      validation: '/api/v1/mpesa/webhooks/validation',
      confirmation: '/api/v1/mpesa/webhooks/confirmation',
      balance: '/api/v1/mpesa/webhooks/balance-callback',
    },
  });
};

// ===== HELPER FUNCTIONS =====

/**
 * Handle escrow funding after successful STK Push
 */
async function handleEscrowFunding(transaction, result) {
  try {
    const booking = await Booking.findById(transaction.booking);
    if (!booking) {
      logger.warn('Booking not found for escrow funding', {
        bookingId: transaction.booking,
      });
      return;
    }

    // Update booking fee status based on transaction type
    if (transaction.type === 'booking_fee') {
      booking.bookingFee.status = 'held';
      booking.bookingFee.paidAt = new Date();
      booking.bookingFee.heldInEscrow = true;
      booking.bookingFee.transactionId = transaction._id;

      // Update booking status to matching if currently pending
      if (booking.status === 'pending') {
        booking.status = 'matching';
        booking.statusHistory.push({
          status: 'matching',
          changedBy: transaction.payer,
          changedAt: new Date(),
          reason: 'Booking fee confirmed via M-Pesa',
        });
      }

      await booking.save();
      logger.info('Escrow funded for booking', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        amount: result.amount,
      });
    } else if (transaction.type === 'booking_payment') {
      // Full payment received
      booking.payment.status = 'completed';
      booking.payment.method = 'mpesa';
      booking.payment.transactionId = transaction._id;
      booking.payment.paidAt = new Date();
      booking.status = 'paid';

      booking.statusHistory.push({
        status: 'paid',
        changedBy: transaction.payer,
        changedAt: new Date(),
        reason: 'Completion payment confirmed via M-Pesa',
      });

      await booking.save();
      logger.info('Full payment received for booking', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        amount: result.amount,
      });
    }

    // Send notification to relevant parties
    // await sendPaymentNotification(booking, transaction, result);
  } catch (error) {
    logger.error('Error handling escrow funding', {
      error: error.message,
      transactionId: transaction._id,
    });
  }
}

/**
 * Handle escrow release after successful B2C payout
 */
async function handleEscrowRelease(transaction, result) {
  try {
    const booking = await Booking.findById(transaction.booking)
      .populate('technician', 'firstName lastName email phoneNumber');

    if (!booking) {
      logger.warn('Booking not found for escrow release', {
        bookingId: transaction.booking,
      });
      return;
    }

    // Update booking fee status to released
    if (booking.bookingFee) {
      booking.bookingFee.status = 'released';
      booking.bookingFee.releasedAt = new Date();
      booking.bookingFee.heldInEscrow = false;
      booking.bookingFee.notes = 'Released via B2C payout after job completion';
    }

    // Update booking status to verified
    booking.status = 'verified';
    booking.statusHistory.push({
      status: 'verified',
      changedBy: transaction.payee?._id || transaction.payee,
      changedAt: new Date(),
      reason: 'Escrow released - technician payout completed',
    });

    await booking.save();

    logger.info('Escrow released successfully', {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      transactionReceipt: result.transactionReceipt,
    });

    // Send notification to technician
    // await sendPayoutNotification(booking, transaction, result);
  } catch (error) {
    logger.error('Error handling escrow release', {
      error: error.message,
      transactionId: transaction._id,
    });
  }
}

module.exports = exports;
