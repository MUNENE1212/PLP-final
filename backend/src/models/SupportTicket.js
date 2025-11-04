const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Support Ticket Message Schema
const TicketMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['customer', 'support', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    url: String,
    fileName: String,
    fileSize: Number,
    fileType: String
  }],
  isInternal: {
    type: Boolean,
    default: false // Internal notes only visible to support team
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Support Ticket Schema
const SupportTicketSchema = new Schema({
  // Ticket Identification
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },

  // User Information
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Support agent
  },

  // Ticket Details
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'account',
      'booking',
      'payment',
      'technical',
      'billing',
      'complaint',
      'feature_request',
      'bug_report',
      'general',
      'other'
    ],
    required: true
  },
  subcategory: String,

  // Priority & Status
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: [
      'open',           // Newly created
      'assigned',       // Assigned to support agent
      'in_progress',    // Being worked on
      'waiting_customer', // Waiting for customer response
      'waiting_internal', // Waiting for internal team
      'resolved',       // Issue resolved
      'closed',         // Ticket closed
      'reopened'        // Reopened after closure
    ],
    default: 'open'
  },

  // Related Entities
  relatedBooking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  relatedTransaction: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  relatedConversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },

  // Messages/Communication
  messages: [TicketMessageSchema],

  // Attachments (initial)
  attachments: [{
    url: String,
    fileName: String,
    fileSize: Number,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Tags
  tags: [String],

  // SLA (Service Level Agreement)
  sla: {
    firstResponseTime: {
      target: Number, // in minutes
      actual: Number,
      met: Boolean
    },
    resolutionTime: {
      target: Number, // in minutes
      actual: Number,
      met: Boolean
    }
  },

  // Timestamps
  assignedAt: Date,
  firstResponseAt: Date,
  resolvedAt: Date,
  closedAt: Date,
  reopenedAt: Date,

  // Resolution
  resolution: {
    summary: String,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionType: {
      type: String,
      enum: ['solved', 'workaround', 'duplicate', 'cannot_reproduce', 'wont_fix', 'other']
    },
    resolutionNotes: String
  },

  // Customer Satisfaction
  customerSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },

  // Escalation
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalationLevel: {
    type: Number,
    default: 0 // 0 = not escalated, 1 = first level, 2 = second level, etc.
  },
  escalatedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  escalatedAt: Date,
  escalationReason: String,

  // Auto-close
  autoCloseDate: Date, // If no response by this date, auto-close

  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'email', 'phone', 'chat', 'admin'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String,

  // Internal Notes (only visible to support team)
  internalNotes: [{
    note: String,
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Status History
  statusHistory: [{
    status: String,
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
SupportTicketSchema.index({ customer: 1 });
SupportTicketSchema.index({ assignedTo: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ category: 1 });
SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: -1 }); // For queue management
SupportTicketSchema.index({ assignedTo: 1, status: 1 }); // For agent workload

// Text search index
SupportTicketSchema.index({
  ticketNumber: 'text',
  subject: 'text',
  description: 'text',
  tags: 'text'
});

// ===== VIRTUALS =====
SupportTicketSchema.virtual('responseTime').get(function() {
  if (!this.firstResponseAt) return null;
  return Math.round((this.firstResponseAt - this.createdAt) / (1000 * 60)); // in minutes
});

SupportTicketSchema.virtual('resolutionTime').get(function() {
  if (!this.resolvedAt) return null;
  return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60)); // in minutes
});

SupportTicketSchema.virtual('age').get(function() {
  const endDate = this.closedAt || new Date();
  return Math.round((endDate - this.createdAt) / (1000 * 60 * 60)); // in hours
});

SupportTicketSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// ===== MIDDLEWARE =====

// Generate ticket number before validation (so it's available when validation runs)
SupportTicketSchema.pre('validate', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TKT-${Date.now()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Update timestamps based on status changes
SupportTicketSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();

    switch (this.status) {
      case 'assigned':
        if (!this.assignedAt) this.assignedAt = now;
        break;
      case 'resolved':
        if (!this.resolvedAt) this.resolvedAt = now;
        // Calculate SLA
        if (this.sla) {
          if (this.sla.resolutionTime) {
            this.sla.resolutionTime.actual = this.resolutionTime;
            this.sla.resolutionTime.met = this.resolutionTime <= this.sla.resolutionTime.target;
          }
        }
        break;
      case 'closed':
        if (!this.closedAt) this.closedAt = now;
        break;
      case 'reopened':
        this.reopenedAt = now;
        break;
    }

    // Add to status history
    this.statusHistory.push({
      status: this.status,
      changedAt: now,
      changedBy: this._currentUser // Set via controller
    });
  }
  next();
});

// Update first response time
SupportTicketSchema.pre('save', function(next) {
  if (this.isModified('messages') && !this.firstResponseAt && this.messages.length > 0) {
    // Find first support/admin response
    const supportResponse = this.messages.find(m =>
      m.senderRole === 'support' || m.senderRole === 'admin'
    );

    if (supportResponse) {
      this.firstResponseAt = supportResponse.timestamp;

      // Calculate SLA
      if (this.sla && this.sla.firstResponseTime) {
        this.sla.firstResponseTime.actual = this.responseTime;
        this.sla.firstResponseTime.met = this.responseTime <= this.sla.firstResponseTime.target;
      }
    }
  }
  next();
});

// ===== METHODS =====

// Add message to ticket
SupportTicketSchema.methods.addMessage = function(senderId, senderRole, message, attachments = [], isInternal = false) {
  this.messages.push({
    sender: senderId,
    senderRole,
    message,
    attachments,
    isInternal,
    timestamp: new Date()
  });
};

// Add internal note
SupportTicketSchema.methods.addInternalNote = function(note, userId) {
  this.internalNotes.push({
    note,
    addedBy: userId,
    addedAt: new Date()
  });
};

// Assign to support agent
SupportTicketSchema.methods.assignToAgent = function(agentId, assignedBy) {
  this.assignedTo = agentId;
  this.status = 'assigned';
  this.assignedAt = new Date();
  this._currentUser = assignedBy;
};

// Escalate ticket
SupportTicketSchema.methods.escalate = function(escalatedTo, reason, escalatedBy) {
  this.isEscalated = true;
  this.escalationLevel += 1;
  this.escalatedTo = escalatedTo;
  this.escalatedAt = new Date();
  this.escalationReason = reason;
  this._currentUser = escalatedBy;
};

// Close ticket
SupportTicketSchema.methods.close = function(summary, resolutionType, closedBy) {
  this.status = 'closed';
  this.closedAt = new Date();
  this.resolution = {
    summary,
    resolvedBy: closedBy,
    resolutionType
  };
  this._currentUser = closedBy;
};

// Reopen ticket
SupportTicketSchema.methods.reopen = function(reason, reopenedBy) {
  this.status = 'reopened';
  this.reopenedAt = new Date();
  this.closedAt = undefined;
  this.resolvedAt = undefined;
  this._currentUser = reopenedBy;

  this.addInternalNote(`Ticket reopened: ${reason}`, reopenedBy);
};

// ===== STATIC METHODS =====

// Get open tickets count for agent
SupportTicketSchema.statics.getAgentWorkload = async function(agentId) {
  return this.countDocuments({
    assignedTo: agentId,
    status: { $in: ['assigned', 'in_progress', 'waiting_customer'] }
  });
};

// Get unassigned tickets
SupportTicketSchema.statics.getUnassignedTickets = async function(limit = 50) {
  return this.find({
    status: 'open',
    assignedTo: { $exists: false }
  })
  .populate('customer', 'firstName lastName email phoneNumber')
  .sort({ priority: -1, createdAt: 1 }) // High priority first, then FIFO
  .limit(limit);
};

// Get tickets by status
SupportTicketSchema.statics.getTicketsByStatus = async function(status, limit = 50) {
  return this.find({ status })
    .populate('customer', 'firstName lastName email phoneNumber')
    .populate('assignedTo', 'firstName lastName email')
    .sort('-createdAt')
    .limit(limit);
};

// Get agent statistics
SupportTicketSchema.statics.getAgentStats = async function(agentId, startDate, endDate) {
  const query = {
    assignedTo: agentId
  };

  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const tickets = await this.find(query);

  const stats = {
    total: tickets.length,
    open: 0,
    closed: 0,
    resolved: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
    satisfactionRating: 0,
    slaCompliance: 0
  };

  let totalResponseTime = 0;
  let totalResolutionTime = 0;
  let responseTimeCount = 0;
  let resolutionTimeCount = 0;
  let totalRating = 0;
  let ratingCount = 0;
  let slaMet = 0;
  let slaCount = 0;

  tickets.forEach(ticket => {
    if (ticket.status === 'open') stats.open++;
    if (ticket.status === 'closed') stats.closed++;
    if (ticket.status === 'resolved') stats.resolved++;

    if (ticket.responseTime) {
      totalResponseTime += ticket.responseTime;
      responseTimeCount++;
    }

    if (ticket.resolutionTime) {
      totalResolutionTime += ticket.resolutionTime;
      resolutionTimeCount++;
    }

    if (ticket.customerSatisfaction?.rating) {
      totalRating += ticket.customerSatisfaction.rating;
      ratingCount++;
    }

    if (ticket.sla) {
      slaCount++;
      if (ticket.sla.firstResponseTime?.met && ticket.sla.resolutionTime?.met) {
        slaMet++;
      }
    }
  });

  stats.avgResponseTime = responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0;
  stats.avgResolutionTime = resolutionTimeCount > 0 ? Math.round(totalResolutionTime / resolutionTimeCount) : 0;
  stats.satisfactionRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0;
  stats.slaCompliance = slaCount > 0 ? ((slaMet / slaCount) * 100).toFixed(2) : 0;

  return stats;
};

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
