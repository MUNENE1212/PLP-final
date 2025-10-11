const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// M-Pesa specific details
const MPesaDetailsSchema = new Schema({
  merchantRequestId: String,
  checkoutRequestId: String,
  mpesaReceiptNumber: String,
  phoneNumber: String,
  transactionDate: Date,
  resultCode: String,
  resultDescription: String
}, { _id: false });

// Stripe specific details
const StripeDetailsSchema = new Schema({
  paymentIntentId: String,
  chargeId: String,
  customerId: String,
  paymentMethodId: String,
  last4: String,
  brand: String
}, { _id: false });

// Refund Details
const RefundSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  reason: String,
  refundedAt: {
    type: Date,
    default: Date.now
  },
  refundedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: String // External refund transaction ID
}, { _id: false });

// Main Transaction Schema
const TransactionSchema = new Schema({
  // Reference Numbers
  transactionNumber: {
    type: String,
    unique: true,
    required: true
  },
  externalTransactionId: String, // From payment gateway

  // Parties Involved
  payer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Transaction Type
  type: {
    type: String,
    enum: [
      'booking_payment',      // Customer pays for booking
      'technician_payout',    // Platform pays technician
      'wallet_topup',         // User adds money to wallet
      'wallet_withdrawal',    // User withdraws from wallet
      'refund',              // Refund to customer
      'penalty',             // Penalty fee
      'subscription',        // Subscription payment
      'tip',                 // Customer tips technician
      'cancellation_fee'     // Cancellation charges
    ],
    required: true
  },

  // Amount Details
  amount: {
    gross: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    net: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },

  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'stripe', 'wallet', 'cash', 'bank_transfer'],
    required: true
  },

  // Gateway-specific details
  mpesaDetails: MPesaDetailsSchema,
  stripeDetails: StripeDetailsSchema,

  // Transaction Status
  status: {
    type: String,
    enum: [
      'initiated',      // Payment initiated
      'pending',        // Waiting for confirmation
      'processing',     // Being processed by gateway
      'completed',      // Successfully completed
      'failed',         // Failed
      'cancelled',      // Cancelled by user
      'expired',        // Payment window expired
      'refunded',       // Refunded
      'partially_refunded' // Partially refunded
    ],
    default: 'initiated',
    required: true
  },

  // Status Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,

  // Failure Details
  failureReason: String,
  failureCode: String,

  // Refund Details
  refund: RefundSchema,

  // Metadata
  description: String,
  notes: String,

  // Webhook Data
  webhookData: {
    received: {
      type: Boolean,
      default: false
    },
    receivedAt: Date,
    rawData: Schema.Types.Mixed,
    verified: {
      type: Boolean,
      default: false
    }
  },

  // Settlement (for technician payouts)
  settlement: {
    scheduled: {
      type: Boolean,
      default: false
    },
    scheduledAt: Date,
    settledAt: Date,
    settlementBatch: String,
    bankAccount: {
      accountNumber: String,
      bankName: String,
      accountName: String
    }
  },

  // Split Payment (for platform fees)
  splits: [{
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    percentage: Number,
    description: String
  }],

  // Escrow (hold payment until service completion)
  escrow: {
    held: {
      type: Boolean,
      default: false
    },
    heldAt: Date,
    releasedAt: Date,
    releaseCondition: String // 'service_completed', 'customer_verified', etc.
  },

  // Receipt & Invoice
  receipt: {
    generated: {
      type: Boolean,
      default: false
    },
    url: String,
    number: String
  },
  invoice: {
    generated: {
      type: Boolean,
      default: false
    },
    url: String,
    number: String
  },

  // Reconciliation
  reconciliation: {
    reconciled: {
      type: Boolean,
      default: false
    },
    reconciledAt: Date,
    reconciledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    discrepancy: Number,
    notes: String
  },

  // IP & Device Info (for fraud detection)
  metadata: {
    ipAddress: String,
    userAgent: String,
    device: String,
    location: {
      country: String,
      city: String,
      coordinates: [Number]
    }
  },

  // Fraud Detection
  fraudCheck: {
    flagged: {
      type: Boolean,
      default: false
    },
    riskScore: Number,
    reasons: [String],
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    approved: Boolean
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
TransactionSchema.index({ externalTransactionId: 1 });
TransactionSchema.index({ payer: 1, status: 1 });
TransactionSchema.index({ payee: 1, status: 1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ completedAt: -1 });
TransactionSchema.index({ 'amount.gross': -1 });
TransactionSchema.index({ 'fraudCheck.flagged': 1 });

// Compound indexes for reporting
TransactionSchema.index({ status: 1, completedAt: -1 });
TransactionSchema.index({ type: 1, createdAt: -1 });
TransactionSchema.index({ payer: 1, createdAt: -1 });

// ===== VIRTUALS =====
TransactionSchema.virtual('isPending').get(function() {
  return ['initiated', 'pending', 'processing'].includes(this.status);
});

TransactionSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

TransactionSchema.virtual('isFailed').get(function() {
  return ['failed', 'cancelled', 'expired'].includes(this.status);
});

TransactionSchema.virtual('processingTime').get(function() {
  if (!this.completedAt || !this.initiatedAt) return null;
  return Math.round((this.completedAt - this.initiatedAt) / 1000); // in seconds
});

// ===== MIDDLEWARE =====

// Generate transaction number before saving
TransactionSchema.pre('save', async function(next) {
  if (!this.transactionNumber) {
    const count = await mongoose.model('Transaction').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(6, '0');
    this.transactionNumber = `TXN${year}${month}${day}${sequence}`;
  }
  next();
});

// Update timestamps based on status changes
TransactionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();

    switch(this.status) {
      case 'processing':
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        // Release escrow if held
        if (this.escrow.held && !this.escrow.releasedAt) {
          this.escrow.releasedAt = now;
        }
        break;
      case 'failed':
      case 'cancelled':
      case 'expired':
        if (!this.failedAt) this.failedAt = now;
        break;
    }
  }
  next();
});

// ===== METHODS =====

// Mark as completed
TransactionSchema.methods.markAsCompleted = async function(externalTxnId = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (externalTxnId) {
    this.externalTransactionId = externalTxnId;
  }
  await this.save();
  return this;
};

// Mark as failed
TransactionSchema.methods.markAsFailed = async function(reason, code = null) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  if (code) this.failureCode = code;
  await this.save();
  return this;
};

// Process refund
TransactionSchema.methods.processRefund = async function(amount, reason, userId) {
  if (this.status !== 'completed') {
    throw new Error('Cannot refund a transaction that is not completed');
  }

  const refundAmount = amount || this.amount.gross;

  if (refundAmount > this.amount.gross) {
    throw new Error('Refund amount cannot exceed transaction amount');
  }

  this.refund = {
    amount: refundAmount,
    reason,
    refundedBy: userId,
    refundedAt: new Date(),
    status: 'pending'
  };

  if (refundAmount === this.amount.gross) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }

  await this.save();
  return this;
};

// Complete refund
TransactionSchema.methods.completeRefund = async function(externalRefundId) {
  if (!this.refund) {
    throw new Error('No refund initiated for this transaction');
  }

  this.refund.status = 'completed';
  this.refund.transactionId = externalRefundId;
  await this.save();
  return this;
};

// Hold in escrow
TransactionSchema.methods.holdInEscrow = async function(releaseCondition) {
  this.escrow = {
    held: true,
    heldAt: new Date(),
    releaseCondition
  };
  await this.save();
  return this;
};

// Release from escrow
TransactionSchema.methods.releaseFromEscrow = async function() {
  if (!this.escrow.held) {
    throw new Error('Transaction is not held in escrow');
  }

  this.escrow.releasedAt = new Date();
  await this.save();
  return this;
};

// Flag for fraud
TransactionSchema.methods.flagForFraud = async function(riskScore, reasons) {
  this.fraudCheck = {
    flagged: true,
    riskScore,
    reasons
  };
  await this.save();
  return this;
};

// Approve flagged transaction
TransactionSchema.methods.approveFlagged = async function(userId) {
  this.fraudCheck.approved = true;
  this.fraudCheck.reviewedBy = userId;
  this.fraudCheck.reviewedAt = new Date();
  await this.save();
  return this;
};

// Generate receipt
TransactionSchema.methods.generateReceipt = async function() {
  // This would typically call a service to generate PDF receipt
  this.receipt = {
    generated: true,
    number: `RCT-${this.transactionNumber}`,
    url: `/receipts/${this.transactionNumber}.pdf`
  };
  await this.save();
  return this;
};

// ===== STATIC METHODS =====

// Find transactions by user
TransactionSchema.statics.findByUser = function(userId, role = 'payer') {
  const query = role === 'payer' ? { payer: userId } : { payee: userId };
  return this.find(query)
    .populate('payer payee booking')
    .sort({ createdAt: -1 });
};

// Find pending transactions
TransactionSchema.statics.findPending = function() {
  return this.find({
    status: { $in: ['initiated', 'pending', 'processing'] }
  })
  .populate('payer payee')
  .sort({ createdAt: 1 });
};

// Find transactions requiring settlement
TransactionSchema.statics.findForSettlement = function() {
  return this.find({
    status: 'completed',
    type: 'booking_payment',
    'escrow.held': false,
    'settlement.scheduled': false
  })
  .populate('payee booking');
};

// Revenue analytics
TransactionSchema.statics.getRevenueStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount.gross' },
        platformFees: { $sum: '$amount.platformFee' },
        processingFees: { $sum: '$amount.processingFee' },
        netRevenue: { $sum: '$amount.net' },
        transactionCount: { $sum: 1 }
      }
    }
  ]);
};

// Daily revenue
TransactionSchema.statics.getDailyRevenue = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
          day: { $dayOfMonth: '$completedAt' }
        },
        revenue: { $sum: '$amount.gross' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

// Payment method statistics
TransactionSchema.statics.getPaymentMethodStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.gross' }
      }
    }
  ]);
};

// Find fraudulent transactions
TransactionSchema.statics.findFraudulent = function() {
  return this.find({
    'fraudCheck.flagged': true,
    'fraudCheck.approved': { $ne: true }
  })
  .populate('payer payee')
  .sort({ 'fraudCheck.riskScore': -1 });
};

// Failed transaction analysis
TransactionSchema.statics.getFailureStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: { $in: ['failed', 'cancelled', 'expired'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          status: '$status',
          reason: '$failureReason'
        },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', TransactionSchema);
