const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * @desc    Send a message
 * @route   POST /api/v1/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversation, type, text, media, location, booking } = req.body;

    // Verify conversation exists and user is participant
    const conv = await Conversation.findById(conversation);
    if (!conv) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conv.participants.includes(req.user.id);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversation,
      sender: req.user.id,
      type,
      text,
      media,
      location,
      booking,
      status: 'sent'
    });

    // Update conversation's last message
    conv.lastMessage = {
      text: type === 'text' ? text : `[${type}]`,
      sender: req.user.id,
      timestamp: new Date()
    };

    // Increment unread count for other participants
    conv.participants.forEach(participant => {
      if (participant.toString() !== req.user.id) {
        const participantSettings = conv.participantSettings.find(
          ps => ps.user.toString() === participant.toString()
        );
        if (participantSettings) {
          participantSettings.unreadCount += 1;
        }
      }
    });

    await conv.save();

    await message.populate('sender', 'firstName lastName profilePicture');

    // TODO: Emit socket.io event for real-time delivery
    // TODO: Send push notification to other participants

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/v1/messages
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversation, page = 1, limit = 50 } = req.query;

    if (!conversation) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }

    // Verify user is participant
    const conv = await Conversation.findById(conversation);
    if (!conv) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conv.participants.includes(req.user.id);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this conversation'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      conversation,
      deletedFor: { $ne: req.user.id }
    })
      .populate('sender', 'firstName lastName profilePicture')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversation,
      deletedFor: { $ne: req.user.id }
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/v1/messages/mark-read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { conversation } = req.body;

    // Update all unread messages
    await Message.updateMany(
      {
        conversation,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        },
        $set: { status: 'read' }
      }
    );

    // Reset unread count in conversation
    const conv = await Conversation.findById(conversation);
    const participantSettings = conv.participantSettings.find(
      ps => ps.user.toString() === req.user.id
    );
    if (participantSettings) {
      participantSettings.unreadCount = 0;
      await conv.save();
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};

/**
 * @desc    Delete message for self
 * @route   DELETE /api/v1/messages/:id
 * @access  Private
 */
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Delete for specific user only
    await message.deleteForUser(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Message deleted for you'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
};

/**
 * @desc    Delete message for everyone
 * @route   DELETE /api/v1/messages/:id/everyone
 * @access  Private (Only message sender)
 */
exports.deleteMessageForEveryone = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages for everyone'
      });
    }

    // Check time limit (optional: only allow deletion within 1 hour)
    const ONE_HOUR = 60 * 60 * 1000;
    const messageAge = Date.now() - message.createdAt;

    if (messageAge > ONE_HOUR) {
      return res.status(403).json({
        success: false,
        message: 'Messages can only be deleted for everyone within 1 hour of sending'
      });
    }

    // Delete for everyone
    await message.deleteForEveryone(req.user.id);

    // TODO: Emit socket.io event to notify all participants
    // TODO: Send push notification about deleted message

    res.status(200).json({
      success: true,
      message: 'Message deleted for everyone'
    });
  } catch (error) {
    console.error('Delete message for everyone error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message for everyone'
    });
  }
};

/**
 * @desc    Add reaction to message
 * @route   POST /api/v1/messages/:id/reaction
 * @access  Private
 */
exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user.id
    );

    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({
        user: req.user.id,
        emoji
      });
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction'
    });
  }
};
