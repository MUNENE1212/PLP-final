const Booking = require('../models/Booking');
const User = require('../models/User');

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

    if (booking.status !== 'pending' && booking.status !== 'matching') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign technician to this booking'
      });
    }

    // Check if booking fee has been paid
    const paymentVerified = ['held', 'paid', 'released'].includes(booking.bookingFee?.status);
    if (!paymentVerified) {
      return res.status(400).json({
        success: false,
        message: 'Booking fee must be paid before assigning technician'
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
    booking.status = 'assigned';

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
    if (materials) booking.materialsUsed = materials;
    if (additionalCosts) booking.pricing.additionalCosts = additionalCosts;

    // Calculate totals
    const materialsTotal = booking.materialsUsed?.reduce((sum, m) => sum + (m.totalPrice || 0), 0) || 0;
    const additionalTotal = booking.pricing.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
    const subtotal = booking.pricing.serviceCharge + materialsTotal + additionalTotal;
    const platformFee = subtotal * (process.env.PLATFORM_FEE_PERCENTAGE || 0.1); // 10% default
    const totalAmount = subtotal + platformFee;

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

    // Initialize quality assurance if not exists
    if (!booking.qualityCheck) {
      booking.qualityCheck = {};
    }

    // Add to notes or create a checkpoint structure
    if (!booking.qualityCheck.notes) {
      booking.qualityCheck.notes = description;
    } else {
      booking.qualityCheck.notes += `\n${description}`;
    }

    booking.qualityCheck.checkedAt = new Date();
    booking.qualityCheck.checkedBy = req.user.id;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'QA checkpoint added successfully',
      qualityCheck: booking.qualityCheck
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

    if (booking.dispute?.status === 'open' || booking.dispute?.status === 'investigating') {
      return res.status(400).json({
        success: false,
        message: 'Booking already has an active dispute'
      });
    }

    booking.dispute = {
      raisedBy: req.user.id,
      raisedAt: new Date(),
      reason,
      status: 'open'
    };

    booking.status = 'disputed';
    booking.statusHistory.push({
      status: 'disputed',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: reason,
      notes: description
    });

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

    if (!booking || !booking.dispute?.raisedBy) {
      return res.status(404).json({
        success: false,
        message: 'No active dispute found'
      });
    }

    booking.dispute.status = 'resolved';
    booking.dispute.resolution = resolutionNotes;
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

    booking.statusHistory.push({
      status: booking.status,
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: `Dispute resolved: ${resolution}. ${resolutionNotes}`
    });

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
