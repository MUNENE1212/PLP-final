const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Participant Schema
const ParticipantSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: Date,
  // Participant-specific settings
  isMuted: {
    type: Boolean,
    default: false
  },
  mutedUntil: Date,
  isPinned: {
    type: Boolean,
    default: false
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  lastReadAt: Date,
  customNickname: String // Custom name for this conversation
}, { _id: false });

// Main Conversation Schema
const ConversationSchema = new Schema({
  // Conversation Type
  type: {
    type: String,
    enum: ['direct', 'group', 'booking', 'support'],
    required: true,
    index: true
  },

  // Participants
  participants: {
    type: [ParticipantSchema],
    required: true,
    validate: {
      validator: function(participants) {
        return participants.length >= 2;
      },
      message: 'A conversation must have at least 2 participants'
    }
  },

  // Group Conversation Details
  name: String, // For group chats
  description: String,
  avatar: {
    url: String,
    publicId: String
  },

  // Booking-related conversation
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    index: true
  },

  // Last Message
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
    index: true
  },

  // Creator (for group chats)
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Settings
  settings: {
    allowMediaSharing: {
      type: Boolean,
      default: true
    },
    allowCalls: {
      type: Boolean,
      default: true
    },
    onlyAdminsCanSend: {
      type: Boolean,
      default: false
    }
  },

  // Metadata
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
ConversationSchema.index({ 'participants.user': 1 });
ConversationSchema.index({ type: 1, status: 1 });
ConversationSchema.index({ booking: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ status: 1, lastMessageAt: -1 });

// Compound index for finding direct conversations between two users
ConversationSchema.index({ 'participants.user': 1, type: 1 });

// ===== VIRTUALS =====
ConversationSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

ConversationSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => !p.leftAt);
});

// ===== MIDDLEWARE =====

// Update lastActivity on save
ConversationSchema.pre('save', function(next) {
  this.metadata.lastActivity = new Date();
  next();
});

// Increment message count when a new message is added
ConversationSchema.post('save', function(doc) {
  // This is handled in Message.post('save')
});

// ===== METHODS =====

// Add participant
ConversationSchema.methods.addParticipant = async function(userId, role = 'member') {
  // Check if user is already a participant
  const exists = this.participants.some(p => p.user.equals(userId) && !p.leftAt);

  if (!exists) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date()
    });
    await this.save();
  }

  return this;
};

// Remove participant
ConversationSchema.methods.removeParticipant = async function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));

  if (participant) {
    participant.leftAt = new Date();
    await this.save();
  }

  return this;
};

// Mute conversation for user
ConversationSchema.methods.muteForUser = async function(userId, duration = null) {
  const participant = this.participants.find(p => p.user.equals(userId));

  if (participant) {
    participant.isMuted = true;
    if (duration) {
      participant.mutedUntil = new Date(Date.now() + duration);
    }
    await this.save();
  }

  return this;
};

// Unmute conversation for user
ConversationSchema.methods.unmuteForUser = async function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));

  if (participant) {
    participant.isMuted = false;
    participant.mutedUntil = null;
    await this.save();
  }

  return this;
};

// Pin conversation for user
ConversationSchema.methods.pinForUser = async function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));

  if (participant) {
    participant.isPinned = true;
    await this.save();
  }

  return this;
};

// Unpin conversation for user
ConversationSchema.methods.unpinForUser = async function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));

  if (participant) {
    participant.isPinned = false;
    await this.save();
  }

  return this;
};

// Update unread count for user
ConversationSchema.methods.updateUnreadCount = async function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));

  if (participant) {
    const Message = mongoose.model('Message');
    const unreadCount = await Message.countDocuments({
      conversation: this._id,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId },
      isDeleted: false
    });

    participant.unreadCount = unreadCount;
    await this.save();
  }

  return this;
};

// Mark as read for user
ConversationSchema.methods.markAsReadForUser = async function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));

  if (participant) {
    participant.unreadCount = 0;
    participant.lastReadAt = new Date();
    await this.save();
  }

  return this;
};

// Archive conversation
ConversationSchema.methods.archive = async function() {
  this.status = 'archived';
  await this.save();
  return this;
};

// Unarchive conversation
ConversationSchema.methods.unarchive = async function() {
  this.status = 'active';
  await this.save();
  return this;
};

// Check if user is participant
ConversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.equals(userId) && !p.leftAt);
};

// Get participant
ConversationSchema.methods.getParticipant = function(userId) {
  return this.participants.find(p => p.user.equals(userId));
};

// ===== STATIC METHODS =====

// Find or create direct conversation between two users
ConversationSchema.statics.findOrCreateDirect = async function(user1Id, user2Id) {
  // Try to find existing conversation
  let conversation = await this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] },
    'participants.leftAt': { $exists: false }
  })
  .populate('participants.user', 'firstName lastName profilePicture isOnline lastSeen')
  .populate('lastMessage');

  // Create new conversation if doesn't exist
  if (!conversation) {
    conversation = await this.create({
      type: 'direct',
      participants: [
        { user: user1Id },
        { user: user2Id }
      ],
      createdBy: user1Id
    });

    conversation = await this.findById(conversation._id)
      .populate('participants.user', 'firstName lastName profilePicture isOnline lastSeen');
  }

  return conversation;
};

// Get user's conversations
ConversationSchema.statics.getUserConversations = async function(
  userId,
  status = 'active',
  page = 1,
  limit = 20
) {
  return this.find({
    'participants.user': userId,
    'participants.leftAt': { $exists: false },
    status
  })
  .populate('participants.user', 'firstName lastName profilePicture isOnline lastSeen')
  .populate('lastMessage')
  .populate('booking', 'bookingNumber status')
  .sort({ lastMessageAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get booking conversation
ConversationSchema.statics.getBookingConversation = async function(bookingId) {
  return this.findOne({
    booking: bookingId,
    type: 'booking'
  })
  .populate('participants.user', 'firstName lastName profilePicture isOnline lastSeen')
  .populate('lastMessage');
};

// Create booking conversation
ConversationSchema.statics.createBookingConversation = async function(
  bookingId,
  customerId,
  technicianId
) {
  const conversation = await this.create({
    type: 'booking',
    booking: bookingId,
    participants: [
      { user: customerId },
      { user: technicianId }
    ],
    createdBy: customerId,
    settings: {
      allowMediaSharing: true,
      allowCalls: true
    }
  });

  return this.findById(conversation._id)
    .populate('participants.user', 'firstName lastName profilePicture isOnline lastSeen');
};

// Create group conversation
ConversationSchema.statics.createGroup = async function(
  name,
  creatorId,
  participantIds,
  description = null
) {
  const participants = [
    { user: creatorId, role: 'admin' },
    ...participantIds.map(id => ({ user: id, role: 'member' }))
  ];

  const conversation = await this.create({
    type: 'group',
    name,
    description,
    participants,
    createdBy: creatorId
  });

  return this.findById(conversation._id)
    .populate('participants.user', 'firstName lastName profilePicture');
};

// Search conversations
ConversationSchema.statics.searchUserConversations = async function(userId, query) {
  // This searches by participant names and conversation names
  const User = mongoose.model('User');

  // Find users matching the query
  const users = await User.find({
    $text: { $search: query }
  }).select('_id');

  const userIds = users.map(u => u._id);

  return this.find({
    'participants.user': userId,
    'participants.leftAt': { $exists: false },
    status: 'active',
    $or: [
      { name: new RegExp(query, 'i') },
      { 'participants.user': { $in: userIds } }
    ]
  })
  .populate('participants.user', 'firstName lastName profilePicture')
  .populate('lastMessage')
  .sort({ lastMessageAt: -1 });
};

// Get unread conversations count
ConversationSchema.statics.getUnreadCount = async function(userId) {
  const conversations = await this.find({
    'participants.user': userId,
    'participants.leftAt': { $exists: false },
    status: 'active'
  });

  let totalUnread = 0;
  conversations.forEach(conv => {
    const participant = conv.participants.find(p => p.user.equals(userId));
    if (participant) {
      totalUnread += participant.unreadCount;
    }
  });

  return totalUnread;
};

// Clean up old deleted conversations
ConversationSchema.statics.cleanupDeleted = async function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  return this.deleteMany({
    status: 'deleted',
    updatedAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Conversation', ConversationSchema);
