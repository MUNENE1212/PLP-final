const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * @desc    Create a new conversation
 * @route   POST /api/v1/conversations
 * @access  Private
 */
exports.createConversation = async (req, res) => {
  try {
    const { type, participants, name, booking } = req.body;

    // Ensure current user is in participants
    const allParticipantIds = [...new Set([req.user.id, ...participants])];

    // For direct messages, check if conversation already exists
    if (type === 'direct' && allParticipantIds.length === 2) {
      const existing = await Conversation.findOne({
        type: 'direct',
        'participants.user': { $all: allParticipantIds }
      }).populate('participants.user', 'firstName lastName profilePicture');

      if (existing && existing.participants.length === 2) {
        return res.status(200).json({
          success: true,
          message: 'Conversation already exists',
          conversation: existing
        });
      }
    }

    // Create conversation with participant subdocuments
    const participantDocs = allParticipantIds.map(userId => ({
      user: userId,
      role: userId === req.user.id ? 'admin' : 'member',
      joinedAt: new Date(),
      unreadCount: 0,
      isMuted: false,
      isPinned: false
    }));

    const conversation = await Conversation.create({
      type,
      participants: participantDocs,
      name,
      booking,
      createdBy: req.user.id
    });

    await conversation.populate('participants.user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

/**
 * @desc    Get all conversations for user
 * @route   GET /api/v1/conversations
 * @access  Private
 */
exports.getConversations = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const query = {
      'participants.user': req.user.id,
      'participants.leftAt': { $exists: false }
    };

    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await Conversation.find(query)
      .populate('participants.user', 'firstName lastName profilePicture role')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'firstName lastName profilePicture'
        }
      })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: conversations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
};

/**
 * @desc    Get single conversation
 * @route   GET /api/v1/conversations/:id
 * @access  Private
 */
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.user', 'firstName lastName profilePicture role email phoneNumber')
      .populate('booking');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.user._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this conversation'
      });
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
};

/**
 * @desc    Update conversation settings
 * @route   PUT /api/v1/conversations/:id/settings
 * @access  Private
 */
exports.updateSettings = async (req, res) => {
  try {
    const { isMuted, isPinned } = req.body;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const participant = conversation.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this conversation'
      });
    }

    if (isMuted !== undefined) participant.isMuted = isMuted;
    if (isPinned !== undefined) participant.isPinned = isPinned;

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: participant
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
};

/**
 * @desc    Add participant to group conversation
 * @route   POST /api/v1/conversations/:id/participants
 * @access  Private
 */
exports.addParticipant = async (req, res) => {
  try {
    const { userId } = req.body;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only add participants to group conversations'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this conversation'
      });
    }

    const alreadyParticipant = conversation.participants.some(
      p => p.user.toString() === userId
    );

    if (alreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    conversation.participants.push({
      user: userId,
      role: 'member',
      joinedAt: new Date(),
      unreadCount: 0,
      isMuted: false,
      isPinned: false
    });

    await conversation.save();

    await conversation.populate('participants.user', 'firstName lastName profilePicture');

    res.status(200).json({
      success: true,
      message: 'Participant added successfully',
      conversation
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding participant'
    });
  }
};

/**
 * @desc    Remove participant from group conversation
 * @route   DELETE /api/v1/conversations/:id/participants/:userId
 * @access  Private
 */
exports.removeParticipant = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Can only remove participants from group conversations'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this conversation'
      });
    }

    conversation.participants = conversation.participants.filter(
      p => p.user.toString() !== userId
    );

    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing participant'
    });
  }
};
