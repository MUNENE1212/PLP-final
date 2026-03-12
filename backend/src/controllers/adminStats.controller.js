/**
 * Admin Stats Controller
 *
 * Handles admin statistics endpoints for dashboard metrics,
 * escrow statistics, revenue data, and service statistics.
 *
 * @module controllers/adminStats.controller
 */

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');

/**
 * Get dashboard overview metrics
 * @route GET /api/v1/admin/stats/overview
 * @access Private (Admin only)
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // Service metrics
    const totalServices = await Service.countDocuments({ isActive: true });
    const pendingApprovals = await Service.countDocuments({
      isCustom: true,
      approvalStatus: 'pending'
    });

    // User metrics
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: todayStart },
      deletedAt: null,
    });

    const activeTechnicians = await User.countDocuments({
      role: 'technician',
      isOnline: true,
      deletedAt: null,
    });

    // Booking metrics for today
    const todayBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    // Escrow metrics
    const escrowStats = await Booking.aggregate([
      {
        $match: {
          'bookingFee.heldInEscrow': true,
          'bookingFee.status': { $in: ['held', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          activeEscrows: { $sum: 1 },
          totalInEscrow: { $sum: '$bookingFee.amount' }
        }
      }
    ]);

    // Pending payouts
    const pendingPayouts = await Booking.countDocuments({
      status: 'completed',
      'payment.status': 'completed',
      'bookingFee.status': 'held'
    });

    // Today's transactions
    const todayTransactions = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          volume: { $sum: '$amount' }
        }
      }
    ]);

    // Platform fees today
    const platformFeesToday = await Transaction.aggregate([
      {
        $match: {
          type: 'platform_fee',
          createdAt: { $gte: todayStart },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        // Services
        pendingApprovals,
        totalServices,

        // Escrow
        activeEscrows: escrowStats[0]?.activeEscrows || 0,
        totalInEscrow: escrowStats[0]?.totalInEscrow || 0,
        pendingPayouts,

        // Transactions
        todayTransactions: todayTransactions[0]?.count || 0,
        todayVolume: todayTransactions[0]?.volume || 0,

        // Users
        newUsersToday,
        activeTechnicians,

        // Platform
        platformFeesToday: platformFeesToday[0]?.total || 0,
        totalBookingsToday: todayBookings[0]?.total || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
    });
  }
};

/**
 * Get escrow statistics
 * @route GET /api/v1/admin/stats/escrow
 * @access Private (Admin only)
 */
exports.getEscrowStats = async (req, res) => {
  try {
    const escrowStats = await Booking.aggregate([
      {
        $match: {
          'bookingFee.required': true,
          'bookingFee.status': { $ne: 'pending' }
        }
      },
      {
        $group: {
          _id: '$bookingFee.status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$bookingFee.amount' }
        }
      }
    ]);

    // Calculate totals
    let totalActive = 0;
    let totalHeld = 0;
    let totalDisputed = 0;
    let pendingRelease = 0;
    let totalValue = 0;

    escrowStats.forEach(stat => {
      totalValue += stat.totalAmount;
      switch (stat._id) {
        case 'paid':
        case 'held':
          totalActive += stat.count;
          if (stat._id === 'held') {
            totalHeld = stat.count;
            pendingRelease = stat.count;
          }
          break;
        case 'disputed':
          totalDisputed = stat.count;
          break;
      }
    });

    // Calculate average hold time
    const completedEscrows = await Booking.aggregate([
      {
        $match: {
          'bookingFee.status': 'released',
          'bookingFee.paidAt': { $exists: true },
          'bookingFee.releasedAt': { $exists: true }
        }
      },
      {
        $project: {
          holdTime: {
            $divide: [
              { $subtract: ['$bookingFee.releasedAt', '$bookingFee.paidAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgHoldTime: { $avg: '$holdTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalActive,
        totalHeld,
        totalDisputed,
        pendingRelease,
        totalValue,
        averageHoldTime: Math.round(completedEscrows[0]?.avgHoldTime || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching escrow stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrow statistics',
    });
  }
};

/**
 * Get revenue statistics
 * @route GET /api/v1/admin/stats/revenue
 * @access Private (Admin only)
 */
exports.getRevenueStats = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Group by period
    let dateFormat;
    switch (period) {
      case 'weekly':
        dateFormat = '%Y-%U';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          type: { $in: ['payment', 'platform_fee'] },
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$type', 'payment'] }, '$amount', 0]
            }
          },
          platformFees: {
            $sum: {
              $cond: [{ $eq: ['$type', 'platform_fee'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate summary
    const summary = revenueData.reduce(
      (acc, item) => ({
        total: acc.total + item.revenue,
        fees: acc.fees + item.platformFees,
        count: acc.count + item.count
      }),
      { total: 0, fees: 0, count: 0 }
    );

    res.json({
      success: true,
      data: {
        data: revenueData.map(item => ({
          date: item._id,
          revenue: item.revenue,
          platformFees: item.platformFees,
          count: item.count
        })),
        summary: {
          total: summary.total,
          average: summary.count > 0 ? Math.round(summary.total / summary.count) : 0,
          platformFees: summary.fees
        }
      }
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue statistics',
    });
  }
};

/**
 * Get service statistics
 * @route GET /api/v1/admin/stats/services
 * @access Private (Admin only)
 */
exports.getServiceStats = async (req, res) => {
  try {
    // Get categories with counts
    const categories = await ServiceCategory.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'services'
        }
      },
      {
        $project: {
          name: 1,
          icon: 1,
          count: { $size: '$services' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top services by bookings
    const topServices = await Booking.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: {
            category: '$serviceCategory',
            type: '$serviceType'
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    // Service approval stats
    const approvalStats = await Service.aggregate([
      {
        $match: { isCustom: true }
      },
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalServices = await Service.countDocuments({ isActive: true });
    const pendingApprovals = approvalStats.find(s => s._id === 'pending')?.count || 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalServices,
          activeServices: totalServices,
          pendingApprovals,
          categories: categories.length
        },
        categories: categories.map(c => ({
          category: c.name,
          count: c.count,
          icon: c.icon
        })),
        topServices: topServices.map(s => ({
          category: s._id.category,
          name: s._id.type,
          bookings: s.bookings,
          revenue: s.revenue
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics',
    });
  }
};

/**
 * Get platform statistics (for charts)
 * @route GET /api/v1/admin/stats/platform
 * @access Private (Admin only)
 */
exports.getPlatformStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Revenue over time
    const revenueOverTime = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$pricing.totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Bookings by category
    const bookingsByCategory = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Technician performance
    const technicianPerformance = await Booking.aggregate([
      {
        $match: {
          technician: { $exists: true },
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$technician',
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalEarnings: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { completedBookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'technician'
        }
      },
      {
        $project: {
          _id: 1,
          name: { $arrayElemAt: ['$technician.firstName', 0] },
          totalBookings: 1,
          completedBookings: 1,
          totalEarnings: 1,
          averageRating: { $arrayElemAt: ['$technician.rating.average', 0] }
        }
      }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Platform fees breakdown
    const platformFeesBreakdown = await Transaction.aggregate([
      {
        $match: {
          type: 'platform_fee',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    const [monthFees, weekFees, todayFees] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'platform_fee', status: 'completed', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'platform_fee', status: 'completed', createdAt: { $gte: weekStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'platform_fee', status: 'completed', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        revenueOverTime: revenueOverTime.map(item => ({
          date: item._id,
          revenue: item.revenue,
          bookings: item.bookings
        })),
        bookingsByCategory: bookingsByCategory.map(item => ({
          category: item._id,
          count: item.count,
          revenue: item.revenue
        })),
        topServices: bookingsByCategory.slice(0, 5).map(item => ({
          name: item._id,
          category: item._id,
          bookings: item.count,
          revenue: item.revenue
        })),
        technicianPerformance,
        userGrowth: userGrowth.map(item => ({
          date: item._id.date,
          role: item._id.role,
          count: item.count
        })),
        platformFeesBreakdown: {
          total: platformFeesBreakdown[0]?.total || 0,
          thisMonth: monthFees[0]?.total || 0,
          thisWeek: weekFees[0]?.total || 0,
          today: todayFees[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
    });
  }
};
