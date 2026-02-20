/**
 * Socket.IO Handler for Real-Time Analytics Dashboard
 *
 * Handles real-time analytics streaming for admin dashboard.
 * Pushes live metrics updates and activity feed to connected admins.
 *
 * Socket Events:
 *
 * Admin -> Server:
 * - analytics:subscribe - Subscribe to live analytics updates
 * - analytics:unsubscribe - Unsubscribe from analytics updates
 * - analytics:get_realtime - Request current real-time metrics
 * - analytics:get_trends - Request historical trends
 *
 * Server -> Admin:
 * - analytics:metrics_update - Real-time metrics update (every 30 seconds)
 * - analytics:activity - New platform activity event
 * - analytics:status_distribution - Booking status distribution
 * - analytics:trends - Historical trend data
 * - analytics:error - Error occurred
 *
 * Security:
 * - Only admin users can subscribe to analytics
 * - Data is aggregated and anonymized
 */

const analyticsService = require('../services/analytics.service');
const User = require('../models/User');

/**
 * Get the Socket.IO instance
 * Will be set by the register function
 */
let io = null;

/**
 * Interval for pushing metrics updates (30 seconds)
 */
const METRICS_UPDATE_INTERVAL = 30 * 1000;

/**
 * Store for active analytics intervals
 */
let metricsInterval = null;

/**
 * Admin room name for broadcasting analytics
 */
const ADMIN_ANALYTICS_ROOM = 'admin:analytics';

/**
 * Validate that the user is an admin
 *
 * @param {Object} socket - Socket instance
 * @returns {boolean} True if user is admin
 */
function validateAdminAccess(socket) {
  return socket.user && socket.user.role === 'admin';
}

/**
 * Handle admin subscribing to analytics updates
 *
 * @param {Object} socket - Socket instance
 */
async function handleAnalyticsSubscribe(socket) {
  try {
    if (!validateAdminAccess(socket)) {
      return socket.emit('analytics:error', {
        error: 'Unauthorized: Admin access required'
      });
    }

    // Join admin analytics room
    socket.join(ADMIN_ANALYTICS_ROOM);

    // Send initial metrics immediately
    const metrics = await analyticsService.getRealtimeMetrics();
    socket.emit('analytics:metrics_update', metrics);

    // Send initial activity feed
    const activityFeed = analyticsService.getActivityFeed(20);
    socket.emit('analytics:activity_feed', activityFeed);

    // Send status distribution
    const statusDistribution = await analyticsService.getStatusDistribution();
    socket.emit('analytics:status_distribution', statusDistribution);

    console.log(`[Analytics] Admin ${socket.userId} subscribed to analytics`);

  } catch (error) {
    console.error('[Analytics] Error subscribing:', error.message);
    socket.emit('analytics:error', {
      error: error.message
    });
  }
}

/**
 * Handle admin unsubscribing from analytics updates
 *
 * @param {Object} socket - Socket instance
 */
function handleAnalyticsUnsubscribe(socket) {
  socket.leave(ADMIN_ANALYTICS_ROOM);
  console.log(`[Analytics] Admin ${socket.userId} unsubscribed from analytics`);
}

/**
 * Handle request for current real-time metrics
 *
 * @param {Object} socket - Socket instance
 */
async function handleGetRealtimeMetrics(socket) {
  try {
    if (!validateAdminAccess(socket)) {
      return socket.emit('analytics:error', {
        error: 'Unauthorized: Admin access required'
      });
    }

    // Force cache clear for fresh data
    analyticsService.clearMetricsCache();

    const metrics = await analyticsService.getRealtimeMetrics();
    socket.emit('analytics:metrics_update', metrics);

  } catch (error) {
    console.error('[Analytics] Error getting realtime metrics:', error.message);
    socket.emit('analytics:error', {
      error: error.message
    });
  }
}

/**
 * Handle request for historical trends
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Request data
 * @param {string} data.period - Time period: '24h', '7d', '30d', '90d'
 */
async function handleGetTrends(socket, data) {
  try {
    if (!validateAdminAccess(socket)) {
      return socket.emit('analytics:error', {
        error: 'Unauthorized: Admin access required'
      });
    }

    const { period = '7d' } = data || {};
    const trends = await analyticsService.getTrends(period);
    socket.emit('analytics:trends', trends);

  } catch (error) {
    console.error('[Analytics] Error getting trends:', error.message);
    socket.emit('analytics:error', {
      error: error.message
    });
  }
}

/**
 * Handle request for status distribution
 *
 * @param {Object} socket - Socket instance
 */
async function handleGetStatusDistribution(socket) {
  try {
    if (!validateAdminAccess(socket)) {
      return socket.emit('analytics:error', {
        error: 'Unauthorized: Admin access required'
      });
    }

    const distribution = await analyticsService.getStatusDistribution();
    socket.emit('analytics:status_distribution', distribution);

  } catch (error) {
    console.error('[Analytics] Error getting status distribution:', error.message);
    socket.emit('analytics:error', {
      error: error.message
    });
  }
}

/**
 * Handle request for activity feed
 *
 * @param {Object} socket - Socket instance
 * @param {Object} data - Request data
 * @param {number} data.limit - Number of activities to return
 */
function handleGetActivityFeed(socket, data) {
  try {
    if (!validateAdminAccess(socket)) {
      return socket.emit('analytics:error', {
        error: 'Unauthorized: Admin access required'
      });
    }

    const { limit = 20 } = data || {};
    const feed = analyticsService.getActivityFeed(limit);
    socket.emit('analytics:activity_feed', feed);

  } catch (error) {
    console.error('[Analytics] Error getting activity feed:', error.message);
    socket.emit('analytics:error', {
      error: error.message
    });
  }
}

/**
 * Broadcast metrics update to all subscribed admins
 * Called automatically every 30 seconds
 */
async function broadcastMetricsUpdate() {
  if (!io) return;

  try {
    // Clear cache to ensure fresh data
    analyticsService.clearMetricsCache();

    const metrics = await analyticsService.getRealtimeMetrics();
    io.to(ADMIN_ANALYTICS_ROOM).emit('analytics:metrics_update', metrics);

    // Also broadcast status distribution
    const distribution = await analyticsService.getStatusDistribution();
    io.to(ADMIN_ANALYTICS_ROOM).emit('analytics:status_distribution', distribution);

    console.log('[Analytics] Broadcasted metrics update to admins');

  } catch (error) {
    console.error('[Analytics] Error broadcasting metrics:', error.message);
  }
}

/**
 * Broadcast new activity event to all subscribed admins
 *
 * @param {string} type - Activity type
 * @param {Object} data - Activity data
 */
function broadcastActivity(type, data) {
  if (!io) return;

  const activity = analyticsService.trackActivity(type, data);
  io.to(ADMIN_ANALYTICS_ROOM).emit('analytics:activity', activity);

  console.log(`[Analytics] Broadcasted activity: ${type}`);
}

/**
 * Start periodic metrics updates
 */
function startMetricsInterval() {
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }

  metricsInterval = setInterval(broadcastMetricsUpdate, METRICS_UPDATE_INTERVAL);
  console.log(`[Analytics] Started metrics update interval (${METRICS_UPDATE_INTERVAL / 1000}s)`);
}

/**
 * Stop periodic metrics updates
 */
function stopMetricsInterval() {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
    console.log('[Analytics] Stopped metrics update interval');
  }
}

/**
 * Register analytics event handlers with the socket.io instance
 *
 * @param {Object} socketIo - The Socket.IO server instance
 */
function registerAnalyticsHandlers(socketIo) {
  io = socketIo;

  // Start periodic metrics updates
  startMetricsInterval();

  io.on('connection', (socket) => {
    // Admin analytics events
    socket.on('analytics:subscribe', () => handleAnalyticsSubscribe(socket));
    socket.on('analytics:unsubscribe', () => handleAnalyticsUnsubscribe(socket));
    socket.on('analytics:get_realtime', () => handleGetRealtimeMetrics(socket));
    socket.on('analytics:get_trends', (data) => handleGetTrends(socket, data));
    socket.on('analytics:get_status_distribution', () => handleGetStatusDistribution(socket));
    socket.on('analytics:get_activity_feed', (data) => handleGetActivityFeed(socket, data));

    // Handle disconnect - automatically leaves rooms
    socket.on('disconnect', () => {
      console.log(`[Analytics] Admin ${socket.userId} disconnected`);
    });
  });

  console.log('[Analytics] Socket handlers registered');

  // Initialize analytics tracking
  analyticsService.initializeAnalyticsTracking();
}

/**
 * Export function to broadcast activity from other parts of the app
 */
function trackAndBroadcastActivity(type, data) {
  broadcastActivity(type, data);
}

module.exports = {
  registerAnalyticsHandlers,
  handleAnalyticsSubscribe,
  handleAnalyticsUnsubscribe,
  handleGetRealtimeMetrics,
  handleGetTrends,
  handleGetStatusDistribution,
  handleGetActivityFeed,
  broadcastMetricsUpdate,
  broadcastActivity,
  trackAndBroadcastActivity,
  startMetricsInterval,
  stopMetricsInterval,
  ADMIN_ANALYTICS_ROOM
};
