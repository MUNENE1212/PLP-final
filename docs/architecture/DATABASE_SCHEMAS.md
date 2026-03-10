# Database Schemas - Dumuwaks Service & Payment Architecture

## Overview

This document defines the MongoDB/Mongoose schemas for the new service discovery (WORD BANK), payment plans, and escrow system. The design follows Clean Architecture principles with clear separation between domain models.

**Architecture Pattern**: Hexagonal Architecture (Clean Architecture)
- **Domain Layer**: Pure business logic in schema methods
- **Application Layer**: Schema statics for complex queries
- **Infrastructure Layer**: Mongoose middleware and hooks

---

## Table of Contents

1. [Service Category Schema](#1-service-category-schema)
2. [Service Schema (WORD BANK)](#2-service-schema-word-bank)
3. [Technician Service Schema](#3-technician-service-schema)
4. [Payment Plan Schema](#4-payment-plan-schema)
5. [Escrow Schema](#5-escrow-schema)
6. [Payout Schema](#6-payout-schema)
7. [Enhanced Booking Schema](#7-enhanced-booking-schema-additions)
8. [Schema Relationships Diagram](#8-schema-relationships)

---

## 1. Service Category Schema

Master categories for the WORD BANK system - 16 categories containing 100+ services.

```javascript
// File: /backend/src/models/ServiceCategory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceCategorySchema = new Schema({
  // Identity
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/ // e.g., 'plumbing', 'electrical'
  },
  name: {
    type: String,
    required: true,
    maxlength: 50 // e.g., 'PLUMBING' (displayed uppercase)
  },

  // Visual Assets
  icon: {
    type: String, // Icon name or URL
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  color: {
    primary: { type: String, default: '#0066CC' },
    secondary: { type: String, default: '#E6F2FF' }
  },

  // Organization
  group: {
    type: String,
    enum: [
      'home_maintenance',
      'cleaning_pest',
      'appliances_hvac',
      'security_outdoor',
      'specialty_services'
    ],
    required: true
  },
  displayOrder: {
    type: Number,
    default: 0 // For sorting on home screen
  },

  // SEO & Discovery
  description: {
    type: String,
    maxlength: 200
  },
  keywords: [{
    type: String,
    lowercase: true
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false // Shows on home screen carousel
  },

  // Statistics
  stats: {
    totalBookings: { type: Number, default: 0 },
    activeTechnicians: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes
ServiceCategorySchema.index({ group: 1, displayOrder: 1 });
ServiceCategorySchema.index({ isActive: 1, isPopular: -1 });
ServiceCategorySchema.index({ slug: 1 }, { unique: true });

// Text search
ServiceCategorySchema.index({
  name: 'text',
  description: 'text',
  keywords: 'text'
});

// Virtual: services count
ServiceCategorySchema.virtual('servicesCount', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Static: Get popular categories
ServiceCategorySchema.statics.getPopular = function(limit = 6) {
  return this.find({ isActive: true, isPopular: true })
    .sort({ displayOrder: 1 })
    .limit(limit);
};

// Static: Get all active with services
ServiceCategorySchema.statics.getAllWithServices = function() {
  return this.find({ isActive: true })
    .sort({ group: 1, displayOrder: 1 })
    .populate('servicesCount');
};

module.exports = mongoose.model('ServiceCategory', ServiceCategorySchema);
```

---

## 2. Service Schema (WORD BANK)

Individual services within categories - the "words" in the WORD BANK.

```javascript
// File: /backend/src/models/Service.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
  // Identity
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 50 // e.g., 'PIPE REPAIR'
  },

  // Display
  shortName: {
    type: String,
    maxlength: 20 // Compact display: 'PIPE REPAIR' -> 'PIPE'
  },
  description: {
    type: String,
    maxlength: 500
  },

  // Visual
  icon: String,
  imageUrl: String,

  // Default Pricing (baseline, technician can override)
  defaultPricing: {
    model: {
      type: String,
      enum: ['hourly', 'fixed', 'per_unit', 'quote_required'],
      default: 'fixed'
    },
    baseRate: {
      type: Number,
      min: 0
    },
    unitLabel: {
      type: String, // e.g., 'per tap', 'per socket', 'per sq meter'
    },
    estimatedDuration: {
      min: { type: Number }, // in minutes
      max: { type: Number }
    },
    priceRange: {
      min: { type: Number },
      max: { type: Number }
    }
  },

  // Organization
  displayOrder: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    lowercase: true
  }],

  // Searchability
  searchTerms: [{
    type: String,
    lowercase: true
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isCustom: {
    type: Boolean,
    default: false // True if created by technician (not in WORD BANK)
  },

  // Statistics
  stats: {
    bookingCount: { type: Number, default: 0 },
    averagePrice: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Compound unique index: category + slug
ServiceSchema.index({ category: 1, slug: 1 }, { unique: true });
ServiceSchema.index({ category: 1, displayOrder: 1 });
ServiceSchema.index({ isActive: 1 });

// Text search
ServiceSchema.index({
  name: 'text',
  description: 'text',
  searchTerms: 'text',
  tags: 'text'
});

// Static: Get services by category
ServiceSchema.statics.getByCategory = function(categoryId) {
  return this.find({ category: categoryId, isActive: true })
    .sort({ displayOrder: 1 });
};

// Static: Search services
ServiceSchema.statics.searchServices = function(query, limit = 20) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .populate('category', 'name slug icon');
};

// Static: Get all WORD BANK services (for seeding)
ServiceSchema.statics.getWordBank = function() {
  return this.find({ isActive: true, isCustom: false })
    .sort({ 'category': 1, displayOrder: 1 })
    .populate('category', 'name slug icon');
};

module.exports = mongoose.model('Service', ServiceSchema);
```

---

## 3. Technician Service Schema

Technician's selected services with custom pricing - links technicians to services they offer.

```javascript
// File: /backend/src/models/TechnicianService.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Pricing Configuration Sub-Schema
const PricingConfigSchema = new Schema({
  model: {
    type: String,
    enum: ['hourly', 'fixed', 'per_unit', 'quote_required'],
    required: true
  },
  rate: {
    type: Number,
    required: true,
    min: [100, 'Rate must be at least KES 100'] // Business rule
  },
  unitLabel: {
    type: String,
    default: null // e.g., 'per tap', 'per socket', 'per meter'
  },
  minimumCharge: {
    type: Number,
    default: null // Minimum charge regardless of time/units
  },
  estimatedDuration: {
    min: { type: Number }, // in minutes
    max: { type: Number },
    typical: { type: Number }
  }
}, { _id: false });

// Availability Sub-Schema
const ServiceAvailabilitySchema = new Schema({
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableDays: [{
    type: Number, // 0-6 (Sunday-Saturday)
    min: 0,
    max: 6
  }],
  timeSlots: [{
    start: String, // "09:00"
    end: String    // "17:00"
  }],
  blackoutDates: [{
    date: Date,
    reason: String
  }]
}, { _id: false });

// Main Schema
const TechnicianServiceSchema = new Schema({
  // References
  technician: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: false // null for custom services
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  },

  // Custom Service (if not from WORD BANK)
  customService: {
    name: { type: String, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    isApproved: { type: Boolean, default: false } // Admin approval required
  },

  // Technician's Pricing
  pricing: {
    type: PricingConfigSchema,
    required: true
  },

  // Service Area for this specific service
  serviceArea: {
    maxDistance: {
      type: Number,
      default: 10, // km
      min: 1,
      max: 100
    },
    counties: [{
      type: String
    }]
  },

  // Availability
  availability: {
    type: ServiceAvailabilitySchema,
    default: () => ({ isAvailable: true })
  },

  // Portfolio/Work Samples for this service
  workSamples: [{
    imageUrl: String,
    publicId: String,
    caption: String,
    isBeforeAfter: { type: Boolean, default: false },
    beforeImageUrl: String
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'inactive'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Statistics
  stats: {
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    responseTime: { type: Number }, // in minutes
    completionRate: { type: Number, default: 0 } // percentage
  },

  // Verification
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    documents: [{
      type: String, // certification URLs
      uploadedAt: Date
    }]
  },

  // Timestamps
  lastBookedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Compound unique index: technician + service (or technician + custom service name)
TechnicianServiceSchema.index(
  { technician: 1, service: 1 },
  { unique: true, partialFilterExpression: { service: { $exists: true } } }
);
TechnicianServiceSchema.index({ technician: 1, 'customService.name': 1 });

// Query indexes
TechnicianServiceSchema.index({ technician: 1, status: 1 });
TechnicianServiceSchema.index({ category: 1, status: 1, isActive: 1 });
TechnicianServiceSchema.index({ 'stats.averageRating': -1 });
TechnicianServiceSchema.index({ 'pricing.rate': 1 });

// Text search for custom services
TechnicianServiceSchema.index({
  'customService.name': 'text',
  'customService.description': 'text'
});

// Virtual: Is custom service
TechnicianServiceSchema.virtual('isCustom').get(function() {
  return !this.service;
});

// Method: Calculate price estimate
TechnicianServiceSchema.methods.calculateEstimate = function(hours = 1, units = 1) {
  const { model, rate, minimumCharge } = this.pricing;

  let estimate = 0;
  switch (model) {
    case 'hourly':
      estimate = rate * hours;
      break;
    case 'fixed':
      estimate = rate;
      break;
    case 'per_unit':
      estimate = rate * units;
      break;
    case 'quote_required':
      return null; // Requires custom quote
  }

  if (minimumCharge && estimate < minimumCharge) {
    estimate = minimumCharge;
  }

  return estimate;
};

// Static: Find technicians by service
TechnicianServiceSchema.statics.findTechniciansByService = function(
  serviceId,
  options = {}
) {
  const { location, maxDistance = 10000, limit = 10 } = options;

  const query = {
    service: serviceId,
    status: 'active',
    isActive: true,
    'availability.isAvailable': true
  };

  return this.find(query)
    .populate('technician', 'firstName lastName profilePicture rating hourlyRate location')
    .sort({ 'stats.averageRating': -1, 'stats.completedBookings': -1 })
    .limit(limit);
};

// Static: Get technician's services
TechnicianServiceSchema.statics.getTechnicianServices = function(technicianId) {
  return this.find({ technician: technicianId, isActive: true })
    .populate('service')
    .populate('category', 'name slug icon')
    .sort({ 'stats.completedBookings': -1 });
};

// Static: Get services by category for technician
TechnicianServiceSchema.statics.getTechnicianServicesByCategory = function(
  technicianId,
  categoryId
) {
  return this.find({
    technician: technicianId,
    category: categoryId,
    isActive: true
  }).populate('service');
};

module.exports = mongoose.model('TechnicianService', TechnicianServiceSchema);
```

---

## 4. Payment Plan Schema

Defines pricing models for bookings - supports technician-defined pricing.

```javascript
// File: /backend/src/models/PaymentPlan.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Milestone Sub-Schema
const MilestoneSchema = new Schema({
  order: { type: Number, required: true },
  name: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  percentage: { type: Number }, // Percentage of total
  dueDate: Date,
  dueCondition: { type: String }, // e.g., 'on_start', 'on_completion'
  status: {
    type: String,
    enum: ['pending', 'due', 'paid', 'waived'],
    default: 'pending'
  },
  paidAt: Date,
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' }
}, { _id: false });

// Deposit Sub-Schema
const DepositSchema = new Schema({
  required: { type: Boolean, default: true },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  amount: { type: Number, default: 20 }, // 20% or fixed amount
  refundable: { type: Boolean, default: true },
  refundConditions: [{
    type: String,
    enum: [
      'job_completed',
      'customer_satisfied',
      'no_show_by_technician',
      'mutual_cancellation',
      'dispute_resolved_customer'
    ]
  }]
}, { _id: false });

// Main Schema
const PaymentPlanSchema = new Schema({
  // Reference
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },

  // Pricing Model
  model: {
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'per_unit', 'milestone', 'quote'],
      required: true
    },
    baseRate: { type: Number, required: true },
    estimatedHours: { type: Number },
    unitCount: { type: Number },
    unitLabel: { type: String }
  },

  // Price Breakdown
  breakdown: {
    baseAmount: { type: Number, required: true },
    materialsCost: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    urgencyPremium: { type: Number, default: 0 },
    weekendPremium: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountCode: { type: String },
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, required: true }, // 10-15%
    platformFeePercentage: { type: Number, default: 12.5 },
    tax: { type: Number, default: 0 }, // VAT 16%
    totalAmount: { type: Number, required: true }
  },

  // Deposit
  deposit: {
    type: DepositSchema,
    default: () => ({})
  },
  depositAmount: { type: Number },
  depositStatus: {
    type: String,
    enum: ['pending', 'paid', 'held', 'applied', 'refunded'],
    default: 'pending'
  },

  // Milestones (for milestone-based pricing)
  milestones: [MilestoneSchema],

  // Final Payment
  finalPayment: {
    amount: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending'
    },
    dueAt: Date,
    paidAt: Date
  },

  // Technician Earnings
  technicianEarnings: {
    grossAmount: { type: Number },
    platformFee: { type: Number },
    taxDeduction: { type: Number, default: 0 },
    netAmount: { type: Number }
  },

  // Status
  status: {
    type: String,
    enum: [
      'draft',
      'pending_deposit',
      'deposit_paid',
      'in_progress',
      'pending_final',
      'completed',
      'refunded',
      'disputed'
    ],
    default: 'draft'
  },

  // Negotiation
  negotiation: {
    originalTotal: { type: Number },
    proposedTotal: { type: Number },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    proposedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected', 'expired']
    },
    validUntil: Date
  },

  // Currency
  currency: {
    type: String,
    default: 'KES'
  },

  // Audit
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
  toJSON: { virtuals: true }
});

// Indexes
PaymentPlanSchema.index({ booking: 1 }, { unique: true });
PaymentPlanSchema.index({ status: 1 });
PaymentPlanSchema.index({ 'depositStatus': 1 });
PaymentPlanSchema.index({ createdAt: -1 });

// Virtual: Total paid
PaymentPlanSchema.virtual('totalPaid').get(function() {
  let paid = 0;
  if (this.depositStatus === 'paid' || this.depositStatus === 'applied') {
    paid += this.depositAmount || 0;
  }
  if (this.finalPayment.status === 'paid') {
    paid += this.finalPayment.amount || 0;
  }
  return paid;
});

// Virtual: Balance due
PaymentPlanSchema.virtual('balanceDue').get(function() {
  return Math.max(0, this.breakdown.totalAmount - this.totalPaid);
});

// Method: Calculate technician earnings
PaymentPlanSchema.methods.calculateTechnicianEarnings = function() {
  const total = this.breakdown.totalAmount;
  const platformFeePct = this.breakdown.platformFeePercentage / 100;

  this.technicianEarnings = {
    grossAmount: total,
    platformFee: Math.round(total * platformFeePct),
    taxDeduction: 0, // Withholding tax if applicable
    netAmount: Math.round(total * (1 - platformFeePct))
  };

  return this.technicianEarnings;
};

// Method: Calculate deposit
PaymentPlanSchema.methods.calculateDeposit = function() {
  const total = this.breakdown.totalAmount;

  if (this.deposit.type === 'percentage') {
    this.depositAmount = Math.round(total * (this.deposit.amount / 100));
  } else {
    this.depositAmount = this.deposit.amount;
  }

  return this.depositAmount;
};

// Static: Get pending payments
PaymentPlanSchema.statics.getPendingPayments = function() {
  return this.find({
    status: { $in: ['pending_deposit', 'pending_final'] }
  })
    .populate('booking')
    .sort({ createdAt: 1 });
};

module.exports = mongoose.model('PaymentPlan', PaymentPlanSchema);
```

---

## 5. Escrow Schema

Holds funds securely until service completion.

```javascript
// File: /backend/src/models/Escrow.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Escrow Event Sub-Schema
const EscrowEventSchema = new Schema({
  type: {
    type: String,
    enum: [
      'created',
      'funded',
      'hold_started',
      'release_scheduled',
      'released',
      'refund_initiated',
      'refunded',
      'disputed',
      'dispute_resolved',
      'partial_release'
    ],
    required: true
  },
  amount: { type: Number },
  triggeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  triggeredAt: { type: Date, default: Date.now },
  notes: String,
  metadata: Schema.Types.Mixed
}, { _id: false });

// Main Schema
const EscrowSchema = new Schema({
  // References
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  paymentPlan: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentPlan',
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technician: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Amounts
  amounts: {
    held: { type: Number, default: 0 },      // Currently in escrow
    released: { type: Number, default: 0 },   // Released to technician
    refunded: { type: Number, default: 0 },   // Refunded to customer
    pending: { type: Number, default: 0 }     // Pending release/refund
  },

  // Status
  status: {
    type: String,
    enum: [
      'pending',          // Awaiting funding
      'funded',           // Money received, on hold
      'partially_released', // Some funds released
      'released',         // All funds released to technician
      'refunded',         // All funds returned to customer
      'disputed',         // Under dispute
      'resolved'          // Dispute resolved
    ],
    default: 'pending'
  },

  // Release Conditions
  releaseConditions: {
    type: {
      type: String,
      enum: [
        'auto_on_completion',    // Auto-release when booking marked complete
        'customer_confirmation', // Customer must confirm
        'manual_review',         // Admin approval required
        'milestone_based'        // Release in milestones
      ],
      default: 'customer_confirmation'
    },
    autoReleaseAfter: {
      type: Number, // Hours after completion before auto-release
      default: 48
    },
    requirePhotoEvidence: {
      type: Boolean,
      default: true
    }
  },

  // Release Schedule
  releaseSchedule: {
    scheduledAt: Date,
    releasedAt: Date,
    releaseMethod: {
      type: String,
      enum: ['mpesa', 'bank_transfer', 'wallet']
    },
    releaseReference: String
  },

  // Dispute Info
  dispute: {
    raisedAt: Date,
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    resolution: String,
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    outcome: {
      type: String,
      enum: ['customer_favor', 'technician_favor', 'split']
    },
    splitRatio: {
      customerPercentage: { type: Number },
      technicianPercentage: { type: Number }
    }
  },

  // Audit Trail
  events: [EscrowEventSchema],

  // Timestamps
  fundedAt: Date,
  holdStartedAt: Date,
  releasedAt: Date,
  refundedAt: Date,

  // Security
  checksum: String, // For integrity verification

  // Metadata
  metadata: Schema.Types.Mixed

}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes
EscrowSchema.index({ booking: 1 }, { unique: true });
EscrowSchema.index({ customer: 1, status: 1 });
EscrowSchema.index({ technician: 1, status: 1 });
EscrowSchema.index({ status: 1 });
EscrowSchema.index({ 'releaseSchedule.scheduledAt': 1 });
EscrowSchema.index({ createdAt: -1 });

// Virtual: Is active
EscrowSchema.virtual('isActive').get(function() {
  return ['pending', 'funded', 'partially_released', 'disputed'].includes(this.status);
});

// Method: Add event
EscrowSchema.methods.addEvent = function(type, amount, userId, notes = '') {
  this.events.push({
    type,
    amount,
    triggeredBy: userId,
    triggeredAt: new Date(),
    notes
  });
  return this;
};

// Method: Fund escrow
EscrowSchema.methods.fund = async function(amount, transactionId, userId) {
  if (this.status !== 'pending') {
    throw new Error('Escrow is not in pending state');
  }

  this.amounts.held = amount;
  this.status = 'funded';
  this.fundedAt = new Date();
  this.holdStartedAt = new Date();

  this.addEvent('funded', amount, userId, `Funded via transaction ${transactionId}`);

  // Schedule auto-release
  const releaseDate = new Date();
  releaseDate.setHours(releaseDate.getHours() + this.releaseConditions.autoReleaseAfter);
  this.releaseSchedule.scheduledAt = releaseDate;

  return this.save();
};

// Method: Release funds
EscrowSchema.methods.release = async function(amount, userId, method = 'mpesa') {
  if (!['funded', 'partially_released'].includes(this.status)) {
    throw new Error('Escrow is not funded');
  }

  const releaseAmount = amount || this.amounts.held;

  this.amounts.released += releaseAmount;
  this.amounts.held -= releaseAmount;

  this.releaseSchedule.releasedAt = new Date();
  this.releaseSchedule.releaseMethod = method;

  if (this.amounts.held === 0) {
    this.status = 'released';
  } else {
    this.status = 'partially_released';
  }

  this.addEvent('released', releaseAmount, userId, `Released via ${method}`);

  return this.save();
};

// Method: Refund funds
EscrowSchema.methods.refund = async function(amount, userId, reason) {
  if (!['funded', 'disputed'].includes(this.status)) {
    throw new Error('Escrow cannot be refunded in current state');
  }

  const refundAmount = amount || this.amounts.held;

  this.amounts.refunded = refundAmount;
  this.amounts.held -= refundAmount;
  this.status = 'refunded';
  this.refundedAt = new Date();

  this.addEvent('refunded', refundAmount, userId, `Refunded: ${reason}`);

  return this.save();
};

// Method: Raise dispute
EscrowSchema.methods.raiseDispute = async function(reason, userId) {
  if (!['funded', 'partially_released'].includes(this.status)) {
    throw new Error('Cannot dispute escrow in current state');
  }

  this.status = 'disputed';
  this.dispute = {
    raisedAt: new Date(),
    raisedBy: userId,
    reason
  };

  this.addEvent('disputed', null, userId, reason);

  return this.save();
};

// Method: Resolve dispute
EscrowSchema.methods.resolveDispute = async function(
  outcome,
  splitRatio,
  resolution,
  adminId
) {
  this.dispute.outcome = outcome;
  this.dispute.resolution = resolution;
  this.dispute.resolvedAt = new Date();
  this.dispute.resolvedBy = adminId;
  this.dispute.splitRatio = splitRatio;
  this.status = 'resolved';

  this.addEvent('dispute_resolved', null, adminId, `Resolution: ${resolution}`);

  return this.save();
};

// Static: Get pending releases
EscrowSchema.statics.getPendingReleases = function() {
  const now = new Date();
  return this.find({
    status: 'funded',
    'releaseSchedule.scheduledAt': { $lte: now }
  })
    .populate('booking technician customer')
    .sort({ 'releaseSchedule.scheduledAt': 1 });
};

// Static: Get disputes
EscrowSchema.statics.getDisputes = function() {
  return this.find({ status: 'disputed' })
    .populate('booking technician customer')
    .sort({ 'dispute.raisedAt': -1 });
};

// Static: Get technician escrow balance
EscrowSchema.statics.getTechnicianBalance = async function(technicianId) {
  const result = await this.aggregate([
    {
      $match: {
        technician: mongoose.Types.ObjectId(technicianId),
        status: 'funded'
      }
    },
    {
      $group: {
        _id: null,
        totalHeld: { $sum: '$amounts.held' },
        totalPending: { $sum: '$amounts.pending' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { totalHeld: 0, totalPending: 0, count: 0 };
};

module.exports = mongoose.model('Escrow', EscrowSchema);
```

---

## 6. Payout Schema

Tracks technician payouts from completed jobs.

```javascript
// File: /backend/src/models/Payout.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Payout Item Sub-Schema (references to bookings)
const PayoutItemSchema = new Schema({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  escrow: {
    type: Schema.Types.ObjectId,
    ref: 'Escrow'
  },
  amount: { type: Number, required: true },
  platformFee: { type: Number },
  netAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'included', 'processing', 'paid'],
    default: 'pending'
  }
}, { _id: false });

// Main Schema
const PayoutSchema = new Schema({
  // Reference
  technician: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Payout Details
  payoutNumber: {
    type: String,
    unique: true
    // Generated: PO-YYYYMM-XXXXX
  },
  payoutType: {
    type: String,
    enum: ['instant', 'daily', 'weekly', 'monthly', 'manual'],
    default: 'daily'
  },

  // Amounts
  amounts: {
    grossAmount: { type: Number, default: 0 },
    platformFees: { type: Number, default: 0 },
    adjustments: { type: Number, default: 0 },
    netAmount: { type: Number, required: true }
  },

  // Items
  items: [PayoutItemSchema],
  itemCount: { type: Number, default: 0 },

  // Payment Method
  paymentMethod: {
    type: {
      type: String,
      enum: ['mpesa', 'bank_transfer', 'wallet'],
      required: true
    },
    // M-Pesa
    mpesaNumber: String,
    mpesaName: String,
    // Bank
    bankName: String,
    bankAccountNumber: String,
    bankAccountName: String
  },

  // Status
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'submitted',
      'completed',
      'failed',
      'cancelled'
    ],
    default: 'pending'
  },

  // Scheduling
  scheduledAt: Date,
  processedAt: Date,
  completedAt: Date,

  // Transaction References
  transactionReference: String, // From payment provider
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },

  // Failure Info
  failureReason: String,
  failureCode: String,
  retryCount: { type: Number, default: 0 },
  nextRetryAt: Date,

  // Period (for batch payouts)
  period: {
    startDate: Date,
    endDate: Date
  },

  // Metadata
  notes: String,
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes
PayoutSchema.index({ technician: 1, status: 1 });
PayoutSchema.index({ technician: 1, createdAt: -1 });
PayoutSchema.index({ status: 1, scheduledAt: 1 });
PayoutSchema.index({ payoutNumber: 1 }, { unique: true });

// Pre-save: Generate payout number
PayoutSchema.pre('save', async function(next) {
  if (!this.payoutNumber) {
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = await mongoose.model('Payout').countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
      }
    });
    this.payoutNumber = `PO-${yearMonth}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

// Virtual: Is pending
PayoutSchema.virtual('isPending').get(function() {
  return ['pending', 'processing', 'submitted'].includes(this.status);
});

// Method: Add item
PayoutSchema.methods.addItem = function(item) {
  this.items.push({
    ...item,
    status: 'included'
  });
  this.itemCount = this.items.length;
  this.amounts.grossAmount += item.amount;
  this.amounts.platformFees += item.platformFee || 0;
  this.amounts.netAmount += item.netAmount;
  return this;
};

// Method: Mark as processing
PayoutSchema.methods.markProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

// Method: Mark as completed
PayoutSchema.methods.markCompleted = function(transactionRef, transactionId) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.transactionReference = transactionRef;
  this.transactionId = transactionId;

  // Update all items
  this.items.forEach(item => {
    item.status = 'paid';
  });

  return this.save();
};

// Method: Mark as failed
PayoutSchema.methods.markFailed = function(reason, code) {
  this.status = 'failed';
  this.failureReason = reason;
  this.failureCode = code;
  this.retryCount += 1;

  // Schedule retry
  if (this.retryCount < 3) {
    const retryDelay = Math.pow(2, this.retryCount) * 60 * 60 * 1000; // Exponential backoff
    this.nextRetryAt = new Date(Date.now() + retryDelay);
  }

  return this.save();
};

// Static: Get pending payouts
PayoutSchema.statics.getPendingPayouts = function() {
  return this.find({
    status: { $in: ['pending', 'processing'] }
  })
    .populate('technician', 'firstName lastName phoneNumber')
    .sort({ scheduledAt: 1 });
};

// Static: Get technician payouts
PayoutSchema.statics.getTechnicianPayouts = function(technicianId, limit = 20) {
  return this.find({ technician: technicianId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static: Get payouts for retry
PayoutSchema.statics.getForRetry = function() {
  return this.find({
    status: 'failed',
    retryCount: { $lt: 3 },
    nextRetryAt: { $lte: new Date() }
  })
    .populate('technician')
    .sort({ nextRetryAt: 1 });
};

// Static: Calculate technician earnings
PayoutSchema.statics.getTechnicianEarnings = async function(technicianId, period) {
  const matchStage = {
    technician: mongoose.Types.ObjectId(technicianId),
    status: 'completed'
  };

  if (period) {
    matchStage.completedAt = {
      $gte: period.start,
      $lte: period.end
    };
  }

  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalGross: { $sum: '$amounts.grossAmount' },
        totalFees: { $sum: '$amounts.platformFees' },
        totalNet: { $sum: '$amounts.netAmount' },
        payoutCount: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { totalGross: 0, totalFees: 0, totalNet: 0, payoutCount: 0 };
};

module.exports = mongoose.model('Payout', PayoutSchema);
```

---

## 7. Enhanced Booking Schema (Additions)

Additions to the existing Booking schema to support new features.

```javascript
// Add these fields to the existing Booking schema in /backend/src/models/Booking.js

// Add to the main schema:

// Enhanced Service Selection (WORD BANK integration)
serviceDetails: {
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service'
  },
  technicianService: {
    type: Schema.Types.ObjectId,
    ref: 'TechnicianService'
  },
  customServiceName: String,
  customServiceDescription: String,
  isCustomService: {
    type: Boolean,
    default: false
  }
},

// Enhanced Pricing (supports multiple models)
pricingModel: {
  type: {
    type: String,
    enum: ['hourly', 'fixed', 'per_unit', 'milestone', 'quote'],
    default: 'fixed'
  },
  rate: Number,
  estimatedHours: Number,
  actualHours: Number,
  unitCount: Number,
  unitLabel: String
},

// Payment Plan Reference
paymentPlan: {
  type: Schema.Types.ObjectId,
  ref: 'PaymentPlan'
},

// Escrow Reference
escrow: {
  type: Schema.Types.ObjectId,
  ref: 'Escrow'
},

// Milestone Tracking (for milestone-based jobs)
milestoneTracking: {
  currentMilestone: { type: Number, default: 0 },
  totalMilestones: { type: Number, default: 0 },
  milestones: [{
    order: Number,
    name: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'approved'],
      default: 'pending'
    },
    completedAt: Date,
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
}
```

---

## 8. Schema Relationships

```
+------------------+       +------------------+
| ServiceCategory  |<------|     Service      |
|------------------|       |------------------|
| _id              |       | _id              |
| slug             |       | category (FK)    |
| name             |       | slug             |
| icon             |       | name             |
| group            |       | defaultPricing   |
+------------------+       +------------------+
         ^                          ^
         |                          |
         |                          |
+------------------+       +------------------+
|TechnicianService |       |     Booking      |
|------------------|       |------------------|
| _id              |       | _id              |
| technician (FK)  |------>| customer (FK)    |
| service (FK)     |       | technician (FK)  |
| category (FK)----+       | serviceDetails   |
| pricing          |       |   category (FK)  |
| stats            |       |   service (FK)   |
+------------------+       |   technicianSvc  |
         |                 | paymentPlan (FK) |
         |                 | escrow (FK)      |
         v                 +------------------+
+------------------+                |
|   PaymentPlan    |<---------------+
|------------------|                |
| _id              |                |
| booking (FK)-----+                |
| model            |                |
| breakdown        |                |
| deposit          |                |
| milestones       |                |
+------------------+                |
         |                          |
         v                          |
+------------------+                |
|     Escrow       |<---------------+
|------------------|
| _id              |
| booking (FK)     |
| paymentPlan (FK) |
| customer (FK)    |
| technician (FK)  |
| amounts          |
| status           |
+------------------+
         |
         v
+------------------+
|     Payout       |
|------------------|
| _id              |
| technician (FK)  |
| items[]          |
|   booking (FK)   |
|   escrow (FK)    |
| amounts          |
| paymentMethod    |
+------------------+
         |
         v
+------------------+
|   Transaction    |
|------------------|
| _id              |
| payer (FK)       |
| payee (FK)       |
| booking (FK)     |
| type             |
| amount           |
| paymentMethod    |
+------------------+
```

---

## Migration Notes

### Adding New Schemas

1. Create schema files in `/backend/src/models/`
2. Import in `/backend/src/models/index.js` (if exists) or require directly
3. Run migrations to create collections

### Data Migration Steps

1. **Seed Service Categories**: Insert 16 categories
2. **Seed Services**: Insert 100+ services with category references
3. **Migrate Existing Bookings**: Add `serviceDetails` to existing bookings
4. **Create TechnicianServices**: From existing user skills

### Index Creation

```javascript
// Run these in MongoDB shell or migration script
db.servicecategories.createIndex({ slug: 1 }, { unique: true });
db.services.createIndex({ category: 1, slug: 1 }, { unique: true });
db.technicianservices.createIndex({ technician: 1, service: 1 }, { unique: true, partialFilterExpression: { service: { $exists: true } } });
db.paymentplans.createIndex({ booking: 1 }, { unique: true });
db.escrows.createIndex({ booking: 1 }, { unique: true });
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-17 | System Architect | Initial schema design |

