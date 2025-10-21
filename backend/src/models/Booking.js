const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Service Location Schema
const ServiceLocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: String,
  county: String,
  postalCode: String,
  landmarks: String,
  accessInstructions: String
}, { _id: false });

// Time Slot Schema
const TimeSlotSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // "09:00"
  },
  endTime: {
    type: String,
    required: true // "11:00"
  },
  estimatedDuration: Number // in minutes
}, { _id: false });

// Status History Schema (for tracking state changes)
const StatusHistorySchema = new Schema({
  status: {
    type: String,
    required: true
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  reason: String,
  notes: String
}, { _id: false });

// Main Booking Schema
const BookingSchema = new Schema({
  // Reference IDs
  bookingNumber: {
    type: String,
    unique: true
    // Note: Auto-generated in pre-save hook, not required here
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technician: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Service Details
  serviceCategory: {
    type: String,
    enum: ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'],
    required: true
  },
  serviceType: {
    type: String,
    required: true // e.g., "Pipe Repair", "Electrical Wiring", etc.
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },

  // Images (for problem description)
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],

  // Location
  serviceLocation: {
    type: ServiceLocationSchema,
    required: true,
    index: '2dsphere'
  },

  // Scheduling
  timeSlot: {
    type: TimeSlotSchema,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  actualDuration: Number, // in minutes

  // Status Management (FSM)
  status: {
    type: String,
    enum: [
      'pending',           // Initial state - waiting for technician assignment
      'matching',          // AI is finding suitable technicians
      'assigned',          // Technician assigned, waiting for acceptance
      'accepted',          // Technician accepted the job
      'rejected',          // Technician rejected the job
      'en_route',          // Technician is on the way
      'arrived',           // Technician has arrived at location
      'in_progress',       // Work is in progress
      'paused',            // Work temporarily paused
      'completed',         // Work completed by technician
      'verified',          // Customer verified completion
      'payment_pending',   // Waiting for payment
      'paid',              // Payment completed
      'cancelled',         // Booking cancelled
      'disputed',          // There's a dispute
      'refunded'           // Payment refunded
    ],
    default: 'pending',
    required: true
  },

  // Status History (Audit Trail)
  statusHistory: [StatusHistorySchema],

  // Pricing
  pricing: {
    basePrice: Number,
    serviceCharge: Number,
    platformFee: Number,
    tax: Number,
    discount: Number,
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },

  // Payment Details
  payment: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['mpesa', 'card', 'cash', 'wallet']
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    paidAt: Date
  },

  // Matching Details
  matchingDetails: {
    requestedAt: Date,
    matchedAt: Date,
    algorithm: String, // 'ai', 'manual', 'auto'
    matchScore: Number,
    alternativeTechnicians: [{
      technician: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      score: Number,
      reason: String
    }]
  },

  // Communication
  notes: {
    customer: String,
    technician: String,
    admin: String
  },

  // Ratings & Reviews
  rating: {
    customerRating: Number,
    technicianRating: Number,
    customerReview: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    },
    technicianReview: {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  },

  // Cancellation
  cancellation: {
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    cancellationFee: Number
  },

  // Dispute
  dispute: {
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    raisedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed']
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolution: String
  },

  // Additional Services (upselling)
  additionalServices: [{
    name: String,
    description: String,
    price: Number,
    addedAt: Date
  }],

  // Materials Used
  materialsUsed: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    providedBy: {
      type: String,
      enum: ['technician', 'customer']
    }
  }],

  // Warranty
  warranty: {
    offered: {
      type: Boolean,
      default: false
    },
    duration: Number, // in days
    terms: String,
    expiresAt: Date
  },

  // Corporate Booking (if applicable)
  corporateDetails: {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    projectName: String,
    projectCode: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    department: String
  },

  // Reminders & Notifications
  reminders: [{
    type: {
      type: String,
      enum: ['booking_confirmation', 'technician_arrival', 'payment_reminder', 'review_request']
    },
    sentAt: Date,
    channel: {
      type: String,
      enum: ['email', 'sms', 'push']
    }
  }],

  // Quality Assurance
  qualityCheck: {
    checked: {
      type: Boolean,
      default: false
    },
    checkedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: Date,
    score: Number,
    notes: String
  },

  // Metadata
  source: {
    type: String,
    enum: ['mobile_app', 'web_app', 'admin_panel', 'api', 'ai_matching'],
    default: 'mobile_app'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringParent: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Soft Delete
  deletedAt: Date,
  deleteReason: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
BookingSchema.index({ customer: 1, status: 1 });
BookingSchema.index({ technician: 1, status: 1 });
BookingSchema.index({ status: 1, 'timeSlot.date': 1 });
BookingSchema.index({ serviceCategory: 1, status: 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ 'timeSlot.date': 1 });
BookingSchema.index({ 'payment.status': 1 });

// Text search for booking number and description
BookingSchema.index({
  bookingNumber: 'text',
  description: 'text',
  serviceType: 'text'
});

// ===== VIRTUALS =====
BookingSchema.virtual('isUpcoming').get(function() {
  return this.timeSlot.date > new Date() &&
         ['pending', 'matching', 'assigned', 'accepted'].includes(this.status);
});

BookingSchema.virtual('isActive').get(function() {
  return ['en_route', 'arrived', 'in_progress', 'paused'].includes(this.status);
});

BookingSchema.virtual('isPastDue').get(function() {
  return this.timeSlot.date < new Date() &&
         !['completed', 'verified', 'paid', 'cancelled', 'disputed', 'refunded'].includes(this.status);
});

BookingSchema.virtual('durationInHours').get(function() {
  if (!this.actualDuration) return null;
  return (this.actualDuration / 60).toFixed(2);
});

// ===== MIDDLEWARE =====

// Generate booking number before saving
BookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const count = await mongoose.model('Booking').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(6, '0');
    this.bookingNumber = `BK${year}${month}${sequence}`;
  }
  next();
});

// Add to status history when status changes
BookingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this._currentUser || this.customer, // Set by controller
      changedAt: new Date(),
      notes: this._statusChangeNote || '' // Set by controller
    });
  }
  next();
});

// Calculate actual duration when job is completed
BookingSchema.pre('save', function(next) {
  if (this.actualStartTime && this.actualEndTime) {
    const diff = this.actualEndTime - this.actualStartTime;
    this.actualDuration = Math.round(diff / (1000 * 60)); // in minutes
  }
  next();
});

// ===== METHODS =====

// Check if booking can be cancelled
BookingSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending', 'matching', 'assigned', 'accepted'];
  return cancellableStatuses.includes(this.status);
};

// Check if booking can be disputed
BookingSchema.methods.canBeDisputed = function() {
  const disputableStatuses = ['completed', 'verified', 'paid'];
  return disputableStatuses.includes(this.status);
};

// Check if payment is due
BookingSchema.methods.isPaymentDue = function() {
  return ['payment_pending', 'completed', 'verified'].includes(this.status) &&
         this.payment.status === 'pending';
};

// Transition to next status (FSM)
BookingSchema.methods.transitionTo = async function(newStatus, userId, reason = '') {
  // Define valid state transitions
  const validTransitions = {
    'pending': ['matching', 'cancelled'],
    'matching': ['assigned', 'cancelled'],
    'assigned': ['accepted', 'rejected', 'cancelled'],
    'rejected': ['matching', 'cancelled'],
    'accepted': ['en_route', 'cancelled'],
    'en_route': ['arrived', 'cancelled'],
    'arrived': ['in_progress', 'cancelled'],
    'in_progress': ['paused', 'completed', 'cancelled'],
    'paused': ['in_progress', 'cancelled'],
    'completed': ['verified', 'disputed', 'cancelled'],
    'verified': ['payment_pending'],
    'payment_pending': ['paid', 'disputed'],
    'paid': ['disputed'],
    'disputed': ['refunded', 'completed'],
    'cancelled': [],
    'refunded': []
  };

  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  this._currentUser = userId;
  this._statusChangeNote = reason;
  this.status = newStatus;

  // Set timestamps for specific statuses
  if (newStatus === 'en_route' && !this.actualStartTime) {
    this.actualStartTime = new Date();
  }
  if (newStatus === 'completed' && !this.actualEndTime) {
    this.actualEndTime = new Date();
  }
  if (newStatus === 'cancelled') {
    this.cancellation = {
      cancelledBy: userId,
      cancelledAt: new Date(),
      reason: reason
    };
  }

  await this.save();
  return this;
};

// Calculate cancellation fee
BookingSchema.methods.calculateCancellationFee = function() {
  const now = new Date();
  const bookingDate = new Date(this.timeSlot.date);
  const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);

  if (hoursUntilBooking > 24) {
    return 0; // Free cancellation
  } else if (hoursUntilBooking > 6) {
    return this.pricing.totalAmount * 0.25; // 25% fee
  } else if (hoursUntilBooking > 2) {
    return this.pricing.totalAmount * 0.50; // 50% fee
  } else {
    return this.pricing.totalAmount * 0.75; // 75% fee
  }
};

// Send reminder
BookingSchema.methods.sendReminder = async function(type, channel) {
  this.reminders.push({
    type,
    sentAt: new Date(),
    channel
  });
  await this.save();
};

// ===== STATIC METHODS =====

// Find bookings by status
BookingSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('customer', 'firstName lastName phoneNumber profilePicture')
    .populate('technician', 'firstName lastName phoneNumber profilePicture rating')
    .sort({ createdAt: -1 });
};

// Find upcoming bookings
BookingSchema.statics.findUpcomingBookings = function(userId, role) {
  const query = {
    'timeSlot.date': { $gte: new Date() },
    status: { $in: ['pending', 'matching', 'assigned', 'accepted', 'en_route'] }
  };

  if (role === 'customer') {
    query.customer = userId;
  } else if (role === 'technician') {
    query.technician = userId;
  }

  return this.find(query)
    .populate('customer technician')
    .sort({ 'timeSlot.date': 1 });
};

// Find bookings requiring payment
BookingSchema.statics.findPaymentPendingBookings = function() {
  return this.find({
    status: { $in: ['payment_pending', 'completed', 'verified'] },
    'payment.status': 'pending'
  })
  .populate('customer technician')
  .sort({ createdAt: 1 });
};

// Analytics: Bookings by date range
BookingSchema.statics.getBookingStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' }
      }
    }
  ]);
};

// Find bookings near location
BookingSchema.statics.findNearLocation = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    'serviceLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

module.exports = mongoose.model('Booking', BookingSchema);
