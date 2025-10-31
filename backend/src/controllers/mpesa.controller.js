const mpesaService = require('../services/mpesa.service');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * @desc    Initiate M-Pesa STK Push for booking fee
 * @route   POST /api/v1/payments/mpesa/stkpush
 * @access  Private (Customer)
 */
exports.initiateSTKPush = async (req, res) => {
  try {
    const { phoneNumber, bookingId, amount, type } = req.body;

    console.log('=== STK PUSH REQUEST DEBUG ===');
    console.log('Phone Number:', phoneNumber);
    console.log('Booking ID:', bookingId);
    console.log('Amount:', amount, 'Type:', typeof amount);
    console.log('Payment Type:', type);

    // Validate required fields
    if (!phoneNumber || !bookingId || !amount) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Phone number, booking ID, and amount are required',
      });
    }

    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log('Booking not found:', bookingId);
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    console.log('Booking found:', booking.bookingNumber);
    console.log('Booking fee amount:', booking.bookingFee?.amount, 'Type:', typeof booking.bookingFee?.amount);
    console.log('Booking fee status:', booking.bookingFee?.status);

    // Verify user owns this booking
    if (booking.customer.toString() !== req.user.id) {
      console.log('Authorization failed - User does not own booking');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this booking',
      });
    }

    // Validate amount matches booking fee (with tolerance for floating point)
    if (type === 'booking_fee') {
      const expectedAmount = booking.bookingFee?.amount;
      const receivedAmount = parseFloat(amount);
      const tolerance = 0.01; // 1 cent tolerance for floating point errors

      console.log('Amount validation:', {
        expected: expectedAmount,
        received: receivedAmount,
        difference: Math.abs(expectedAmount - receivedAmount),
        tolerance: tolerance
      });

      if (!expectedAmount) {
        console.log('Booking fee amount not set in booking');
        return res.status(400).json({
          success: false,
          message: 'Booking fee amount not configured',
        });
      }

      if (Math.abs(expectedAmount - receivedAmount) > tolerance) {
        console.log('Amount mismatch!');
        return res.status(400).json({
          success: false,
          message: `Amount must be ${expectedAmount} KES for booking fee. Received ${receivedAmount} KES`,
        });
      }
    }

    // Check if booking fee already paid
    if (type === 'booking_fee' && booking.bookingFee.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking fee already paid',
      });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      type: type || 'booking_fee',
      amount: {
        gross: amount,
        net: amount,
        currency: 'KES',
      },
      payer: req.user.id,
      payee: booking.technician, // Will be null if no technician assigned yet
      booking: bookingId,
      paymentMethod: 'mpesa',
      status: 'initiated',
      description: `${type === 'booking_fee' ? 'Booking fee' : 'Payment'} for ${booking.bookingNumber}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    // Initiate STK Push
    const stkPushResult = await mpesaService.initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: booking.bookingNumber,
      transactionDesc: `Booking fee for ${booking.bookingNumber}`,
    });

    if (!stkPushResult.success) {
      // Mark transaction as failed
      transaction.status = 'failed';
      transaction.failureReason = stkPushResult.error;
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: stkPushResult.error,
        details: stkPushResult.details,
      });
    }

    // Update transaction with M-Pesa details
    transaction.mpesaDetails = {
      merchantRequestId: stkPushResult.data.merchantRequestId,
      checkoutRequestId: stkPushResult.data.checkoutRequestId,
      phoneNumber,
    };
    transaction.status = 'pending';
    transaction.externalTransactionId = stkPushResult.data.checkoutRequestId;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'STK Push sent successfully. Please enter your M-Pesa PIN on your phone.',
      data: {
        transactionId: transaction._id,
        checkoutRequestId: stkPushResult.data.checkoutRequestId,
        customerMessage: stkPushResult.data.customerMessage,
      },
    });
  } catch (error) {
    console.error('Initiate STK Push Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating M-Pesa payment',
      error: error.message,
    });
  }
};

/**
 * @desc    M-Pesa callback handler
 * @route   POST /api/v1/payments/mpesa/callback
 * @access  Public (Called by M-Pesa)
 */
exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback Received:', JSON.stringify(req.body, null, 2));

    // Validate callback
    if (!mpesaService.validateCallback(req.body)) {
      console.error('Invalid M-Pesa callback structure');
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback data',
      });
    }

    // Process callback
    const result = mpesaService.processCallback(req.body);

    // Find transaction by CheckoutRequestID
    const transaction = await Transaction.findOne({
      'mpesaDetails.checkoutRequestId': result.checkoutRequestId,
    });

    if (!transaction) {
      console.error('Transaction not found for CheckoutRequestID:', result.checkoutRequestId);
      return res.status(404).json({
        ResultCode: 1,
        ResultDesc: 'Transaction not found',
      });
    }

    // Update transaction based on result
    if (result.success) {
      // Payment successful
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.mpesaDetails.mpesaReceiptNumber = result.mpesaReceiptNumber;
      transaction.mpesaDetails.transactionDate = new Date(result.transactionDate.toString());
      transaction.mpesaDetails.resultCode = '0';
      transaction.mpesaDetails.resultDescription = result.resultDesc;

      await transaction.save();

      // Update booking if this was a booking fee payment
      if (transaction.type === 'booking_fee') {
        const booking = await Booking.findById(transaction.booking);
        if (booking) {
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

          console.log(`Booking fee confirmed for booking ${booking.bookingNumber}`);
        }
      }

      console.log(`Payment successful: ${result.mpesaReceiptNumber}`);
    } else {
      // Payment failed
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.failureReason = result.errorMessage || result.resultDesc;
      transaction.failureCode = result.resultCode.toString();
      transaction.mpesaDetails.resultCode = result.resultCode.toString();
      transaction.mpesaDetails.resultDescription = result.resultDesc;

      await transaction.save();

      console.log(`Payment failed: ${result.resultDesc}`);
    }

    // Store webhook data
    transaction.webhookData = {
      received: true,
      receivedAt: new Date(),
      rawData: req.body,
      verified: true,
    };
    await transaction.save();

    // Respond to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  } catch (error) {
    console.error('M-Pesa Callback Error:', error);

    // Always respond with success to M-Pesa to prevent retries
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
};

/**
 * @desc    Query M-Pesa transaction status
 * @route   GET /api/v1/payments/mpesa/status/:transactionId
 * @access  Private
 */
exports.queryTransactionStatus = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Verify user is authorized to view this transaction
    if (
      transaction.payer.toString() !== req.user.id &&
      !['admin', 'support'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction',
      });
    }

    // If transaction is still pending, query M-Pesa for status
    if (transaction.status === 'pending' && transaction.mpesaDetails?.checkoutRequestId) {
      const queryResult = await mpesaService.querySTKPushStatus(
        transaction.mpesaDetails.checkoutRequestId
      );

      if (queryResult.success) {
        // Update transaction if query shows completion
        if (queryResult.data.resultCode === '0') {
          transaction.status = 'completed';
          transaction.completedAt = new Date();
        } else if (queryResult.data.resultCode) {
          transaction.status = 'failed';
          transaction.failedAt = new Date();
          transaction.failureReason = queryResult.data.resultDesc;
        }

        await transaction.save();
      }
    }

    res.status(200).json({
      success: true,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        amount: transaction.amount.gross,
        currency: transaction.amount.currency,
        paymentMethod: transaction.paymentMethod,
        mpesaReceiptNumber: transaction.mpesaDetails?.mpesaReceiptNumber,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        failedAt: transaction.failedAt,
        failureReason: transaction.failureReason,
      },
    });
  } catch (error) {
    console.error('Query Transaction Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error querying transaction status',
      error: error.message,
    });
  }
};

/**
 * @desc    Get M-Pesa payment history
 * @route   GET /api/v1/payments/mpesa/history
 * @access  Private
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      payer: req.user.id,
      paymentMethod: 'mpesa',
    };

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('booking', 'bookingNumber serviceType serviceCategory')
      .select('-webhookData -metadata');

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      transactions,
    });
  } catch (error) {
    console.error('Get Payment History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message,
    });
  }
};

module.exports = exports;
