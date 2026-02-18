/**
 * Profile Completeness Controller
 *
 * Endpoints for managing technician profile completeness.
 * Provides score tracking, suggestions, and recalculation.
 */

const mongoose = require('mongoose');
const profileCompletenessService = require('../services/profileCompleteness.service');
const ProfileCompleteness = require('../models/ProfileCompleteness');

/**
 * Get user's completeness score
 *
 * @route GET /api/v1/profile/completeness
 * @access Private (Technician only)
 */
const getCompleteness = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Only allow technicians
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Profile completeness is only available for technicians'
      });
    }

    const completeness = await profileCompletenessService.getCompleteness(userId);

    res.json({
      success: true,
      data: completeness
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Get error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile completeness'
    });
  }
};

/**
 * Recalculate completeness score
 *
 * @route POST /api/v1/profile/completeness/recalculate
 * @access Private (Technician only)
 */
const recalculateCompleteness = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Only allow technicians
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Profile completeness is only available for technicians'
      });
    }

    const completeness = await profileCompletenessService.calculateCompleteness(userId);

    res.json({
      success: true,
      message: 'Profile completeness recalculated successfully',
      data: completeness
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Recalculate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to recalculate profile completeness'
    });
  }
};

/**
 * Get suggestions for profile improvement
 *
 * @route GET /api/v1/profile/completeness/suggestions
 * @access Private (Technician only)
 */
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Only allow technicians
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Profile completeness is only available for technicians'
      });
    }

    const suggestions = await profileCompletenessService.getSuggestions(userId, limit);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get suggestions'
    });
  }
};

/**
 * Get missing items checklist
 *
 * @route GET /api/v1/profile/completeness/missing
 * @access Private (Technician only)
 */
const getMissingItems = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Only allow technicians
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Profile completeness is only available for technicians'
      });
    }

    const missingItems = await profileCompletenessService.getMissingItems(userId);

    res.json({
      success: true,
      data: missingItems
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Get missing items error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get missing items'
    });
  }
};

/**
 * Get completeness by section
 *
 * @route GET /api/v1/profile/completeness/sections/:section
 * @access Private (Technician only)
 */
const getSectionCompleteness = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { section } = req.params;

    // Validate section name
    const validSections = ['basicInfo', 'services', 'portfolio', 'verification', 'availability', 'reviews'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Valid sections are: ${validSections.join(', ')}`
      });
    }

    // Only allow technicians
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Profile completeness is only available for technicians'
      });
    }

    const completeness = await profileCompletenessService.getCompleteness(userId);
    const sectionData = completeness.sections[section];

    res.json({
      success: true,
      data: {
        section,
        ...sectionData.toObject()
      }
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Get section error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get section completeness'
    });
  }
};

/**
 * Get completeness statistics (Admin only)
 *
 * @route GET /api/v1/profile/completeness/admin/statistics
 * @access Private (Admin only)
 */
const getStatistics = async (req, res) => {
  try {
    const statistics = await profileCompletenessService.getStatistics();

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get statistics'
    });
  }
};

/**
 * Batch recalculate for multiple users (Admin only)
 *
 * @route POST /api/v1/profile/completeness/admin/batch-recalculate
 * @access Private (Admin only)
 */
const batchRecalculate = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds must be a non-empty array'
      });
    }

    // Validate all user IDs
    const invalidIds = userIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid user IDs: ${invalidIds.join(', ')}`
      });
    }

    const results = await profileCompletenessService.batchCalculate(userIds);

    res.json({
      success: true,
      message: `Batch recalculation completed: ${results.success} successful, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Batch recalculate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to batch recalculate'
    });
  }
};

/**
 * Get public profile completeness (limited data)
 * Used for displaying badge on technician profile
 *
 * @route GET /api/v1/profile/completeness/public/:userId
 * @access Public
 */
const getPublicCompleteness = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const completeness = await ProfileCompleteness.findOne({ user: userId })
      .select('score level color');

    if (!completeness) {
      // Calculate if doesn't exist
      try {
        const calculated = await profileCompletenessService.calculateCompleteness(userId);
        return res.json({
          success: true,
          data: {
            score: calculated.score,
            level: calculated.level,
            color: calculated.color
          }
        });
      } catch (error) {
        // User might not be a technician
        return res.status(404).json({
          success: false,
          message: 'Profile completeness not found'
        });
      }
    }

    res.json({
      success: true,
      data: {
        score: completeness.score,
        level: completeness.level,
        color: completeness.color
      }
    });
  } catch (error) {
    console.error('[ProfileCompleteness] Get public completeness error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get public completeness'
    });
  }
};

module.exports = {
  getCompleteness,
  recalculateCompleteness,
  getSuggestions,
  getMissingItems,
  getSectionCompleteness,
  getStatistics,
  batchRecalculate,
  getPublicCompleteness
};
