const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// Base Location Schema (reusable)
const LocationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  address: String,
  city: String,
  county: String,
  country: {
    type: String,
    default: 'Kenya'
  }
}, { _id: false });

// Technician-specific schemas
const SkillSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'],
    required: true
  },
  yearsOfExperience: Number,
  verified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    url: String,
    type: String,
    uploadedAt: Date,
    verifiedAt: Date
  }]
}, { _id: false });

const AvailabilitySchema = new Schema({
  dayOfWeek: {
    type: Number, // 0 = Sunday, 6 = Saturday
    required: true
  },
  startTime: String, // "09:00"
  endTime: String, // "17:00"
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const PortfolioSchema = new Schema({
  title: String,
  description: String,
  images: [{
    url: String,
    publicId: String
  }],
  category: String,
  completedAt: Date,
  client: {
    name: String,
    testimonial: String
  }
}, { timestamps: true });

// Main User Schema
const UserSchema = new Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false // Don't return password by default
  },

  // Role Management
  role: {
    type: String,
    enum: ['customer', 'technician', 'admin', 'corporate', 'support'],
    default: 'customer',
    required: true
  },

  // Profile Information
  profilePicture: {
    url: {
      type: String,
      default: 'https://res.cloudinary.com/default-avatar.png'
    },
    publicId: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },

  // Location (Geospatial)
  location: {
    type: LocationSchema,
    index: '2dsphere' // Enables geospatial queries
  },

  // Authentication & Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },

  // Refresh Tokens (for JWT)
  refreshTokens: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    device: String
  }],

  // Account Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'deactivated', 'banned'],
    default: 'active'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: Date,

  // TECHNICIAN-SPECIFIC FIELDS
  skills: {
    type: [SkillSchema],
    default: undefined // Only for technicians
  },
  availability: {
    type: [AvailabilitySchema],
    default: undefined
  },
  portfolio: {
    type: [PortfolioSchema],
    default: undefined
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  serviceRadius: {
    type: Number, // in kilometers
    default: 10
  },
  yearsOfExperience: Number,
  businessName: String,
  businessLicense: {
    number: String,
    verified: Boolean,
    documents: [{
      url: String,
      publicId: String
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    verified: Boolean
  },

  // KYC Information
  kyc: {
    idType: {
      type: String,
      enum: ['national_id', 'passport', 'drivers_license']
    },
    idNumber: String,
    idFrontImage: {
      url: String,
      publicId: String
    },
    idBackImage: {
      url: String,
      publicId: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Ratings & Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },

  // Statistics
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    responseTime: Number, // in minutes (average)
    completionRate: {
      type: Number,
      default: 0
    } // percentage
  },

  // CORPORATE-SPECIFIC FIELDS
  companyName: String,
  companyRegistration: String,
  department: String,
  employeeCount: Number,
  corporateAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  billingInfo: {
    taxId: String,
    billingEmail: String,
    billingAddress: String,
    paymentTerms: String
  },

  // SUPPORT-SPECIFIC FIELDS
  supportInfo: {
    employeeId: String,
    department: {
      type: String,
      enum: ['technical', 'billing', 'general', 'complaints']
    },
    specializations: [String], // e.g., ['bookings', 'payments', 'accounts']
    languages: [{
      type: String,
      default: 'English'
    }],
    availability: {
      status: {
        type: String,
        enum: ['available', 'busy', 'away', 'offline'],
        default: 'offline'
      },
      maxConcurrentTickets: {
        type: Number,
        default: 5
      }
    },
    stats: {
      ticketsHandled: {
        type: Number,
        default: 0
      },
      ticketsClosed: {
        type: Number,
        default: 0
      },
      averageResponseTime: Number, // in minutes
      averageResolutionTime: Number, // in minutes
      satisfactionRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      ratingCount: {
        type: Number,
        default: 0
      }
    },
    shiftSchedule: [{
      dayOfWeek: Number, // 0 = Sunday, 6 = Saturday
      startTime: String, // "09:00"
      endTime: String // "17:00"
    }]
  },

  // Social Features
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },

  // Notifications Preferences
  notificationPreferences: {
    email: {
      bookings: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      updates: { type: Boolean, default: true }
    },
    sms: {
      bookings: { type: Boolean, default: true },
      messages: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false }
    },
    push: {
      bookings: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
      updates: { type: Boolean, default: true }
    }
  },

  // FCM Tokens for Push Notifications (Mobile)
  fcmTokens: [{
    token: String,
    device: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Audit Trail
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    device: String,
    location: String
  }],

  // GDPR & Compliance
  gdprConsent: {
    marketing: Boolean,
    dataProcessing: Boolean,
    dateSigned: Date
  },

  // Account Deletion (Soft Delete)
  deletedAt: Date,
  deleteReason: String

}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ 'skills.category': 1 });
UserSchema.index({ 'rating.average': -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isOnline: 1, role: 1 }); // For finding online technicians
UserSchema.index({ 'stats.completedBookings': -1 }); // For leaderboards

// Text Search Index (for searching users by name, skills, bio)
UserSchema.index({
  firstName: 'text',
  lastName: 'text',
  bio: 'text',
  'skills.name': 'text',
  businessName: 'text'
});

// ===== VIRTUAL FIELDS =====
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for reviews
UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'technician',
  justOne: false
});

// ===== MIDDLEWARE =====

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastSeen on save if isOnline changed to false
UserSchema.pre('save', function(next) {
  if (this.isModified('isOnline') && !this.isOnline) {
    this.lastSeen = new Date();
  }
  next();
});

// ===== METHODS =====

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate phone verification code
UserSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.phoneVerificationCode = code;
  this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

// Check if user is available (for technicians)
UserSchema.methods.isAvailableAt = function(dayOfWeek, time) {
  if (!this.availability || this.role !== 'technician') return false;

  const availability = this.availability.find(a => a.dayOfWeek === dayOfWeek);
  if (!availability || !availability.isAvailable) return false;

  // Check if time is within range
  const [hours, minutes] = time.split(':').map(Number);
  const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
  const [endHours, endMinutes] = availability.endTime.split(':').map(Number);

  const timeInMinutes = hours * 60 + minutes;
  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;

  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
};

// Calculate completion rate
UserSchema.methods.calculateCompletionRate = function() {
  if (this.stats.totalBookings === 0) return 0;
  return (this.stats.completedBookings / this.stats.totalBookings * 100).toFixed(2);
};

// Add FCM Token
UserSchema.methods.addFCMToken = function(token, device, platform) {
  // Remove duplicate tokens
  this.fcmTokens = this.fcmTokens.filter(t => t.token !== token);

  // Add new token
  this.fcmTokens.push({
    token,
    device,
    platform,
    addedAt: new Date()
  });

  // Keep only last 5 tokens per user
  if (this.fcmTokens.length > 5) {
    this.fcmTokens = this.fcmTokens.slice(-5);
  }
};

// Remove FCM Token
UserSchema.methods.removeFCMToken = function(token) {
  this.fcmTokens = this.fcmTokens.filter(t => t.token !== token);
};

// ===== STATIC METHODS =====

// Find technicians by skill and location
UserSchema.statics.findTechniciansBySkillAndLocation = async function(
  skillCategory,
  longitude,
  latitude,
  maxDistance = 10000 // in meters
) {
  return this.find({
    role: 'technician',
    status: 'active',
    'skills.category': skillCategory,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  }).select('-password -refreshTokens');
};

// Find top-rated technicians
UserSchema.statics.findTopRatedTechnicians = async function(limit = 10) {
  return this.find({
    role: 'technician',
    status: 'active',
    'rating.count': { $gte: 5 } // At least 5 reviews
  })
  .sort({ 'rating.average': -1 })
  .limit(limit)
  .select('-password -refreshTokens');
};

// Search users (text search)
UserSchema.statics.searchUsers = async function(query, role = null) {
  const searchQuery = { $text: { $search: query } };
  if (role) searchQuery.role = role;

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .select('-password -refreshTokens');
};

module.exports = mongoose.model('User', UserSchema);
