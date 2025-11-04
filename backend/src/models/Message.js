const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const Schema = mongoose.Schema;

// Message Attachment Schema
const AttachmentSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'location'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: String,
  thumbnail: String,
  filename: String,
  size: Number, // in bytes
  mimeType: String,
  duration: Number, // for audio/video, in seconds
  // For location attachments
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  locationName: String
}, { _id: false });

// Read Receipt Schema
const ReadReceiptSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Main Message Schema
const MessageSchema = new Schema({
  // Conversation/Chat Room
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },

  // Sender
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Message Type
  type: {
    type: String,
    enum: [
      'text',           // Regular text message
      'image',          // Image message
      'video',          // Video message
      'audio',          // Audio message
      'document',       // Document/file
      'location',       // Location share
      'booking',        // Booking info
      'system',         // System message
      'call'            // Call notification
    ],
    default: 'text',
    required: true
  },

  // Content (encrypted)
  text: {
    type: String,
    maxlength: 10000, // Increased to accommodate encrypted data
    set: function(value) {
      // Encrypt text before saving (only for non-system messages)
      if (value && this.type !== 'system') {
        return encrypt(value);
      }
      return value;
    },
    get: function(value) {
      // Decrypt text when retrieving (only for non-system messages)
      if (value && this.type !== 'system') {
        return decrypt(value);
      }
      return value;
    }
  },
  attachments: [AttachmentSchema],

  // Encryption metadata
  isEncrypted: {
    type: Boolean,
    default: true
  },

  // Special message types
  bookingRef: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  callInfo: {
    type: {
      type: String,
      enum: ['voice', 'video']
    },
    duration: Number, // in seconds
    status: {
      type: String,
      enum: ['missed', 'completed', 'declined']
    }
  },

  // Reply/Thread
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },

  // Delivery Status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },

  // Read Receipts
  readBy: [ReadReceiptSchema],

  // Reactions
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Mentions
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Edit History
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    text: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Deletion
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }, // Who deleted it for everyone
  deletedFor: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }], // Users who deleted this message for themselves only

  // System Message Info
  systemInfo: {
    action: String, // 'user_joined', 'user_left', 'booking_created', etc.
    metadata: Schema.Types.Mixed
  },

  // Metadata
  metadata: {
    ipAddress: String,
    device: String,
    platform: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// ===== INDEXES =====
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ conversation: 1, status: 1 });
MessageSchema.index({ type: 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ 'readBy.user': 1 });

// Text search
MessageSchema.index({ text: 'text' });

// ===== VIRTUALS =====
MessageSchema.virtual('isRead').get(function() {
  return this.status === 'read' || this.readBy.length > 0;
});

MessageSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// ===== MIDDLEWARE =====

// Update conversation's lastMessage when a new message is created
MessageSchema.post('save', async function(doc) {
  if (!doc.isDeleted && doc.type !== 'system') {
    await mongoose.model('Conversation').findByIdAndUpdate(doc.conversation, {
      lastMessage: doc._id,
      lastMessageAt: doc.createdAt
    });
  }
});

// ===== METHODS =====

// Mark as read by user
MessageSchema.methods.markAsRead = async function(userId) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(receipt => receipt.user.equals(userId));

  if (!alreadyRead && !this.sender.equals(userId)) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });

    this.status = 'read';
    await this.save();

    // Update conversation unread count
    await mongoose.model('Conversation').updateUnreadCount(this.conversation, userId);
  }

  return this;
};

// Add reaction
MessageSchema.methods.addReaction = async function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => !r.user.equals(userId));

  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji,
    createdAt: new Date()
  });

  await this.save();
  return this;
};

// Remove reaction
MessageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(r => !r.user.equals(userId));
  await this.save();
  return this;
};

// Edit message
MessageSchema.methods.edit = async function(newText) {
  // Get decrypted text for history
  const currentText = this.get('text', null, { getters: false });

  // Save old encrypted text to history
  this.editHistory.push({
    text: currentText, // Save encrypted version
    editedAt: new Date()
  });

  this.text = newText; // Will be encrypted by setter
  this.isEdited = true;
  this.editedAt = new Date();

  await this.save();
  return this;
};

// Delete message for everyone
MessageSchema.methods.deleteForEveryone = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.text = null; // Clear encrypted text
  this.attachments = [];

  await this.save();
  return this;
};

// Delete for specific user
MessageSchema.methods.deleteForUser = async function(userId) {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
    await this.save();
  }
  return this;
};

// ===== STATIC METHODS =====

// Get messages for a conversation
MessageSchema.statics.getConversationMessages = function(
  conversationId,
  page = 1,
  limit = 50
) {
  return this.find({
    conversation: conversationId,
    isDeleted: false
  })
  .populate('sender', 'firstName lastName profilePicture isOnline lastSeen')
  .populate('replyTo')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
};

// Get unread messages for user in a conversation
MessageSchema.statics.getUnreadMessages = function(conversationId, userId) {
  return this.find({
    conversation: conversationId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    isDeleted: false
  })
  .populate('sender', 'firstName lastName profilePicture')
  .sort({ createdAt: 1 });
};

// Mark all messages as read in a conversation
MessageSchema.statics.markAllAsRead = async function(conversationId, userId) {
  const messages = await this.find({
    conversation: conversationId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    isDeleted: false
  });

  for (const message of messages) {
    await message.markAsRead(userId);
  }

  return messages.length;
};

// Search messages in conversation
MessageSchema.statics.searchInConversation = function(conversationId, query) {
  return this.find({
    conversation: conversationId,
    $text: { $search: query },
    isDeleted: false
  }, {
    score: { $meta: 'textScore' }
  })
  .populate('sender', 'firstName lastName profilePicture')
  .sort({ score: { $meta: 'textScore' } });
};

// Get media messages from conversation
MessageSchema.statics.getMediaMessages = function(conversationId, mediaType = null) {
  const query = {
    conversation: conversationId,
    type: { $in: ['image', 'video', 'audio', 'document'] },
    isDeleted: false
  };

  if (mediaType) {
    query.type = mediaType;
  }

  return this.find(query)
    .populate('sender', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 });
};

// Delete old messages (cleanup)
MessageSchema.statics.deleteOldMessages = async function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isDeleted: true
  });
};

module.exports = mongoose.model('Message', MessageSchema);
