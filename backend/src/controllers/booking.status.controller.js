const Booking = require('../models/Booking');

/**
 * @desc    Technician updates status to "en_route" (on the way)
 * @route   POST /api/v1/bookings/:id/status/en-route
 * @access  Private (Technician)
 */
exports.updateToEnRoute = async (req, res) => {
  try {
    const { notes } = req.body;

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

    // Verify booking is in accepted status
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot set en_route from ${booking.status} status. Booking must be accepted first.`
      });
    }

    // Update to en_route status
    booking.status = 'en_route';
    booking.actualStartTime = new Date();
    booking.statusHistory.push({
      status: 'en_route',
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: notes || 'Technician is on the way to service location'
    });

    await booking.save();

    // Notify customer
    try {
      const notificationService = require('../services/notification.service');
      await notificationService.notifyStatusChange(
        booking,
        'en_route',
        booking.customer._id || booking.customer,
        `Your technician is on the way for booking #${booking.bookingNumber}`
      );
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Status updated to en_route',
      booking
    });

  } catch (error) {
    console.error('Update to en_route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

/**
 * @desc    Technician updates status to "arrived"
 * @route   POST /api/v1/bookings/:id/status/arrived
 * @access  Private (Technician)
 */
exports.updateToArrived = async (req, res) => {
  try {
    const { notes } = req.body;

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

    // Verify booking is in en_route status
    if (booking.status !== 'en_route') {
      return res.status(400).json({
        success: false,
        message: `Cannot set arrived from ${booking.status} status. Must be en_route first.`
      });
    }

    // Update to arrived status
    booking.status = 'arrived';
    booking.statusHistory.push({
      status: 'arrived',
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: notes || 'Technician has arrived at service location'
    });

    await booking.save();

    // Notify customer
    try {
      const notificationService = require('../services/notification.service');
      await notificationService.notifyStatusChange(
        booking,
        'arrived',
        booking.customer._id || booking.customer,
        `Your technician has arrived for booking #${booking.bookingNumber}`
      );
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Status updated to arrived',
      booking
    });

  } catch (error) {
    console.error('Update to arrived error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

/**
 * @desc    Technician updates status to "in_progress"
 * @route   POST /api/v1/bookings/:id/status/in-progress
 * @access  Private (Technician)
 */
exports.updateToInProgress = async (req, res) => {
  try {
    const { notes } = req.body;

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

    // Verify booking is in arrived or paused status
    if (!['arrived', 'paused'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot set in_progress from ${booking.status} status. Must be arrived or paused.`
      });
    }

    // Update to in_progress status
    booking.status = 'in_progress';
    booking.statusHistory.push({
      status: 'in_progress',
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: notes || 'Work has started'
    });

    await booking.save();

    // Notify customer
    try {
      const notificationService = require('../services/notification.service');
      await notificationService.notifyStatusChange(
        booking,
        'in_progress',
        booking.customer._id || booking.customer,
        `Work has started on booking #${booking.bookingNumber}`
      );
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Status updated to in_progress',
      booking
    });

  } catch (error) {
    console.error('Update to in_progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

/**
 * @desc    Technician requests job completion (requires customer/support confirmation)
 * @route   POST /api/v1/bookings/:id/status/request-complete
 * @access  Private (Technician)
 */
exports.requestCompletion = async (req, res) => {
  try {
    const { notes, completionImages } = req.body;

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
        message: 'Only the assigned technician can request completion'
      });
    }

    // Verify booking is in_progress
    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot request completion from ${booking.status} status. Job must be in progress.`
      });
    }

    // Create completion request
    booking.completionRequest = {
      requestedBy: req.user.id,
      requestedAt: new Date(),
      status: 'pending',
      escalationDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };

    // Update status to completed (pending customer verification)
    booking.status = 'completed';
    booking.actualEndTime = new Date();
    booking.actualDuration = Math.round((booking.actualEndTime - booking.actualStartTime) / 60000);

    booking.statusHistory.push({
      status: 'completed',
      changedBy: req.user.id,
      changedAt: new Date(),
      notes: notes || 'Technician requests job completion - pending customer confirmation'
    });

    // Store completion images if provided
    if (completionImages && completionImages.length > 0) {
      if (!booking.images) booking.images = [];
      booking.images.push(...completionImages.map(img => ({
        ...img,
        caption: 'Completion photo'
      })));
    }

    await booking.save();

    // Notify customer (URGENT - requires action)
    try {
      const notificationService = require('../services/notification.service');
      const technicianName = `${booking.technician.firstName} ${booking.technician.lastName}`;
      await notificationService.notifyCompletionRequested(booking, technicianName);
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Completion request sent to customer for confirmation',
      booking,
      nextSteps: {
        action: 'await_customer_confirmation',
        escalationDeadline: booking.completionRequest.escalationDeadline,
        description: 'Customer has 48 hours to confirm or report issues. After that, support will follow up.'
      }
    });

  } catch (error) {
    console.error('Request completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting completion',
      error: error.message
    });
  }
};

/**
 * @desc    Customer/Support confirms job completion
 * @route   POST /api/v1/bookings/:id/status/confirm-complete
 * @access  Private (Customer/Support)
 */
exports.confirmCompletion = async (req, res) => {
  try {
    const { approved, feedback, issues } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Approved status is required (true or false)'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization - customer or support
    const isCustomer = booking.customer?._id?.toString() === req.user.id;
    const isSupport = ['support', 'admin'].includes(req.user.role);

    if (!isCustomer && !isSupport) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer or support can confirm completion'
      });
    }

    // Check if there's a pending completion request
    if (!booking.completionRequest || booking.completionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'No pending completion request found'
      });
    }

    // Update completion request with response
    booking.completionRequest.customerResponse = {
      respondedAt: new Date(),
      approved,
      feedback,
      issues
    };

    if (approved) {
      // Customer approved - now process remaining payment
      booking.completionRequest.status = 'approved';

      // Calculate remaining amount to be paid
      const totalAmount = booking.pricing.totalAmount;
      const bookingFeeAmount = booking.bookingFee.amount || 0;
      const remainingAmount = totalAmount - bookingFeeAmount;

      console.log('=== COMPLETION PAYMENT PROCESSING ===');
      console.log('Total Amount:', totalAmount);
      console.log('Booking Fee (already paid):', bookingFeeAmount);
      console.log('Remaining Amount:', remainingAmount);

      // Check if there's remaining amount to be paid
      if (remainingAmount > 0 && booking.payment.status !== 'completed') {
        // Need to collect remaining payment - set status to payment_pending
        booking.status = 'payment_pending';
        booking.statusHistory.push({
          status: 'payment_pending',
          changedBy: req.user.id,
          changedAt: new Date(),
          notes: `Completion approved - awaiting payment of remaining ${remainingAmount} KES`
        });

        await booking.save();

        // Return response indicating payment is required
        return res.status(200).json({
          success: true,
          message: 'Job completion approved. Please proceed with payment for the remaining amount.',
          paymentRequired: true,
          paymentDetails: {
            remainingAmount,
            totalAmount,
            bookingFeePaid: bookingFeeAmount,
            currency: booking.pricing.currency || 'KES'
          },
          booking
        });
      } else {
        // No remaining payment needed (or already paid) - mark as verified
        booking.status = 'verified';
        booking.statusHistory.push({
          status: 'verified',
          changedBy: req.user.id,
          changedAt: new Date(),
          notes: isSupport ? 'Completion approved by support' : 'Completion confirmed by customer'
        });
      }
    } else {
      // Customer rejected - back to in_progress
      booking.completionRequest.status = 'rejected';
      booking.status = 'in_progress';
      booking.statusHistory.push({
        status: 'in_progress',
        changedBy: req.user.id,
        changedAt: new Date(),
        notes: `Completion rejected. Issues: ${issues || 'Not specified'}`
      });

      // Create support ticket if not already support
      if (!isSupport) {
        const SupportTicket = require('../models/SupportTicket');
        await SupportTicket.create({
          customer: booking.customer,
          subject: `Job Completion Dispute - ${booking.bookingNumber}`,
          description: `Customer has rejected job completion. Issues reported: ${issues}`,
          category: 'complaint',
          priority: 'high',
          relatedBooking: booking._id,
          source: 'system'
        });
      }
    }

    await booking.save();

    // Notify technician
    try {
      const notificationService = require('../services/notification.service');
      const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;
      await notificationService.notifyCompletionResponse(booking, customerName, approved);
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(200).json({
      success: true,
      message: approved
        ? 'Job completion confirmed'
        : 'Completion rejected - technician has been notified',
      booking
    });

  } catch (error) {
    console.error('Confirm completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming completion',
      error: error.message
    });
  }
};

/**
 * @desc    Pause job
 * @route   POST /api/v1/bookings/:id/status/pause
 * @access  Private (Technician)
 */
exports.pauseJob = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName');

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

    // Verify booking is in_progress
    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot pause job from ${booking.status} status`
      });
    }

    // Update to paused status
    booking.status = 'paused';
    booking.statusHistory.push({
      status: 'paused',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: reason || 'Job paused by technician',
      notes: reason
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Job paused successfully',
      booking
    });

  } catch (error) {
    console.error('Pause job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error pausing job',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   POST /api/v1/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isCustomer = booking.customer?._id?.toString() === req.user.id;
    const isTechnician = booking.technician?._id?.toString() === req.user.id;
    const isAdmin = ['admin', 'support'].includes(req.user.role);

    if (!isCustomer && !isTechnician && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    const cancellableStatuses = ['pending', 'matching', 'assigned', 'accepted', 'en_route'];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking in ${booking.status} status`
      });
    }

    // Calculate cancellation fee
    const hoursTillStart = (new Date(booking.timeSlot.date) - new Date()) / (1000 * 60 * 60);
    let cancellationFee = 0;

    if (isCustomer && hoursTillStart < 24 && booking.status !== 'pending') {
      if (hoursTillStart < 2) {
        cancellationFee = booking.pricing.totalAmount * 0.75; // 75%
      } else if (hoursTillStart < 6) {
        cancellationFee = booking.pricing.totalAmount * 0.50; // 50%
      } else {
        cancellationFee = booking.pricing.totalAmount * 0.25; // 25%
      }
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user.id,
      cancelledAt: new Date(),
      reason: reason || 'Booking cancelled',
      cancellationFee
    };

    booking.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: reason || 'Booking cancelled',
      notes: `Cancelled by ${isCustomer ? 'customer' : isTechnician ? 'technician' : 'admin'}. Fee: ${cancellationFee}`
    });

    await booking.save();

    // TODO: Process refund if applicable
    // TODO: Send notifications

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
      cancellationFee
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};
