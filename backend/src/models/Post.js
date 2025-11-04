const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Media Schema (for images and videos)
const MediaSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: String, // Cloudinary public ID
  thumbnail: String, // For videos
  width: Number,
  height: Number,
  size: Number, // in bytes
  duration: Number, // for videos, in seconds
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Comment Schema
const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  replies: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    mentions: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Main Post Schema
const PostSchema = new Schema({
  // Author
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Post Type
  type: {
    type: String,
    enum: [
      'text',          // Text only
      'image',         // Image post
      'video',         // Video post
      'portfolio',     // Portfolio/work showcase
      'tip',           // Tutorial/tip
      'question',      // Ask community
      'achievement'    // Milestone/achievement
    ],
    default: 'text',
    required: true
  },

  // Content
  caption: {
    type: String,
    maxlength: 2000
  },
  media: [MediaSchema],

  // Portfolio-specific fields
  portfolioDetails: {
    title: String,
    projectType: String,
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other']
    },
    completionDate: Date,
    duration: String, // e.g., "2 days"
    materials: [String],
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'KES'
      }
    },
    clientTestimonial: String,
    tags: [String]
  },

  // Question-specific fields
  questionDetails: {
    question: String,
    category: String,
    isAnswered: {
      type: Boolean,
      default: false
    },
    bestAnswer: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  },

  // Engagement
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  comments: [CommentSchema],
  commentsCount: {
    type: Number,
    default: 0
  },
  shares: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharesCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  bookmarks: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarksCount: {
    type: Number,
    default: 0
  },

  // Hashtags & Mentions
  hashtags: [String],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Location (optional)
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },

  // Visibility & Privacy
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },

  // Status
  status: {
    type: String,
    enum: ['published', 'draft', 'archived', 'removed'],
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

  // Content Moderation (AI)
  aiModeration: {
    checked: {
      type: Boolean,
      default: false
    },
    checkedAt: Date,
    scores: {
      inappropriate: Number,
      spam: Number,
      hate: Number,
      violence: Number
    },
    flagged: Boolean,
    flaggedFor: [String]
  },

  // Engagement Score (for feed algorithm)
  engagementScore: {
    type: Number,
    default: 0
  },

  // Pinned (for user profile)
  isPinned: {
    type: Boolean,
    default: false
  },

  // Featured (by admin)
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
  editHistory: [{
    caption: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Related Booking (if showcasing completed work)
  relatedBooking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deleteReason: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
PostSchema.index({ author: 1, status: 1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ type: 1, status: 1 });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ visibility: 1, status: 1 });
PostSchema.index({ isFeatured: 1, featuredAt: -1 });
PostSchema.index({ 'portfolioDetails.category': 1 });

// Text search index
PostSchema.index({
  caption: 'text',
  'portfolioDetails.title': 'text',
  'portfolioDetails.tags': 'text',
  'questionDetails.question': 'text',
  hashtags: 'text'
});

// Compound index for feed generation
PostSchema.index({ status: 1, visibility: 1, createdAt: -1 });
PostSchema.index({ author: 1, type: 1, createdAt: -1 });

// ===== VIRTUALS =====
PostSchema.virtual('isLikedBy').get(function() {
  return (userId) => this.likes.some(id => id.equals(userId));
});

PostSchema.virtual('isBookmarkedBy').get(function() {
  return (userId) => this.bookmarks.some(id => id.equals(userId));
});

PostSchema.virtual('totalEngagement').get(function() {
  return this.likesCount + this.commentsCount + this.sharesCount + this.views;
});

// ===== MIDDLEWARE =====

// Calculate engagement score before saving
PostSchema.pre('save', function(next) {
  // Weighted engagement score for feed algorithm
  const weights = {
    like: 1,
    comment: 3,
    share: 5,
    view: 0.1
  };

  this.engagementScore = (
    (this.likesCount * weights.like) +
    (this.commentsCount * weights.comment) +
    (this.sharesCount * weights.share) +
    (this.views * weights.view)
  );

  // Apply recency decay (posts get lower scores as they age)
  const ageInDays = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.max(0.1, 1 - (ageInDays * 0.1)); // 10% decay per day
  this.engagementScore *= decayFactor;

  next();
});

// Extract hashtags from caption
PostSchema.pre('save', function(next) {
  if (this.isModified('caption') && this.caption) {
    const hashtagRegex = /#(\w+)/g;
    const matches = this.caption.match(hashtagRegex);
    if (matches) {
      this.hashtags = [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
    }
  }
  next();
});

// Update counts when likes/comments change
PostSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.commentsCount = this.comments.length;
  }
  if (this.isModified('shares')) {
    this.sharesCount = this.shares.length;
  }
  if (this.isModified('bookmarks')) {
    this.bookmarksCount = this.bookmarks.length;
  }
  next();
});

// Update author's posts count
PostSchema.post('save', async function(doc) {
  if (doc.status === 'published') {
    await mongoose.model('User').findByIdAndUpdate(doc.author, {
      $inc: { postsCount: 1 }
    });
  }
});

PostSchema.post('remove', async function(doc) {
  await mongoose.model('User').findByIdAndUpdate(doc.author, {
    $inc: { postsCount: -1 }
  });
});

// ===== METHODS =====

// Like post
PostSchema.methods.like = async function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount++;
    await this.save();
  }
  return this;
};

// Unlike post
PostSchema.methods.unlike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likesCount--;
    await this.save();
  }
  return this;
};

// Add comment
PostSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    user: userId,
    text
  });
  this.commentsCount++;
  await this.save();
  return this.comments[this.comments.length - 1];
};

// Remove comment
PostSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(c => !c._id.equals(commentId));
  this.commentsCount = this.comments.length;
  await this.save();
  return this;
};

// Like comment
PostSchema.methods.likeComment = async function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment && !comment.likes.includes(userId)) {
    comment.likes.push(userId);
    comment.likesCount++;
    await this.save();
  }
  return this;
};

// Share post
PostSchema.methods.share = async function(userId) {
  this.shares.push({
    user: userId,
    sharedAt: new Date()
  });
  this.sharesCount++;
  await this.save();
  return this;
};

// Bookmark post
PostSchema.methods.bookmark = async function(userId) {
  if (!this.bookmarks.includes(userId)) {
    this.bookmarks.push(userId);
    this.bookmarksCount++;
    await this.save();
  }
  return this;
};

// Unbookmark post
PostSchema.methods.unbookmark = async function(userId) {
  const index = this.bookmarks.indexOf(userId);
  if (index > -1) {
    this.bookmarks.splice(index, 1);
    this.bookmarksCount--;
    await this.save();
  }
  return this;
};

// Increment view count
PostSchema.methods.incrementViews = async function() {
  this.views++;
  await this.save();
  return this;
};

// Flag post
PostSchema.methods.flag = async function(userId, reason) {
  this.moderation.flags.push({
    user: userId,
    reason,
    flaggedAt: new Date()
  });

  // Auto-flag if multiple reports
  if (this.moderation.flags.length >= 5) {
    this.moderation.flagged = true;
  }

  await this.save();
  return this;
};

// Edit post
PostSchema.methods.edit = async function(newCaption) {
  // Save to edit history
  this.editHistory.push({
    caption: this.caption,
    editedAt: new Date()
  });

  this.caption = newCaption;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
  return this;
};

// Delete post (for everyone)
PostSchema.methods.deletePost = async function(userId, reason = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.deleteReason = reason;
  this.status = 'removed';
  await this.save();
  return this;
};

// ===== STATIC METHODS =====

// Get user feed (following + own posts)
PostSchema.statics.getUserFeed = async function(userId, page = 1, limit = 20) {
  const user = await mongoose.model('User').findById(userId).select('following');
  const following = user.following || [];

  return this.find({
    $or: [
      { author: userId },
      { author: { $in: following } }
    ],
    status: 'published',
    visibility: { $in: ['public', 'followers'] }
  })
  .populate('author', 'firstName lastName profilePicture rating')
  .sort({ engagementScore: -1, createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get explore feed (trending posts)
PostSchema.statics.getExploreFeed = async function(page = 1, limit = 20) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.find({
    status: 'published',
    visibility: 'public',
    createdAt: { $gte: oneDayAgo }
  })
  .populate('author', 'firstName lastName profilePicture rating')
  .sort({ engagementScore: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get posts by hashtag
PostSchema.statics.getByHashtag = async function(hashtag, page = 1, limit = 20) {
  return this.find({
    hashtags: hashtag.toLowerCase(),
    status: 'published',
    visibility: 'public'
  })
  .populate('author', 'firstName lastName profilePicture')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get portfolio posts by category
PostSchema.statics.getPortfolioByCategory = async function(category, page = 1, limit = 20) {
  return this.find({
    type: 'portfolio',
    'portfolioDetails.category': category,
    status: 'published',
    visibility: 'public'
  })
  .populate('author', 'firstName lastName profilePicture rating')
  .sort({ likesCount: -1, createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Search posts
PostSchema.statics.searchPosts = async function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published',
    visibility: 'public',
    ...filters
  };

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .populate('author', 'firstName lastName profilePicture')
    .sort({ score: { $meta: 'textScore' } });
};

// Get trending hashtags
PostSchema.statics.getTrendingHashtags = async function(limit = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        status: 'published',
        createdAt: { $gte: oneDayAgo }
      }
    },
    { $unwind: '$hashtags' },
    {
      $group: {
        _id: '$hashtags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

// Get featured posts
PostSchema.statics.getFeaturedPosts = async function(limit = 10) {
  return this.find({
    isFeatured: true,
    status: 'published',
    visibility: 'public'
  })
  .populate('author', 'firstName lastName profilePicture rating')
  .sort({ featuredAt: -1 })
  .limit(limit);
};

// Get flagged posts for moderation
PostSchema.statics.getFlaggedPosts = function() {
  return this.find({
    'moderation.flagged': true,
    'moderation.reviewed': { $ne: true }
  })
  .populate('author')
  .sort({ 'moderation.flags': -1 });
};

module.exports = mongoose.model('Post', PostSchema);
