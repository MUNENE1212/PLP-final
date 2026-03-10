const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * ServiceApproval Schema
 * Tracks the approval workflow for custom services submitted by technicians
 * Provides audit trail and history for service approvals/rejections
 */
const ServiceApprovalSchema = new Schema({
  // Reference to the service being approved
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required']
  },

  // Technician who submitted the service
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester reference is required']
  },

  // Admin who reviewed the service
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Current approval status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resubmitted'],
    default: 'pending',
    required: true
  },

  // Rejection reason (if rejected)
  rejectionReason: {
    type: String,
    maxlength: 1000
  },

  // Admin's review notes
  reviewNotes: {
    type: String,
    maxlength: 1000
  },

  // Internal notes (not visible to technician)
  internalNotes: {
    type: String,
    maxlength: 1000
  },

  // Approval history (for tracking multiple review cycles)
  history: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'resubmitted'],
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
  }],

  // Resubmission tracking
  resubmission: {
    count: {
      type: Number,
      default: 0
    },
    lastResubmittedAt: Date,
    changes: String // Description of changes made
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Target review date (SLA)
  targetReviewDate: {
    type: Date,
    default: function() {
      // Default: 2 business days from creation
      const date = new Date();
      date.setDate(date.getDate() + 2);
      return date;
    }
  },

  // Actual review completion date
  reviewedAt: Date,

  // Time tracking
  timeTracking: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    firstReviewAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    totalProcessingTime: Number // in hours
  },

  // Flags
  flags: {
    needsEscalation: {
      type: Boolean,
      default: false
    },
    escalationReason: String,
    isComplexReview: {
      type: Boolean,
      default: false
    },
    requiresAdditionalInfo: {
      type: Boolean,
      default: false
    },
    additionalInfoRequested: String
  },

  // Notifications sent
  notifications: [{
    type: {
      type: String,
      enum: ['submission_confirmation', 'status_update', 'approval', 'rejection', 'resubmission_request']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'in_app', 'push']
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
ServiceApprovalSchema.index({ status: 1, createdAt: -1 });
ServiceApprovalSchema.index({ requestedBy: 1, status: 1 });
ServiceApprovalSchema.index({ reviewedBy: 1 });
ServiceApprovalSchema.index({ priority: 1, status: 1 });
ServiceApprovalSchema.index({ 'flags.needsEscalation': 1 });
ServiceApprovalSchema.index({ targetReviewDate: 1 });

// ===== VIRTUAL FIELDS =====

// Virtual for processing time
ServiceApprovalSchema.virtual('processingTime').get(function() {
  if (!this.timeTracking.submittedAt) return null;

  const endTime = this.reviewedAt || new Date();
  const diffMs = endTime - this.timeTracking.submittedAt;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  return diffHours;
});

// Virtual for SLA status
ServiceApprovalSchema.virtual('slaStatus').get(function() {
  if (this.status === 'approved' || this.status === 'rejected') {
    if (this.reviewedAt && this.targetReviewDate) {
      return this.reviewedAt <= this.targetReviewDate ? 'met' : 'breached';
    }
    return 'completed';
  }

  if (this.status === 'pending') {
    return new Date() <= this.targetReviewDate ? 'on_track' : 'overdue';
  }

  return 'unknown';
});

// Virtual for days pending
ServiceApprovalSchema.virtual('daysPending').get(function() {
  if (this.status !== 'pending') return 0;

  const now = new Date();
  const submitted = this.timeTracking.submittedAt || this.createdAt;
  const diffMs = now - submitted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
});

// ===== MIDDLEWARE =====

// Add to history on status change
ServiceApprovalSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.history.push({
      status: this.status,
      changedBy: this._currentReviewer || this.reviewedBy,
      changedAt: new Date(),
      reason: this.rejectionReason,
      notes: this.reviewNotes
    });
  }
  next();
});

// Update time tracking
ServiceApprovalSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();

    if (this.status === 'approved') {
      this.timeTracking.approvedAt = now;
      this.reviewedAt = now;

      // Calculate total processing time
      if (this.timeTracking.submittedAt) {
        const diffMs = now - this.timeTracking.submittedAt;
        this.timeTracking.totalProcessingTime = Math.round(diffMs / (1000 * 60 * 60));
      }
    } else if (this.status === 'rejected') {
      this.timeTracking.rejectedAt = now;
      this.reviewedAt = now;

      if (this.timeTracking.submittedAt) {
        const diffMs = now - this.timeTracking.submittedAt;
        this.timeTracking.totalProcessingTime = Math.round(diffMs / (1000 * 60 * 60));
      }
    } else if (this.status === 'pending' && !this.timeTracking.firstReviewAt) {
      // First time going to pending is submission
      this.timeTracking.submittedAt = now;
    }
  }
  next();
});

// ===== STATIC METHODS =====

/**
 * Find all pending approvals
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Pending approvals
 */
ServiceApprovalSchema.statics.findPending = function(options = {}) {
  const { limit = 50, skip = 0, priority = null } = options;

  const query = { status: 'pending' };
  if (priority) query.priority = priority;

  return this.find(query)
    .populate('service', 'name description category')
    .populate('requestedBy', 'firstName lastName email')
    .sort({ priority: -1, createdAt: 1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Find approvals by requester (technician)
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} User's approval requests
 */
ServiceApprovalSchema.statics.findByRequester = function(userId) {
  return this.find({ requestedBy: userId })
    .populate('service', 'name description category approvalStatus')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

/**
 * Find overdue approvals
 * @returns {Promise<Array>} Overdue approvals
 */
ServiceApprovalSchema.statics.findOverdue = function() {
  return this.find({
    status: 'pending',
    targetReviewDate: { $lt: new Date() }
  })
    .populate('service', 'name description')
    .populate('requestedBy', 'firstName lastName email')
    .sort({ targetReviewDate: 1 });
};

/**
 * Get approval statistics
 * @param {Object} dateRange - Date range for stats
 * @returns {Promise<Object>} Statistics
 */
ServiceApprovalSchema.statics.getStats = async function(dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchStage = {};

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$timeTracking.totalProcessingTime' }
      }
    }
  ]);

  const result = {
    pending: 0,
    approved: 0,
    rejected: 0,
    resubmitted: 0,
    total: 0,
    avgProcessingTime: 0
  };

  let totalProcessingTime = 0;
  let processingCount = 0;

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;

    if (stat.avgProcessingTime) {
      totalProcessingTime += stat.avgProcessingTime * stat.count;
      processingCount += stat.count;
    }
  });

  if (processingCount > 0) {
    result.avgProcessingTime = Math.round(totalProcessingTime / processingCount);
  }

  return result;
};

/**
 * Find approvals needing escalation
 * @returns {Promise<Array>} Escalation-needed approvals
 */
ServiceApprovalSchema.statics.findNeedingEscalation = function() {
  return this.find({
    status: 'pending',
    $or: [
      { 'flags.needsEscalation': true },
      {
        targetReviewDate: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Overdue by 24 hours
        status: 'pending'
      }
    ]
  })
    .populate('service', 'name description')
    .populate('requestedBy', 'firstName lastName email')
    .sort({ targetReviewDate: 1 });
};

// ===== INSTANCE METHODS =====

/**
 * Approve the service
 * @param {ObjectId} adminId - Admin user ID
 * @param {string} notes - Optional review notes
 * @returns {Promise<Object>} Updated approval
 */
ServiceApprovalSchema.methods.approve = async function(adminId, notes = '') {
  if (this.status !== 'pending') {
    throw new Error('Only pending approvals can be approved');
  }

  const Service = mongoose.model('Service');

  this._currentReviewer = adminId;
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewNotes = notes;
  this.reviewedAt = new Date();

  // Update the service status
  await Service.findByIdAndUpdate(this.service, {
    approvalStatus: 'approved',
    rejectionReason: null
  });

  return this.save();
};

/**
 * Reject the service
 * @param {ObjectId} adminId - Admin user ID
 * @param {string} reason - Rejection reason
 * @param {string} notes - Optional review notes
 * @returns {Promise<Object>} Updated approval
 */
ServiceApprovalSchema.methods.reject = async function(adminId, reason, notes = '') {
  if (this.status !== 'pending') {
    throw new Error('Only pending approvals can be rejected');
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  const Service = mongoose.model('Service');

  this._currentReviewer = adminId;
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.rejectionReason = reason;
  this.reviewNotes = notes;
  this.reviewedAt = new Date();

  // Update the service status
  await Service.findByIdAndUpdate(this.service, {
    approvalStatus: 'rejected',
    rejectionReason: reason
  });

  return this.save();
};

/**
 * Request resubmission
 * @param {ObjectId} adminId - Admin user ID
 * @param {string} reason - Reason for requesting resubmission
 * @returns {Promise<Object>} Updated approval
 */
ServiceApprovalSchema.methods.requestResubmission = async function(adminId, reason) {
  if (this.status !== 'pending') {
    throw new Error('Only pending approvals can request resubmission');
  }

  this._currentReviewer = adminId;
  this.status = 'resubmitted';
  this.reviewedBy = adminId;
  this.flags.requiresAdditionalInfo = true;
  this.flags.additionalInfoRequested = reason;

  return this.save();
};

/**
 * Resubmit after changes
 * @param {string} changes - Description of changes made
 * @returns {Promise<Object>} Updated approval
 */
ServiceApprovalSchema.methods.resubmit = async function(changes) {
  if (this.status !== 'resubmitted') {
    throw new Error('Only resubmitted approvals can be resubmitted');
  }

  this.status = 'pending';
  this.resubmission.count += 1;
  this.resubmission.lastResubmittedAt = new Date();
  this.resubmission.changes = changes;
  this.flags.requiresAdditionalInfo = false;
  this.flags.additionalInfoRequested = null;

  // Update target review date
  this.targetReviewDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  return this.save();
};

/**
 * Set priority
 * @param {string} priority - Priority level
 * @returns {Promise<Object>} Updated approval
 */
ServiceApprovalSchema.methods.setPriority = function(priority) {
  this.priority = priority;

  // Adjust target review date based on priority
  const daysMap = {
    urgent: 0.5,
    high: 1,
    medium: 2,
    low: 4
  };

  const days = daysMap[priority] || 2;
  this.targetReviewDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return this.save();
};

/**
 * Escalate the approval
 * @param {string} reason - Escalation reason
 * @returns {Promise<Object>} Updated approval
 */
ServiceApprovalSchema.methods.escalate = function(reason) {
  this.flags.needsEscalation = true;
  this.flags.escalationReason = reason;
  this.priority = 'urgent';

  return this.save();
};

/**
 * Add notification record
 * @param {string} type - Notification type
 * @param {string} channel - Notification channel
 * @param {ObjectId} recipient - Recipient user ID
 * @returns {Promise<Object>} Updated approval
 */
ServiceApprovalSchema.methods.addNotification = function(type, channel, recipient) {
  this.notifications.push({
    type,
    channel,
    recipient,
    sentAt: new Date()
  });

  return this.save();
};

module.exports = mongoose.model('ServiceApproval', ServiceApprovalSchema);
