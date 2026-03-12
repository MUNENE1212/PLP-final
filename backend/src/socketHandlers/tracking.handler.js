/**
 * Socket.IO Handler for Real-time Technician Location Tracking
 *
 * Handles all tracking-related socket events for the DumuWaks platform.
 * Provides real-time communication between technicians and customers
 * during the en_route booking status.
 *
 * Socket Events:
 *
 * Technician -> Server:
 * - tracking:start - Start a new tracking session
 * - tracking:update - Send location update
 * - tracking:pause - Pause sharing location
 * - tracking:resume - Resume sharing location
 * - tracking:end - End tracking session
 *
 * Server -> Customer:
 * - tracking:started - Tracking session started
 * - tracking:position - Real-time position update with ETA
 * - tracking:paused - Technician paused sharing
 * - tracking:resumed - Technician resumed sharing
 * - tracking:completed - Tracking ended (technician arrived)
 * - tracking:error - Error occurred
 *
 * Security:
 * - All events require authentication (handled by socket middleware)
 * - Only booking's technician can send updates
 * - Only booking's customer receives updates
 * - Booking-specific rooms for isolation
 */

const trackingService = require('../services/tracking.service');
const Booking = require('../models/Booking');

/**
 * Get the Socket.IO instance and tracking namespace
 * Will be set by the register function
 */
let io = null;

/**
 * Room name generator for booking-specific rooms
 * @param {string} bookingId - The booking ID
 * @returns {string} Room name
 */
function getTrackingRoom(bookingId) {
  return `tracking:${bookingId}`;
}

/**
 * Get customer room for a booking
 * @param {string} customerId - The customer ID
 * @returns {string} Room name
 */
function getCustomerRoom(customerId) {
  return `customer:${customerId}`;
}

/**
 * Validate that the user is the booking's technician
 *
 * @param {string} bookingId - The booking ID
 * @param {string} technicianId - The technician's user ID
 * @returns {Promise<Object>} The booking if valid
 */
async function validateTechnicianAccess(bookingId, technicianId) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.technician?.toString() !== technicianId) {
    throw new Error('Unauthorized: You are not the assigned technician for this booking');
  }

  return booking;
}

/**
 * Validate that the user is the booking's customer
 *
 * @param {string} bookingId - The booking ID
 * @param {string} customerId - The customer's user ID
 * @returns {Promise<Object>} The booking if valid
 */
async function validateCustomerAccess(bookingId, customerId) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.customer?.toString() !== customerId) {
    throw new Error('Unauthorized: You are not the customer for this booking');
  }

  return booking;
}

/**
 * Handle tracking:start event
 * Starts a new tracking session for the booking
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Event data
 * @param {string} data.bookingId - The booking ID
 */
async function handleTrackingStart(socket, data) {
  try {
    const { bookingId } = data;
    const technicianId = socket.userId;

    if (!bookingId) {
      return socket.emit('tracking:error', {
        bookingId: null,
        error: 'bookingId is required'
      });
    }

    // Validate booking access
    const booking = await validateTechnicianAccess(bookingId, technicianId);

    // Check booking status is eligible for tracking
    if (!trackingService.TRACKING_ELIGIBLE_STATUSES.includes(booking.status)) {
      return socket.emit('tracking:error', {
        bookingId,
        error: `Tracking can only start when booking status is 'en_route'. Current status: ${booking.status}`
      });
    }

    // Get destination from booking
    const destination = {
      coordinates: booking.serviceLocation.coordinates,
      address: booking.serviceLocation.address
    };

    // Determine area type based on location (default to urban for Kenya)
    const area = booking.serviceLocation.county?.toLowerCase().includes('nairobi') ? 'urban' : 'urban';

    // Start tracking session
    const session = trackingService.startTrackingSession(
      bookingId,
      technicianId,
      booking.customer.toString(),
      destination,
      area
    );

    // Join tracking room
    socket.join(getTrackingRoom(bookingId));

    // Notify customer that tracking has started
    const customerRoom = getCustomerRoom(booking.customer.toString());
    io.to(customerRoom).emit('tracking:started', {
      bookingId,
      technicianId,
      startTime: session.startTime,
      destination: session.destination,
      message: 'Your technician is on the way! You can now track their location.'
    });

  } catch (error) {
    console.error('[Tracking] Error starting session:', error.message);
    socket.emit('tracking:error', {
      bookingId: data?.bookingId,
      error: error.message
    });
  }
}

/**
 * Handle tracking:update event
 * Updates technician's location and broadcasts to customer
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Event data
 * @param {string} data.bookingId - The booking ID
 * @param {number[]} data.coordinates - [longitude, latitude]
 */
async function handleTrackingUpdate(socket, data) {
  try {
    const { bookingId, coordinates } = data;
    const technicianId = socket.userId;

    if (!bookingId || !coordinates) {
      return socket.emit('tracking:error', {
        bookingId,
        error: 'bookingId and coordinates are required'
      });
    }

    // Update location in tracking service
    const update = trackingService.updateTechnicianLocation(bookingId, technicianId, coordinates);

    // Get session to find customer
    const session = trackingService.getTrackingSession(bookingId, technicianId);

    if (session) {
      // Broadcast to customer
      const customerRoom = getCustomerRoom(session.customerId);
      io.to(customerRoom).emit('tracking:position', {
        bookingId,
        position: update.position,
        eta: update.eta,
        isPaused: update.isPaused
      });

      // Also emit to tracking room for any other listeners
      io.to(getTrackingRoom(bookingId)).emit('tracking:position', {
        bookingId,
        position: update.position,
        eta: update.eta
      });
    }

  } catch (error) {
    console.error('[Tracking] Error updating location:', error.message);
    socket.emit('tracking:error', {
      bookingId: data?.bookingId,
      error: error.message
    });
  }
}

/**
 * Handle tracking:pause event
 * Pauses location sharing (privacy control)
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Event data
 * @param {string} data.bookingId - The booking ID
 */
async function handleTrackingPause(socket, data) {
  try {
    const { bookingId } = data;
    const technicianId = socket.userId;

    if (!bookingId) {
      return socket.emit('tracking:error', {
        bookingId: null,
        error: 'bookingId is required'
      });
    }

    // Pause tracking
    const result = trackingService.pauseTracking(bookingId, technicianId);

    // Get session to notify customer
    const session = trackingService.getTrackingSession(bookingId, technicianId);

    if (session) {
      const customerRoom = getCustomerRoom(session.customerId);
      io.to(customerRoom).emit('tracking:paused', {
        bookingId,
        pausedAt: result.pausedAt,
        message: 'The technician has temporarily paused location sharing'
      });
    }

  } catch (error) {
    console.error('[Tracking] Error pausing tracking:', error.message);
    socket.emit('tracking:error', {
      bookingId: data?.bookingId,
      error: error.message
    });
  }
}

/**
 * Handle tracking:resume event
 * Resumes location sharing after pause
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Event data
 * @param {string} data.bookingId - The booking ID
 */
async function handleTrackingResume(socket, data) {
  try {
    const { bookingId } = data;
    const technicianId = socket.userId;

    if (!bookingId) {
      return socket.emit('tracking:error', {
        bookingId: null,
        error: 'bookingId is required'
      });
    }

    // Resume tracking
    const result = trackingService.resumeTracking(bookingId, technicianId);

    // Get session to notify customer
    const session = trackingService.getTrackingSession(bookingId, technicianId);

    if (session) {
      const customerRoom = getCustomerRoom(session.customerId);
      io.to(customerRoom).emit('tracking:resumed', {
        bookingId,
        resumedAt: result.resumedAt,
        message: 'Location sharing has resumed'
      });
    }

  } catch (error) {
    console.error('[Tracking] Error resuming tracking:', error.message);
    socket.emit('tracking:error', {
      bookingId: data?.bookingId,
      error: error.message
    });
  }
}

/**
 * Handle tracking:end event
 * Ends tracking session when technician arrives
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Event data
 * @param {string} data.bookingId - The booking ID
 */
async function handleTrackingEnd(socket, data) {
  try {
    const { bookingId } = data;
    const technicianId = socket.userId;

    if (!bookingId) {
      return socket.emit('tracking:error', {
        bookingId: null,
        error: 'bookingId is required'
      });
    }

    // End tracking session
    const summary = trackingService.endTrackingSession(bookingId, technicianId);

    // Leave tracking room
    socket.leave(getTrackingRoom(bookingId));

    // Notify customer
    const customerRoom = getCustomerRoom(summary.customerId);
    io.to(customerRoom).emit('tracking:completed', {
      bookingId,
      arrivalTime: summary.endTime,
      duration: summary.duration,
      message: 'Your technician has arrived!'
    });

  } catch (error) {
    console.error('[Tracking] Error ending session:', error.message);
    socket.emit('tracking:error', {
      bookingId: data?.bookingId,
      error: error.message
    });
  }
}

/**
 * Handle customer subscribing to tracking updates
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Event data
 * @param {string} data.bookingId - The booking ID
 */
async function handleTrackingSubscribe(socket, data) {
  try {
    const { bookingId } = data;
    const customerId = socket.userId;

    if (!bookingId) {
      return socket.emit('tracking:error', {
        bookingId: null,
        error: 'bookingId is required'
      });
    }

    // Validate customer access
    await validateCustomerAccess(bookingId, customerId);

    // Join customer room for this booking
    socket.join(getCustomerRoom(customerId));
    socket.join(getTrackingRoom(bookingId));

    // Check if there's an active session and send current state
    try {
      const session = trackingService.getTrackingSession(bookingId, customerId);
      if (session) {
        socket.emit('tracking:state', {
          bookingId,
          position: session.currentPosition,
          eta: session.eta,
          isPaused: session.isPaused,
          status: session.status,
          startTime: session.startTime
        });
      }
    } catch (e) {
      // No active session, that's okay
    }

  } catch (error) {
    console.error('[Tracking] Error subscribing:', error.message);
    socket.emit('tracking:error', {
      bookingId: data?.bookingId,
      error: error.message
    });
  }
}

/**
 * Handle customer unsubscribing from tracking updates
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Event data
 * @param {string} data.bookingId - The booking ID
 */
function handleTrackingUnsubscribe(socket, data) {
  try {
    const { bookingId } = data;

    socket.leave(getTrackingRoom(bookingId));
  } catch (error) {
    console.error('[Tracking] Error unsubscribing:', error.message);
  }
}

/**
 * Register tracking event handlers with the socket.io instance
 *
 * @param {Object} socketIo - The Socket.IO server instance
 */
function registerTrackingHandlers(socketIo) {
  io = socketIo;

  // Get the main namespace or create a tracking-specific one
  const mainNamespace = io.sockets;

  io.on('connection', (socket) => {
    // Technician events
    socket.on('tracking:start', (data) => handleTrackingStart(socket, data));
    socket.on('tracking:update', (data) => handleTrackingUpdate(socket, data));
    socket.on('tracking:pause', (data) => handleTrackingPause(socket, data));
    socket.on('tracking:resume', (data) => handleTrackingResume(socket, data));
    socket.on('tracking:end', (data) => handleTrackingEnd(socket, data));

    // Customer events
    socket.on('tracking:subscribe', (data) => handleTrackingSubscribe(socket, data));
    socket.on('tracking:unsubscribe', (data) => handleTrackingUnsubscribe(socket, data));
  });

  // Set up periodic cleanup of expired sessions (every 30 minutes)
  setInterval(() => {
    const cleaned = trackingService.cleanupExpiredSessions();
  }, 30 * 60 * 1000);
}

module.exports = {
  registerTrackingHandlers,
  handleTrackingStart,
  handleTrackingUpdate,
  handleTrackingPause,
  handleTrackingResume,
  handleTrackingEnd,
  handleTrackingSubscribe,
  handleTrackingUnsubscribe,
  getTrackingRoom,
  getCustomerRoom
};
