/**
 * Dynamic Pricing Service
 * Handles surge pricing, peak hours, and real-time price adjustments
 *
 * Task #74: Real-Time Pricing & Negotiation
 */

const Booking = require('../models/Booking');
const PricingConfig = require('../models/PricingConfig');
const redis = require('../config/redis');

// Cache keys for demand tracking
const DEMAND_CACHE_PREFIX = 'demand:';
const SURGE_CACHE_PREFIX = 'surge:';
const MARKET_RATES_PREFIX = 'market_rates:';

// Cache TTL in seconds
const CACHE_TTL = 300; // 5 minutes

// Peak hours in Kenya (hours in 24h format)
const MORNING_PEAK_START = 7;
const MORNING_PEAK_END = 9;
const EVENING_PEAK_START = 17; // 5 PM
const EVENING_PEAK_END = 19; // 7 PM

// Base peak hour multiplier
const PEAK_HOUR_MULTIPLIER = 1.1;

// Surge thresholds and multipliers
const SURGE_THRESHOLDS = [
  { threshold: 5, multiplier: 1.2, level: 'low' },
  { threshold: 10, multiplier: 1.3, level: 'moderate' },
  { threshold: 15, multiplier: 1.4, level: 'high' },
  { threshold: 20, multiplier: 1.5, level: 'severe' }
];

/**
 * Check if current time is within peak hours
 * @returns {Object} Peak hour information
 */
function isPeakHour(dateTime = new Date()) {
  const hour = dateTime.getHours();
  const isMorningPeak = hour >= MORNING_PEAK_START && hour < MORNING_PEAK_END;
  const isEveningPeak = hour >= EVENING_PEAK_START && hour < EVENING_PEAK_END;

  return {
    isPeak: isMorningPeak || isEveningPeak,
    peakType: isMorningPeak ? 'morning' : (isEveningPeak ? 'evening' : null),
    multiplier: (isMorningPeak || isEveningPeak) ? PEAK_HOUR_MULTIPLIER : 1.0
  };
}

/**
 * Get the current hour bucket for demand tracking
 * @returns {string} Hour bucket key
 */
function getCurrentHourBucket() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours()}`;
}

/**
 * Track a new booking for demand calculation
 * @param {string} category - Service category
 * @returns {Promise<number>} Updated booking count for the hour
 */
async function trackBooking(category) {
  try {
    const bucket = getCurrentHourBucket();
    const cacheKey = `${DEMAND_CACHE_PREFIX}${category}:${bucket}`;

    // Increment booking count in Redis
    let count;
    if (redis.isAvailable && redis.client) {
      count = await redis.client.incr(cacheKey);
      // Set expiry if this is a new key
      if (count === 1) {
        await redis.client.expire(cacheKey, CACHE_TTL * 12); // 1 hour
      }
    } else {
      // Fallback to database query if Redis not available
      const startOfHour = new Date();
      startOfHour.setMinutes(0, 0, 0);
      const endOfHour = new Date(startOfHour);
      endOfHour.setHours(endOfHour.getHours() + 1);

      count = await Booking.countDocuments({
        serviceCategory: category,
        createdAt: { $gte: startOfHour, $lt: endOfHour }
      });
      count += 1; // Include current booking
    }

    return count;
  } catch (error) {
    console.error('Error tracking booking demand:', error);
    return 0;
  }
}

/**
 * Get demand level for a category in the current hour
 * @param {string} category - Service category
 * @returns {Promise<number>} Number of active bookings
 */
async function getDemandLevel(category) {
  try {
    const bucket = getCurrentHourBucket();
    const cacheKey = `${DEMAND_CACHE_PREFIX}${category}:${bucket}`;

    if (redis.isAvailable && redis.client) {
      const count = await redis.client.get(cacheKey);
      return parseInt(count || '0', 10);
    }

    // Fallback to database query
    const startOfHour = new Date();
    startOfHour.setMinutes(0, 0, 0);
    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(endOfHour.getHours() + 1);

    return await Booking.countDocuments({
      serviceCategory: category,
      createdAt: { $gte: startOfHour, $lt: endOfHour }
    });
  } catch (error) {
    console.error('Error getting demand level:', error);
    return 0;
  }
}

/**
 * Calculate surge multiplier based on demand
 * @param {string} category - Service category
 * @param {Date} dateTime - Date/time for calculation
 * @param {number} demandLevel - Optional pre-calculated demand level
 * @returns {Promise<Object>} Surge information
 */
async function calculateSurge(category, dateTime = new Date(), demandLevel = null) {
  try {
    // Get demand level if not provided
    const demand = demandLevel !== null ? demandLevel : await getDemandLevel(category);

    // Find applicable surge level
    let surgeInfo = {
      active: false,
      multiplier: 1.0,
      level: 'none',
      demandLevel: demand,
      threshold: 0
    };

    // Check demand thresholds (highest matching threshold wins)
    for (const threshold of [...SURGE_THRESHOLDS].reverse()) {
      if (demand >= threshold.threshold) {
        surgeInfo = {
          active: true,
          multiplier: threshold.multiplier,
          level: threshold.level,
          demandLevel: demand,
          threshold: threshold.threshold
        };
        break;
      }
    }

    // Cache the surge info
    if (redis.isAvailable && redis.client) {
      const cacheKey = `${SURGE_CACHE_PREFIX}${category}`;
      await redis.client.setex(cacheKey, CACHE_TTL, JSON.stringify(surgeInfo));
    }

    return surgeInfo;
  } catch (error) {
    console.error('Error calculating surge:', error);
    return {
      active: false,
      multiplier: 1.0,
      level: 'none',
      demandLevel: 0,
      threshold: 0,
      error: error.message
    };
  }
}

/**
 * Get cached surge info or calculate fresh
 * @param {string} category - Service category
 * @returns {Promise<Object>} Surge information
 */
async function getSurgeInfo(category) {
  try {
    // Try cache first
    if (redis.isAvailable && redis.client) {
      const cacheKey = `${SURGE_CACHE_PREFIX}${category}`;
      const cached = await redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // Calculate fresh if not cached
    return await calculateSurge(category);
  } catch (error) {
    console.error('Error getting surge info:', error);
    return {
      active: false,
      multiplier: 1.0,
      level: 'none',
      demandLevel: 0,
      threshold: 0
    };
  }
}

/**
 * Calculate complete dynamic price for a service
 * @param {Object} params - Pricing parameters
 * @returns {Promise<Object>} Complete pricing breakdown
 */
async function calculateDynamicPrice(params) {
  const {
    serviceCategory,
    serviceType,
    urgency = 'medium',
    scheduledDateTime = new Date(),
    customerId,
    technicianId,
    basePrice: providedBasePrice,
    distanceFee = 0
  } = params;

  try {
    // Track this booking for demand
    await trackBooking(serviceCategory);

    // Get pricing configuration
    const pricingConfig = await PricingConfig.getActivePricing();
    if (!pricingConfig) {
      throw new Error('No active pricing configuration found');
    }

    // 1. Get base price
    let basePrice = providedBasePrice;
    if (!basePrice) {
      const servicePrice = pricingConfig.getServicePrice(serviceCategory, serviceType || 'general');
      basePrice = servicePrice ? servicePrice.basePrice : 1500; // Default fallback
    }

    // 2. Calculate surge multiplier
    const surgeInfo = await calculateSurge(serviceCategory, new Date(scheduledDateTime));

    // 3. Check for peak hours
    const peakInfo = isPeakHour(new Date(scheduledDateTime));

    // 4. Get urgency multiplier
    const urgencyMultiplier = pricingConfig.getUrgencyMultiplier(urgency);

    // 5. Get technician multiplier if technician specified
    let technicianMultiplier = 1.0;
    if (technicianId) {
      const User = require('../models/User');
      const technician = await User.findById(technicianId);
      if (technician) {
        technicianMultiplier = pricingConfig.getTechnicianMultiplier({
          experience: technician.experience || 0,
          rating: technician.rating?.average || 0,
          completedJobs: technician.stats?.completedBookings || 0
        });
      }
    }

    // 6. Calculate time-based multiplier (weekends, holidays)
    const timeMultiplier = pricingConfig.getTimeMultiplier(new Date(scheduledDateTime));

    // Combine all multipliers (surge and peak stack, but with diminishing returns)
    // Combined surge = 1 + (surge - 1) + (peak - 1) * 0.5 to avoid excessive pricing
    let combinedSurgeMultiplier = 1.0;
    if (surgeInfo.active || peakInfo.isPeak) {
      const surgeAdd = surgeInfo.active ? (surgeInfo.multiplier - 1) : 0;
      const peakAdd = peakInfo.isPeak ? (peakInfo.multiplier - 1) * 0.5 : 0;
      combinedSurgeMultiplier = 1 + surgeAdd + peakAdd;
    }

    // Final price calculation
    const adjustedBase = basePrice * combinedSurgeMultiplier * technicianMultiplier;
    const adjustedDistance = distanceFee * urgencyMultiplier;
    const subtotal = adjustedBase + adjustedDistance;
    const finalSubtotal = subtotal * timeMultiplier;

    // Apply min/max constraints
    const totalAmount = Math.max(
      pricingConfig.minBookingPrice || 500,
      Math.min(pricingConfig.maxBookingPrice || 100000, finalSubtotal)
    );

    // Calculate booking fee
    const bookingFeeResult = pricingConfig.calculateBookingFee(totalAmount);

    // Build detailed breakdown
    const breakdown = {
      basePrice,
      multipliers: {
        surge: surgeInfo.active ? surgeInfo.multiplier : 1.0,
        peakHour: peakInfo.isPeak ? peakInfo.multiplier : 1.0,
        urgency: urgencyMultiplier,
        technician: technicianMultiplier,
        timeBased: timeMultiplier,
        combinedSurge: combinedSurgeMultiplier
      },
      fees: {
        distance: distanceFee
      },
      surgeInfo: {
        active: surgeInfo.active,
        level: surgeInfo.level,
        demandLevel: surgeInfo.demandLevel,
        percentageIncrease: surgeInfo.active ? Math.round((surgeInfo.multiplier - 1) * 100) : 0
      },
      peakInfo: {
        isPeak: peakInfo.isPeak,
        peakType: peakInfo.peakType
      },
      subtotal: Math.round(subtotal * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      bookingFee: {
        amount: bookingFeeResult.feeAmount,
        percentage: bookingFeeResult.percentage,
        tierLabel: bookingFeeResult.tierLabel
      },
      currency: pricingConfig.currency || 'KES',
      calculatedAt: new Date().toISOString()
    };

    return {
      success: true,
      breakdown,
      configVersion: pricingConfig.version
    };
  } catch (error) {
    console.error('Error calculating dynamic price:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get market rates for all categories
 * @returns {Promise<Object>} Market rates by category
 */
async function getMarketRates() {
  try {
    const categories = ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding'];
    const rates = {};

    for (const category of categories) {
      const surgeInfo = await getSurgeInfo(category);
      const demandLevel = await getDemandLevel(category);

      rates[category] = {
        surgeActive: surgeInfo.active,
        surgeMultiplier: surgeInfo.multiplier,
        surgeLevel: surgeInfo.level,
        demandLevel,
        peakHour: isPeakHour().isPeak,
        lastUpdated: new Date().toISOString()
      };
    }

    return {
      success: true,
      rates,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting market rates:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get surge status for broadcasting
 * @returns {Promise<Object>} Surge alerts for active categories
 */
async function getSurgeAlerts() {
  try {
    const categories = ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding'];
    const alerts = [];

    for (const category of categories) {
      const surgeInfo = await getSurgeInfo(category);

      if (surgeInfo.active) {
        alerts.push({
          category,
          level: surgeInfo.level,
          multiplier: surgeInfo.multiplier,
          percentageIncrease: Math.round((surgeInfo.multiplier - 1) * 100),
          demandLevel: surgeInfo.demandLevel
        });
      }
    }

    return {
      success: true,
      alerts,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting surge alerts:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clear surge cache (for testing or admin override)
 * @param {string} category - Optional category to clear
 */
async function clearSurgeCache(category = null) {
  try {
    if (!redis.isAvailable || !redis.client) {
      return { success: false, message: 'Redis not available' };
    }

    if (category) {
      await redis.client.del(`${SURGE_CACHE_PREFIX}${category}`);
    } else {
      // Clear all surge cache keys
      const keys = await redis.client.keys(`${SURGE_CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.client.del(...keys);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing surge cache:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  // Core functions
  calculateDynamicPrice,
  calculateSurge,
  getSurgeInfo,
  getMarketRates,
  getSurgeAlerts,

  // Utility functions
  isPeakHour,
  getDemandLevel,
  trackBooking,

  // Admin functions
  clearSurgeCache,

  // Constants
  SURGE_THRESHOLDS,
  PEAK_HOUR_MULTIPLIER,
  MORNING_PEAK_START,
  MORNING_PEAK_END,
  EVENING_PEAK_START,
  EVENING_PEAK_END
};
