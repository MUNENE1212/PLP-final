const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Matching Preference Model - User preferences for AI matching
 *
 * Stores customer preferences for technician matching and recommendations
 */
const MatchingPreferenceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // General preferences
  general: {
    // Maximum distance willing to travel/have technician travel (km)
    maxDistance: {
      type: Number,
      default: 25,
      min: 1,
      max: 100
    },

    // Price range preferences
    priceRange: {
      min: Number,
      max: Number,
      preference: {
        type: String,
        enum: ['budget', 'moderate', 'premium', 'any'],
        default: 'moderate'
      }
    },

    // Response time preference
    responseTime: {
      type: String,
      enum: ['immediate', 'within_hour', 'within_day', 'flexible'],
      default: 'within_hour'
    },

    // Preferred language
    languages: [{
      type: String,
      enum: ['english', 'swahili', 'french', 'spanish', 'other']
    }],

    // Service urgency default
    defaultUrgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium'
    }
  },

  // Technician attribute preferences (weighted 0-10)
  technicianPreferences: {
    // Importance of rating (0-10)
    ratingImportance: {
      type: Number,
      default: 8,
      min: 0,
      max: 10
    },

    // Minimum acceptable rating
    minRating: {
      type: Number,
      default: 3.5,
      min: 0,
      max: 5
    },

    // Experience level preference
    experienceLevel: {
      type: String,
      enum: ['any', 'beginner', 'intermediate', 'advanced', 'expert'],
      default: 'any'
    },

    // Minimum years of experience
    minYearsExperience: {
      type: Number,
      default: 0,
      min: 0
    },

    // Certifications required
    requireCertifications: {
      type: Boolean,
      default: false
    },

    // Background check required
    requireBackgroundCheck: {
      type: Boolean,
      default: false
    },

    // Insurance required
    requireInsurance: {
      type: Boolean,
      default: false
    },

    // Gender preference (if legally allowed in jurisdiction)
    genderPreference: {
      type: String,
      enum: ['any', 'male', 'female', 'non_binary'],
      default: 'any'
    },

    // Age preference
    agePreference: {
      min: Number,
      max: Number
    }
  },

  // Scheduling preferences
  scheduling: {
    // Preferred time slots
    preferredTimeSlots: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // HH:MM format
      endTime: String
    }],

    // How far in advance to book
    bookingAdvanceTime: {
      type: String,
      enum: ['asap', 'same_day', 'next_day', 'within_week', 'flexible'],
      default: 'flexible'
    },

    // Availability requirements
    availabilityRequired: {
      type: String,
      enum: ['immediate', 'today', 'this_week', 'flexible'],
      default: 'flexible'
    }
  },

  // Past behavior and learned preferences
  learnedPreferences: {
    // Previously hired technicians (positive experience)
    favoredTechnicians: [{
      technician: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      hireCount: Number,
      avgRating: Number,
      lastHired: Date
    }],

    // Blocked technicians
    blockedTechnicians: [{
      technician: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      blockedAt: Date
    }],

    // Preferred service categories
    preferredCategories: [{
      category: String,
      frequency: Number,
      lastUsed: Date
    }],

    // Typical budget patterns
    spendingPattern: {
      avgBookingValue: Number,
      minSpent: Number,
      maxSpent: Number,
      totalSpent: Number
    },

    // Time patterns
    bookingPatterns: {
      preferredDays: [String],
      preferredTimes: [String],
      avgAdvanceBooking: Number // days
    }
  },

  // Communication preferences
  communication: {
    // Preferred contact method
    preferredMethod: {
      type: String,
      enum: ['in_app_chat', 'phone', 'email', 'sms', 'whatsapp'],
      default: 'in_app_chat'
    },

    // Response expectation
    expectedResponseTime: {
      type: String,
      enum: ['immediate', 'within_15min', 'within_hour', 'within_day'],
      default: 'within_hour'
    },

    // Notification preferences for matches
    notifyOnMatch: {
      type: Boolean,
      default: true
    },

    notifyOnBetterMatch: {
      type: Boolean,
      default: true
    },

    matchNotificationFrequency: {
      type: String,
      enum: ['instant', 'hourly', 'daily', 'weekly'],
      default: 'instant'
    }
  },

  // AI/ML specific settings
  ai: {
    // Enable AI recommendations
    enableAIRecommendations: {
      type: Boolean,
      default: true
    },

    // Auto-match (system automatically suggests matches)
    autoMatch: {
      type: Boolean,
      default: true
    },

    // Smart scheduling
    enableSmartScheduling: {
      type: Boolean,
      default: true
    },

    // Price prediction
    enablePricePrediction: {
      type: Boolean,
      default: true
    },

    // Learning from behavior
    allowBehaviorLearning: {
      type: Boolean,
      default: true
    },

    // Personalization level
    personalizationLevel: {
      type: String,
      enum: ['minimal', 'moderate', 'high'],
      default: 'moderate'
    }
  },

  // Custom weights for matching algorithm
  customWeights: {
    skillMatch: {
      type: Number,
      default: 25,
      min: 0,
      max: 100
    },
    locationProximity: {
      type: Number,
      default: 20,
      min: 0,
      max: 100
    },
    availability: {
      type: Number,
      default: 15,
      min: 0,
      max: 100
    },
    rating: {
      type: Number,
      default: 15,
      min: 0,
      max: 100
    },
    experienceLevel: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    pricing: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    },
    responseTime: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    },
    completionRate: {
      type: Number,
      default: 3,
      min: 0,
      max: 100
    },
    customerPreference: {
      type: Number,
      default: 2,
      min: 0,
      max: 100
    }
  },

  // Privacy settings
  privacy: {
    shareDataForImprovement: {
      type: Boolean,
      default: true
    },
    allowProfileSharing: {
      type: Boolean,
      default: true
    }
  },

  // Metadata
  lastUpdated: Date,
  lastMatchRequest: Date,
  totalMatches: {
    type: Number,
    default: 0
  },
  successfulBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
MatchingPreferenceSchema.index({ user: 1 }, { unique: true });

// Virtual for match success rate
MatchingPreferenceSchema.virtual('successRate').get(function() {
  if (this.totalMatches === 0) return 0;
  return ((this.successfulBookings / this.totalMatches) * 100).toFixed(2);
});

// Method to update from match feedback
MatchingPreferenceSchema.methods.updateFromFeedback = async function(matching, feedback) {
  // Learn from successful matches
  if (feedback.helpful || feedback.rating >= 4) {
    // Add to favored technicians or increment count
    const existing = this.learnedPreferences.favoredTechnicians.find(
      f => f.technician.toString() === matching.technician.toString()
    );

    if (existing) {
      existing.hireCount++;
      existing.avgRating = (existing.avgRating + feedback.rating) / 2;
      existing.lastHired = new Date();
    } else {
      this.learnedPreferences.favoredTechnicians.push({
        technician: matching.technician,
        hireCount: 1,
        avgRating: feedback.rating,
        lastHired: new Date()
      });
    }
  }

  // Learn category preferences
  const categoryPref = this.learnedPreferences.preferredCategories.find(
    c => c.category === matching.serviceCategory
  );

  if (categoryPref) {
    categoryPref.frequency++;
    categoryPref.lastUsed = new Date();
  } else {
    this.learnedPreferences.preferredCategories.push({
      category: matching.serviceCategory,
      frequency: 1,
      lastUsed: new Date()
    });
  }

  this.lastUpdated = new Date();
  await this.save();
  return this;
};

// Method to block a technician
MatchingPreferenceSchema.methods.blockTechnician = async function(technicianId, reason) {
  // Check if already blocked
  const alreadyBlocked = this.learnedPreferences.blockedTechnicians.some(
    b => b.technician.toString() === technicianId.toString()
  );

  if (!alreadyBlocked) {
    this.learnedPreferences.blockedTechnicians.push({
      technician: technicianId,
      reason: reason,
      blockedAt: new Date()
    });
    await this.save();
  }

  return this;
};

// Method to unblock a technician
MatchingPreferenceSchema.methods.unblockTechnician = async function(technicianId) {
  this.learnedPreferences.blockedTechnicians =
    this.learnedPreferences.blockedTechnicians.filter(
      b => b.technician.toString() !== technicianId.toString()
    );
  await this.save();
  return this;
};

// Static method to get or create preferences for user
MatchingPreferenceSchema.statics.getOrCreate = async function(userId) {
  let prefs = await this.findOne({ user: userId });

  if (!prefs) {
    prefs = await this.create({ user: userId });
  }

  return prefs;
};

// Static method to normalize custom weights
MatchingPreferenceSchema.methods.normalizeWeights = function() {
  const weights = this.customWeights;
  const total = Object.values(weights).reduce((sum, val) => sum + val, 0);

  if (total !== 100) {
    // Normalize to 100
    Object.keys(weights).forEach(key => {
      weights[key] = Math.round((weights[key] / total) * 100);
    });
    this.customWeights = weights;
  }

  return this.customWeights;
};

// Pre-save hook to update lastUpdated
MatchingPreferenceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const MatchingPreference = mongoose.model('MatchingPreference', MatchingPreferenceSchema);

module.exports = MatchingPreference;
