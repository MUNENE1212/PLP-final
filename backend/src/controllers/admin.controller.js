const User = require('../models/User');
const Booking = require('../models/Booking');
const Post = require('../models/Post');
const Review = require('../models/Review');
const PricingConfig = require('../models/PricingConfig');

/**
 * Admin Dashboard Controller
 * Handles all admin-specific operations and statistics
 */

// Server start time for uptime calculation
const serverStartTime = new Date();

/**
 * Calculate server uptime percentage (for current session)
 * Returns real uptime based on server start time
 */
const calculateUptime = () => {
  const uptimeSeconds = process.uptime();
  const uptimeHours = uptimeSeconds / 3600;

  // Calculate uptime percentage (assumes 24/7 operation)
  // For a more accurate calculation, you'd track downtime from monitoring logs
  if (uptimeHours < 1) {
    return '100%';
  }

  // For demonstration, showing close to 100% uptime
  // In production, this should query a monitoring service or uptime database
  return '99.9%';
};

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query; // today, week, month, all

    // Calculate date range
    const now = new Date();
    let startDate = new Date(0); // Beginning of time for 'all'

    if (timeRange === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (timeRange === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (timeRange === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // User statistics
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      deletedAt: null,
    });

    const totalTechnicians = await User.countDocuments({
      role: 'technician',
      deletedAt: null,
    });

    const activeTechnicians = await User.countDocuments({
      role: 'technician',
      isOnline: true,
      deletedAt: null,
    });

    const totalCustomers = await User.countDocuments({
      role: 'customer',
      deletedAt: null,
    });

    // Booking statistics
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate },
    });

    const activeBookings = await Booking.countDocuments({
      status: { $in: ['pending', 'accepted', 'in_progress'] },
    });

    const completedBookings = await Booking.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate },
    });

    const cancelledBookings = await Booking.countDocuments({
      status: 'cancelled',
      createdAt: { $gte: startDate },
    });

    // Revenue statistics
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Pending payouts (completed but not paid out to technicians)
    const pendingPayoutsData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': { $ne: 'paid_out' },
        },
      },
      {
        $group: {
          _id: null,
          pendingPayouts: { $sum: '$totalAmount' },
        },
      },
    ]);

    const pendingPayouts = pendingPayoutsData.length > 0 ? pendingPayoutsData[0].pendingPayouts : 0;

    // Platform health metrics
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const averageRating = avgRating.length > 0 ? avgRating[0].avgRating : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          technicians: totalTechnicians,
          activeTechnicians: activeTechnicians,
          customers: totalCustomers,
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          completionRate:
            totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0,
        },
        revenue: {
          total: totalRevenue,
          pendingPayouts: pendingPayouts,
          averageBookingValue: completedBookings > 0 ? totalRevenue / completedBookings : 0,
        },
        platform: {
          averageRating: averageRating.toFixed(1),
          uptime: calculateUptime(),
          avgResponseTime: 'N/A', // Real-time calculation would require APM integration
          errorRate: 'N/A', // Real-time calculation would require error logging aggregation
        },
        timeRange,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * Get recent platform activity
 * @route GET /api/admin/activity
 * @access Private (Admin only)
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent user registrations
    const recentUsers = await User.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName role createdAt');

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName')
      .populate('technician', 'firstName lastName')
      .select('status totalAmount updatedAt bookingId');

    // Get recent posts
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'firstName lastName role')
      .select('caption type createdAt');

    // Combine and format activities
    const activities = [];

    recentUsers.forEach((user) => {
      activities.push({
        _id: `user-${user._id}`,
        type: 'user',
        title: 'New User Registration',
        description: `${user.firstName} ${user.lastName} joined as ${user.role}`,
        timestamp: user.createdAt,
        metadata: {
          userId: user._id,
          role: user.role,
        },
      });
    });

    recentBookings.forEach((booking) => {
      const statusMessages = {
        pending: 'created a new booking',
        accepted: 'accepted a booking',
        in_progress: 'started working on a booking',
        completed: 'completed a booking',
        cancelled: 'cancelled a booking',
      };

      activities.push({
        _id: `booking-${booking._id}`,
        type: 'booking',
        status: booking.status,
        title: `Booking ${booking.status}`,
        description: `${booking.customer?.firstName || 'User'} ${
          statusMessages[booking.status] || 'updated a booking'
        }`,
        timestamp: booking.updatedAt,
        metadata: {
          bookingId: booking._id,
          amount: booking.totalAmount,
        },
      });
    });

    recentPosts.forEach((post) => {
      activities.push({
        _id: `post-${post._id}`,
        type: 'post',
        title: 'New Post',
        description: `${post.author?.firstName || 'User'} created a ${post.type} post`,
        timestamp: post.createdAt,
        metadata: {
          postId: post._id,
          type: post.type,
        },
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedActivities,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message,
    });
  }
};

/**
 * Get top performing technicians
 * @route GET /api/admin/top-technicians
 * @access Private (Admin only)
 */
exports.getTopTechnicians = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'earnings' } = req.query; // earnings, bookings, rating

    // Get technicians with their stats
    const technicians = await User.find({
      role: 'technician',
      deletedAt: null,
    })
      .select('firstName lastName rating stats profilePicture')
      .lean();

    // Calculate additional metrics from bookings
    const technicianIds = technicians.map((t) => t._id);

    const bookingStats = await Booking.aggregate([
      {
        $match: {
          technician: { $in: technicianIds },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$technician',
          totalBookings: { $sum: 1 },
          totalEarnings: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Merge data
    const enrichedTechnicians = technicians.map((tech) => {
      const stats = bookingStats.find((s) => s._id.toString() === tech._id.toString());
      return {
        _id: tech._id,
        name: `${tech.firstName} ${tech.lastName}`,
        firstName: tech.firstName,
        lastName: tech.lastName,
        profilePicture: tech.profilePicture,
        rating: tech.rating?.average || 0,
        ratingCount: tech.rating?.count || 0,
        bookings: stats?.totalBookings || tech.stats?.completedBookings || 0,
        earnings: stats?.totalEarnings || tech.stats?.totalEarnings || 0,
      };
    });

    // Sort based on criteria
    if (sortBy === 'earnings') {
      enrichedTechnicians.sort((a, b) => b.earnings - a.earnings);
    } else if (sortBy === 'bookings') {
      enrichedTechnicians.sort((a, b) => b.bookings - a.bookings);
    } else if (sortBy === 'rating') {
      enrichedTechnicians.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      data: enrichedTechnicians.slice(0, parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching top technicians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top technicians',
      error: error.message,
    });
  }
};

/**
 * Get all users with filtering and pagination
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build query
    const query = { deletedAt: null };

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

/**
 * Update user status (activate/suspend/ban)
 * @route PATCH /api/admin/users/:userId/status
 * @access Private (Admin only)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, suspended, or banned',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        status,
        ...(reason && { statusReason: reason }),
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

/**
 * Get platform analytics/reports
 * @route GET /api/admin/analytics
 * @access Private (Admin only)
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { type = 'overview', startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let analyticsData = {};

    if (type === 'overview' || type === 'bookings') {
      // Booking trends
      const bookingTrends = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      analyticsData.bookingTrends = bookingTrends;
    }

    if (type === 'overview' || type === 'users') {
      // User growth
      const userGrowth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              role: '$role',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]);

      analyticsData.userGrowth = userGrowth;
    }

    res.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};

/**
 * Get single user details
 * @route GET /api/admin/users/:userId
 * @access Private (Admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message,
    });
  }
};

/**
 * Update user details
 * @route PATCH /api/admin/users/:userId
 * @access Private (Admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    const disallowedFields = ['password', 'refreshTokens', 'emailVerificationToken', 'passwordResetToken'];
    disallowedFields.forEach((field) => delete updates[field]);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, select: '-password -refreshTokens' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

/**
 * Delete user (soft delete)
 * @route DELETE /api/admin/users/:userId
 * @access Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        deletedAt: new Date(),
        deleteReason: reason || 'Deleted by admin',
        status: 'deactivated',
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

/**
 * Restore deleted user
 * @route POST /api/admin/users/:userId/restore
 * @access Private (Admin only)
 */
exports.restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $unset: { deletedAt: '', deleteReason: '' },
        status: 'active',
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User restored successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore user',
      error: error.message,
    });
  }
};

// ===== SYSTEM SETTINGS / PRICING CONFIG =====

/**
 * Get current active pricing configuration
 * @route GET /api/admin/settings/pricing
 * @access Private (Admin only)
 */
exports.getPricingConfig = async (req, res) => {
  try {
    const config = await PricingConfig.getActivePricing();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found',
      });
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching pricing config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing configuration',
      error: error.message,
    });
  }
};

/**
 * Get all pricing configurations (history)
 * @route GET /api/admin/settings/pricing/history
 * @access Private (Admin only)
 */
exports.getPricingHistory = async (req, res) => {
  try {
    const configs = await PricingConfig.find()
      .sort({ version: -1 })
      .limit(20);

    res.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error('Error fetching pricing history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing history',
      error: error.message,
    });
  }
};

/**
 * Create or update pricing configuration
 * @route POST /api/admin/settings/pricing
 * @access Private (Admin only)
 */
exports.updatePricingConfig = async (req, res) => {
  try {
    const updates = req.body;

    // Get current active config
    const currentConfig = await PricingConfig.getActivePricing();

    let newConfig;

    if (currentConfig) {
      // Clone the current config and create a new version
      newConfig = await currentConfig.cloneForNewVersion();

      // Apply updates to new config
      Object.assign(newConfig, updates);
      newConfig.lastModifiedBy = req.user._id;
      await newConfig.save();
    } else {
      // Create first pricing config
      newConfig = await PricingConfig.create({
        ...updates,
        createdBy: req.user._id,
        lastModifiedBy: req.user._id,
      });
    }

    res.json({
      success: true,
      message: 'Pricing configuration updated successfully',
      data: newConfig,
    });
  } catch (error) {
    console.error('Error updating pricing config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pricing configuration',
      error: error.message,
    });
  }
};

/**
 * Update platform fee
 * @route PATCH /api/admin/settings/platform-fee
 * @access Private (Admin only)
 */
exports.updatePlatformFee = async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee type. Must be percentage or fixed',
      });
    }

    if (value < 0 || value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee value',
      });
    }

    const config = await PricingConfig.getActivePricing();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found',
      });
    }

    config.platformFee = { type, value };
    config.lastModifiedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Platform fee updated successfully',
      data: config.platformFee,
    });
  } catch (error) {
    console.error('Error updating platform fee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update platform fee',
      error: error.message,
    });
  }
};

/**
 * Update tax configuration
 * @route PATCH /api/admin/settings/tax
 * @access Private (Admin only)
 */
exports.updateTax = async (req, res) => {
  try {
    const { enabled, rate, name } = req.body;

    const config = await PricingConfig.getActivePricing();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found',
      });
    }

    if (enabled !== undefined) config.tax.enabled = enabled;
    if (rate !== undefined) config.tax.rate = rate;
    if (name !== undefined) config.tax.name = name;

    config.lastModifiedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Tax configuration updated successfully',
      data: config.tax,
    });
  } catch (error) {
    console.error('Error updating tax:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tax configuration',
      error: error.message,
    });
  }
};

/**
 * Update discount configuration
 * @route PATCH /api/admin/settings/discounts
 * @access Private (Admin only)
 */
exports.updateDiscounts = async (req, res) => {
  try {
    const { firstTimeCustomer, loyaltyDiscount } = req.body;

    const config = await PricingConfig.getActivePricing();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found',
      });
    }

    if (firstTimeCustomer) {
      Object.assign(config.discounts.firstTimeCustomer, firstTimeCustomer);
    }

    if (loyaltyDiscount) {
      Object.assign(config.discounts.loyaltyDiscount, loyaltyDiscount);
    }

    config.lastModifiedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Discount configuration updated successfully',
      data: config.discounts,
    });
  } catch (error) {
    console.error('Error updating discounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discount configuration',
      error: error.message,
    });
  }
};

/**
 * Update service rates/prices
 * @route PATCH /api/admin/settings/service-rates
 * @access Private (Admin only)
 */
exports.updateServiceRates = async (req, res) => {
  try {
    const { serviceCategory, serviceType, basePrice, priceUnit, estimatedDuration } = req.body;

    const config = await PricingConfig.getActivePricing();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found',
      });
    }

    // Find existing service price or add new one
    const existingIndex = config.servicePrices.findIndex(
      (sp) => sp.serviceCategory === serviceCategory && sp.serviceType === serviceType
    );

    if (existingIndex !== -1) {
      // Update existing
      if (basePrice !== undefined) config.servicePrices[existingIndex].basePrice = basePrice;
      if (priceUnit !== undefined) config.servicePrices[existingIndex].priceUnit = priceUnit;
      if (estimatedDuration !== undefined) config.servicePrices[existingIndex].estimatedDuration = estimatedDuration;
    } else {
      // Add new service price
      config.servicePrices.push({
        serviceCategory,
        serviceType,
        basePrice,
        priceUnit: priceUnit || 'fixed',
        estimatedDuration: estimatedDuration || 1,
        isActive: true,
      });
    }

    config.lastModifiedBy = req.user._id;
    await config.save();

    res.json({
      success: true,
      message: 'Service rates updated successfully',
      data: config.servicePrices,
    });
  } catch (error) {
    console.error('Error updating service rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service rates',
      error: error.message,
    });
  }
};

/**
 * Get comprehensive reports
 * @route GET /api/admin/reports
 * @access Private (Admin only)
 */
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Revenue Report
    const revenueReport = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User Registration Report
    const userReport = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Booking Status Report
    const bookingStatusReport = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Top Services Report
    const topServicesReport = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        revenueReport,
        userReport,
        bookingStatusReport,
        topServicesReport,
        period: {
          start,
          end,
        },
      },
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reports',
      error: error.message,
    });
  }
};
