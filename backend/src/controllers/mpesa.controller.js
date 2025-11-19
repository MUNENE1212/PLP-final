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

    // Validate amount based on payment type
    if (type === 'booking_fee') {
      const expectedAmount = booking.bookingFee?.amount;
      const receivedAmount = parseFloat(amount);
      const tolerance = 0.01; // 1 cent tolerance for floating point errors

      console.log('Booking Fee Amount validation:', {
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

      // Check if booking fee already paid
      if (booking.bookingFee.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Booking fee already paid',
        });
      }
    } else if (type === 'booking_payment') {
      // Completion payment - validate remaining amount
      const totalAmount = booking.pricing.totalAmount;
      const bookingFeeAmount = booking.bookingFee?.amount || 0;
      const expectedAmount = totalAmount - bookingFeeAmount;
      const receivedAmount = parseFloat(amount);
      const tolerance = 0.01;

      console.log('Completion Payment Amount validation:', {
        totalAmount,
        bookingFeeAmount,
        expectedRemaining: expectedAmount,
        received: receivedAmount,
        difference: Math.abs(expectedAmount - receivedAmount),
        tolerance: tolerance
      });

      if (Math.abs(expectedAmount - receivedAmount) > tolerance) {
        console.log('Completion payment amount mismatch!');
        return res.status(400).json({
          success: false,
          message: `Amount must be ${expectedAmount} KES for completion payment. Received ${receivedAmount} KES`,
        });
      }

      // Check if payment already completed
      if (booking.payment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Payment already completed',
        });
      }

      // Check if booking is in payment_pending status
      if (booking.status !== 'payment_pending') {
        return res.status(400).json({
          success: false,
          message: 'Booking is not awaiting payment. Please confirm job completion first.',
        });
      }
    }

    // Create pending transaction
    const paymentDescription =
      type === 'booking_fee' ? `Booking fee for ${booking.bookingNumber}` :
      type === 'booking_payment' ? `Completion payment for ${booking.bookingNumber}` :
      `Payment for ${booking.bookingNumber}`;

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
      description: paymentDescription,
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
      transactionDesc: paymentDescription,
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
    console.log('=== M-PESA CALLBACK RECEIVED ===');
    console.log('Raw Callback:', JSON.stringify(req.body, null, 2));

    // Validate callback
    if (!mpesaService.validateCallback(req.body)) {
      console.error('❌ Invalid M-Pesa callback structure');
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback data',
      });
    }

    // Process callback
    console.log('✅ Callback validated, processing...');
    const result = mpesaService.processCallback(req.body);
    console.log('Processed result:', JSON.stringify(result, null, 2));

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
      transaction.mpesaDetails.transactionDate = result.transactionDate; // Already parsed as Date
      transaction.mpesaDetails.resultCode = '0';
      transaction.mpesaDetails.resultDescription = result.resultDesc;

      console.log('💾 Saving completed transaction...');
      try {
        await transaction.save();
        console.log('✅ Transaction saved successfully');
      } catch (saveError) {
        console.error('❌ Error saving transaction:', saveError.message);
        if (saveError.errors) {
          Object.keys(saveError.errors).forEach(key => {
            console.error(`  - ${key}: ${saveError.errors[key].message}`);
          });
        }
        // Still respond success to M-Pesa to prevent retries
        return res.status(200).json({
          ResultCode: 0,
          ResultDesc: 'Accepted',
        });
      }

      // Update booking based on transaction type
      if (transaction.type === 'booking_fee') {
        console.log('📦 Processing booking fee payment...');
        const booking = await Booking.findById(transaction.booking);
        if (booking) {
          console.log(`Found booking: ${booking.bookingNumber}`);

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
            console.log('📊 Booking status updated to: matching');
          }

          await booking.save();
          console.log(`✅ Booking fee confirmed for booking ${booking.bookingNumber}`);
        } else {
          console.warn('⚠️ Booking not found for transaction');
        }
      } else if (transaction.type === 'booking_payment') {
        console.log('💰 Processing completion payment...');
        const booking = await Booking.findById(transaction.booking)
          .populate('technician', 'firstName lastName email phoneNumber');

        if (booking) {
          console.log(`Found booking: ${booking.bookingNumber}`);
          console.log(`Total Amount: ${booking.pricing.totalAmount} KES`);

          // Update booking payment status
          booking.payment.status = 'completed';
          booking.payment.method = 'mpesa';
          booking.payment.transactionId = transaction._id;
          booking.payment.paidAt = new Date();

          // Update booking status to paid
          booking.status = 'paid';
          booking.statusHistory.push({
            status: 'paid',
            changedBy: transaction.payer,
            changedAt: new Date(),
            reason: 'Completion payment confirmed via M-Pesa',
          });
          console.log('💳 Booking payment status updated to: paid');

          // Calculate technician payout (85% of total amount)
          const totalAmount = booking.pricing.totalAmount;
          const technicianPayoutPercentage = 0.85; // 85% to technician
          const platformCommissionPercentage = 0.15; // 15% platform fee

          const technicianPayout = Math.round(totalAmount * technicianPayoutPercentage * 100) / 100;
          const platformCommission = Math.round(totalAmount * platformCommissionPercentage * 100) / 100;

          console.log('💵 Payment Breakdown:');
          console.log(`  Total Amount: ${totalAmount} KES`);
          console.log(`  Technician Payout (85%): ${technicianPayout} KES`);
          console.log(`  Platform Commission (15%): ${platformCommission} KES`);

          // Create payout transaction for technician
          const Transaction = require('../models/Transaction');
          const payoutTransaction = await Transaction.create({
            type: 'technician_payout',
            amount: {
              gross: technicianPayout,
              net: technicianPayout,
              currency: 'KES',
            },
            payer: transaction.payer, // Original customer who paid
            payee: booking.technician._id,
            booking: booking._id,
            paymentMethod: 'mpesa',
            status: 'pending', // Will be processed manually or via B2C API
            description: `Technician payout for ${booking.bookingNumber} (85% of ${totalAmount} KES)`,
            metadata: {
              totalAmount,
              technicianPercentage: 85,
              platformCommission,
              originalTransaction: transaction._id,
            },
          });

          console.log(`📝 Created payout transaction: ${payoutTransaction._id}`);

          // Release booking fee from escrow
          booking.bookingFee.status = 'released';
          booking.bookingFee.releasedAt = new Date();
          booking.bookingFee.heldInEscrow = false;
          booking.bookingFee.notes = 'Released after successful job completion';

          // Update booking status to verified
          booking.status = 'verified';
          booking.statusHistory.push({
            status: 'verified',
            changedBy: transaction.payer,
            changedAt: new Date(),
            reason: 'Payment completed - job verified',
          });

          await booking.save();
          console.log(`✅ Completion payment processed for booking ${booking.bookingNumber}`);
          console.log(`✅ Payout of ${technicianPayout} KES pending for technician`);
        } else {
          console.warn('⚠️ Booking not found for completion payment transaction');
        }
      }

      console.log(`✅ Payment successful: ${result.mpesaReceiptNumber}`);
    } else {
      // Payment failed
      console.log('❌ Payment failed');
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.failureReason = result.errorMessage || result.resultDesc;
      transaction.failureCode = result.resultCode.toString();
      transaction.mpesaDetails.resultCode = result.resultCode.toString();
      transaction.mpesaDetails.resultDescription = result.resultDesc;

      await transaction.save();

      console.log(`❌ Payment failed: ${result.resultDesc} (Code: ${result.resultCode})`);
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

/**
 * @desc    M-Pesa B2C callback handler
 * @route   POST /api/v1/payments/mpesa/b2c-callback
 * @access  Public (Called by M-Pesa)
 */
exports.b2cCallback = async (req, res) => {
  try {
    console.log('=== M-PESA B2C CALLBACK RECEIVED ===');
    console.log('Raw Callback:', JSON.stringify(req.body, null, 2));

    // Validate callback
    if (!mpesaService.validateB2CCallback(req.body)) {
      console.error('❌ Invalid M-Pesa B2C callback structure');
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback data',
      });
    }

    // Process callback
    console.log('✅ B2C Callback validated, processing...');
    const result = mpesaService.processB2CCallback(req.body);
    console.log('Processed B2C result:', JSON.stringify(result, null, 2));

    // Find transaction by ConversationID
    const transaction = await Transaction.findOne({
      'mpesaDetails.conversationId': result.conversationId,
    });

    if (!transaction) {
      console.error('Transaction not found for ConversationID:', result.conversationId);
      return res.status(404).json({
        ResultCode: 1,
        ResultDesc: 'Transaction not found',
      });
    }

    console.log('Found payout transaction:', transaction._id);

    // Update transaction based on result
    if (result.success) {
      // Payout successful
      console.log('💰 B2C Payment successful');
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.mpesaDetails.transactionReceipt = result.transactionReceipt;
      transaction.mpesaDetails.transactionId = result.transactionId;
      transaction.mpesaDetails.resultCode = '0';
      transaction.mpesaDetails.resultDescription = result.resultDesc;
      transaction.externalTransactionId = result.transactionId;

      // Add B2C specific details to metadata
      if (!transaction.metadata) transaction.metadata = {};
      transaction.metadata.b2cRecipientIsRegistered = result.b2CRecipientIsRegisteredCustomer;
      transaction.metadata.transactionCompletedDateTime = result.transactionCompletedDateTime;

      await transaction.save();
      console.log(`✅ Payout completed: ${result.transactionReceipt}`);

      // Notify technician of successful payout
      try {
        const notificationService = require('../services/notification.service');
        const booking = await Booking.findById(transaction.booking);
        if (booking) {
          await notificationService.createNotification({
            recipient: transaction.payee,
            type: 'payment',
            title: 'Payout Received',
            message: `You have received ${transaction.amount.gross} KES for booking ${booking.bookingNumber}`,
            relatedBooking: booking._id,
            priority: 'normal',
          });
        }
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    } else {
      // Payout failed
      console.log('❌ B2C Payment failed');
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.failureReason = result.errorMessage || result.resultDesc;
      transaction.failureCode = result.resultCode.toString();
      transaction.mpesaDetails.resultCode = result.resultCode.toString();
      transaction.mpesaDetails.resultDescription = result.resultDesc;

      await transaction.save();
      console.log(`❌ Payout failed: ${result.resultDesc} (Code: ${result.resultCode})`);
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
    console.error('M-Pesa B2C Callback Error:', error);

    // Always respond with success to M-Pesa to prevent retries
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
};

/**
 * @desc    M-Pesa B2C timeout handler
 * @route   POST /api/v1/payments/mpesa/b2c-timeout
 * @access  Public (Called by M-Pesa)
 */
exports.b2cTimeout = async (req, res) => {
  try {
    console.log('=== M-PESA B2C TIMEOUT RECEIVED ===');
    console.log('Raw Timeout:', JSON.stringify(req.body, null, 2));

    // Find transaction and mark as timed out
    const { Result } = req.body;
    if (Result && Result.ConversationID) {
      const transaction = await Transaction.findOne({
        'mpesaDetails.conversationId': Result.ConversationID,
      });

      if (transaction) {
        transaction.status = 'failed';
        transaction.failedAt = new Date();
        transaction.failureReason = 'Request timeout';
        transaction.failureCode = 'TIMEOUT';
        await transaction.save();
        console.log('Transaction marked as timed out:', transaction._id);
      }
    }

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Timeout received',
    });
  } catch (error) {
    console.error('M-Pesa B2C Timeout Error:', error);
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
};

module.exports = exports;
