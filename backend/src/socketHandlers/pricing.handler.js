/**
 * Pricing Socket Handler
 * Handles real-time pricing updates, surge alerts, and negotiation events
 *
 * Task #74: Real-Time Pricing & Negotiation
 */

const {
  getMarketRates,
  getSurgeAlerts,
  getSurgeInfo,
  calculateDynamicPrice
} = require('../services/dynamicPricing.service');

const Booking = require('../models/Booking');

// Store interval reference for surge broadcasts
let surgeBroadcastInterval = null;

/**
 * Register pricing socket handlers
 * @param {Object} io - Socket.IO server instance
 */
function registerPricingHandlers(io) {
  // Track users subscribed to pricing updates
  const pricingSubscribers = new Set();

  io.on('connection', (socket) => {
    /**
     * Subscribe to pricing updates (market rates, surge alerts)
     */
    socket.on('pricing:subscribe', async () => {
      try {
        pricingSubscribers.add(socket.id);

        // Send current market rates immediately
        const marketRates = await getMarketRates();
        socket.emit('pricing:market_rates', marketRates);

        // Send current surge alerts
        const surgeAlerts = await getSurgeAlerts();
        socket.emit('pricing:surge_alert', surgeAlerts);

        console.log(`User ${socket.userId} subscribed to pricing updates`);
      } catch (error) {
        console.error('Error subscribing to pricing:', error);
        socket.emit('pricing:error', {
          error: error.message || 'Failed to subscribe to pricing updates'
        });
      }
    });

    /**
     * Unsubscribe from pricing updates
     */
    socket.on('pricing:unsubscribe', () => {
      pricingSubscribers.delete(socket.id);
      console.log(`User ${socket.userId} unsubscribed from pricing updates`);
    });

    /**
     * Get current market rates
     */
    socket.on('pricing:get_market_rates', async () => {
      try {
        const marketRates = await getMarketRates();
        socket.emit('pricing:market_rates', marketRates);
      } catch (error) {
        console.error('Error getting market rates:', error);
        socket.emit('pricing:error', {
          error: error.message || 'Failed to get market rates'
        });
      }
    });

    /**
     * Get surge info for a specific category
     */
    socket.on('pricing:get_surge', async (data) => {
      try {
        const { category } = data;

        if (!category) {
          socket.emit('pricing:error', {
            error: 'Category is required'
          });
          return;
        }

        const surgeInfo = await getSurgeInfo(category);
        socket.emit('pricing:surge_info', {
          category,
          ...surgeInfo
        });
      } catch (error) {
        console.error('Error getting surge info:', error);
        socket.emit('pricing:error', {
          error: error.message || 'Failed to get surge info'
        });
      }
    });

    /**
     * Get dynamic price estimate
     */
    socket.on('pricing:get_estimate', async (data) => {
      try {
        const {
          serviceCategory,
          serviceType,
          urgency,
          scheduledDateTime,
          basePrice,
          distanceFee
        } = data;

        if (!serviceCategory) {
          socket.emit('pricing:error', {
            error: 'Service category is required'
          });
          return;
        }

        const estimate = await calculateDynamicPrice({
          serviceCategory,
          serviceType,
          urgency: urgency || 'medium',
          scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime) : new Date(),
          basePrice,
          distanceFee: distanceFee || 0
        });

        socket.emit('pricing:estimate', estimate);
      } catch (error) {
        console.error('Error getting price estimate:', error);
        socket.emit('pricing:error', {
          error: error.message || 'Failed to get price estimate'
        });
      }
    });

    /**
     * Subscribe to counter-offer updates for a booking
     */
    socket.on('counter_offer:subscribe', async (data) => {
      try {
        const { bookingId } = data;

        if (!bookingId) {
          socket.emit('counter_offer:error', {
            error: 'Booking ID is required'
          });
          return;
        }

        // Verify user has access to this booking
        const booking = await Booking.findById(bookingId)
          .select('customer technician');

        if (!booking) {
          socket.emit('counter_offer:error', {
            error: 'Booking not found'
          });
          return;
        }

        const userId = socket.userId.toString();
        const customerId = booking.customer._id?.toString() || booking.customer.toString();
        const technicianId = booking.technician?._id?.toString() || booking.technician?.toString();

        if (userId !== customerId && userId !== technicianId) {
          socket.emit('counter_offer:error', {
            error: 'Access denied to this booking'
          });
          return;
        }

        // Join counter-offer room for this booking
        socket.join(`counter_offer:${bookingId}`);

        // Send current counter-offer state if exists
        const fullBooking = await Booking.findById(bookingId)
          .select('counterOffer pricing')
          .populate('counterOffer.proposedBy', 'firstName lastName');

        if (fullBooking.counterOffer) {
          socket.emit('counter_offer:state', {
            bookingId,
            counterOffer: fullBooking.counterOffer
          });
        }

        console.log(`User ${socket.userId} subscribed to counter-offers for booking ${bookingId}`);
      } catch (error) {
        console.error('Error subscribing to counter-offers:', error);
        socket.emit('counter_offer:error', {
          error: error.message || 'Failed to subscribe to counter-offers'
        });
      }
    });

    /**
     * Unsubscribe from counter-offer updates
     */
    socket.on('counter_offer:unsubscribe', (data) => {
      const { bookingId } = data;
      socket.leave(`counter_offer:${bookingId}`);
      console.log(`User ${socket.userId} unsubscribed from counter-offers for booking ${bookingId}`);
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      pricingSubscribers.delete(socket.id);
    });
  });

  // Start periodic surge alert broadcast
  startSurgeBroadcast(io);

  console.log('Pricing socket handlers registered');
}

/**
 * Start periodic surge alert broadcast to all subscribers
 * @param {Object} io - Socket.IO server instance
 */
function startSurgeBroadcast(io) {
  // Clear existing interval if any
  if (surgeBroadcastInterval) {
    clearInterval(surgeBroadcastInterval);
  }

  // Broadcast surge alerts every 30 seconds
  surgeBroadcastInterval = setInterval(async () => {
    try {
      const surgeAlerts = await getSurgeAlerts();

      if (surgeAlerts.success && surgeAlerts.alerts.length > 0) {
        // Broadcast to all connected clients
        io.emit('pricing:surge_alert', surgeAlerts);
      }

      // Also broadcast market rates every minute
      const marketRates = await getMarketRates();
      io.emit('pricing:market_rates', marketRates);
    } catch (error) {
      console.error('Error in surge broadcast:', error);
    }
  }, 30000); // Every 30 seconds
}

/**
 * Emit counter-offer event to relevant parties
 * @param {Object} io - Socket.IO server instance
 * @param {string} bookingId - Booking ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function emitCounterOfferEvent(io, bookingId, event, data) {
  io.to(`counter_offer:${bookingId}`).emit(event, data);
}

/**
 * Notify about new counter-offer
 * @param {Object} io - Socket.IO server instance
 * @param {Object} booking - Booking document
 * @param {Object} counterOffer - Counter-offer details
 */
function notifyNewCounterOffer(io, booking, counterOffer) {
  const bookingId = booking._id.toString();
  const customerId = booking.customer._id?.toString() || booking.customer.toString();

  const eventData = {
    bookingId,
    counterOffer: {
      proposedBy: counterOffer.proposedBy,
      proposedAt: counterOffer.proposedAt,
      proposedPricing: counterOffer.proposedPricing,
      reason: counterOffer.reason,
      additionalNotes: counterOffer.additionalNotes,
      validUntil: counterOffer.validUntil,
      round: counterOffer.round || 1
    }
  };

  // Emit to counter-offer room
  emitCounterOfferEvent(io, bookingId, 'counter_offer:new', eventData);

  // Also emit to customer's personal room for notification
  io.to(customerId).emit('counter_offer:new', eventData);

  console.log(`New counter-offer notification sent for booking ${bookingId}`);
}

/**
 * Notify about counter-offer acceptance
 * @param {Object} io - Socket.IO server instance
 * @param {Object} booking - Booking document
 * @param {Object} response - Response details
 */
function notifyCounterOfferAccepted(io, booking, response) {
  const bookingId = booking._id.toString();
  const technicianId = booking.technician._id?.toString() || booking.technician?.toString();

  const eventData = {
    bookingId,
    acceptedAt: response.respondedAt,
    notes: response.notes,
    newPricing: booking.pricing
  };

  // Emit to counter-offer room
  emitCounterOfferEvent(io, bookingId, 'counter_offer:accepted', eventData);

  // Also emit to technician's personal room
  if (technicianId) {
    io.to(technicianId).emit('counter_offer:accepted', eventData);
  }

  console.log(`Counter-offer accepted notification sent for booking ${bookingId}`);
}

/**
 * Notify about counter-offer rejection
 * @param {Object} io - Socket.IO server instance
 * @param {Object} booking - Booking document
 * @param {Object} response - Response details
 */
function notifyCounterOfferRejected(io, booking, response) {
  const bookingId = booking._id.toString();
  const technicianId = booking.technician._id?.toString() || booking.technician?.toString();

  const eventData = {
    bookingId,
    rejectedAt: response.respondedAt,
    notes: response.notes,
    canRenegotiate: true // Always allow new negotiation
  };

  // Emit to counter-offer room
  emitCounterOfferEvent(io, bookingId, 'counter_offer:rejected', eventData);

  // Also emit to technician's personal room
  if (technicianId) {
    io.to(technicianId).emit('counter_offer:rejected', eventData);
  }

  console.log(`Counter-offer rejected notification sent for booking ${bookingId}`);
}

/**
 * Broadcast surge alert to all clients
 * @param {Object} io - Socket.IO server instance
 * @param {Object} surgeData - Surge information
 */
function broadcastSurgeAlert(io, surgeData) {
  io.emit('pricing:surge_alert', surgeData);
}

/**
 * Send market rates to specific user
 * @param {Object} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {Object} marketRates - Market rates data
 */
function sendMarketRatesToUser(io, userId, marketRates) {
  io.to(userId).emit('pricing:market_rates', marketRates);
}

module.exports = {
  registerPricingHandlers,
  emitCounterOfferEvent,
  notifyNewCounterOffer,
  notifyCounterOfferAccepted,
  notifyCounterOfferRejected,
  broadcastSurgeAlert,
  sendMarketRatesToUser
};
