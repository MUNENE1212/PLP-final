const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Matching Interaction Model - Track matching interactions, recommendations, and analytics
 *
 * Stores all matching-related interactions for analytics and continuous improvement
 */
const MatchingInteractionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of matching interaction
  interactionType: {
    type: String,
    required: true,
    enum: [
      'chat',                    // Chatbot conversation
      'recommendation',          // Service/technician recommendation
      'matching',                // Technician-customer matching
      'price_estimation',        // Price estimation
      'schedule_optimization',   // Schedule suggestion
      'skill_assessment',        // Technician skill evaluation
      'problem_diagnosis',       // Issue diagnosis help
      'search_assist',           // Smart search
      'fraud_detection',         // Fraud/scam detection
      'content_moderation',      // Post/review moderation
      'sentiment_analysis',      // User sentiment analysis
      'analytics',               // Analytics
      'other'
    ]
  },

  // Conversation/session tracking
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Input from user
  input: {
    text: String,
    type: {
      type: String,
      enum: ['text', 'voice', 'image', 'structured_data']
    },
    data: Schema.Types.Mixed, // Any structured input data
    metadata: {
      language: String,
      location: {
        type: { type: String, enum: ['Point'] },
        coordinates: [Number]
      },
      deviceType: String,
      platform: String
    }
  },

  // System response/output
  output: {
    text: String,
    type: {
      type: String,
      enum: ['text', 'structured_data', 'recommendation', 'action']
    },
    data: Schema.Types.Mixed, // Any structured output data
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    alternatives: [{
      text: String,
      data: Schema.Types.Mixed,
      confidence: Number
    }]
  },

  // Algorithm information
  algorithm: {
    name: String,
    version: String,
    type: {
      type: String,
      enum: ['rule_based', 'heuristic', 'weighted_scoring', 'ml_model', 'other'],
      default: 'weighted_scoring'
    },
    parameters: Schema.Types.Mixed
  },

  // Processing details
  processing: {
    startTime: Date,
    endTime: Date,
    duration: Number, // milliseconds
    tokens: {
      input: Number,
      output: Number,
      total: Number
    },
    cost: Number, // in USD or local currency
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'timeout'],
      default: 'completed'
    },
    error: String
  },

  // User feedback
  feedback: {
    helpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracy: {
      type: String,
      enum: ['accurate', 'partially_accurate', 'inaccurate']
    },
    comment: String,
    submittedAt: Date
  },

  // Action taken based on AI output
  action: {
    taken: Boolean,
    type: String, // e.g., 'booking_created', 'technician_contacted', 'search_refined'
    result: String,
    timestamp: Date
  },

  // Context and references
  context: {
    previousInteractions: Number, // Count of previous interactions in session
    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    relatedMatching: {
      type: Schema.Types.ObjectId,
      ref: 'Matching'
    },
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    userHistory: {
      totalInteractions: Number,
      avgSatisfaction: Number
    }
  },

  // Intent detection
  intent: {
    primary: String,
    confidence: Number,
    secondary: [String],
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }]
  },

  // Sentiment analysis
  sentiment: {
    overall: {
      type: String,
      enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']
    },
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    emotions: [{
      type: String,
      intensity: Number
    }]
  },

  // Privacy and compliance
  dataRetention: {
    deleteAfter: Date,
    anonymized: {
      type: Boolean,
      default: false
    },
    gdprCompliant: {
      type: Boolean,
      default: true
    }
  },

  // Analytics flags
  flags: {
    requiresHumanReview: {
      type: Boolean,
      default: false
    },
    containsSensitiveData: {
      type: Boolean,
      default: false
    },
    isTrainingData: {
      type: Boolean,
      default: false
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and analytics
MatchingInteractionSchema.index({ user: 1, createdAt: -1 });
MatchingInteractionSchema.index({ sessionId: 1, createdAt: 1 });
MatchingInteractionSchema.index({ interactionType: 1, createdAt: -1 });
MatchingInteractionSchema.index({ 'processing.status': 1 });
MatchingInteractionSchema.index({ 'feedback.helpful': 1 });
MatchingInteractionSchema.index({ 'flags.requiresHumanReview': 1 });
MatchingInteractionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days

// Compound indexes
MatchingInteractionSchema.index({ user: 1, interactionType: 1, createdAt: -1 });
MatchingInteractionSchema.index({ sessionId: 1, interactionType: 1 });

// Virtual for response time in seconds
MatchingInteractionSchema.virtual('responseTimeSeconds').get(function() {
  if (this.processing?.duration) {
    return (this.processing.duration / 1000).toFixed(2);
  }
  return null;
});

// Virtual for cost in cents
MatchingInteractionSchema.virtual('costInCents').get(function() {
  if (this.processing?.cost) {
    return Math.round(this.processing.cost * 100);
  }
  return 0;
});

// Method to add user feedback
MatchingInteractionSchema.methods.addFeedback = async function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    submittedAt: new Date()
  };
  await this.save();
  return this;
};

// Method to mark action taken
MatchingInteractionSchema.methods.recordAction = async function(actionType, result) {
  this.action = {
    taken: true,
    type: actionType,
    result: result,
    timestamp: new Date()
  };
  await this.save();
  return this;
};

// Method to flag for human review
MatchingInteractionSchema.methods.flagForReview = async function(reason) {
  this.flags.requiresHumanReview = true;
  if (reason) {
    this.processing.error = reason;
  }
  await this.save();
  return this;
};

// Static method to get session history
MatchingInteractionSchema.statics.getSessionHistory = function(sessionId) {
  return this.find({ sessionId })
    .sort({ createdAt: 1 })
    .select('-user -dataRetention -flags');
};

// Static method to get user interaction stats
MatchingInteractionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$interactionType',
        count: { $sum: 1 },
        avgDuration: { $avg: '$processing.duration' },
        totalCost: { $sum: '$processing.cost' },
        helpfulCount: {
          $sum: { $cond: ['$feedback.helpful', 1, 0] }
        },
        avgRating: { $avg: '$feedback.rating' }
      }
    }
  ]);

  return stats;
};

// Static method to get interactions needing review
MatchingInteractionSchema.statics.getNeedsReview = function(limit = 50) {
  return this.find({ 'flags.requiresHumanReview': true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email');
};

// Static method for analytics - popular interaction types
MatchingInteractionSchema.statics.getPopularInteractions = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$interactionType',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$output.confidence' },
        successRate: {
          $avg: { $cond: ['$feedback.helpful', 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Pre-save hook to calculate duration
MatchingInteractionSchema.pre('save', function(next) {
  if (this.processing?.startTime && this.processing?.endTime) {
    this.processing.duration =
      this.processing.endTime - this.processing.startTime;
  }
  next();
});

// Pre-save hook to set data retention
MatchingInteractionSchema.pre('save', function(next) {
  if (!this.dataRetention?.deleteAfter) {
    // Default: delete after 90 days
    this.dataRetention = this.dataRetention || {};
    this.dataRetention.deleteAfter = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});

const MatchingInteraction = mongoose.model('MatchingInteraction', MatchingInteractionSchema);

module.exports = MatchingInteraction;
