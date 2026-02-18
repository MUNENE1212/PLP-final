/**
 * Profile Completeness Model
 *
 * Tracks profile completion metrics for technicians.
 * Complete profiles get better visibility in search results.
 *
 * Sections and weights:
 * - Basic Info: 20% (profile picture, bio, phone verified, location)
 * - Services: 25% (at least 3 services, prices set)
 * - Portfolio: 20% (at least 5 portfolio images)
 * - Verification: 15% (ID verified, email verified)
 * - Availability: 10% (availability schedule set)
 * - Reviews: 10% (has at least 1 review - bonus)
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Item Status Schema - Individual checklist item
 */
const ItemStatusSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, { _id: false });

/**
 * Section Status Schema - Profile section with multiple items
 */
const SectionStatusSchema = new Schema({
  completed: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  items: [ItemStatusSchema]
}, { _id: false });

/**
 * Suggestion Schema - Prioritized improvement suggestion
 */
const SuggestionSchema = new Schema({
  section: {
    type: String,
    required: true,
    enum: ['basicInfo', 'services', 'portfolio', 'verification', 'availability', 'reviews']
  },
  item: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionLabel: {
    type: String,
    default: null
  }
}, { _id: false });

/**
 * Profile Completeness Schema
 */
const ProfileCompletenessSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sections: {
    basicInfo: {
      type: SectionStatusSchema,
      default: () => ({
        weight: 20,
        items: [
          { name: 'profilePicture', label: 'Profile Picture', completed: false },
          { name: 'bio', label: 'Professional Bio', completed: false },
          { name: 'phoneVerified', label: 'Phone Verified', completed: false },
          { name: 'location', label: 'Location Set', completed: false }
        ]
      })
    },
    services: {
      type: SectionStatusSchema,
      default: () => ({
        weight: 25,
        items: [
          { name: 'hasServices', label: 'At Least 3 Services', completed: false },
          { name: 'hasPrices', label: 'Service Prices Set', completed: false }
        ]
      })
    },
    portfolio: {
      type: SectionStatusSchema,
      default: () => ({
        weight: 20,
        items: [
          { name: 'hasPortfolioImages', label: 'At Least 5 Portfolio Images', completed: false }
        ]
      })
    },
    verification: {
      type: SectionStatusSchema,
      default: () => ({
        weight: 15,
        items: [
          { name: 'emailVerified', label: 'Email Verified', completed: false },
          { name: 'idVerified', label: 'ID Verified', completed: false }
        ]
      })
    },
    availability: {
      type: SectionStatusSchema,
      default: () => ({
        weight: 10,
        items: [
          { name: 'hasSchedule', label: 'Availability Schedule Set', completed: false }
        ]
      })
    },
    reviews: {
      type: SectionStatusSchema,
      default: () => ({
        weight: 10,
        items: [
          { name: 'hasReviews', label: 'Has At Least 1 Review', completed: false }
        ]
      })
    }
  },
  suggestions: [SuggestionSchema],
  lastCalculatedAt: {
    type: Date,
    default: Date.now
  },
  // Metadata
  previousScore: {
    type: Number,
    default: 0
  },
  scoreHistory: [{
    score: Number,
    calculatedAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
ProfileCompletenessSchema.index({ score: -1 });
ProfileCompletenessSchema.index({ lastCalculatedAt: 1 });

// ===== VIRTUAL FIELDS =====

/**
 * Get completion level category
 */
ProfileCompletenessSchema.virtual('level').get(function() {
  if (this.score >= 90) return 'excellent';
  if (this.score >= 70) return 'good';
  if (this.score >= 50) return 'fair';
  if (this.score >= 30) return 'needsWork';
  return 'incomplete';
});

/**
 * Get color for progress indicator
 */
ProfileCompletenessSchema.virtual('color').get(function() {
  if (this.score >= 80) return '#22c55e'; // green
  if (this.score >= 60) return '#eab308'; // yellow
  if (this.score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
});

/**
 * Check if profile is considered complete enough for visibility boost
 */
ProfileCompletenessSchema.virtual('isVisibilityEligible').get(function() {
  return this.score >= 70;
});

// ===== METHODS =====

/**
 * Get the top N suggestions sorted by priority
 */
ProfileCompletenessSchema.methods.getTopSuggestions = function(count = 3) {
  return this.suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, count);
};

/**
 * Get section by name
 */
ProfileCompletenessSchema.methods.getSection = function(sectionName) {
  return this.sections[sectionName] || null;
};

/**
 * Get all incomplete items across all sections
 */
ProfileCompletenessSchema.methods.getIncompleteItems = function() {
  const incompleteItems = [];

  for (const [sectionName, section] of Object.entries(this.sections)) {
    for (const item of section.items) {
      if (!item.completed) {
        incompleteItems.push({
          section: sectionName,
          ...item.toObject()
        });
      }
    }
  }

  return incompleteItems;
};

/**
 * Record score to history
 */
ProfileCompletenessSchema.methods.recordScore = function() {
  // Keep only last 10 score records
  if (this.scoreHistory.length >= 10) {
    this.scoreHistory = this.scoreHistory.slice(-9);
  }

  this.scoreHistory.push({
    score: this.score,
    calculatedAt: new Date()
  });

  this.previousScore = this.score;
  this.lastCalculatedAt = new Date();

  return this;
};

// ===== STATIC METHODS =====

/**
 * Find profiles below a certain score threshold
 */
ProfileCompletenessSchema.statics.findBelowScore = async function(threshold = 70) {
  return this.find({ score: { $lt: threshold } })
    .populate('user', 'firstName lastName email');
};

/**
 * Find profiles eligible for visibility boost
 */
ProfileCompletenessSchema.statics.findVisibilityEligible = async function() {
  return this.find({ score: { $gte: 70 } })
    .populate('user', 'firstName lastName email');
};

/**
 * Get average score across all profiles
 */
ProfileCompletenessSchema.statics.getAverageScore = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
        totalProfiles: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { averageScore: 0, totalProfiles: 0 };
};

/**
 * Get score distribution
 */
ProfileCompletenessSchema.statics.getScoreDistribution = async function() {
  return this.aggregate([
    {
      $bucket: {
        groupBy: '$score',
        boundaries: [0, 25, 50, 75, 100],
        default: 'other',
        output: {
          count: { $sum: 1 },
          users: { $push: '$user' }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('ProfileCompleteness', ProfileCompletenessSchema);
