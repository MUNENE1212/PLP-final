const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

/**
 * @desc    Create a support ticket
 * @route   POST /api/v1/support/tickets
 * @access  Private
 */
exports.createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      subcategory,
      priority,
      relatedBooking,
      relatedTransaction,
      attachments,
      tags
    } = req.body;

    // Set SLA targets based on priority
    const slaTargets = {
      urgent: { firstResponse: 15, resolution: 120 },   // 15 min, 2 hours
      high: { firstResponse: 30, resolution: 240 },     // 30 min, 4 hours
      medium: { firstResponse: 60, resolution: 480 },   // 1 hour, 8 hours
      low: { firstResponse: 120, resolution: 1440 }     // 2 hours, 24 hours
    };

    const ticketPriority = priority || 'medium';
    const slaTarget = slaTargets[ticketPriority];

    const ticket = await SupportTicket.create({
      customer: req.user.id,
      subject,
      description,
      category,
      subcategory,
      priority: ticketPriority,
      relatedBooking,
      relatedTransaction,
      attachments: attachments || [],
      tags: tags || [],
      source: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sla: {
        firstResponseTime: {
          target: slaTarget.firstResponse
        },
        resolutionTime: {
          target: slaTarget.resolution
        }
      }
    });

    // Add initial message
    ticket.addMessage(
      req.user.id,
      'customer',
      description,
      attachments || []
    );

    await ticket.save();

    // TODO: Notify support team
    // TODO: Auto-assign based on category and agent availability

    await ticket.populate([
      { path: 'customer', select: 'firstName lastName email phoneNumber' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating support ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Get all tickets (with filters)
 * @route   GET /api/v1/support/tickets
 * @access  Private
 */
exports.getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'support') {
      // Support agents see assigned tickets or unassigned
      if (!assignedTo) {
        query.$or = [
          { assignedTo: req.user.id },
          { status: 'open', assignedTo: { $exists: false } }
        ];
      } else if (assignedTo === 'me') {
        query.assignedTo = req.user.id;
      }
    }
    // Admin sees all tickets

    // Filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo && assignedTo !== 'me') query.assignedTo = assignedTo;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await SupportTicket.find(query)
      .populate('customer', 'firstName lastName email phoneNumber profilePicture')
      .populate('assignedTo', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      tickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets'
    });
  }
};

/**
 * @desc    Get single ticket
 * @route   GET /api/v1/support/tickets/:id
 * @access  Private
 */
exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber profilePicture')
      .populate('assignedTo', 'firstName lastName email profilePicture')
      .populate('messages.sender', 'firstName lastName profilePicture role')
      .populate('relatedBooking')
      .populate('relatedTransaction');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check authorization
    const isAuthorized =
      ticket.customer._id.toString() === req.user.id ||
      ticket.assignedTo?._id.toString() === req.user.id ||
      req.user.role === 'admin' ||
      req.user.role === 'support';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }

    // Filter internal notes/messages for customers
    if (req.user.role === 'customer') {
      ticket.messages = ticket.messages.filter(m => !m.isInternal);
      ticket.internalNotes = undefined;
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket'
    });
  }
};

/**
 * @desc    Add message to ticket
 * @route   POST /api/v1/support/tickets/:id/messages
 * @access  Private
 */
exports.addMessage = async (req, res) => {
  try {
    const { message, attachments, isInternal } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check authorization
    const isAuthorized =
      ticket.customer.toString() === req.user.id ||
      ticket.assignedTo?.toString() === req.user.id ||
      req.user.role === 'admin' ||
      req.user.role === 'support';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add message to this ticket'
      });
    }

    // Only support/admin can add internal messages
    const messageIsInternal = (isInternal && (req.user.role === 'support' || req.user.role === 'admin'));

    // Determine sender role
    let senderRole = 'customer';
    if (req.user.role === 'support') senderRole = 'support';
    if (req.user.role === 'admin') senderRole = 'admin';

    ticket.addMessage(
      req.user.id,
      senderRole,
      message,
      attachments || [],
      messageIsInternal
    );

    // Update status if customer responds
    if (ticket.status === 'waiting_customer' && req.user.role === 'customer') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    await ticket.populate('messages.sender', 'firstName lastName profilePicture role');

    // TODO: Send notification to other party
    // TODO: Create real-time update via Socket.io

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      newMessage: ticket.messages[ticket.messages.length - 1]
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message'
    });
  }
};

/**
 * @desc    Assign ticket to support agent
 * @route   PUT /api/v1/support/tickets/:id/assign
 * @access  Private (Support/Admin)
 */
exports.assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Verify agent exists and has support role
    const agent = await User.findById(agentId);
    if (!agent || (agent.role !== 'support' && agent.role !== 'admin')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid support agent'
      });
    }

    // Check agent workload
    const workload = await SupportTicket.getAgentWorkload(agentId);
    const maxTickets = agent.supportInfo?.availability?.maxConcurrentTickets || 5;

    if (workload >= maxTickets) {
      return res.status(400).json({
        success: false,
        message: `Agent has reached maximum concurrent tickets (${maxTickets})`,
        currentWorkload: workload
      });
    }

    ticket.assignToAgent(agentId, req.user.id);

    await ticket.save();

    await ticket.populate('assignedTo', 'firstName lastName email');

    // TODO: Notify assigned agent

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning ticket'
    });
  }
};

/**
 * @desc    Update ticket status
 * @route   PUT /api/v1/support/tickets/:id/status
 * @access  Private (Support/Admin)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = status;
    ticket._currentUser = req.user.id;

    if (notes) {
      ticket.addInternalNote(notes, req.user.id);
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status'
    });
  }
};

/**
 * @desc    Update ticket priority
 * @route   PUT /api/v1/support/tickets/:id/priority
 * @access  Private (Support/Admin)
 */
exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.priority = priority;
    ticket.addInternalNote(`Priority changed to ${priority}`, req.user.id);

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket priority updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket priority'
    });
  }
};

/**
 * @desc    Close/resolve ticket
 * @route   PUT /api/v1/support/tickets/:id/close
 * @access  Private (Support/Admin)
 */
exports.closeTicket = async (req, res) => {
  try {
    const { summary, resolutionType, resolutionNotes } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.close(summary, resolutionType, req.user.id);

    if (resolutionNotes) {
      ticket.resolution.resolutionNotes = resolutionNotes;
    }

    await ticket.save();

    // TODO: Send satisfaction survey to customer

    res.status(200).json({
      success: true,
      message: 'Ticket closed successfully',
      ticket
    });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing ticket'
    });
  }
};

/**
 * @desc    Reopen ticket
 * @route   PUT /api/v1/support/tickets/:id/reopen
 * @access  Private
 */
exports.reopenTicket = async (req, res) => {
  try {
    const { reason } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Can only reopen closed tickets'
      });
    }

    ticket.reopen(reason, req.user.id);

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket reopened successfully',
      ticket
    });
  } catch (error) {
    console.error('Reopen ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reopening ticket'
    });
  }
};

/**
 * @desc    Escalate ticket
 * @route   PUT /api/v1/support/tickets/:id/escalate
 * @access  Private (Support/Admin)
 */
exports.escalateTicket = async (req, res) => {
  try {
    const { escalatedTo, reason } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.escalate(escalatedTo, reason, req.user.id);

    await ticket.save();

    await ticket.populate('escalatedTo', 'firstName lastName email');

    // TODO: Notify escalated person

    res.status(200).json({
      success: true,
      message: 'Ticket escalated successfully',
      ticket
    });
  } catch (error) {
    console.error('Escalate ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error escalating ticket'
    });
  }
};

/**
 * @desc    Add customer satisfaction rating
 * @route   POST /api/v1/support/tickets/:id/rate
 * @access  Private (Customer only)
 */
exports.rateTicket = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only ticket creator can rate'
      });
    }

    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate closed or resolved tickets'
      });
    }

    ticket.customerSatisfaction = {
      rating,
      feedback,
      ratedAt: new Date()
    };

    await ticket.save();

    // Update support agent's stats
    if (ticket.assignedTo) {
      const agent = await User.findById(ticket.assignedTo);
      if (agent && agent.supportInfo) {
        const currentRating = agent.supportInfo.stats.satisfactionRating || 0;
        const currentCount = agent.supportInfo.stats.ratingCount || 0;

        agent.supportInfo.stats.satisfactionRating =
          ((currentRating * currentCount) + rating) / (currentCount + 1);
        agent.supportInfo.stats.ratingCount = currentCount + 1;

        await agent.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      rating: ticket.customerSatisfaction
    });
  } catch (error) {
    console.error('Rate ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating ticket'
    });
  }
};

/**
 * @desc    Get ticket statistics
 * @route   GET /api/v1/support/stats
 * @access  Private (Support/Admin)
 */
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate, agentId } = req.query;

    let query = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // If support agent, show only their stats
    if (req.user.role === 'support' && !agentId) {
      query.assignedTo = req.user.id;
    } else if (agentId) {
      query.assignedTo = agentId;
    }

    const [statusBreakdown, priorityBreakdown, categoryBreakdown, agentStats] = await Promise.all([
      SupportTicket.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      SupportTicket.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      SupportTicket.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      query.assignedTo ? SupportTicket.getAgentStats(
        query.assignedTo,
        query.createdAt?.$gte,
        query.createdAt?.$lte
      ) : null
    ]);

    const totalTickets = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      total: totalTickets,
      statusBreakdown,
      priorityBreakdown,
      categoryBreakdown,
      agentStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

/**
 * @desc    Get support agent dashboard
 * @route   GET /api/v1/support/dashboard
 * @access  Private (Support/Admin)
 */
exports.getDashboard = async (req, res) => {
  try {
    const agentId = req.user.role === 'support' ? req.user.id : null;

    const [
      assignedTickets,
      unassignedTickets,
      urgentTickets,
      workload
    ] = await Promise.all([
      agentId ? SupportTicket.find({
        assignedTo: agentId,
        status: { $in: ['assigned', 'in_progress', 'waiting_customer'] }
      })
        .populate('customer', 'firstName lastName email')
        .sort({ priority: -1, createdAt: 1 })
        .limit(10) : [],

      SupportTicket.getUnassignedTickets(10),

      SupportTicket.find({
        priority: 'urgent',
        status: { $nin: ['closed', 'resolved'] }
      })
        .populate('customer', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName')
        .sort('createdAt')
        .limit(10),

      agentId ? SupportTicket.getAgentWorkload(agentId) : 0
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        assignedTickets,
        unassignedTickets,
        urgentTickets,
        currentWorkload: workload
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard'
    });
  }
};

/**
 * @desc    Update support agent availability
 * @route   PUT /api/v1/support/availability
 * @access  Private (Support)
 */
exports.updateAvailability = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.supportInfo) {
      user.supportInfo = {};
    }

    if (!user.supportInfo.availability) {
      user.supportInfo.availability = {};
    }

    user.supportInfo.availability.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      availability: user.supportInfo.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
};

/**
 * @desc    Create/Get support conversation
 * @route   POST /api/v1/support/conversation
 * @access  Private
 */
exports.createSupportConversation = async (req, res) => {
  try {
    const { ticketId, message } = req.body;

    // Check if ticket exists
    let ticket;
    if (ticketId) {
      ticket = await SupportTicket.findById(ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found'
        });
      }

      // Check if user has access to this ticket
      const hasAccess =
        ticket.customer.toString() === req.user.id ||
        ticket.assignedTo?.toString() === req.user.id ||
        req.user.role === 'admin' ||
        req.user.role === 'support';

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this ticket'
        });
      }

      // Check if conversation already exists for this ticket
      if (ticket.relatedConversation) {
        const conversation = await Conversation.findById(ticket.relatedConversation)
          .populate('participants.user', 'firstName lastName profilePicture role')
          .populate('lastMessage');

        return res.status(200).json({
          success: true,
          message: 'Conversation already exists',
          conversation
        });
      }
    }

    // Find an available support agent
    let supportAgent;
    if (req.user.role !== 'support' && req.user.role !== 'admin') {
      const supportUsers = await User.find({
        role: 'support',
        'supportInfo.availability.status': 'available'
      }).limit(5);

      // Simple round-robin assignment - find agent with least workload
      if (supportUsers.length > 0) {
        const workloads = await Promise.all(
          supportUsers.map(async (agent) => ({
            agent: agent._id,
            workload: await SupportTicket.getAgentWorkload(agent._id)
          }))
        );

        workloads.sort((a, b) => a.workload - b.workload);
        supportAgent = workloads[0].agent;
      } else {
        // No available agents, find any support user
        const anySupport = await User.findOne({ role: 'support' });
        if (anySupport) {
          supportAgent = anySupport._id;
        }
      }
    }

    // Create conversation participants
    const participantIds = supportAgent
      ? [req.user.id, supportAgent]
      : [req.user.id];

    const participantDocs = participantIds.map(userId => ({
      user: userId,
      role: userId.toString() === req.user.id ? 'member' : 'admin',
      joinedAt: new Date(),
      unreadCount: 0,
      isMuted: false,
      isPinned: false
    }));

    // Create support conversation
    const conversation = await Conversation.create({
      type: 'support',
      participants: participantDocs,
      name: ticketId ? `Support - ${ticket.subject}` : 'Support Chat',
      createdBy: req.user.id
    });

    // Link conversation to ticket if exists
    if (ticket) {
      ticket.relatedConversation = conversation._id;

      // Auto-assign ticket to support agent
      if (supportAgent && !ticket.assignedTo) {
        ticket.assignToAgent(supportAgent, req.user.id);
      }

      await ticket.save();
    }

    await conversation.populate('participants.user', 'firstName lastName profilePicture role');

    // If initial message provided, create it
    if (message) {
      const Message = require('../models/Message');
      await Message.create({
        conversation: conversation._id,
        sender: req.user.id,
        type: 'text',
        text: message,
        status: 'sent'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Support conversation created successfully',
      conversation,
      assignedAgent: supportAgent
    });
  } catch (error) {
    console.error('Create support conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating support conversation',
      error: error.message
    });
  }
};
