/**
 * Analytics Service for DumuWaks Admin Dashboard
 *
 * Provides real-time analytics and metrics aggregation for admin monitoring.
 * Tracks bookings, revenue, active users, and platform performance metrics.
 *
 * Features:
 * - Real-time metrics aggregation
 * - Historical trend analysis
 * - Activity stream tracking
 * - Status distribution analytics
 *
 * Performance:
 * - In-memory caching for real-time data
 * - Database aggregation for historical data
 * - Automatic cleanup of stale data
 */

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Escrow = require('../models/Escrow');

/**
 * In-memory storage for real-time metrics
 * Cleared every 30 seconds to ensure freshness
 */
let realtimeMetricsCache = {
  timestamp: null,
  data: null
};

/**
 * In-memory storage for activity feed
 * Limited to last 100 events
 */
const activityFeed = [];
const MAX_ACTIVITY_FEED_SIZE = 100;

/**
 * Calculate real-time platform metrics
 *
 * Aggregates current platform statistics including:
 * - Active bookings by status
 * - Revenue metrics (today vs yesterday)
 * - User activity (technicians and customers online)
 * - Booking rates and response times
 *
 * @returns {Promise<Object>} Current platform metrics
 */
async function getRealtimeMetrics() {
  // Check cache (cache valid for 5 seconds)
  const now = Date.now();
  if (realtimeMetricsCache.timestamp && (now - realtimeMetricsCache.timestamp) < 5000) {
    return realtimeMetricsCache.data;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Run aggregations in parallel for performance
    const [
      activeBookingsByStatus,
      revenueToday,
      revenueYesterday,
      techniciansOnline,
      customersOnline,
      bookingsLastHour,
      avgResponseTime
    ] = await Promise.all([
      // Active bookings by status
      Booking.aggregate([
        {
          $match: {
            status: { $in: ['pending', 'confirmed', 'en_route', 'in_progress'] }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Revenue today
      Escrow.aggregate([
        {
          $match: {
            status: 'released',
            releasedAt: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$platformFee' }
          }
        }
      ]),

      // Revenue yesterday
      Escrow.aggregate([
        {
          $match: {
            status: 'released',
            releasedAt: { $gte: yesterday, $lt: today }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$platformFee' }
          }
        }
      ]),

      // Technicians online
      User.countDocuments({
        role: 'technician',
        'availability.status': 'online'
      }),

      // Customers online
      User.countDocuments({
        role: 'customer',
        isOnline: true
      }),

      // Bookings in the last hour
      Booking.countDocuments({
        createdAt: { $gte: new Date(now - 60 * 60 * 1000) }
      }),

      // Average response time (technician acceptance)
      Booking.aggregate([
        {
          $match: {
            status: { $ne: 'pending' },
            'statusHistory.status': 'confirmed',
            createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) }
          }
        },
        {
          $project: {
            responseTime: {
              $subtract: [
                { $arrayElemAt: ['$statusHistory.changedAt', 1] },
                '$createdAt'
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ])
    ]);

    // Format active bookings by status
    const statusDistribution = {};
    let activeBookings = 0;
    activeBookingsByStatus.forEach(item => {
      statusDistribution[item._id] = item.count;
      activeBookings += item.count;
    });

    // Calculate revenue change
    const todayRevenue = revenueToday[0]?.total || 0;
    const yesterdayRevenue = revenueYesterday[0]?.total || 0;
    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    // Format average response time (in minutes)
    const avgResponseMs = avgResponseTime[0]?.avgResponseTime || 0;
    const avgResponseMinutes = Math.round(avgResponseMs / (1000 * 60));

    const metrics = {
      activeBookings,
      activeBookingsByStatus: statusDistribution,
      revenueToday: todayRevenue,
      revenueYesterday: yesterdayRevenue,
      revenueChangePercent: Math.round(revenueChange * 10) / 10,
      techniciansOnline,
      customersOnline,
      bookingsLastHour,
      averageResponseTime: avgResponseMinutes,
      timestamp: new Date().toISOString()
    };

    // Update cache
    realtimeMetricsCache = {
      timestamp: now,
      data: metrics
    };

    return metrics;
  } catch (error) {
    console.error('[Analytics] Error getting realtime metrics:', error);
    throw error;
  }
}

/**
 * Get historical trends for analytics
 *
 * @param {string} period - Time period: '24h', '7d', '30d', '90d'
 * @returns {Promise<Object>} Historical trend data
 */
async function getTrends(period = '7d') {
  try {
    const now = new Date();
    let startDate;
    let groupFormat;

    switch (period) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d %H:00'; // Hourly
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d'; // Daily
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%U'; // Weekly
        break;
      case '7d':
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d'; // Daily
        break;
    }

    // Run aggregations in parallel
    const [bookingsTrend, revenueTrend, usersTrend] = await Promise.all([
      // Bookings trend
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupFormat, date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Revenue trend
      Escrow.aggregate([
        {
          $match: {
            status: 'released',
            releasedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupFormat, date: '$releasedAt' }
            },
            revenue: { $sum: '$platformFee' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // New users trend
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupFormat, date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Format trends for frontend charts
    const formatTrend = (data, valueKey = 'count') =>
      data.map(item => ({
        date: item._id,
        [valueKey]: item[valueKey]
      }));

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      bookings: formatTrend(bookingsTrend),
      revenue: formatTrend(revenueTrend, 'revenue'),
      users: formatTrend(usersTrend)
    };
  } catch (error) {
    console.error('[Analytics] Error getting trends:', error);
    throw error;
  }
}

/**
 * Track platform activity event
 *
 * @param {string} type - Event type (booking_created, booking_completed, payment_received, etc.)
 * @param {Object} data - Event data
 * @returns {Object} Activity event
 */
function trackActivity(type, data) {
  const activity = {
    type,
    data,
    timestamp: new Date().toISOString(),
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  // Add to feed (maintain max size)
  activityFeed.unshift(activity);
  if (activityFeed.length > MAX_ACTIVITY_FEED_SIZE) {
    activityFeed.pop();
  }

  return activity;
}

/**
 * Get recent activity feed
 *
 * @param {number} limit - Maximum number of activities to return (default: 20)
 * @returns {Array} Recent activities
 */
function getActivityFeed(limit = 20) {
  return activityFeed.slice(0, limit);
}

/**
 * Get booking status distribution
 *
 * @returns {Promise<Object>} Status distribution with counts and percentages
 */
async function getStatusDistribution() {
  try {
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

    const distribution = statusCounts.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    return {
      total,
      distribution
    };
  } catch (error) {
    console.error('[Analytics] Error getting status distribution:', error);
    throw error;
  }
}

/**
 * Clear the realtime metrics cache
 * Forces fresh data on next request
 */
function clearMetricsCache() {
  realtimeMetricsCache = {
    timestamp: null,
    data: null
  };
}

/**
 * Get cache statistics
 *
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  return {
    hasCache: realtimeMetricsCache.data !== null,
    cacheAge: realtimeMetricsCache.timestamp
      ? Date.now() - realtimeMetricsCache.timestamp
      : null,
    activityFeedSize: activityFeed.length
  };
}

/**
 * Initialize analytics tracking
 * Sets up automatic event tracking hooks
 */
function initializeAnalyticsTracking() {
  // Track booking creation via Mongoose hooks is handled in the Booking model
  // This function can be extended for additional tracking

  console.log('[Analytics] Analytics tracking initialized');
}

module.exports = {
  // Core metrics functions
  getRealtimeMetrics,
  getTrends,
  getStatusDistribution,

  // Activity tracking
  trackActivity,
  getActivityFeed,

  // Cache management
  clearMetricsCache,
  getCacheStats,

  // Initialization
  initializeAnalyticsTracking,

  // Constants
  MAX_ACTIVITY_FEED_SIZE
};
