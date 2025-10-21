const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Matching Model - AI-powered technician-customer matching
 *
 * Stores matching results, scores, and reasons for technician recommendations
 */
const MatchingSchema = new Schema({
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

  // Matching context
  serviceCategory: {
    type: String,
    required: true,
    enum: [
      'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
      'appliance_repair', 'hvac', 'locksmith', 'landscaping', 'roofing',
      'flooring', 'masonry', 'welding', 'pest_control', 'general_handyman', 'other'
    ]
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },

  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },

  // Matching scores (0-100)
  scores: {
    overall: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Individual scoring factors
    skillMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    locationProximity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    availability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    rating: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    experienceLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    pricing: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    responseTime: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    customerPreference: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },

  // Distance from customer to technician
  distance: {
    type: Number, // in kilometers
    required: true
  },

  // AI-generated reasons for match
  matchReasons: [{
    reason: String,
    weight: Number, // importance factor
    score: Number
  }],

  // Matching algorithm details
  algorithm: {
    version: {
      type: String,
      default: '1.0'
    },
    model: {
      type: String,
      default: 'weighted_scoring'
    },
    factors: {
      type: Map,
      of: Number // weight for each factor
    }
  },

  // User interaction
  status: {
    type: String,
    enum: ['suggested', 'viewed', 'contacted', 'accepted', 'rejected', 'expired'],
    default: 'suggested'
  },

  viewedAt: Date,
  contactedAt: Date,
  respondedAt: Date,

  // If customer took action
  action: {
    type: String,
    enum: ['none', 'contacted', 'booked', 'skipped', 'reported'],
    default: 'none'
  },

  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Feedback on match quality
  feedback: {
    helpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },

  // Metadata
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
MatchingSchema.index({ customer: 1, createdAt: -1 });
MatchingSchema.index({ technician: 1, createdAt: -1 });
MatchingSchema.index({ 'scores.overall': -1 });
MatchingSchema.index({ status: 1, isActive: 1 });
MatchingSchema.index({ expiresAt: 1 });
MatchingSchema.index({ location: '2dsphere' });

// Compound indexes
MatchingSchema.index({ customer: 1, status: 1, 'scores.overall': -1 });
MatchingSchema.index({ customer: 1, serviceCategory: 1, createdAt: -1 });

// Virtual for match quality level
MatchingSchema.virtual('matchQuality').get(function() {
  const score = this.scores.overall;
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'very_good';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
});

// Method to mark as viewed
MatchingSchema.methods.markAsViewed = async function() {
  if (this.status === 'suggested') {
    this.status = 'viewed';
    this.viewedAt = new Date();
    await this.save();
  }
  return this;
};

// Method to mark as contacted
MatchingSchema.methods.markAsContacted = async function() {
  this.status = 'contacted';
  this.contactedAt = new Date();
  this.action = 'contacted';
  await this.save();
  return this;
};

// Method to accept match (convert to booking)
MatchingSchema.methods.acceptMatch = async function(bookingId) {
  this.status = 'accepted';
  this.action = 'booked';
  this.bookingId = bookingId;
  await this.save();
  return this;
};

// Method to reject match
MatchingSchema.methods.rejectMatch = async function(reason) {
  this.status = 'rejected';
  this.action = 'skipped';
  if (reason) {
    this.feedback = { comment: reason, submittedAt: new Date() };
  }
  await this.save();
  return this;
};

// Method to add feedback
MatchingSchema.methods.addFeedback = async function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    submittedAt: new Date()
  };
  await this.save();
  return this;
};

// Static method to get active matches for customer
MatchingSchema.statics.getActiveMatches = function(customerId, options = {}) {
  const query = {
    customer: customerId,
    isActive: true,
    expiresAt: { $gt: new Date() },
    status: { $in: ['suggested', 'viewed'] }
  };

  if (options.serviceCategory) {
    query.serviceCategory = options.serviceCategory;
  }

  return this.find(query)
    .populate('technician', 'firstName lastName profilePicture rating skills location')
    .sort({ 'scores.overall': -1 })
    .limit(options.limit || 10);
};

// Static method to calculate match score
MatchingSchema.statics.calculateMatchScore = function(customer, technician, context) {
  const weights = {
    skillMatch: 0.25,
    locationProximity: 0.20,
    availability: 0.15,
    rating: 0.15,
    experienceLevel: 0.10,
    pricing: 0.05,
    responseTime: 0.05,
    completionRate: 0.03,
    customerPreference: 0.02
  };

  // Calculate individual scores (0-100)
  const scores = {
    skillMatch: calculateSkillMatch(technician, context),
    locationProximity: calculateLocationScore(customer, technician, context),
    availability: calculateAvailabilityScore(technician),
    rating: calculateRatingScore(technician), // Fixed: proper rating calculation
    experienceLevel: calculateExperienceScore(technician),
    pricing: calculatePricingScore(technician, context),
    responseTime: calculateResponseTimeScore(technician),
    completionRate: (technician.completionRate || 80),
    customerPreference: calculatePreferenceScore(customer, technician)
  };

  // Validate all scores are numbers
  Object.keys(scores).forEach(key => {
    if (isNaN(scores[key]) || !isFinite(scores[key])) {
      console.warn(`Invalid score for ${key}:`, scores[key], 'Setting to 0');
      scores[key] = 0;
    }
  });

  // Calculate weighted overall score
  const overall = Object.keys(weights).reduce((total, key) => {
    const score = scores[key] || 0;
    const weight = weights[key] || 0;
    return total + (score * weight);
  }, 0);

  return { scores: { ...scores, overall: Math.round(overall) }, weights };
};

// Helper functions (placeholders - implement based on your logic)
function calculateSkillMatch(technician, context) {
  // Check if technician has the required skill
  if (!technician.skills || !Array.isArray(technician.skills)) return 0;

  const hasSkill = technician.skills.some(skill =>
    skill.category === context.serviceCategory
  );

  if (!hasSkill) return 0;

  // Get skill proficiency
  const skill = technician.skills.find(s => s.category === context.serviceCategory);
  const proficiencyScore = {
    'beginner': 50,
    'intermediate': 75,
    'advanced': 90,
    'expert': 100
  };

  return proficiencyScore[skill?.proficiency] || 50;
}

function calculateLocationScore(customer, technician, context) {
  // Distance-based scoring (closer = better)
  const distance = context.distance || 10; // km
  if (distance <= 5) return 100;
  if (distance <= 10) return 85;
  if (distance <= 20) return 70;
  if (distance <= 30) return 50;
  if (distance <= 50) return 30;
  return 10;
}

function calculateRatingScore(technician) {
  // Convert rating to 0-100 scale
  // Handle both object format { average: X, count: Y } and number format
  if (!technician.rating) return 0;

  if (typeof technician.rating === 'object') {
    const avg = technician.rating.average || 0;
    const count = technician.rating.count || 0;

    // Penalize technicians with very few ratings
    if (count === 0) return 50; // New technicians get neutral score
    if (count < 5) return avg * 20 * 0.8; // 80% weight for < 5 reviews
    return avg * 20; // Full weight for 5+ reviews (convert 5-star to 100 scale)
  }

  // If rating is a number, treat it as average
  return (technician.rating || 0) * 20;
}

function calculateAvailabilityScore(technician) {
  // Check current availability
  if (!technician.availability) return 30;

  // Handle different availability formats
  if (typeof technician.availability === 'object') {
    if (technician.availability.isAvailable === true) return 100;
    if (technician.availability.isAvailable === false) return 30;
    if (technician.availability.status === 'available') return 100;
    if (technician.availability.status === 'busy') return 50;
  }

  return 30;
}

function calculateExperienceScore(technician) {
  const years = technician.yearsOfExperience || 0;
  const completedJobs = technician.completedJobs || 0;

  const yearScore = Math.min(years * 10, 50); // Max 50 points for years
  const jobScore = Math.min(completedJobs / 2, 50); // Max 50 points for jobs

  return yearScore + jobScore;
}

function calculatePricingScore(technician, context) {
  // Prefer reasonable pricing (not too high, not too low)
  const rate = technician.hourlyRate || 50;
  const budget = context.budget || 100;

  if (rate <= budget * 0.8) return 100;
  if (rate <= budget) return 85;
  if (rate <= budget * 1.2) return 60;
  return 30;
}

function calculateResponseTimeScore(technician) {
  const avgResponseTime = technician.avgResponseTime || 60; // minutes

  if (avgResponseTime <= 15) return 100;
  if (avgResponseTime <= 30) return 85;
  if (avgResponseTime <= 60) return 70;
  if (avgResponseTime <= 120) return 50;
  return 30;
}

function calculatePreferenceScore(customer, technician) {
  // Check if customer has previously worked with this technician
  // This would require historical booking data
  // Placeholder implementation
  return 50;
}

// Auto-expire old matches
MatchingSchema.pre('find', function() {
  // Optionally auto-deactivate expired matches
  this.where({ expiresAt: { $gte: new Date() } });
});

const Matching = mongoose.model('Matching', MatchingSchema);

module.exports = Matching;
