/**
 * Socket.IO Handler for Real-time Booking Status Notifications
 *
 * Handles all booking-related socket events for the DumuWaks platform.
 * Provides real-time notifications for booking status changes, assignments,
 * counter-offers, and payment updates.
 *
 * Socket Events:
 *
 * Server -> Client:
 * - booking:status_changed - Booking status transitioned
 * - booking:assigned - New technician assigned to booking
 * - booking:counter_offer - Counter-offer received from technician
 * - booking:payment_update - Payment status changed
 *
 * Client -> Server:
 * - booking:subscribe - Subscribe to booking updates
 * - booking:unsubscribe - Unsubscribe from booking updates
 *
 * Security:
 * - All events require authentication (handled by socket middleware)
 * - Only booking participants receive notifications
 * - Booking-specific rooms for isolation
 */

const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Get the Socket.IO instance
 * Will be set by the register function
 */
let io = null;

/**
 * Room name generators
 */
function getBookingRoom(bookingId) {
  return `booking:${bookingId}`;
}

function getUserRoom(userId) {
  return `user:${userId}`;
}

/**
 * Status change messages for customer
 */
const STATUS_MESSAGES_CUSTOMER = {
  pending: 'Your booking is pending technician assignment',
  matching: 'Finding the best technician for you...',
  assigned: 'A technician has been assigned to your booking',
  accepted: 'Your technician has accepted the job!',
  rejected: 'The technician declined this booking. Finding another...',
  en_route: 'Your technician is on the way!',
  arrived: 'Your technician has arrived at the location',
  in_progress: 'Work has started on your booking',
  paused: 'Work has been temporarily paused',
  completed: 'Work completed! Please verify and confirm.',
  verified: 'Completion verified. Awaiting payment.',
  payment_pending: 'Payment is pending',
  paid: 'Payment completed successfully!',
  cancelled: 'Booking has been cancelled',
  disputed: 'A dispute has been opened',
  refunded: 'Payment has been refunded'
};

/**
 * Status change messages for technician
 */
const STATUS_MESSAGES_TECHNICIAN = {
  pending: 'New booking request received',
  matching: 'Customer is looking for a technician',
  assigned: 'You have been assigned to a booking',
  accepted: 'You accepted this booking',
  rejected: 'You rejected this booking',
  en_route: 'You marked yourself as en route',
  arrived: 'You marked yourself as arrived',
  in_progress: 'Work in progress',
  paused: 'Work paused',
  completed: 'You marked the job as completed',
  verified: 'Customer verified completion!',
  payment_pending: 'Waiting for customer payment',
  paid: 'Payment received!',
  cancelled: 'Booking cancelled',
  disputed: 'Customer opened a dispute',
  refunded: 'Payment refunded to customer'
};

/**
 * Validate user is participant in booking
 *
 * @param {string} bookingId - The booking ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The booking if valid
 */
async function validateBookingParticipant(bookingId, userId) {
  const booking = await Booking.findById(bookingId)
    .populate('customer', 'firstName lastName profilePicture')
    .populate('technician', 'firstName lastName profilePicture rating');

  if (!booking) {
    throw new Error('Booking not found');
  }

  const isCustomer = booking.customer._id.toString() === userId;
  const isTechnician = booking.technician && booking.technician._id.toString() === userId;

  if (!isCustomer && !isTechnician) {
    throw new Error('Unauthorized: You are not a participant in this booking');
  }

  return { booking, isCustomer, isTechnician };
}

/**
 * Get user info for notifications
 */
async function getUserInfo(userId) {
  const user = await User.findById(userId).select('firstName lastName profilePicture rating');
  return user ? {
    _id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    profilePicture: user.profilePicture,
    rating: user.rating?.average || 0
  } : null;
}

/**
 * Emit booking status change notification
 * Called by booking controller when status changes
 *
 * @param {string} bookingId - The booking ID
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} changedBy - User ID who made the change
 * @param {string} note - Optional note
 */
async function emitBookingStatusChanged(bookingId, oldStatus, newStatus, changedBy, note = '') {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName rating');

    if (!booking) {
      console.error('[BookingNotifications] Booking not found:', bookingId);
      return;
    }

    const customerId = booking.customer._id.toString();
    const technicianId = booking.technician?._id?.toString();

    // Notify customer
    const customerMessage = STATUS_MESSAGES_CUSTOMER[newStatus] || `Booking status changed to ${newStatus}`;
    io.to(getUserRoom(customerId)).emit('booking:status_changed', {
      bookingId,
      bookingNumber: booking.bookingNumber,
      oldStatus,
      newStatus,
      message: customerMessage,
      note,
      timestamp: new Date().toISOString(),
      serviceType: booking.serviceType,
      pricing: booking.pricing
    });

    // Notify technician if assigned
    if (technicianId && technicianId !== changedBy) {
      const technicianMessage = STATUS_MESSAGES_TECHNICIAN[newStatus] || `Booking status changed to ${newStatus}`;
      io.to(getUserRoom(technicianId)).emit('booking:status_changed', {
        bookingId,
        bookingNumber: booking.bookingNumber,
        oldStatus,
        newStatus,
        message: technicianMessage,
        note,
        timestamp: new Date().toISOString(),
        serviceType: booking.serviceType
      });
    }

    // Also emit to booking room
    io.to(getBookingRoom(bookingId)).emit('booking:status_changed', {
      bookingId,
      bookingNumber: booking.bookingNumber,
      oldStatus,
      newStatus,
      message: customerMessage,
      note,
      timestamp: new Date().toISOString()
    });

    console.log(`[BookingNotifications] Status changed: ${bookingId} ${oldStatus} -> ${newStatus}`);
  } catch (error) {
    console.error('[BookingNotifications] Error emitting status change:', error.message);
  }
}

/**
 * Emit booking assigned notification
 * Called when a technician is assigned to a booking
 *
 * @param {string} bookingId - The booking ID
 * @param {string} technicianId - The assigned technician ID
 */
async function emitBookingAssigned(bookingId, technicianId) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName profilePicture rating');

    if (!booking || !booking.technician) {
      console.error('[BookingNotifications] Booking or technician not found');
      return;
    }

    const technician = booking.technician;
    const customerId = booking.customer._id.toString();

    // Notify customer about technician assignment
    io.to(getUserRoom(customerId)).emit('booking:assigned', {
      bookingId,
      bookingNumber: booking.bookingNumber,
      technician: {
        _id: technician._id,
        name: `${technician.firstName} ${technician.lastName}`,
        profilePicture: technician.profilePicture,
        rating: technician.rating?.average || 0
      },
      serviceType: booking.serviceType,
      scheduledDate: booking.timeSlot?.date,
      eta: '~15 min', // Placeholder - could be calculated
      message: 'A technician has been assigned to your booking',
      timestamp: new Date().toISOString()
    });

    // Notify technician about new assignment
    io.to(getUserRoom(technicianId)).emit('booking:assigned', {
      bookingId,
      bookingNumber: booking.bookingNumber,
      customer: {
        _id: booking.customer._id,
        name: `${booking.customer.firstName} ${booking.customer.lastName}`
      },
      serviceType: booking.serviceType,
      serviceLocation: booking.serviceLocation,
      scheduledDate: booking.timeSlot?.date,
      scheduledTime: booking.timeSlot?.startTime,
      pricing: booking.pricing,
      message: 'New booking assigned to you',
      timestamp: new Date().toISOString()
    });

    console.log(`[BookingNotifications] Booking assigned: ${bookingId} to technician ${technicianId}`);
  } catch (error) {
    console.error('[BookingNotifications] Error emitting assignment:', error.message);
  }
}

/**
 * Emit counter-offer notification
 * Called when technician submits a counter-offer or customer responds
 *
 * @param {string} bookingId - The booking ID
 * @param {Object} offer - Counter-offer details
 * @param {string} direction - 'technician_to_customer' or 'customer_to_technician'
 */
async function emitCounterOffer(bookingId, offer, direction = 'technician_to_customer') {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName');

    if (!booking) {
      console.error('[BookingNotifications] Booking not found');
      return;
    }

    const notificationData = {
      bookingId,
      bookingNumber: booking.bookingNumber,
      offer: {
        amount: offer.proposedAmount || offer.totalAmount,
        originalAmount: booking.pricing?.totalAmount,
        reason: offer.reason,
        additionalNotes: offer.additionalNotes,
        status: offer.status,
        validUntil: offer.validUntil
      },
      timestamp: new Date().toISOString()
    };

    if (direction === 'technician_to_customer') {
      // Notify customer of new counter-offer
      io.to(getUserRoom(booking.customer._id)).emit('booking:counter_offer', {
        ...notificationData,
        technician: booking.technician ? {
          name: `${booking.technician.firstName} ${booking.technician.lastName}`,
          rating: booking.technician.rating?.average || 0
        } : null,
        message: 'The technician has sent a counter-offer'
      });
    } else {
      // Notify technician of customer response
      if (booking.technician) {
        io.to(getUserRoom(booking.technician._id)).emit('booking:counter_offer', {
          ...notificationData,
          customer: {
            name: `${booking.customer.firstName} ${booking.customer.lastName}`
          },
          message: offer.status === 'accepted'
            ? 'Your counter-offer has been accepted!'
            : 'Your counter-offer was declined'
        });
      }
    }

    console.log(`[BookingNotifications] Counter-offer emitted: ${bookingId}`);
  } catch (error) {
    console.error('[BookingNotifications] Error emitting counter-offer:', error.message);
  }
}

/**
 * Emit payment update notification
 * Called when payment status changes
 *
 * @param {string} bookingId - The booking ID
 * @param {string} status - Payment status
 * @param {number} amount - Payment amount
 * @param {string} method - Payment method
 */
async function emitPaymentUpdate(bookingId, status, amount, method = null) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName');

    if (!booking) {
      console.error('[BookingNotifications] Booking not found');
      return;
    }

    const notificationData = {
      bookingId,
      bookingNumber: booking.bookingNumber,
      status,
      amount,
      method,
      currency: booking.pricing?.currency || 'KES',
      timestamp: new Date().toISOString()
    };

    const statusMessages = {
      pending: 'Payment is being processed',
      processing: 'Payment is being processed',
      completed: 'Payment completed successfully!',
      failed: 'Payment failed. Please try again.',
      refunded: 'Payment has been refunded'
    };

    // Notify customer
    io.to(getUserRoom(booking.customer._id)).emit('booking:payment_update', {
      ...notificationData,
      message: statusMessages[status] || 'Payment status updated'
    });

    // Notify technician on successful payment
    if (status === 'completed' && booking.technician) {
      io.to(getUserRoom(booking.technician._id)).emit('booking:payment_update', {
        ...notificationData,
        message: 'Customer payment received!'
      });
    }

    console.log(`[BookingNotifications] Payment update emitted: ${bookingId} - ${status}`);
  } catch (error) {
    console.error('[BookingNotifications] Error emitting payment update:', error.message);
  }
}

/**
 * Handle client subscribing to booking updates
 */
function handleBookingSubscribe(socket, data) {
  try {
    const { bookingId } = data;
    const userId = socket.userId;

    if (!bookingId) {
      return socket.emit('booking:error', {
        error: 'bookingId is required'
      });
    }

    // Join booking room
    socket.join(getBookingRoom(bookingId));
    console.log(`[BookingNotifications] User ${userId} subscribed to booking ${bookingId}`);
  } catch (error) {
    console.error('[BookingNotifications] Subscribe error:', error.message);
    socket.emit('booking:error', { error: error.message });
  }
}

/**
 * Handle client unsubscribing from booking updates
 */
function handleBookingUnsubscribe(socket, data) {
  try {
    const { bookingId } = data;

    socket.leave(getBookingRoom(bookingId));
    console.log(`[BookingNotifications] User ${socket.userId} unsubscribed from booking ${bookingId}`);
  } catch (error) {
    console.error('[BookingNotifications] Unsubscribe error:', error.message);
  }
}

/**
 * Register booking notification handlers with the socket.io instance
 *
 * @param {Object} socketIo - The Socket.IO server instance
 */
function registerBookingNotificationHandlers(socketIo) {
  io = socketIo;

  io.on('connection', (socket) => {
    // User joins their personal room for direct notifications
    socket.join(getUserRoom(socket.userId));

    // Subscribe/unsubscribe to specific booking updates
    socket.on('booking:subscribe', (data) => handleBookingSubscribe(socket, data));
    socket.on('booking:unsubscribe', (data) => handleBookingUnsubscribe(socket, data));

    console.log(`[BookingNotifications] User ${socket.userId} connected and joined personal room`);
  });

  console.log('[BookingNotifications] Socket handlers registered');
}

// Export public functions
module.exports = {
  registerBookingNotificationHandlers,
  emitBookingStatusChanged,
  emitBookingAssigned,
  emitCounterOffer,
  emitPaymentUpdate,
  getBookingRoom,
  getUserRoom
};
