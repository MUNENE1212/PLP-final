const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Milestone Schema
 * Individual milestone within a milestone-based payment plan
 */
const MilestoneSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Milestone name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    required: [true, 'Milestone percentage is required']
  },
  amount: {
    type: Number,
    min: 0
  },
  dueDate: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, { _id: true });

/**
 * Payment Plan Schema
 * Flexible pricing structures for technician services
 * Supports hourly, fixed, milestone, per-project, and negotiable pricing
 */
const PaymentPlanSchema = new Schema({
  // References
  technician: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Technician reference is required'],
    index: true
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required'],
    index: true
  },

  // Plan type
  planType: {
    type: String,
    enum: ['hourly', 'fixed', 'milestone', 'per_project', 'negotiable'],
    required: [true, 'Plan type is required'],
    index: true
  },

  // Hourly pricing configuration
  hourlyRate: {
    amount: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative']
    },
    currency: {
      type: String,
      default: 'KES',
      uppercase: true
    },
    minimumHours: {
      type: Number,
      min: [0.5, 'Minimum hours must be at least 0.5'],
      default: 1
    }
  },

  // Fixed pricing configuration
  fixedPrice: {
    amount: {
      type: Number,
      min: [0, 'Fixed price cannot be negative']
    },
    currency: {
      type: String,
      default: 'KES',
      uppercase: true
    },
    includesMaterials: {
      type: Boolean,
      default: false
    },
    estimatedDuration: {
      type: Number, // in minutes
      min: [15, 'Estimated duration must be at least 15 minutes']
    }
  },

  // Milestone-based pricing configuration
  milestones: [MilestoneSchema],

  // Per-project (quote-based) pricing configuration
  perProject: {
    baseAmount: {
      type: Number,
      min: [0, 'Base amount cannot be negative']
    },
    requiresQuote: {
      type: Boolean,
      default: true
    },
    estimatedRange: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0,
        validate: {
          validator: function(value) {
            return !this.perProject?.estimatedRange?.min || value >= this.perProject.estimatedRange.min;
          },
          message: 'Maximum estimate must be greater than or equal to minimum'
        }
      }
    },
    typicalDuration: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'varies'],
      default: 'varies'
    }
  },

  // Deposit requirements
  deposit: {
    required: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    minimumAmount: {
      type: Number,
      min: 0
    }
  },

  // Availability settings
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },

  // Terms and conditions
  terms: {
    type: String,
    maxlength: 2000,
    trim: true
  },

  // Cancellation policy
  cancellationPolicy: {
    freeCancellationHours: {
      type: Number,
      min: 0,
      default: 24
    },
    cancellationFeePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },

  // Usage statistics
  stats: {
    timesUsed: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== COMPOUND INDEXES =====
PaymentPlanSchema.index({ technician: 1, service: 1 }, { unique: true });
PaymentPlanSchema.index({ technician: 1, isActive: 1 });
PaymentPlanSchema.index({ service: 1, isActive: 1 });
PaymentPlanSchema.index({ planType: 1, isActive: 1 });
PaymentPlanSchema.index({ validFrom: 1, validUntil: 1 });

// ===== VIRTUAL FIELDS =====

/**
 * Virtual for checking if plan is currently valid
 */
PaymentPlanSchema.virtual('isValid').get(function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  return true;
});

/**
 * Virtual for displaying the price based on plan type
 */
PaymentPlanSchema.virtual('displayPrice').get(function() {
  const currency = this.getCurrency();

  switch (this.planType) {
    case 'hourly':
      return `${currency} ${this.hourlyRate?.amount?.toLocaleString()}/hr`;
    case 'fixed':
      return `${currency} ${this.fixedPrice?.amount?.toLocaleString()}`;
    case 'milestone':
      const total = this.milestones?.reduce((sum, m) => sum + (m.amount || 0), 0) || 0;
      return `${currency} ${total.toLocaleString()} (milestones)`;
    case 'per_project':
      if (this.perProject?.estimatedRange?.min && this.perProject?.estimatedRange?.max) {
        return `${currency} ${this.perProject.estimatedRange.min.toLocaleString()} - ${this.perProject.estimatedRange.max.toLocaleString()}`;
      }
      return 'Quote required';
    case 'negotiable':
      return 'Negotiable';
    default:
      return 'Contact for pricing';
  }
});

// ===== INSTANCE METHODS =====

/**
 * Get the currency for this payment plan
 * @returns {string} Currency code (e.g., 'KES')
 */
PaymentPlanSchema.methods.getCurrency = function() {
  switch (this.planType) {
    case 'hourly':
      return this.hourlyRate?.currency || 'KES';
    case 'fixed':
      return this.fixedPrice?.currency || 'KES';
    default:
      return 'KES';
  }
};

/**
 * Calculate total price based on plan type and options
 * @param {Object} options - Calculation options
 * @param {number} options.hours - Number of hours (for hourly plans)
 * @param {number} options.quantity - Quantity/units
 * @returns {Object} Calculation result with breakdown
 */
PaymentPlanSchema.methods.calculateTotal = function(options = {}) {
  const { hours = 1, quantity = 1 } = options;
  const currency = this.getCurrency();
  const result = {
    success: true,
    planType: this.planType,
    currency,
    breakdown: {},
    totalAmount: 0,
    depositAmount: 0
  };

  try {
    switch (this.planType) {
      case 'hourly':
        const effectiveHours = Math.max(hours, this.hourlyRate?.minimumHours || 1);
        result.breakdown = {
          hourlyRate: this.hourlyRate.amount,
          hours: effectiveHours,
          minimumHours: this.hourlyRate.minimumHours
        };
        result.totalAmount = this.hourlyRate.amount * effectiveHours * quantity;
        break;

      case 'fixed':
        result.breakdown = {
          fixedAmount: this.fixedPrice.amount,
          includesMaterials: this.fixedPrice.includesMaterials,
          quantity
        };
        result.totalAmount = this.fixedPrice.amount * quantity;
        break;

      case 'milestone':
        const milestones = this.milestones || [];
        result.breakdown = {
          milestones: milestones.map(m => ({
            name: m.name,
            percentage: m.percentage,
            amount: m.amount
          })),
          totalMilestones: milestones.length
        };
        result.totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
        break;

      case 'per_project':
        if (this.perProject.requiresQuote) {
          result.success = false;
          result.error = 'This service requires a custom quote';
          result.estimatedRange = this.perProject.estimatedRange;
        } else {
          result.breakdown = {
            baseAmount: this.perProject.baseAmount,
            quantity
          };
          result.totalAmount = this.perProject.baseAmount * quantity;
        }
        break;

      case 'negotiable':
        result.success = false;
        result.error = 'Price is negotiable. Please contact the technician for a quote.';
        break;

      default:
        result.success = false;
        result.error = 'Unknown plan type';
    }

    // Calculate deposit if required
    if (result.success && this.deposit?.required && result.totalAmount > 0) {
      if (this.deposit.percentage) {
        result.depositAmount = (result.totalAmount * this.deposit.percentage) / 100;
      }
      if (this.deposit.minimumAmount && result.depositAmount < this.deposit.minimumAmount) {
        result.depositAmount = this.deposit.minimumAmount;
      }
      result.breakdown.deposit = {
        required: true,
        percentage: this.deposit.percentage,
        minimumAmount: this.deposit.minimumAmount,
        calculatedAmount: result.depositAmount
      };
    }

    // Round amounts to 2 decimal places
    result.totalAmount = Math.round(result.totalAmount * 100) / 100;
    result.depositAmount = Math.round(result.depositAmount * 100) / 100;

    return result;

  } catch (error) {
    return {
      success: false,
      error: error.message,
      planType: this.planType,
      totalAmount: 0
    };
  }
};

/**
 * Calculate cancellation fee based on hours until service
 * @param {Date} serviceDate - The scheduled service date
 * @returns {Object} Cancellation details
 */
PaymentPlanSchema.methods.calculateCancellationFee = function(serviceDate) {
  const now = new Date();
  const service = new Date(serviceDate);
  const hoursUntilService = (service - now) / (1000 * 60 * 60);

  if (hoursUntilService >= (this.cancellationPolicy?.freeCancellationHours || 24)) {
    return {
      isFree: true,
      feeAmount: 0,
      feePercent: 0,
      message: 'Free cancellation available'
    };
  }

  const feePercent = this.cancellationPolicy?.cancellationFeePercent || 0;
  return {
    isFree: false,
    feePercent,
    feeAmount: null, // Requires total amount to calculate
    message: `Cancellation fee of ${feePercent}% applies`
  };
};

/**
 * Validate plan data based on plan type
 * @returns {Object} Validation result
 */
PaymentPlanSchema.methods.validatePlanData = function() {
  const errors = [];

  switch (this.planType) {
    case 'hourly':
      if (!this.hourlyRate?.amount || this.hourlyRate.amount <= 0) {
        errors.push('Hourly rate amount is required for hourly plans');
      }
      break;

    case 'fixed':
      if (!this.fixedPrice?.amount || this.fixedPrice.amount <= 0) {
        errors.push('Fixed price amount is required for fixed price plans');
      }
      break;

    case 'milestone':
      if (!this.milestones || this.milestones.length === 0) {
        errors.push('At least one milestone is required for milestone plans');
      } else {
        const totalPercentage = this.milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          errors.push('Milestone percentages must sum to 100%');
        }
      }
      break;

    case 'per_project':
      if (!this.perProject?.requiresQuote) {
        if (!this.perProject?.baseAmount || this.perProject.baseAmount <= 0) {
          errors.push('Base amount is required for non-quote per-project plans');
        }
      }
      break;

    case 'negotiable':
      // No specific validation required
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===== STATIC METHODS =====

/**
 * Find all active payment plans for a technician
 * @param {ObjectId} technicianId - Technician's user ID
 * @returns {Promise<Array>} List of payment plans
 */
PaymentPlanSchema.statics.findByTechnician = function(technicianId) {
  return this.find({
    technician: technicianId,
    isActive: true
  })
    .populate('service', 'name description category')
    .sort({ createdAt: -1 });
};

/**
 * Find all active payment plans for a service
 * @param {ObjectId} serviceId - Service ID
 * @returns {Promise<Array>} List of payment plans
 */
PaymentPlanSchema.statics.findByService = function(serviceId) {
  return this.find({
    service: serviceId,
    isActive: true
  })
    .populate('technician', 'firstName lastName rating hourlyRate businessName')
    .sort({ 'stats.averageRating': -1 });
};

/**
 * Get active payment plan for a technician-service combination
 * @param {ObjectId} technicianId - Technician's user ID
 * @param {ObjectId} serviceId - Service ID
 * @returns {Promise<Object|null>} Payment plan or null
 */
PaymentPlanSchema.statics.getActivePlan = function(technicianId, serviceId) {
  return this.findOne({
    technician: technicianId,
    service: serviceId,
    isActive: true
  }).populate('service', 'name description category');
};

/**
 * Find all expired plans that should be deactivated
 * @returns {Promise<Array>} List of expired plans
 */
PaymentPlanSchema.statics.findExpired = function() {
  return this.find({
    isActive: true,
    validUntil: { $lt: new Date() }
  });
};

/**
 * Get popular plan types for analytics
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Aggregated plan type statistics
 */
PaymentPlanSchema.statics.getPopularPlanTypes = function(limit = 5) {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$planType', count: { $sum: 1 }, avgRevenue: { $avg: '$stats.totalRevenue' } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// ===== MIDDLEWARE =====

/**
 * Pre-save validation middleware
 */
PaymentPlanSchema.pre('save', function(next) {
  // Validate plan-specific data
  const validation = this.validatePlanData();
  if (!validation.isValid) {
    return next(new Error(`Validation failed: ${validation.errors.join(', ')}`));
  }

  // Auto-calculate milestone amounts if percentages are set but amounts aren't
  if (this.planType === 'milestone' && this.milestones?.length > 0) {
    // This is handled separately when we have a total amount
  }

  // Ensure valid date range
  if (this.validFrom && this.validUntil && this.validFrom >= this.validUntil) {
    return next(new Error('validUntil must be after validFrom'));
  }

  next();
});

// Export the model
module.exports = mongoose.model('PaymentPlan', PaymentPlanSchema);
