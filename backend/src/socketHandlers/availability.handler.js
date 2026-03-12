/**
 * Availability Socket Handler
 * Handles real-time availability updates via Socket.IO
 *
 * Task #73: Real-Time Availability & Queue System
 */

const {
  updateTechnicianStatus,
  updateStatusBasedOnBooking,
  calculateQueuePosition,
  getOnlineTechnicianCount,
  setInactiveTechniciansAway,
  getTechnicianStatus,
  AVAILABILITY_STATUS
} = require('../services/availability.service');

/**
 * Register availability socket handlers
 * @param {Object} io - Socket.IO server instance
 */
function registerAvailabilityHandlers(io) {
  // Track activity timestamps for auto-away feature
  const technicianActivity = new Map();

  /**
   * Handle technician availability status update
   */
  io.on('connection', (socket) => {
    /**
     * Technician updates their availability status
     */
    socket.on('availability:update', async (data) => {
      try {
        const { status, currentBookingId } = data;
        const technicianId = socket.userId;

        // Only technicians can update availability
        if (socket.user.role !== 'technician') {
          socket.emit('availability:error', {
            error: 'Only technicians can update availability'
          });
          return;
        }

        // Update activity timestamp
        technicianActivity.set(technicianId, Date.now());

        // Update status
        const result = await updateTechnicianStatus(
          technicianId,
          status,
          currentBookingId
        );

        // Confirm update to technician
        socket.emit('availability:updated', result);
      } catch (error) {
        console.error('Availability update error:', error);
        socket.emit('availability:error', {
          error: error.message || 'Failed to update availability'
        });
      }
    });

    /**
     * Get current availability status
     */
    socket.on('availability:get_status', async (data) => {
      try {
        const { technicianId } = data;

        const status = await getTechnicianStatus(technicianId);

        socket.emit('availability:status', status);
      } catch (error) {
        console.error('Get status error:', error);
        socket.emit('availability:error', {
          error: error.message || 'Failed to get status'
        });
      }
    });

    /**
     * Get online technician count for a category
     */
    socket.on('availability:get_online_count', async (data) => {
      try {
        const { category } = data;

        const result = await getOnlineTechnicianCount(category);

        socket.emit('availability:online_count', result);
      } catch (error) {
        console.error('Get online count error:', error);
        socket.emit('availability:error', {
          error: error.message || 'Failed to get online count'
        });
      }
    });

    /**
     * Subscribe to queue position updates for a booking
     */
    socket.on('queue:subscribe', async (data) => {
      try {
        const { bookingId } = data;

        // Join booking room for queue updates
        socket.join(`queue:${bookingId}`);

        // Calculate and send current position
        const queueInfo = await calculateQueuePosition(bookingId);

        socket.emit('queue:position_update', queueInfo);
      } catch (error) {
        console.error('Queue subscribe error:', error);
        socket.emit('queue:error', {
          error: error.message || 'Failed to subscribe to queue'
        });
      }
    });

    /**
     * Unsubscribe from queue updates
     */
    socket.on('queue:unsubscribe', (data) => {
      const { bookingId } = data;
      socket.leave(`queue:${bookingId}`);
    });

    /**
     * Update activity timestamp (heartbeat)
     */
    socket.on('availability:heartbeat', () => {
      const technicianId = socket.userId;

      if (socket.user.role === 'technician') {
        technicianActivity.set(technicianId, Date.now());
      }
    });

    /**
     * Handle booking status changes to update availability
     */
    socket.on('booking:status_changed', async (data) => {
      try {
        const { bookingId, status, technicianId } = data;

        // Update availability based on booking lifecycle
        if (technicianId) {
          const result = await updateStatusBasedOnBooking(
            technicianId,
            status,
            bookingId
          );

        }
      } catch (error) {
        console.error('Booking status change availability error:', error);
      }
    });

    /**
     * Handle disconnect - set technician to offline
     */
    socket.on('disconnect', async () => {
      try {
        if (socket.user.role === 'technician') {
          // Set to offline
          await updateTechnicianStatus(
            socket.userId,
            AVAILABILITY_STATUS.OFFLINE
          );

          // Clean up activity tracking
          technicianActivity.delete(socket.userId);
        }
      } catch (error) {
        console.error('Error setting technician offline on disconnect:', error);
      }
    });
  });

  /**
   * Periodic task to set inactive technicians to away
   * Runs every minute
   */
  setInterval(async () => {
    try {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Check all tracked technicians
      for (const [technicianId, lastActivity] of technicianActivity.entries()) {
        if (now - lastActivity > fiveMinutes) {
          // Set to away
          await updateTechnicianStatus(
            technicianId,
            AVAILABILITY_STATUS.AWAY
          );

          // Remove from activity tracking
          technicianActivity.delete(technicianId);
        }
      }

      // Also run the database-wide check
      await setInactiveTechniciansAway(5);
    } catch (error) {
      console.error('Error in auto-away check:', error);
    }
  }, 60000); // Every minute
}

module.exports = {
  registerAvailabilityHandlers
};
