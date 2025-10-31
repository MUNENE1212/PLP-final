const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
