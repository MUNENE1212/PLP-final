const Booking = require('../models/Booking');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Conversation = require('../models/Conversation');

/**
 * @desc    Create a new booking
 * @route   POST /api/v1/bookings
 * @access  Private (Customer/Corporate)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceType,
      description,
      scheduledDate,
      serviceLocation,
      technician,
      preferredTechnician,
      urgency,
      estimatedDuration,
      materials
    } = req.body;

    // Validate customer role
    if (!['customer', 'corporate'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only customers and corporate accounts can create bookings'
      });
    }

    // Generate booking number
    const bookingCount = await Booking.countDocuments();
    const bookingNumber = `BKG-${Date.now()}-${(bookingCount + 1).toString().padStart(5, '0')}`;

    // Create booking data
    const bookingData = {
      bookingNumber,
      customer: req.user.id,
      serviceType,
      description,
      scheduledDate,
      serviceLocation: {
        type: 'Point',
        coordinates: serviceLocation.coordinates,
        address: serviceLocation.address
      },
      status: 'pending',
      urgency: urgency || 'normal',
      estimatedDuration,
      materials: materials || []
    };

    // If specific technician requested
    if (technician) {
      const tech = await User.findById(technician);
      if (!tech || tech.role !== 'technician') {
        return res.status(400).json({
          success: false,
          message: 'Invalid technician'
        });
      }
      bookingData.technician = technician;
      bookingData.status = 'awaiting_acceptance';
    } else if (preferredTechnician) {
      bookingData.preferredTechnician = preferredTechnician;
    }

    const booking = await Booking.create(bookingData);

    // Populate data for response
    await booking.populate([
      { path: 'customer', select: 'firstName lastName phoneNumber profilePicture' },
      { path: 'technician', select: 'firstName lastName phoneNumber profilePicture rating skills' }
    ]);

    // TODO: Send notification to technician if assigned
    // TODO: Trigger AI matching if no technician assigned

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get all bookings (with filters)
 * @route   GET /api/v1/bookings
 * @access  Private
 */
exports.getBookings = async (req, res) => {
  try {
    const {
      status,
      serviceType,
      startDate,
      endDate,
      role,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Filter by user role
    if (req.user.role === 'customer' || req.user.role === 'corporate') {
      query.customer = req.user.id;
    } else if (req.user.role === 'technician') {
      query.technician = req.user.id;
    }
    // Admin sees all bookings

    // Additional filters
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('customer', 'firstName lastName phoneNumber profilePicture')
      .populate('technician', 'firstName lastName phoneNumber profilePicture rating skills')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/v1/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber profilePicture location')
      .populate('technician', 'firstName lastName email phoneNumber profilePicture rating skills location')
      .populate('alternativeTechnicians.technician', 'firstName lastName rating skills profilePicture');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isAuthorized =
      booking.customer._id.toString() === req.user.id ||
      booking.technician?._id.toString() === req.user.id ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking'
    });
  }
};

/**
 * @desc    Update booking status
 * @route   PUT /api/v1/bookings/:id/status
 * @access  Private
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName email')
      .populate('technician', 'firstName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization and validate state transition
    const canUpdate =
      (req.user.role === 'technician' && booking.technician?._id.toString() === req.user.id) ||
      (req.user.role === 'customer' && booking.customer._id.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate state transition
    const validTransitions = booking.schema.path('status').enumValues;
    if (!validTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Business logic for specific transitions
    const currentStatus = booking.status;

    // Technician accepts booking
    if (status === 'accepted' && currentStatus === 'awaiting_acceptance') {
      if (req.user.role !== 'technician') {
        return res.status(403).json({
          success: false,
          message: 'Only technician can accept booking'
        });
      }
      booking.acceptedAt = new Date();
    }

    // Start job
    if (status === 'in_progress' && currentStatus === 'accepted') {
      if (req.user.role !== 'technician') {
        return res.status(403).json({
          success: false,
          message: 'Only technician can start the job'
        });
      }
      booking.startedAt = new Date();
    }

    // Complete job
    if (status === 'completed' && currentStatus === 'in_progress') {
      if (req.user.role !== 'technician') {
        return res.status(403).json({
          success: false,
          message: 'Only technician can mark job as completed'
        });
      }
      booking.completedAt = new Date();
      // TODO: Trigger payment release from escrow
    }

    // Cancel booking
    if (status === 'cancelled') {
      booking.cancelledBy = req.user.id;
      booking.cancelledAt = new Date();
      booking.cancellationReason = notes;

      // Calculate cancellation fee if applicable
      const hoursTillStart = (new Date(booking.scheduledDate) - new Date()) / (1000 * 60 * 60);
      if (hoursTillStart < 24 && currentStatus !== 'pending') {
        booking.pricing.cancellationFee = booking.pricing.totalAmount * 0.2; // 20% fee
      }
    }

    booking.status = status;

    // Add to status history
    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes
    });

    await booking.save();

    // TODO: Send notifications
    // TODO: Update related transaction status

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

/**
 * @desc    Assign technician to booking
 * @route   PUT /api/v1/bookings/:id/assign-technician
 * @access  Private (Admin or AI system)
 */
exports.assignTechnician = async (req, res) => {
  try {
    const { technician } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign technician to non-pending booking'
      });
    }

    // Verify technician
    const tech = await User.findById(technician);
    if (!tech || tech.role !== 'technician') {
      return res.status(400).json({
        success: false,
        message: 'Invalid technician'
      });
    }

    booking.technician = technician;
    booking.status = 'awaiting_acceptance';

    await booking.save();

    await booking.populate('technician', 'firstName lastName phoneNumber rating skills');

    // TODO: Send notification to technician

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      booking
    });
  } catch (error) {
    console.error('Assign technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning technician'
    });
  }
};

/**
 * @desc    Update booking pricing
 * @route   PUT /api/v1/bookings/:id/pricing
 * @access  Private (Technician/Admin)
 */
exports.updatePricing = async (req, res) => {
  try {
    const { serviceCharge, materials, additionalCosts } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const canUpdate =
      (req.user.role === 'technician' && booking.technician?.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update pricing'
      });
    }

    if (serviceCharge) booking.pricing.serviceCharge = serviceCharge;
    if (materials) booking.materials = materials;
    if (additionalCosts) booking.pricing.additionalCosts = additionalCosts;

    // Calculate totals
    const materialsTotal = booking.materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);
    const additionalTotal = booking.pricing.additionalCosts.reduce((sum, c) => sum + c.amount, 0);
    const subtotal = booking.pricing.serviceCharge + materialsTotal + additionalTotal;
    const platformFee = subtotal * (process.env.PLATFORM_FEE_PERCENTAGE || 0.1); // 10% default
    const totalAmount = subtotal + platformFee;

    booking.pricing.materialsTotal = materialsTotal;
    booking.pricing.platformFee = platformFee;
    booking.pricing.totalAmount = totalAmount;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Pricing updated successfully',
      pricing: booking.pricing
    });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing'
    });
  }
};

/**
 * @desc    Add QA checkpoint
 * @route   POST /api/v1/bookings/:id/qa-checkpoint
 * @access  Private (Technician)
 */
exports.addQACheckpoint = async (req, res) => {
  try {
    const { description, images, checklistItems } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.technician?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only assigned technician can add QA checkpoints'
      });
    }

    booking.qualityAssurance.checkpoints.push({
      description,
      images: images || [],
      checklist: checklistItems || [],
      timestamp: new Date()
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'QA checkpoint added successfully',
      checkpoint: booking.qualityAssurance.checkpoints[booking.qualityAssurance.checkpoints.length - 1]
    });
  } catch (error) {
    console.error('Add QA checkpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding QA checkpoint'
    });
  }
};

/**
 * @desc    Create dispute
 * @route   POST /api/v1/bookings/:id/dispute
 * @access  Private (Customer/Technician)
 */
exports.createDispute = async (req, res) => {
  try {
    const { reason, description, evidence } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const canDispute =
      booking.customer.toString() === req.user.id ||
      booking.technician?.toString() === req.user.id;

    if (!canDispute) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create dispute for this booking'
      });
    }

    if (booking.dispute.isDisputed) {
      return res.status(400).json({
        success: false,
        message: 'Booking already has an active dispute'
      });
    }

    booking.dispute = {
      isDisputed: true,
      reason,
      description,
      initiatedBy: req.user.id,
      initiatedAt: new Date(),
      status: 'open',
      evidence: evidence || []
    };

    booking.status = 'disputed';

    await booking.save();

    // TODO: Notify admin and other party
    // TODO: Hold payment in escrow

    res.status(200).json({
      success: true,
      message: 'Dispute created successfully. Admin will review shortly.',
      dispute: booking.dispute
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating dispute'
    });
  }
};

/**
 * @desc    Resolve dispute
 * @route   PUT /api/v1/bookings/:id/dispute/resolve
 * @access  Private (Admin)
 */
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution, resolutionNotes, refundAmount } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking || !booking.dispute.isDisputed) {
      return res.status(404).json({
        success: false,
        message: 'No active dispute found'
      });
    }

    booking.dispute.status = 'resolved';
    booking.dispute.resolution = resolution;
    booking.dispute.resolutionNotes = resolutionNotes;
    booking.dispute.resolvedBy = req.user.id;
    booking.dispute.resolvedAt = new Date();

    // Update booking status based on resolution
    if (resolution === 'customer_favor') {
      booking.status = 'cancelled';
      // TODO: Process refund
    } else if (resolution === 'technician_favor') {
      booking.status = 'completed';
      // TODO: Release payment
    } else if (resolution === 'partial_refund') {
      booking.status = 'completed';
      // TODO: Process partial refund
    }

    await booking.save();

    // TODO: Notify both parties

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      dispute: booking.dispute
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving dispute'
    });
  }
};

/**
 * @desc    Get booking statistics
 * @route   GET /api/v1/bookings/stats
 * @access  Private
 */
exports.getBookingStats = async (req, res) => {
  try {
    const query = {};

    // Filter by user role
    if (req.user.role === 'customer' || req.user.role === 'corporate') {
      query.customer = req.user.id;
    } else if (req.user.role === 'technician') {
      query.technician = req.user.id;
    }

    const stats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      stats
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics'
    });
  }
};
