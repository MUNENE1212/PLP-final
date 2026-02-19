const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Booking Fee Tier Schema - Tiered booking fee structure
const BookingFeeTierSchema = new Schema({
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAmount: {
    type: Number,
    default: null // null = no upper limit
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  label: {
    type: String // e.g., "Standard", "Medium", "Large Jobs"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Service Price Schema - Base prices for different services
const ServicePriceSchema = new Schema({
  serviceCategory: {
    type: String,
    enum: ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'],
    required: true
  },
  serviceType: {
    type: String,
    required: true // e.g., "Pipe Repair", "Electrical Wiring", etc.
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceUnit: {
    type: String,
    enum: ['fixed', 'per_hour', 'per_sqm', 'per_unit'],
    default: 'fixed'
  },
  estimatedDuration: {
    type: Number, // in hours (supports fractions like 0.5, 1.5, etc.)
    default: 1
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Distance-based Pricing Tiers
const DistanceTierSchema = new Schema({
  minDistance: {
    type: Number, // in kilometers
    required: true,
    default: 0
  },
  maxDistance: {
    type: Number, // in kilometers
    required: true
  },
  pricePerKm: {
    type: Number,
    required: true
  },
  flatFee: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Urgency Multipliers
const UrgencyMultiplierSchema = new Schema({
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    required: true
  },
  multiplier: {
    type: Number,
    required: true,
    min: 1 // Cannot be less than 1
  },
  description: String
}, { _id: false });

// Time-based Pricing (Peak hours, weekends, etc.)
const TimePricingSchema = new Schema({
  name: {
    type: String,
    required: true // e.g., "Weekend", "After Hours", "Holiday"
  },
  daysOfWeek: [{
    type: Number, // 0 = Sunday, 1 = Monday, etc.
    min: 0,
    max: 6
  }],
  startTime: String, // "HH:MM" format
  endTime: String,
  multiplier: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Technician Tier Pricing
const TechnicianTierSchema = new Schema({
  tierName: {
    type: String,
    required: true // e.g., "Junior", "Senior", "Expert", "Master"
  },
  minExperience: {
    type: Number, // in years
    required: true
  },
  minRating: {
    type: Number,
    min: 0,
    max: 5
  },
  minCompletedJobs: {
    type: Number,
    default: 0
  },
  priceMultiplier: {
    type: Number,
    required: true,
    min: 1
  },
  description: String
}, { _id: false });

// Main Pricing Configuration Schema
const PricingConfigSchema = new Schema({
  // Configuration Name
  name: {
    type: String,
    required: true,
    default: 'Default Pricing Configuration'
  },

  // Service Prices
  servicePrices: [ServicePriceSchema],

  // Booking Fee Tiers - Tiered fee structure based on booking amount
  bookingFeeTiers: [BookingFeeTierSchema],

  // Default booking fee percentage (fallback if no tiers configured)
  defaultBookingFeePercentage: {
    type: Number,
    default: 12,
    min: 0,
    max: 100
  },

  // Distance Pricing
  distancePricing: {
    enabled: {
      type: Boolean,
      default: true
    },
    tiers: [DistanceTierSchema],
    maxServiceDistance: {
      type: Number, // in kilometers
      default: 50
    }
  },

  // Urgency Multipliers
  urgencyMultipliers: [UrgencyMultiplierSchema],

  // Time-based Pricing
  timePricing: {
    enabled: {
      type: Boolean,
      default: true
    },
    schedules: [TimePricingSchema]
  },

  // Technician Tier Pricing
  technicianTiers: {
    enabled: {
      type: Boolean,
      default: true
    },
    tiers: [TechnicianTierSchema]
  },

  // Platform Fees
  platformFee: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      required: true,
      default: 15 // 15% or fixed amount
    }
  },

  // Tax Configuration
  tax: {
    enabled: {
      type: Boolean,
      default: true
    },
    rate: {
      type: Number,
      default: 16 // 16% VAT in Kenya
    },
    name: {
      type: String,
      default: 'VAT'
    }
  },

  // Discount Configuration
  discounts: {
    firstTimeCustomer: {
      enabled: {
        type: Boolean,
        default: true
      },
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      },
      value: {
        type: Number,
        default: 10
      }
    },
    loyaltyDiscount: {
      enabled: {
        type: Boolean,
        default: true
      },
      thresholds: [{
        minBookings: Number,
        discount: Number // percentage
      }]
    }
  },

  // Surge Pricing (for high demand periods)
  surgePricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    threshold: {
      type: Number, // When technician availability drops below this percentage
      default: 20
    },
    maxMultiplier: {
      type: Number,
      default: 2
    }
  },

  // Minimum and Maximum Prices
  minBookingPrice: {
    type: Number,
    default: 500 // KES
  },
  maxBookingPrice: {
    type: Number,
    default: 100000 // KES
  },

  // Currency
  currency: {
    type: String,
    default: 'KES'
  },

  // Version Control
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Effective dates
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveTo: Date,

  // Metadata
  notes: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
PricingConfigSchema.index({ isActive: 1, effectiveFrom: -1 });
PricingConfigSchema.index({ 'servicePrices.serviceCategory': 1 });
PricingConfigSchema.index({ version: -1 });

// ===== VIRTUALS =====
PricingConfigSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive &&
         this.effectiveFrom <= now &&
         (!this.effectiveTo || this.effectiveTo >= now);
});

// ===== VALIDATION =====

/**
 * Validate booking fee tiers configuration
 * - Tiers must not overlap
 * - Tiers should cover all amounts (0 to infinity)
 * - Percentage must be between 0 and 100
 */
PricingConfigSchema.pre('save', function(next) {
  // Skip validation if no booking fee tiers configured
  if (!this.bookingFeeTiers || this.bookingFeeTiers.length === 0) {
    return next();
  }

  const activeTiers = this.bookingFeeTiers.filter(tier => tier.isActive);

  // Validate each tier's percentage is within bounds
  for (const tier of activeTiers) {
    if (tier.percentage < 0 || tier.percentage > 100) {
      const error = new Error(
        `Booking fee tier "${tier.label || 'unnamed'}" has invalid percentage: ${tier.percentage}. Must be between 0 and 100.`
      );
      return next(error);
    }

    // Validate minAmount is non-negative
    if (tier.minAmount < 0) {
      const error = new Error(
        `Booking fee tier "${tier.label || 'unnamed'}" has negative minAmount: ${tier.minAmount}. Must be >= 0.`
      );
      return next(error);
    }

    // Validate maxAmount if not null
    if (tier.maxAmount !== null && tier.maxAmount <= tier.minAmount) {
      const error = new Error(
        `Booking fee tier "${tier.label || 'unnamed'}" has maxAmount (${tier.maxAmount}) <= minAmount (${tier.minAmount}).`
      );
      return next(error);
    }
  }

  // Sort tiers by minAmount for overlap and coverage checking
  const sortedTiers = [...activeTiers].sort((a, b) => a.minAmount - b.minAmount);

  // Check for overlaps and gaps
  for (let i = 0; i < sortedTiers.length; i++) {
    const current = sortedTiers[i];

    // First tier should start at 0
    if (i === 0 && current.minAmount !== 0) {
      const error = new Error(
        `Booking fee tiers must start at minAmount 0. First tier "${current.label || 'unnamed'}" starts at ${current.minAmount}.`
      );
      return next(error);
    }

    // Check for gaps between tiers
    if (i > 0) {
      const previous = sortedTiers[i - 1];
      const expectedMin = previous.maxAmount !== null ? previous.maxAmount + 1 : previous.minAmount;

      if (previous.maxAmount === null) {
        const error = new Error(
          `Booking fee tier "${previous.label || 'unnamed'}" has no upper limit (maxAmount: null), but there's another tier "${current.label || 'unnamed'}" after it.`
        );
        return next(error);
      }

      if (current.minAmount > expectedMin) {
        const error = new Error(
          `Gap in booking fee tiers: No coverage between ${previous.maxAmount} and ${current.minAmount}. Tiers must be contiguous.`
        );
        return next(error);
      }

      if (current.minAmount < expectedMin) {
        const error = new Error(
          `Overlap in booking fee tiers: "${previous.label || 'unnamed'}" (${previous.minAmount}-${previous.maxAmount}) overlaps with "${current.label || 'unnamed'}" (${current.minAmount}-${current.maxAmount || 'null'}).`
        );
        return next(error);
      }
    }
  }

  // Last tier should have no upper limit (maxAmount: null) to cover all amounts
  const lastTier = sortedTiers[sortedTiers.length - 1];
  if (lastTier.maxAmount !== null) {
    // This is a warning, not an error - amounts beyond the last tier will use default percentage
    console.warn(
      `[PricingConfig] Warning: Last booking fee tier "${lastTier.label || 'unnamed'}" has an upper limit. ` +
      `Amounts above ${lastTier.maxAmount} will use default percentage (${this.defaultBookingFeePercentage}%).`
    );
  }

  next();
});

// ===== METHODS =====

// Get service price by category and type
PricingConfigSchema.methods.getServicePrice = function(serviceCategory, serviceType) {
  return this.servicePrices.find(sp =>
    sp.serviceCategory === serviceCategory &&
    sp.serviceType === serviceType &&
    sp.isActive
  );
};

// Get distance tier for a given distance
PricingConfigSchema.methods.getDistanceTier = function(distance) {
  if (!this.distancePricing.enabled) return null;

  return this.distancePricing.tiers.find(tier =>
    distance >= tier.minDistance && distance <= tier.maxDistance
  );
};

// Get urgency multiplier
PricingConfigSchema.methods.getUrgencyMultiplier = function(urgencyLevel) {
  const multiplier = this.urgencyMultipliers.find(um =>
    um.urgencyLevel === urgencyLevel
  );
  return multiplier ? multiplier.multiplier : 1;
};

// Get time-based multiplier
PricingConfigSchema.methods.getTimeMultiplier = function(dateTime) {
  if (!this.timePricing.enabled) return 1;

  const dayOfWeek = dateTime.getDay();
  const time = `${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;

  let maxMultiplier = 1;

  for (const schedule of this.timePricing.schedules) {
    if (!schedule.isActive) continue;

    // Check day of week
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      if (!schedule.daysOfWeek.includes(dayOfWeek)) continue;
    }

    // Check time range
    if (schedule.startTime && schedule.endTime) {
      if (time >= schedule.startTime && time <= schedule.endTime) {
        maxMultiplier = Math.max(maxMultiplier, schedule.multiplier);
      }
    } else {
      maxMultiplier = Math.max(maxMultiplier, schedule.multiplier);
    }
  }

  return maxMultiplier;
};

// Get technician tier multiplier
PricingConfigSchema.methods.getTechnicianMultiplier = function(technician) {
  if (!this.technicianTiers.enabled) return 1;

  // Sort tiers by minExperience descending to get highest matching tier
  const sortedTiers = [...this.technicianTiers.tiers].sort(
    (a, b) => b.minExperience - a.minExperience
  );

  for (const tier of sortedTiers) {
    const meetsExperience = technician.experience >= tier.minExperience;
    const meetsRating = !tier.minRating || technician.rating >= tier.minRating;
    const meetsJobs = !tier.minCompletedJobs || technician.completedJobs >= tier.minCompletedJobs;

    if (meetsExperience && meetsRating && meetsJobs) {
      return tier.priceMultiplier;
    }
  }

  return 1;
};

// Calculate discount
PricingConfigSchema.methods.calculateDiscount = function(customer, subtotal) {
  let discount = 0;

  // First-time customer discount
  if (this.discounts.firstTimeCustomer.enabled && customer.isFirstBooking) {
    if (this.discounts.firstTimeCustomer.type === 'percentage') {
      discount += (subtotal * this.discounts.firstTimeCustomer.value) / 100;
    } else {
      discount += this.discounts.firstTimeCustomer.value;
    }
  }

  // Loyalty discount
  if (this.discounts.loyaltyDiscount.enabled && this.discounts.loyaltyDiscount.thresholds) {
    const sortedThresholds = [...this.discounts.loyaltyDiscount.thresholds].sort(
      (a, b) => b.minBookings - a.minBookings
    );

    for (const threshold of sortedThresholds) {
      if (customer.totalBookings >= threshold.minBookings) {
        discount += (subtotal * threshold.discount) / 100;
        break;
      }
    }
  }

  return discount;
};

/**
 * Get applicable booking fee tier for a given amount
 * @param {Number} amount - The booking amount to find the tier for
 * @returns {Object|null} The matching tier or null if no tiers configured
 */
PricingConfigSchema.methods.getApplicableTier = function(amount) {
  // If no tiers configured or amount is invalid, return null
  if (!this.bookingFeeTiers || this.bookingFeeTiers.length === 0 || amount < 0) {
    return null;
  }

  // Sort tiers by minAmount ascending to ensure correct matching
  const sortedTiers = [...this.bookingFeeTiers]
    .filter(tier => tier.isActive)
    .sort((a, b) => a.minAmount - b.minAmount);

  // Find the first tier where amount falls within range
  for (const tier of sortedTiers) {
    const withinMin = amount >= tier.minAmount;
    const withinMax = tier.maxAmount === null || amount <= tier.maxAmount;

    if (withinMin && withinMax) {
      return tier;
    }
  }

  // If no tier found (should not happen with properly configured tiers),
  // return the last active tier for amounts beyond the highest maxAmount
  const lastActiveTier = sortedTiers[sortedTiers.length - 1];
  if (lastActiveTier && lastActiveTier.maxAmount === null && amount >= lastActiveTier.minAmount) {
    return lastActiveTier;
  }

  return null;
};

/**
 * Calculate booking fee based on amount using tiered structure
 * @param {Number} amount - The booking amount to calculate fee for
 * @returns {Object} Object containing fee amount, percentage, and tier info
 */
PricingConfigSchema.methods.calculateBookingFee = function(amount) {
  // Validate input
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    return {
      feeAmount: 0,
      percentage: this.defaultBookingFeePercentage || 12,
      tier: null,
      tierLabel: 'Default',
      isDefault: true
    };
  }

  // Try to get applicable tier
  const applicableTier = this.getApplicableTier(amount);

  if (applicableTier) {
    const feeAmount = Math.round((amount * applicableTier.percentage) / 100 * 100) / 100;
    return {
      feeAmount,
      percentage: applicableTier.percentage,
      tier: applicableTier,
      tierLabel: applicableTier.label || 'Custom',
      isDefault: false
    };
  }

  // Fallback to default percentage if no tier matches
  const defaultPercentage = this.defaultBookingFeePercentage || 12;
  const feeAmount = Math.round((amount * defaultPercentage) / 100 * 100) / 100;
  return {
    feeAmount,
    percentage: defaultPercentage,
    tier: null,
    tierLabel: 'Default',
    isDefault: true
  };
};

// ===== STATIC METHODS =====

// Get active pricing configuration
PricingConfigSchema.statics.getActivePricing = async function() {
  const now = new Date();
  return this.findOne({
    isActive: true,
    effectiveFrom: { $lte: now },
    $or: [
      { effectiveTo: { $exists: false } },
      { effectiveTo: { $gte: now } }
    ]
  }).sort({ version: -1 });
};

// Get all service prices for a category
PricingConfigSchema.statics.getServicePricesByCategory = async function(category) {
  const config = await this.getActivePricing();
  if (!config) return [];

  return config.servicePrices.filter(sp =>
    sp.serviceCategory === category && sp.isActive
  );
};

/**
 * Get or create default pricing configuration with recommended booking fee tiers
 * This ensures there's always a valid pricing config available
 * @returns {Promise<Object>} The pricing configuration document
 */
PricingConfigSchema.statics.getOrCreateDefault = async function() {
  // First, try to get existing active config
  let config = await this.getActivePricing();

  if (config) {
    return config;
  }

  // Create default configuration with recommended fee tiers
  const defaultConfig = {
    name: 'Default Pricing Configuration',
    bookingFeeTiers: [
      {
        minAmount: 0,
        maxAmount: 5000,
        percentage: 12,
        label: 'Standard',
        isActive: true
      },
      {
        minAmount: 5001,
        maxAmount: 20000,
        percentage: 10,
        label: 'Medium',
        isActive: true
      },
      {
        minAmount: 20001,
        maxAmount: null, // No upper limit
        percentage: 8,
        label: 'Large Jobs',
        isActive: true
      }
    ],
    defaultBookingFeePercentage: 12,
    servicePrices: [
      // Default service prices for each category
      { serviceCategory: 'plumbing', serviceType: 'general', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 2 },
      { serviceCategory: 'electrical', serviceType: 'general', basePrice: 1500, priceUnit: 'fixed', estimatedDuration: 2 },
      { serviceCategory: 'carpentry', serviceType: 'general', basePrice: 1200, priceUnit: 'fixed', estimatedDuration: 3 },
      { serviceCategory: 'masonry', serviceType: 'general', basePrice: 2000, priceUnit: 'per_hour', estimatedDuration: 4 },
      { serviceCategory: 'painting', serviceType: 'general', basePrice: 800, priceUnit: 'per_sqm', estimatedDuration: 4 },
      { serviceCategory: 'hvac', serviceType: 'general', basePrice: 2500, priceUnit: 'fixed', estimatedDuration: 2 },
      { serviceCategory: 'welding', serviceType: 'general', basePrice: 1800, priceUnit: 'fixed', estimatedDuration: 3 }
    ],
    distancePricing: {
      enabled: true,
      tiers: [
        { minDistance: 0, maxDistance: 5, pricePerKm: 0, flatFee: 0 },
        { minDistance: 5, maxDistance: 15, pricePerKm: 50, flatFee: 0 },
        { minDistance: 15, maxDistance: 30, pricePerKm: 40, flatFee: 100 },
        { minDistance: 30, maxDistance: 50, pricePerKm: 35, flatFee: 200 }
      ],
      maxServiceDistance: 50
    },
    urgencyMultipliers: [
      { urgencyLevel: 'low', multiplier: 1.0, description: 'Scheduled more than 3 days ahead' },
      { urgencyLevel: 'medium', multiplier: 1.0, description: 'Standard scheduling' },
      { urgencyLevel: 'high', multiplier: 1.25, description: 'Within 24 hours' },
      { urgencyLevel: 'emergency', multiplier: 1.5, description: 'Within 4 hours' }
    ],
    timePricing: {
      enabled: true,
      schedules: [
        {
          name: 'Weekend',
          daysOfWeek: [0, 6], // Sunday and Saturday
          multiplier: 1.15,
          isActive: true
        },
        {
          name: 'After Hours',
          daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          startTime: '18:00',
          endTime: '23:59',
          multiplier: 1.1,
          isActive: true
        }
      ]
    },
    technicianTiers: {
      enabled: true,
      tiers: [
        { tierName: 'Junior', minExperience: 0, minRating: 0, minCompletedJobs: 0, priceMultiplier: 1.0, description: 'New technicians' },
        { tierName: 'Mid-Level', minExperience: 2, minRating: 4.0, minCompletedJobs: 20, priceMultiplier: 1.15, description: 'Experienced technicians' },
        { tierName: 'Senior', minExperience: 5, minRating: 4.5, minCompletedJobs: 50, priceMultiplier: 1.3, description: 'Highly experienced' },
        { tierName: 'Expert', minExperience: 10, minRating: 4.8, minCompletedJobs: 100, priceMultiplier: 1.5, description: 'Master technicians' }
      ]
    },
    platformFee: {
      type: 'percentage',
      value: 15
    },
    tax: {
      enabled: true,
      rate: 16,
      name: 'VAT'
    },
    discounts: {
      firstTimeCustomer: {
        enabled: true,
        type: 'percentage',
        value: 10
      },
      loyaltyDiscount: {
        enabled: true,
        thresholds: [
          { minBookings: 5, discount: 5 },
          { minBookings: 10, discount: 10 },
          { minBookings: 20, discount: 15 }
        ]
      }
    },
    surgePricing: {
      enabled: false,
      threshold: 20,
      maxMultiplier: 2
    },
    minBookingPrice: 500,
    maxBookingPrice: 100000,
    currency: 'KES',
    isActive: true,
    version: 1
  };

  config = await this.create(defaultConfig);
  return config;
};

// Clone configuration for new version
PricingConfigSchema.methods.cloneForNewVersion = async function() {
  const newConfig = this.toObject();
  delete newConfig._id;
  delete newConfig.createdAt;
  delete newConfig.updatedAt;

  newConfig.version = this.version + 1;
  newConfig.effectiveFrom = new Date();
  newConfig.effectiveTo = undefined;

  // Deactivate current config
  this.isActive = false;
  this.effectiveTo = new Date();
  await this.save();

  return this.constructor.create(newConfig);
};

module.exports = mongoose.model('PricingConfig', PricingConfigSchema);
