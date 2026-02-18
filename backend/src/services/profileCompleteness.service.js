/**
 * Profile Completeness Service
 *
 * Business logic for calculating and managing profile completeness scores.
 * Used to encourage technicians to complete their profiles for better visibility.
 *
 * Criteria:
 * - Basic Info (20%): profile picture, bio, phone verified, location
 * - Services (25%): at least 3 services, prices set
 * - Portfolio (20%): at least 5 portfolio images
 * - Verification (15%): ID verified, email verified
 * - Availability (10%): availability schedule set
 * - Reviews (10%): has at least 1 review (bonus)
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ProfileCompleteness = require('../models/ProfileCompleteness');

// Section weight configuration
const SECTION_WEIGHTS = {
  basicInfo: 20,
  services: 25,
  portfolio: 20,
  verification: 15,
  availability: 10,
  reviews: 10
};

// Item priorities for suggestions (higher = more important)
const ITEM_PRIORITIES = {
  basicInfo: {
    profilePicture: 9,
    bio: 7,
    phoneVerified: 8,
    location: 6
  },
  services: {
    hasServices: 10,
    hasPrices: 8
  },
  portfolio: {
    hasPortfolioImages: 7
  },
  verification: {
    emailVerified: 10,
    idVerified: 9
  },
  availability: {
    hasSchedule: 5
  },
  reviews: {
    hasReviews: 3
  }
};

// Action URLs for suggestions
const SUGGESTION_ACTIONS = {
  basicInfo: {
    profilePicture: { url: '/profile/settings#picture', label: 'Upload Photo' },
    bio: { url: '/profile/settings#bio', label: 'Add Bio' },
    phoneVerified: { url: '/profile/settings#phone', label: 'Verify Phone' },
    location: { url: '/profile/settings#location', label: 'Set Location' }
  },
  services: {
    hasServices: { url: '/profile/services', label: 'Add Services' },
    hasPrices: { url: '/profile/services', label: 'Set Prices' }
  },
  portfolio: {
    hasPortfolioImages: { url: '/profile/portfolio', label: 'Add Portfolio' }
  },
  verification: {
    emailVerified: { url: '/profile/settings#email', label: 'Verify Email' },
    idVerified: { url: '/profile/verification', label: 'Verify ID' }
  },
  availability: {
    hasSchedule: { url: '/profile/availability', label: 'Set Schedule' }
  },
  reviews: {
    hasReviews: { url: null, label: null } // Can't directly control reviews
  }
};

/**
 * Calculate profile completeness for a user
 *
 * @param {string} userId - User ID to calculate completeness for
 * @returns {Promise<Object>} Profile completeness data
 */
const calculateCompleteness = async (userId) => {
  // Validate userId
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  // Fetch user with all relevant data
  const user = await User.findById(userId)
    .select('profilePicture bio isPhoneVerified isEmailVerified location skills availability workGalleryImages portfolio rating kyc role');

  if (!user) {
    throw new Error('User not found');
  }

  // Only calculate for technicians
  if (user.role !== 'technician') {
    throw new Error('Profile completeness is only available for technicians');
  }

  // Calculate each section
  const sections = {
    basicInfo: calculateBasicInfoSection(user),
    services: calculateServicesSection(user),
    portfolio: calculatePortfolioSection(user),
    verification: calculateVerificationSection(user),
    availability: calculateAvailabilitySection(user),
    reviews: calculateReviewsSection(user)
  };

  // Calculate total score
  let totalScore = 0;
  for (const [sectionName, section] of Object.entries(sections)) {
    totalScore += section.score * (section.weight / 100);
  }

  // Round to 1 decimal place
  totalScore = Math.round(totalScore * 10) / 10;

  // Generate suggestions for incomplete items
  const suggestions = generateSuggestions(sections);

  // Find or create profile completeness record
  let profileCompleteness = await ProfileCompleteness.findOne({ user: userId });

  if (!profileCompleteness) {
    profileCompleteness = new ProfileCompleteness({
      user: userId,
      score: 0,
      sections: {},
      suggestions: []
    });
  }

  // Update the record
  profileCompleteness.score = totalScore;
  profileCompleteness.sections = sections;
  profileCompleteness.suggestions = suggestions;
  profileCompleteness.recordScore();

  await profileCompleteness.save();

  return profileCompleteness;
};

/**
 * Calculate Basic Info section
 */
const calculateBasicInfoSection = (user) => {
  const items = [
    {
      name: 'profilePicture',
      label: 'Profile Picture',
      completed: !!user.profilePicture,
      completedAt: user.profilePicture ? new Date() : null
    },
    {
      name: 'bio',
      label: 'Professional Bio',
      completed: !!user.bio && user.bio.length >= 20,
      completedAt: user.bio ? new Date() : null
    },
    {
      name: 'phoneVerified',
      label: 'Phone Verified',
      completed: !!user.isPhoneVerified,
      completedAt: user.isPhoneVerified ? new Date() : null
    },
    {
      name: 'location',
      label: 'Location Set',
      completed: !!(user.location && user.location.coordinates && user.location.coordinates.length === 2),
      completedAt: user.location ? new Date() : null
    }
  ];

  const completedCount = items.filter(item => item.completed).length;
  const score = Math.round((completedCount / items.length) * 100);

  return {
    completed: completedCount === items.length,
    weight: SECTION_WEIGHTS.basicInfo,
    score,
    items
  };
};

/**
 * Calculate Services section
 */
const calculateServicesSection = (user) => {
  const skills = user.skills || [];
  const hasMinServices = skills.length >= 3;
  const hasPrices = skills.some(skill => skill.yearsOfExperience > 0);

  const items = [
    {
      name: 'hasServices',
      label: 'At Least 3 Services',
      completed: hasMinServices,
      completedAt: hasMinServices ? new Date() : null
    },
    {
      name: 'hasPrices',
      label: 'Service Prices Set',
      completed: hasPrices,
      completedAt: hasPrices ? new Date() : null
    }
  ];

  const completedCount = items.filter(item => item.completed).length;
  const score = Math.round((completedCount / items.length) * 100);

  return {
    completed: completedCount === items.length,
    weight: SECTION_WEIGHTS.services,
    score,
    items
  };
};

/**
 * Calculate Portfolio section
 */
const calculatePortfolioSection = (user) => {
  const workGalleryImages = user.workGalleryImages || [];
  const portfolio = user.portfolio || [];

  // Combine both portfolio sources
  const totalImages = workGalleryImages.length + portfolio.reduce((acc, p) => acc + (p.images?.length || 0), 0);
  const hasMinPortfolio = totalImages >= 5;

  const items = [
    {
      name: 'hasPortfolioImages',
      label: 'At Least 5 Portfolio Images',
      completed: hasMinPortfolio,
      completedAt: hasMinPortfolio ? new Date() : null
    }
  ];

  const completedCount = items.filter(item => item.completed).length;
  const score = Math.round((completedCount / items.length) * 100);

  return {
    completed: completedCount === items.length,
    weight: SECTION_WEIGHTS.portfolio,
    score,
    items
  };
};

/**
 * Calculate Verification section
 */
const calculateVerificationSection = (user) => {
  const items = [
    {
      name: 'emailVerified',
      label: 'Email Verified',
      completed: !!user.isEmailVerified,
      completedAt: user.isEmailVerified ? new Date() : null
    },
    {
      name: 'idVerified',
      label: 'ID Verified',
      completed: !!(user.kyc && user.kyc.verified),
      completedAt: user.kyc?.verified ? new Date() : null
    }
  ];

  const completedCount = items.filter(item => item.completed).length;
  const score = Math.round((completedCount / items.length) * 100);

  return {
    completed: completedCount === items.length,
    weight: SECTION_WEIGHTS.verification,
    score,
    items
  };
};

/**
 * Calculate Availability section
 */
const calculateAvailabilitySection = (user) => {
  const hasSchedule = !!(
    user.availability &&
    user.availability.schedule &&
    user.availability.schedule.length > 0
  );

  const items = [
    {
      name: 'hasSchedule',
      label: 'Availability Schedule Set',
      completed: hasSchedule,
      completedAt: hasSchedule ? new Date() : null
    }
  ];

  const completedCount = items.filter(item => item.completed).length;
  const score = Math.round((completedCount / items.length) * 100);

  return {
    completed: completedCount === items.length,
    weight: SECTION_WEIGHTS.availability,
    score,
    items
  };
};

/**
 * Calculate Reviews section (bonus)
 */
const calculateReviewsSection = (user) => {
  const hasReviews = !!(user.rating && user.rating.count > 0);

  const items = [
    {
      name: 'hasReviews',
      label: 'Has At Least 1 Review',
      completed: hasReviews,
      completedAt: hasReviews ? new Date() : null
    }
  ];

  const completedCount = items.filter(item => item.completed).length;
  const score = Math.round((completedCount / items.length) * 100);

  return {
    completed: completedCount === items.length,
    weight: SECTION_WEIGHTS.reviews,
    score,
    items
  };
};

/**
 * Generate suggestions for incomplete items
 */
const generateSuggestions = (sections) => {
  const suggestions = [];

  for (const [sectionName, section] of Object.entries(sections)) {
    for (const item of section.items) {
      if (!item.completed) {
        const priority = ITEM_PRIORITIES[sectionName]?.[item.name] || 5;
        const action = SUGGESTION_ACTIONS[sectionName]?.[item.name] || { url: null, label: null };

        suggestions.push({
          section: sectionName,
          item: item.name,
          label: item.label,
          priority,
          actionUrl: action.url,
          actionLabel: action.label
        });
      }
    }
  }

  // Sort by priority (highest first)
  return suggestions.sort((a, b) => b.priority - a.priority);
};

/**
 * Get suggestions for a user
 *
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of suggestions to return
 * @returns {Promise<Array>} List of suggestions
 */
const getSuggestions = async (userId, limit = 10) => {
  let profileCompleteness = await ProfileCompleteness.findOne({ user: userId });

  if (!profileCompleteness) {
    // Calculate if not exists
    profileCompleteness = await calculateCompleteness(userId);
  }

  // Check if recalculation is needed (older than 24 hours)
  const lastCalculated = new Date(profileCompleteness.lastCalculatedAt);
  const hoursSinceCalculation = (Date.now() - lastCalculated.getTime()) / (1000 * 60 * 60);

  if (hoursSinceCalculation > 24) {
    profileCompleteness = await calculateCompleteness(userId);
  }

  return profileCompleteness.suggestions.slice(0, limit);
};

/**
 * Get missing items for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of missing items
 */
const getMissingItems = async (userId) => {
  let profileCompleteness = await ProfileCompleteness.findOne({ user: userId });

  if (!profileCompleteness) {
    profileCompleteness = await calculateCompleteness(userId);
  }

  return profileCompleteness.getIncompleteItems();
};

/**
 * Get profile completeness for a user (with caching)
 *
 * @param {string} userId - User ID
 * @param {boolean} forceRecalculate - Force recalculation
 * @returns {Promise<Object>} Profile completeness data
 */
const getCompleteness = async (userId, forceRecalculate = false) => {
  let profileCompleteness = await ProfileCompleteness.findOne({ user: userId });

  const needsCalculation = forceRecalculate ||
    !profileCompleteness ||
    isStale(profileCompleteness);

  if (needsCalculation) {
    profileCompleteness = await calculateCompleteness(userId);
  }

  return profileCompleteness;
};

/**
 * Check if profile completeness data is stale (older than 24 hours)
 */
const isStale = (profileCompleteness) => {
  if (!profileCompleteness.lastCalculatedAt) return true;

  const lastCalculated = new Date(profileCompleteness.lastCalculatedAt);
  const hoursSinceCalculation = (Date.now() - lastCalculated.getTime()) / (1000 * 60 * 60);

  return hoursSinceCalculation > 24;
};

/**
 * Get completeness statistics for admin dashboard
 *
 * @returns {Promise<Object>} Statistics
 */
const getStatistics = async () => {
  const stats = await ProfileCompleteness.aggregate([
    {
      $group: {
        _id: null,
        averageScore: { $avg: '$score' },
        minScore: { $min: '$score' },
        maxScore: { $max: '$score' },
        totalProfiles: { $sum: 1 },
        completeProfiles: {
          $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] }
        }
      }
    }
  ]);

  const distribution = await ProfileCompleteness.getScoreDistribution();

  return {
    summary: stats[0] || {
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
      totalProfiles: 0,
      completeProfiles: 0
    },
    distribution
  };
};

/**
 * Batch calculate completeness for multiple users
 *
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Object>} Results
 */
const batchCalculate = async (userIds) => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const userId of userIds) {
    try {
      await calculateCompleteness(userId);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        userId,
        error: error.message
      });
    }
  }

  return results;
};

module.exports = {
  calculateCompleteness,
  getSuggestions,
  getMissingItems,
  getCompleteness,
  getStatistics,
  batchCalculate,
  SECTION_WEIGHTS,
  ITEM_PRIORITIES
};
