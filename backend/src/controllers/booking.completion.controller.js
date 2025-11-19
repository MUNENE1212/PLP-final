const Booking = require('../models/Booking');

/**
 * @desc    Support agent initiates follow-up for unresponsive customer
 * @route   POST /api/v1/bookings/:id/followup/initiate
 * @access  Private (Support/Admin)
 */
exports.initiateFollowUp = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if there's a pending completion request
    if (!booking.completionRequest || booking.completionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending completion request found'
      });
    }

    // Initialize support follow-up
    booking.completionRequest.status = 'escalated';
    booking.completionRequest.autoEscalated = true;
    booking.completionRequest.supportFollowUp = {
      initiated: true,
      initiatedAt: new Date(),
      supportAgent: req.user.id,
      contactAttempts: []
    };

    await booking.save();

    await booking.populate('completionRequest.supportFollowUp.supportAgent', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Follow-up initiated successfully',
      booking
    });
  } catch (error) {
    console.error('Initiate follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating follow-up',
      error: error.message
    });
  }
};

/**
 * @desc    Support agent logs contact attempt
 * @route   POST /api/v1/bookings/:id/followup/log-contact
 * @access  Private (Support/Admin)
 */
exports.logContactAttempt = async (req, res) => {
  try {
    const { method, reached, notes } = req.body;

    if (!method || !['call', 'sms', 'email', 'in_app'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Valid contact method is required (call, sms, email, in_app)'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if support follow-up is initiated
    if (!booking.completionRequest?.supportFollowUp?.initiated) {
      return res.status(400).json({
        success: false,
        message: 'Support follow-up not initiated'
      });
    }

    // Log contact attempt
    booking.completionRequest.supportFollowUp.contactAttempts.push({
      method,
      attemptedAt: new Date(),
      reached: reached || false,
      notes
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Contact attempt logged',
      contactAttempts: booking.completionRequest.supportFollowUp.contactAttempts
    });
  } catch (error) {
    console.error('Log contact attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging contact attempt',
      error: error.message
    });
  }
};

/**
 * @desc    Support agent completes job after follow-up
 * @route   POST /api/v1/bookings/:id/followup/complete
 * @access  Private (Support/Admin)
 */
exports.completeBySupport = async (req, res) => {
  try {
    const { outcome, notes } = req.body;

    if (!outcome || !['customer_confirmed', 'customer_disputed', 'unreachable', 'auto_completed'].includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: 'Valid outcome is required (customer_confirmed, customer_disputed, unreachable, auto_completed)'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if support follow-up is initiated
    if (!booking.completionRequest?.supportFollowUp?.initiated) {
      return res.status(400).json({
        success: false,
        message: 'Support follow-up not initiated'
      });
    }

    // Complete the job
    booking.completionRequest.supportFollowUp.outcome = outcome;
    booking.completionRequest.supportFollowUp.completedBy = req.user.id;
    booking.completionRequest.supportFollowUp.completedAt = new Date();
    booking.completionRequest.supportFollowUp.notes = notes;

    if (outcome === 'customer_confirmed' || outcome === 'unreachable' || outcome === 'auto_completed') {
      booking.completionRequest.status = 'auto_approved';
      booking.status = 'verified';
      booking.statusHistory.push({
        status: 'verified',
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: `Completion approved by support after follow-up. Outcome: ${outcome}`
      });
    } else if (outcome === 'customer_disputed') {
      booking.status = 'disputed';
      booking.statusHistory.push({
        status: 'disputed',
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: 'Customer disputed completion after support contact'
      });
    }

    await booking.save();

    await booking.populate('completionRequest.supportFollowUp.completedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Job completion processed by support',
      booking
    });
  } catch (error) {
    console.error('Complete by support error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing job',
      error: error.message
    });
  }
};

/**
 * @desc    Get bookings pending completion response
 * @route   GET /api/v1/bookings/pending-completion
 * @access  Private (Support/Admin)
 */
exports.getPendingCompletions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({
      'completionRequest.status': 'pending',
      'completionRequest.escalationDeadline': { $lte: new Date() },
      'completionRequest.autoEscalated': false
    })
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName')
      .populate('completionRequest.requestedBy', 'firstName lastName')
      .sort({ 'completionRequest.requestedAt': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({
      'completionRequest.status': 'pending',
      'completionRequest.escalationDeadline': { $lte: new Date() },
      'completionRequest.autoEscalated': false
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings
    });
  } catch (error) {
    console.error('Get pending completions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending completions',
      error: error.message
    });
  }
};
