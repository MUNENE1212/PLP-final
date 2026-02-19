/**
 * Admin Stats Routes
 *
 * Routes for admin statistics endpoints including dashboard overview,
 * escrow statistics, revenue data, and service statistics.
 *
 * @module routes/adminStats.routes
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminStatsController = require('../controllers/adminStats.controller');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/v1/admin/stats/overview
 * @desc    Get dashboard overview metrics
 * @access  Private (Admin only)
 */
router.get('/overview', adminStatsController.getDashboardOverview);

/**
 * @route   GET /api/v1/admin/stats/escrow
 * @desc    Get escrow statistics
 * @access  Private (Admin only)
 */
router.get('/escrow', adminStatsController.getEscrowStats);

/**
 * @route   GET /api/v1/admin/stats/revenue
 * @desc    Get revenue statistics
 * @query   period - daily, weekly, monthly
 * @query   startDate - ISO date string
 * @query   endDate - ISO date string
 * @access  Private (Admin only)
 */
router.get('/revenue', adminStatsController.getRevenueStats);

/**
 * @route   GET /api/v1/admin/stats/services
 * @desc    Get service statistics
 * @access  Private (Admin only)
 */
router.get('/services', adminStatsController.getServiceStats);

/**
 * @route   GET /api/v1/admin/stats/platform
 * @desc    Get platform statistics for charts
 * @query   startDate - ISO date string
 * @query   endDate - ISO date string
 * @access  Private (Admin only)
 */
router.get('/platform', adminStatsController.getPlatformStatistics);

module.exports = router;
