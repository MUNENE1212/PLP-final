const Booking = require('../models/Booking');

/**
 * @desc    Accept booking (Technician)
 * @route   POST /api/v1/bookings/:id/accept
 * @access  Private (Technician)
 */
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify technician is assigned to this booking
    if (booking.technician?._id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this booking'
      });
    }

    // Verify booking is in assigned status
    if (booking.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking in ${booking.status} status`
      });
    }

    // IMPORTANT: Verify booking fee has been paid
    const paymentVerified = ['held', 'paid', 'released'].includes(booking.bookingFee?.status);
    if (!paymentVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept booking. Customer must complete booking fee payment first.',
        bookingFee: {
          status: booking.bookingFee?.status || 'pending',
          amount: booking.bookingFee?.amount || 0,
          required: true
        }
      });
    }

    // Update booking status to accepted
    booking.status = 'accepted';
    booking.statusHistory.push({
      status: 'accepted',
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: 'Technician accepted the booking'
    });

    await booking.save();

    // Create notification for customer
    try {
      const notificationService = require('../services/notification.service');
      await notificationService.notifyBookingAccepted(booking);
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });

  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting booking',
      error: error.message
    });
  }
};

/**
 * @desc    Reject booking (Technician)
 * @route   POST /api/v1/bookings/:id/reject
 * @access  Private (Technician)
 */
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify technician is assigned to this booking
    if (booking.technician?._id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this booking'
      });
    }

    // Verify booking is in assigned status
    if (booking.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking in ${booking.status} status`
      });
    }

    // Update booking status to rejected
    booking.status = 'rejected';
    booking.statusHistory.push({
      status: 'rejected',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: reason || 'Technician rejected the booking',
      notes: reason
    });

    // Clear technician assignment
    booking.technician = null;

    await booking.save();

    // Notify customer
    try {
      const notificationService = require('../services/notification.service');
      await notificationService.notifyBookingRejected(booking);
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    // TODO: Trigger re-matching process to find another technician

    res.status(200).json({
      success: true,
      message: 'Booking rejected. Finding another technician...',
      booking
    });

  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting booking',
      error: error.message
    });
  }
};

/**
 * @desc    Submit counter offer (Technician)
 * @route   POST /api/v1/bookings/:id/counter-offer
 * @access  Private (Technician)
 */
exports.submitCounterOffer = async (req, res) => {
  try {
    const { proposedAmount, reason, additionalNotes } = req.body;

    if (!proposedAmount || proposedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid proposed amount is required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason for counter offer is required'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify technician is assigned to this booking
    if (booking.technician?._id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this booking'
      });
    }

    // Verify booking is in assigned status
    if (booking.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit counter offer for booking in ${booking.status} status`
      });
    }

    // Calculate new pricing breakdown based on proposed amount
    const originalPricing = booking.pricing;
    const priceRatio = proposedAmount / originalPricing.totalAmount;

    const proposedPricing = {
      basePrice: Math.round((originalPricing.basePrice || 0) * priceRatio),
      serviceCharge: Math.round((originalPricing.serviceCharge || 0) * priceRatio),
      platformFee: Math.round((originalPricing.platformFee || 0) * priceRatio),
      tax: Math.round((originalPricing.tax || 0) * priceRatio),
      discount: originalPricing.discount || 0,
      totalAmount: proposedAmount,
      currency: originalPricing.currency || 'KES'
    };

    // Set counter offer expiration (24 hours from now)
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 24);

    // Create counter offer
    booking.counterOffer = {
      proposedBy: req.user.id,
      proposedAt: new Date(),
      status: 'pending',
      proposedPricing,
      reason,
      additionalNotes,
      validUntil
    };

    await booking.save();

    // Notify customer
    try {
      const notificationService = require('../services/notification.service');
      const technicianName = `${booking.technician.firstName} ${booking.technician.lastName}`;
      await notificationService.notifyCounterOfferSubmitted(booking, technicianName);
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Counter offer submitted successfully',
      counterOffer: booking.counterOffer,
      booking
    });

  } catch (error) {
    console.error('Submit counter offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting counter offer',
      error: error.message
    });
  }
};

/**
 * @desc    Respond to counter offer (Customer)
 * @route   POST /api/v1/bookings/:id/counter-offer/respond
 * @access  Private (Customer)
 */
exports.respondToCounterOffer = async (req, res) => {
  try {
    const { accepted, notes } = req.body;

    if (typeof accepted !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Accepted status is required (true or false)'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user is the customer
    if (booking.customer?._id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer can respond to counter offers'
      });
    }

    // Verify counter offer exists and is pending
    if (!booking.counterOffer || booking.counterOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending counter offer found for this booking'
      });
    }

    // Check if counter offer has expired
    if (new Date() > booking.counterOffer.validUntil) {
      booking.counterOffer.status = 'expired';
      await booking.save();
      return res.status(400).json({
        success: false,
        message: 'Counter offer has expired'
      });
    }

    // Update counter offer response
    booking.counterOffer.customerResponse = {
      respondedAt: new Date(),
      accepted,
      notes
    };

    if (accepted) {
      // Accept counter offer - update pricing and status
      booking.counterOffer.status = 'accepted';
      booking.pricing = booking.counterOffer.proposedPricing;

      // Recalculate booking fee (20% of new total)
      booking.bookingFee.amount = Math.round(booking.pricing.totalAmount * (booking.bookingFee.percentage / 100));

      // Move to accepted status
      booking.status = 'accepted';
      booking.statusHistory.push({
        status: 'accepted',
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: `Customer accepted counter offer. New price: ${booking.pricing.currency} ${booking.pricing.totalAmount}`
      });
    } else {
      // Reject counter offer
      booking.counterOffer.status = 'rejected';
      booking.statusHistory.push({
        status: 'assigned', // Keep as assigned
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: `Customer rejected counter offer. ${notes || ''}`
      });
    }

    await booking.save();

    // Notify technician
    try {
      const notificationService = require('../services/notification.service');
      const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;

      if (accepted) {
        await notificationService.notifyCounterOfferAccepted(booking, customerName);
      } else {
        await notificationService.notifyCounterOfferRejected(booking, customerName);
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: accepted ? 'Counter offer accepted' : 'Counter offer rejected',
      booking
    });

  } catch (error) {
    console.error('Respond to counter offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to counter offer',
      error: error.message
    });
  }
};
