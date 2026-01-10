const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Portfolio Model - Verified technician work catalogue
 *
 * Verification levels:
 * 1. Auto-verified: Added from completed booking (highest trust)
 * 2. Pending review: Uploaded by technician, needs admin approval
 * 3. Verified: Admin approved
 */
const portfolioSchema = new Schema({
  technician: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Link to booking if auto-generated from completed work
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    index: true
  },

  // Title of the work/project
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  // Detailed description of what was done
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Service category
  serviceCategory: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'Carpentry', 'Appliance Repair', 'Painting', 'Cleaning', 'Other']
  },

  // Images (before/after or work in progress)
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true // Cloudinary public ID for deletion
    },
    type: {
      type: String,
      enum: ['before', 'after', 'during', 'final'],
      default: 'final'
    },
    caption: {
      type: String,
      maxlength: 200
    }
  }],

  // Location where work was done
  location: {
    city: {
      type: String,
      required: true
    },
    address: String // Optional specific address
  },

  // Completion date
  completedAt: {
    type: Date,
    default: Date.now
  },

  // Verification status
  verificationStatus: {
    type: String,
    enum: ['auto-verified', 'pending', 'verified', 'rejected'],
    default: 'pending'
  },

  // If rejected, reason for rejection
  rejectionReason: {
    type: String,
    maxlength: 500
  },

  // Customer who can verify this work (if from booking)
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Customer testimonial for this specific work
  customerTestimonial: {
    text: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Skills demonstrated (for search/filtering)
  tags: [{
    type: String,
    trim: true
  }],

  // Cost range (optional, helps set expectations)
  costRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'KES'
    }
  },

  // How long the job took
  duration: {
    amount: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'hours'
    }
  },

  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  saves: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Admin approval metadata
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,

  // Soft delete
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
portfolioSchema.index({ technician: 1, verificationStatus: 1, deletedAt: 1 });
portfolioSchema.index({ serviceCategory: 1, createdAt: -1 });
portfolioSchema.index({ 'tags': 1 });

// Virtual for image count
portfolioSchema.virtual('imageCount').get(function() {
  return this.images.length;
});

// Virtual for total engagement
portfolioSchema.virtual('totalEngagement').get(function() {
  return this.likes.length + this.saves.length + this.views;
});

// Method to add an image
portfolioSchema.methods.addImage = function(url, publicId, type = 'final', caption = '') {
  this.images.push({ url, publicId, type, caption });
  return this.save();
};

// Method to remove an image
portfolioSchema.methods.removeImage = function(publicId) {
  this.images = this.images.filter(img => img.publicId !== publicId);
  return this.save();
};

// Static method to get verified portfolio for a technician
portfolioSchema.statics.getTechnicianPortfolio = function(technicianId) {
  return this.find({
    technician: technicianId,
    verificationStatus: { $in: ['auto-verified', 'verified'] },
    deletedAt: null
  })
  .populate('customer', 'firstName lastName')
  .sort({ completedAt: -1 });
};

// Static method to get featured portfolio items across platform
portfolioSchema.statics.getFeaturedPortfolio = function(limit = 20) {
  return this.find({
    verificationStatus: { $in: ['auto-verified', 'verified'] },
    deletedAt: null
  })
  .populate('technician', 'firstName lastName businessName location rating profileImage')
  .populate('customer', 'firstName')
  .sort({ totalEngagement: -1, createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
