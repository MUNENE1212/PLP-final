const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Review Images Schema
const ReviewImageSchema = new Schema({
  url: String,
  publicId: String,
  caption: String
}, { _id: false });

// Review Response Schema (from technician/business)
const ResponseSchema = new Schema({
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, { _id: false });

// Main Review Schema
const ReviewSchema = new Schema({
  // References
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Review Type
  reviewerRole: {
    type: String,
    enum: ['customer', 'technician'],
    required: true
  },

  // Rating (1-5 stars)
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    // Detailed ratings
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Review Content
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  images: [ReviewImageSchema],

  // Helpful votes
  helpful: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpful: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  notHelpfulCount: {
    type: Number,
    default: 0
  },

  // Response from reviewee
  response: ResponseSchema,

  // Verification
  verified: {
    type: Boolean,
    default: true // Auto-verified if linked to booking
  },
  verifiedPurchase: {
    type: Boolean,
    default: true
  },

  // Status
  status: {
    type: String,
    enum: ['published', 'pending', 'hidden', 'removed'],
    default: 'published'
  },

  // Moderation
  moderation: {
    flagged: {
      type: Boolean,
      default: false
    },
    flags: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      flaggedAt: {
        type: Date,
        default: Date.now
      }
    }],
    reviewed: Boolean,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    approved: Boolean,
    removalReason: String
  },

  // AI Sentiment Analysis
  sentimentAnalysis: {
    analyzed: {
      type: Boolean,
      default: false
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    score: Number, // -1 to 1
    keywords: [String],
    topics: [String]
  },

  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },

  // Featured Review
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date,

  // Edit History
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editCount: {
    type: Number,
    default: 0
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
ReviewSchema.index({ reviewer: 1, createdAt: -1 });
ReviewSchema.index({ reviewee: 1, status: 1 });
ReviewSchema.index({ reviewee: 1, 'rating.overall': -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ helpfulCount: -1 });
ReviewSchema.index({ verified: 1 });

// Text search
ReviewSchema.index({
  title: 'text',
  comment: 'text'
});

// Compound indexes
ReviewSchema.index({ reviewee: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, isFeatured: 1 });

// Ensure one review per booking per role
ReviewSchema.index({ booking: 1, reviewerRole: 1 }, { unique: true });

// ===== VIRTUALS =====
ReviewSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  if (total === 0) return 0;
  return (this.helpfulCount / total) * 100;
});

ReviewSchema.virtual('hasResponse').get(function() {
  return !!this.response;
});

// ===== MIDDLEWARE =====

// Update helpful counts
ReviewSchema.pre('save', function(next) {
  if (this.isModified('helpful')) {
    this.helpfulCount = this.helpful.length;
  }
  if (this.isModified('notHelpful')) {
    this.notHelpfulCount = this.notHelpful.length;
  }
  next();
});

// Update reviewee's rating after saving
ReviewSchema.post('save', async function(doc) {
  if (doc.status === 'published') {
    await updateUserRating(doc.reviewee);
  }
});

// Update reviewee's rating after removing
ReviewSchema.post('remove', async function(doc) {
  await updateUserRating(doc.reviewee);
});

// Helper function to update user rating
async function updateUserRating(userId) {
  const Review = mongoose.model('Review');
  const User = mongoose.model('User');

  const stats = await Review.aggregate([
    {
      $match: {
        reviewee: userId,
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      'rating.average': parseFloat(stats[0].averageRating.toFixed(2)),
      'rating.count': stats[0].count
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
}

// ===== METHODS =====

// Mark as helpful
ReviewSchema.methods.markAsHelpful = async function(userId) {
  // Remove from not helpful if exists
  const notHelpfulIndex = this.notHelpful.indexOf(userId);
  if (notHelpfulIndex > -1) {
    this.notHelpful.splice(notHelpfulIndex, 1);
  }

  // Add to helpful if not already there
  if (!this.helpful.includes(userId)) {
    this.helpful.push(userId);
  }

  await this.save();
  return this;
};

// Mark as not helpful
ReviewSchema.methods.markAsNotHelpful = async function(userId) {
  // Remove from helpful if exists
  const helpfulIndex = this.helpful.indexOf(userId);
  if (helpfulIndex > -1) {
    this.helpful.splice(helpfulIndex, 1);
  }

  // Add to not helpful if not already there
  if (!this.notHelpful.includes(userId)) {
    this.notHelpful.push(userId);
  }

  await this.save();
  return this;
};

// Add response
ReviewSchema.methods.addResponse = async function(userId, text) {
  this.response = {
    text,
    respondedBy: userId,
    createdAt: new Date()
  };

  await this.save();
  return this;
};

// Edit response
ReviewSchema.methods.editResponse = async function(text) {
  if (!this.response) {
    throw new Error('No response to edit');
  }

  this.response.text = text;
  this.response.isEdited = true;
  this.response.editedAt = new Date();

  await this.save();
  return this;
};

// Edit review
ReviewSchema.methods.edit = async function(updates) {
  Object.assign(this, updates);
  this.isEdited = true;
  this.editedAt = new Date();
  this.editCount++;

  await this.save();
  return this;
};

// Flag review
ReviewSchema.methods.flag = async function(userId, reason) {
  this.moderation.flags.push({
    user: userId,
    reason,
    flaggedAt: new Date()
  });

  // Auto-flag if multiple reports
  if (this.moderation.flags.length >= 3) {
    this.moderation.flagged = true;
  }

  await this.save();
  return this;
};

// Analyze sentiment (placeholder - would call AI service)
ReviewSchema.methods.analyzeSentiment = async function() {
  // This would typically call an AI service
  // For now, simple keyword-based analysis
  const positiveKeywords = ['great', 'excellent', 'amazing', 'professional', 'recommend'];
  const negativeKeywords = ['poor', 'terrible', 'bad', 'late', 'unprofessional'];

  const text = (this.title + ' ' + this.comment).toLowerCase();

  let score = 0;
  positiveKeywords.forEach(word => {
    if (text.includes(word)) score++;
  });
  negativeKeywords.forEach(word => {
    if (text.includes(word)) score--;
  });

  let sentiment = 'neutral';
  if (score > 0) sentiment = 'positive';
  if (score < 0) sentiment = 'negative';

  this.sentimentAnalysis = {
    analyzed: true,
    sentiment,
    score: score / 10 // Normalize
  };

  await this.save();
  return this;
};

// ===== STATIC METHODS =====

// Get reviews for a user (technician)
ReviewSchema.statics.getForUser = function(userId, status = 'published', page = 1, limit = 20) {
  return this.find({
    reviewee: userId,
    status
  })
  .populate('reviewer', 'firstName lastName profilePicture')
  .populate('booking', 'bookingNumber serviceCategory')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get reviews by a user (customer)
ReviewSchema.statics.getByUser = function(userId, page = 1, limit = 20) {
  return this.find({
    reviewer: userId,
    status: 'published'
  })
  .populate('reviewee', 'firstName lastName profilePicture')
  .populate('booking', 'bookingNumber serviceCategory')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get featured reviews
ReviewSchema.statics.getFeaturedReviews = function(limit = 10) {
  return this.find({
    isFeatured: true,
    status: 'published'
  })
  .populate('reviewer reviewee', 'firstName lastName profilePicture')
  .sort({ featuredAt: -1 })
  .limit(limit);
};

// Get top-rated reviews (most helpful)
ReviewSchema.statics.getTopRated = function(userId, limit = 10) {
  return this.find({
    reviewee: userId,
    status: 'published',
    helpfulCount: { $gte: 1 }
  })
  .populate('reviewer', 'firstName lastName profilePicture')
  .sort({ helpfulCount: -1, 'rating.overall': -1 })
  .limit(limit);
};

// Get review statistics for a user
ReviewSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        reviewee: userId,
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageOverall: { $avg: '$rating.overall' },
        averageQuality: { $avg: '$rating.quality' },
        averageProfessionalism: { $avg: '$rating.professionalism' },
        averageCommunication: { $avg: '$rating.communication' },
        averagePunctuality: { $avg: '$rating.punctuality' },
        averageValueForMoney: { $avg: '$rating.valueForMoney' },
        fiveStars: {
          $sum: { $cond: [{ $eq: ['$rating.overall', 5] }, 1, 0] }
        },
        fourStars: {
          $sum: { $cond: [{ $eq: ['$rating.overall', 4] }, 1, 0] }
        },
        threeStars: {
          $sum: { $cond: [{ $eq: ['$rating.overall', 3] }, 1, 0] }
        },
        twoStars: {
          $sum: { $cond: [{ $eq: ['$rating.overall', 2] }, 1, 0] }
        },
        oneStar: {
          $sum: { $cond: [{ $eq: ['$rating.overall', 1] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalReviews: 0,
    averageOverall: 0,
    averageQuality: 0,
    averageProfessionalism: 0,
    averageCommunication: 0,
    averagePunctuality: 0,
    averageValueForMoney: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  };
};

// Get flagged reviews
ReviewSchema.statics.getFlaggedReviews = function() {
  return this.find({
    'moderation.flagged': true,
    'moderation.reviewed': { $ne: true }
  })
  .populate('reviewer reviewee')
  .sort({ 'moderation.flags': -1 });
};

// Search reviews
ReviewSchema.statics.searchReviews = async function(query, userId = null) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published'
  };

  if (userId) {
    searchQuery.reviewee = userId;
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .populate('reviewer reviewee', 'firstName lastName profilePicture')
    .sort({ score: { $meta: 'textScore' } });
};

// Get reviews by rating range
ReviewSchema.statics.getByRatingRange = function(userId, minRating, maxRating, page = 1, limit = 20) {
  return this.find({
    reviewee: userId,
    status: 'published',
    'rating.overall': { $gte: minRating, $lte: maxRating }
  })
  .populate('reviewer', 'firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get recent reviews
ReviewSchema.statics.getRecentReviews = function(limit = 20) {
  return this.find({
    status: 'published',
    verified: true
  })
  .populate('reviewer reviewee', 'firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Review', ReviewSchema);
