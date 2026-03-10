const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Service Schema
 * Represents individual services within categories in the WORD BANK
 * Services can be system-defined or custom (technician-created)
 */
const ServiceSchema = new Schema({
  // Reference to parent category
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: [true, 'Service category is required'],
    index: true
  },

  // Service name (stored in UPPERCASE for WORD BANK display)
  name: {
    type: String,
    required: [true, 'Service name is required'],
    uppercase: true,
    trim: true,
    maxlength: 200
  },

  // URL-friendly slug
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },

  // Detailed description of the service
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: 1000
  },

  // Icon representation (emoji or image URL)
  icon: {
    type: String,
    default: null
  },

  // Service image
  image: {
    url: String,
    publicId: String,
    alt: String
  },

  // Base pricing range (in KES)
  basePrice: {
    min: {
      type: Number,
      required: [true, 'Minimum base price is required'],
      min: 0
    },
    max: {
      type: Number,
      required: [true, 'Maximum base price is required'],
      min: 0,
      validate: {
        validator: function(value) {
          return value >= this.basePrice.min;
        },
        message: 'Maximum price must be greater than or equal to minimum price'
      }
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },

  // Estimated duration (in minutes)
  estimatedDuration: {
    min: {
      type: Number,
      default: 30,
      min: 15
    },
    max: {
      type: Number,
      default: 120,
      min: 15,
      validate: {
        validator: function(value) {
          return value >= this.estimatedDuration.min;
        },
        message: 'Maximum duration must be greater than or equal to minimum duration'
      }
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'minutes'
    }
  },

  // Service status
  isActive: {
    type: Boolean,
    default: true
  },

  // Whether this is a custom service created by a technician
  isCustom: {
    type: Boolean,
    default: false
  },

  // Who created this service (system = null, technician = userId)
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Approval workflow for custom services
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // System services are auto-approved
  },

  // Rejection reason (if rejected)
  rejectionReason: {
    type: String,
    maxlength: 500
  },

  // Search tags for better discoverability
  searchTags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 50
  }],

  // SEO and search metadata
  meta: {
    keywords: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    searchBoost: {
      type: Number,
      default: 1,
      min: 0.1,
      max: 10
    },
    popularityScore: {
      type: Number,
      default: 0
    }
  },

  // Requirements for this service
  requirements: [{
    type: String,
    maxlength: 200
  }],

  // Common materials needed
  materials: [{
    name: String,
    optional: {
      type: Boolean,
      default: false
    }
  }],

  // Statistics
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    techniciansOffering: {
      type: Number,
      default: 0
    }
  },

  // Soft delete
  deletedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== COMPOUND INDEXES =====
ServiceSchema.index({ category: 1, name: 1 }, { unique: true });
ServiceSchema.index({ category: 1, sortOrder: 1 });
ServiceSchema.index({ isActive: 1, approvalStatus: 1 });
ServiceSchema.index({ isCustom: 1, approvalStatus: 1 });
ServiceSchema.index({ createdBy: 1 });
ServiceSchema.index({ 'stats.popularityScore': -1 });

// Text search index
ServiceSchema.index({
  name: 'text',
  description: 'text',
  searchTags: 'text',
  'meta.keywords': 'text'
});

// ===== VIRTUAL FIELDS =====

// Virtual for technician services offering this service
ServiceSchema.virtual('technicianServices', {
  ref: 'TechnicianService',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

// Virtual for price display
ServiceSchema.virtual('priceRange').get(function() {
  const currency = this.basePrice.currency || 'KES';
  if (this.basePrice.min === this.basePrice.max) {
    return `${currency} ${this.basePrice.min.toLocaleString()}`;
  }
  return `${currency} ${this.basePrice.min.toLocaleString()} - ${this.basePrice.max.toLocaleString()}`;
});

// Virtual for duration display
ServiceSchema.virtual('durationRange').get(function() {
  const unit = this.estimatedDuration.unit || 'minutes';
  if (this.estimatedDuration.min === this.estimatedDuration.max) {
    return `${this.estimatedDuration.min} ${unit}`;
  }
  return `${this.estimatedDuration.min} - ${this.estimatedDuration.max} ${unit}`;
});

// ===== MIDDLEWARE =====

// Generate slug from name before saving
ServiceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Set approval status based on isCustom flag
ServiceSchema.pre('save', function(next) {
  if (this.isModified('isCustom')) {
    if (this.isCustom && this.isNew) {
      this.approvalStatus = 'pending';
    } else if (!this.isCustom) {
      this.approvalStatus = 'approved';
    }
  }
  next();
});

// ===== STATIC METHODS =====

/**
 * Find all approved services in a category
 * @param {ObjectId} categoryId - Category ID
 * @returns {Promise<Array>} List of services
 */
ServiceSchema.statics.findByCategory = function(categoryId) {
  return this.find({
    category: categoryId,
    isActive: true,
    approvalStatus: 'approved',
    deletedAt: null
  }).sort({ name: 1 });
};

/**
 * Search services by text query
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching services
 */
ServiceSchema.statics.searchServices = function(query, options = {}) {
  const { limit = 20, categoryId = null } = options;

  const matchConditions = {
    $text: { $search: query },
    isActive: true,
    approvalStatus: 'approved',
    deletedAt: null
  };

  if (categoryId) {
    matchConditions.category = categoryId;
  }

  return this.find(matchConditions, { score: { $meta: 'textScore' } })
    .populate('category', 'name slug icon color')
    .sort({ score: { $meta: 'textScore' }, 'meta.popularityScore': -1 })
    .limit(limit);
};

/**
 * Find services by tags
 * @param {Array<string>} tags - Tags to search
 * @returns {Promise<Array>} Matching services
 */
ServiceSchema.statics.findByTags = function(tags) {
  return this.find({
    searchTags: { $in: tags.map(t => t.toLowerCase()) },
    isActive: true,
    approvalStatus: 'approved',
    deletedAt: null
  }).sort({ 'stats.popularityScore': -1 });
};

/**
 * Find pending custom services (for admin review)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Pending services
 */
ServiceSchema.statics.findPending = function(options = {}) {
  const { limit = 50, skip = 0 } = options;

  return this.find({
    isCustom: true,
    approvalStatus: 'pending',
    deletedAt: null
  })
    .populate('category', 'name slug')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Get popular services
 * @param {number} limit - Number of services to return
 * @returns {Promise<Array>} Popular services
 */
ServiceSchema.statics.getPopular = function(limit = 10) {
  return this.find({
    isActive: true,
    approvalStatus: 'approved',
    deletedAt: null,
    'stats.totalBookings': { $gt: 0 }
  })
    .populate('category', 'name slug icon color')
    .sort({ 'stats.totalBookings': -1, 'stats.popularityScore': -1 })
    .limit(limit);
};

/**
 * Get services created by a technician
 * @param {ObjectId} technicianId - Technician user ID
 * @returns {Promise<Array>} Technician's custom services
 */
ServiceSchema.statics.findByTechnician = function(technicianId) {
  return this.find({
    createdBy: technicianId,
    isCustom: true,
    deletedAt: null
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
};

// ===== INSTANCE METHODS =====

/**
 * Approve a pending custom service
 * @param {ObjectId} adminId - Admin user ID
 * @returns {Promise<Object>} Updated service
 */
ServiceSchema.methods.approve = async function(adminId) {
  if (this.approvalStatus !== 'pending') {
    throw new Error('Only pending services can be approved');
  }

  this.approvalStatus = 'approved';
  this.rejectionReason = undefined;

  return this.save();
};

/**
 * Reject a pending custom service
 * @param {ObjectId} adminId - Admin user ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated service
 */
ServiceSchema.methods.reject = async function(adminId, reason) {
  if (this.approvalStatus !== 'pending') {
    throw new Error('Only pending services can be rejected');
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  this.approvalStatus = 'rejected';
  this.rejectionReason = reason;

  return this.save();
};

/**
 * Update statistics
 * @param {Object} statsUpdate - Stats to update
 * @returns {Promise<Object>} Updated service
 */
ServiceSchema.methods.updateStats = async function(statsUpdate) {
  if (statsUpdate.bookingCompleted) {
    this.stats.totalBookings += 1;
  }
  if (statsUpdate.revenue) {
    this.stats.totalRevenue += statsUpdate.revenue;
  }
  if (statsUpdate.rating !== undefined) {
    const currentTotal = this.stats.averageRating * this.stats.ratingCount;
    this.stats.ratingCount += 1;
    this.stats.averageRating = (currentTotal + statsUpdate.rating) / this.stats.ratingCount;
  }

  // Update popularity score
  this.meta.popularityScore = (
    this.stats.totalBookings * 10 +
    this.stats.averageRating * 20 +
    this.stats.techniciansOffering * 5
  );

  return this.save();
};

/**
 * Soft delete the service
 * @returns {Promise<void>}
 */
ServiceSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  await this.save();
};

module.exports = mongoose.model('Service', ServiceSchema);
