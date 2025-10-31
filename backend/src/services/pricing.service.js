const PricingConfig = require('../models/PricingConfig');
const User = require('../models/User');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate comprehensive price for a service booking
 * @param {Object} params - Pricing parameters
 * @param {String} params.serviceCategory - Service category
 * @param {String} params.serviceType - Specific service type
 * @param {String} params.urgency - Urgency level (low, medium, high, emergency)
 * @param {Object} params.serviceLocation - Service location coordinates
 * @param {Object} params.technicianLocation - Technician location coordinates (optional)
 * @param {String} params.technicianId - Technician ID (optional)
 * @param {Date} params.scheduledDateTime - When service is scheduled
 * @param {String} params.customerId - Customer ID
 * @param {Number} params.quantity - Quantity/units (for per_unit pricing)
 * @returns {Object} Detailed price breakdown
 */
async function calculatePrice(params) {
  try {
    const {
      serviceCategory,
      serviceType,
      urgency = 'medium',
      serviceLocation,
      technicianLocation,
      technicianId,
      scheduledDateTime = new Date(),
      customerId,
      quantity = 1
    } = params;

    // Get active pricing configuration
    const pricingConfig = await PricingConfig.getActivePricing();
    if (!pricingConfig) {
      throw new Error('No active pricing configuration found');
    }

    // Initialize price breakdown
    const breakdown = {
      basePrice: 0,
      distanceFee: 0,
      urgencyMultiplier: 1,
      timeMultiplier: 1,
      technicianMultiplier: 1,
      subtotal: 0,
      platformFee: 0,
      tax: 0,
      discount: 0,
      totalAmount: 0,
      technicianPayout: 0,
      bookingFee: 0,
      remainingAmount: 0,
      currency: pricingConfig.currency,
      details: {}
    };

    // 1. Get base service price (with fallback to 'general' if specific type not found)
    let servicePrice = pricingConfig.getServicePrice(serviceCategory, serviceType);

    // Fallback to 'general' service type if specific type not found
    if (!servicePrice) {
      console.log(`Service type '${serviceType}' not found in category '${serviceCategory}', using fallback 'general'`);
      servicePrice = pricingConfig.getServicePrice(serviceCategory, 'general');

      // If still not found, throw error (category might be invalid)
      if (!servicePrice) {
        throw new Error(`No pricing found for category '${serviceCategory}'. Please check the category name.`);
      }
    }

    breakdown.basePrice = servicePrice.basePrice * quantity;
    breakdown.details.servicePrice = {
      price: servicePrice.basePrice,
      unit: servicePrice.priceUnit,
      quantity,
      total: breakdown.basePrice,
      estimatedDuration: servicePrice.estimatedDuration
    };

    // 2. Calculate distance fee
    let distance = 0;
    if (pricingConfig.distancePricing.enabled && serviceLocation && technicianLocation) {
      const [serviceLon, serviceLat] = serviceLocation.coordinates;
      const [techLon, techLat] = technicianLocation.coordinates;

      distance = calculateDistance(serviceLat, serviceLon, techLat, techLon);

      // Check if within service range
      if (distance > pricingConfig.distancePricing.maxServiceDistance) {
        throw new Error(`Service location is ${distance}km away, exceeds maximum service distance of ${pricingConfig.distancePricing.maxServiceDistance}km`);
      }

      const distanceTier = pricingConfig.getDistanceTier(distance);
      if (distanceTier) {
        breakdown.distanceFee = distanceTier.flatFee + (distance * distanceTier.pricePerKm);
        breakdown.details.distance = {
          kilometers: distance,
          tier: {
            range: `${distanceTier.minDistance}-${distanceTier.maxDistance}km`,
            pricePerKm: distanceTier.pricePerKm,
            flatFee: distanceTier.flatFee
          },
          fee: breakdown.distanceFee
        };
      }
    }

    // 3. Auto-calculate urgency based on scheduled date if not provided
    let calculatedUrgency = urgency || 'medium';
    if (scheduledDateTime) {
      const scheduledDate = new Date(scheduledDateTime);
      const now = new Date();
      const hoursUntilService = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilService < 0) {
        calculatedUrgency = 'medium'; // Past date, use default
      } else if (hoursUntilService <= 4) {
        calculatedUrgency = 'emergency'; // Within 4 hours
      } else if (hoursUntilService <= 24) {
        calculatedUrgency = 'high'; // Within 24 hours
      } else if (hoursUntilService <= 72) {
        calculatedUrgency = 'medium'; // Within 3 days
      } else {
        calculatedUrgency = 'low'; // More than 3 days
      }

      console.log('Auto-calculated urgency:', {
        scheduledDateTime,
        hoursUntilService: Math.round(hoursUntilService * 10) / 10,
        calculatedUrgency
      });
    }

    breakdown.urgencyMultiplier = pricingConfig.getUrgencyMultiplier(calculatedUrgency);
    breakdown.details.urgency = {
      level: calculatedUrgency,
      multiplier: breakdown.urgencyMultiplier,
      autoCalculated: calculatedUrgency !== urgency
    };

    // 4. Get time-based multiplier
    const serviceDateTime = new Date(scheduledDateTime);
    breakdown.timeMultiplier = pricingConfig.getTimeMultiplier(serviceDateTime);
    breakdown.details.timing = {
      scheduledAt: serviceDateTime,
      multiplier: breakdown.timeMultiplier,
      isPeakTime: breakdown.timeMultiplier > 1
    };

    // 5. Get technician tier multiplier
    if (technicianId && pricingConfig.technicianTiers.enabled) {
      const technician = await User.findById(technicianId);
      if (technician) {
        const technicianData = {
          experience: technician.experience || 0,
          rating: technician.rating?.average || 0,
          completedJobs: technician.stats?.completedBookings || 0
        };

        breakdown.technicianMultiplier = pricingConfig.getTechnicianMultiplier(technicianData);
        breakdown.details.technician = {
          id: technician._id,
          name: `${technician.firstName} ${technician.lastName}`,
          tier: getTierName(pricingConfig, technicianData),
          multiplier: breakdown.technicianMultiplier,
          experience: technicianData.experience,
          rating: technicianData.rating
        };
      }
    }

    // 6. Calculate subtotal (apply all multipliers)
    const basePlusDistance = breakdown.basePrice + breakdown.distanceFee;
    breakdown.subtotal = basePlusDistance *
                        breakdown.urgencyMultiplier *
                        breakdown.timeMultiplier *
                        breakdown.technicianMultiplier;

    // 7. Calculate discount (applied to subtotal before platform fee/tax)
    if (customerId) {
      const customer = await User.findById(customerId);
      if (customer) {
        const customerData = {
          isFirstBooking: !customer.stats?.totalBookings || customer.stats.totalBookings === 0,
          totalBookings: customer.stats?.totalBookings || 0
        };

        breakdown.discount = pricingConfig.calculateDiscount(customerData, breakdown.subtotal);
        breakdown.details.discount = {
          applied: breakdown.discount > 0,
          amount: breakdown.discount,
          reasons: []
        };

        if (customerData.isFirstBooking && pricingConfig.discounts.firstTimeCustomer.enabled) {
          breakdown.details.discount.reasons.push('First-time customer discount');
        }
        if (breakdown.discount > 0 && !customerData.isFirstBooking) {
          breakdown.details.discount.reasons.push('Loyalty discount');
        }
      }
    }

    // 8. Calculate total amount (what customer pays)
    // Customer pays: subtotal - discount (NO platform fee or tax added)
    breakdown.totalAmount = breakdown.subtotal - breakdown.discount;

    console.log('=== PRICING CALCULATION DEBUG ===');
    console.log('Subtotal:', breakdown.subtotal);
    console.log('Discount:', breakdown.discount);
    console.log('Total Amount (before min/max):', breakdown.totalAmount);
    console.log('Min Booking Price:', pricingConfig.minBookingPrice);
    console.log('Max Booking Price:', pricingConfig.maxBookingPrice);

    // 9. Apply min/max constraints FIRST (before any dependent calculations)
    const originalTotalAmount = breakdown.totalAmount;
    if (breakdown.totalAmount < pricingConfig.minBookingPrice) {
      breakdown.totalAmount = pricingConfig.minBookingPrice;
      breakdown.details.priceAdjustment = {
        reason: 'Minimum booking price applied',
        originalPrice: originalTotalAmount,
        adjustedPrice: pricingConfig.minBookingPrice
      };
      console.log('⚠️ MIN PRICE APPLIED:', originalTotalAmount, '→', pricingConfig.minBookingPrice);
    } else if (breakdown.totalAmount > pricingConfig.maxBookingPrice) {
      breakdown.totalAmount = pricingConfig.maxBookingPrice;
      breakdown.details.priceAdjustment = {
        reason: 'Maximum booking price cap applied',
        originalPrice: originalTotalAmount,
        adjustedPrice: pricingConfig.maxBookingPrice
      };
      console.log('⚠️ MAX PRICE APPLIED:', originalTotalAmount, '→', pricingConfig.maxBookingPrice);
    } else {
      console.log('✅ No min/max adjustment needed');
    }
    console.log('Total Amount (after min/max):', breakdown.totalAmount);
    console.log('==================================');

    // 10. Calculate platform fee (deducted from technician's earnings) - AFTER min/max
    if (pricingConfig.platformFee.type === 'percentage') {
      breakdown.platformFee = (breakdown.totalAmount * pricingConfig.platformFee.value) / 100;
    } else {
      breakdown.platformFee = pricingConfig.platformFee.value;
    }

    breakdown.details.platformFee = {
      type: pricingConfig.platformFee.type,
      value: pricingConfig.platformFee.value,
      amount: breakdown.platformFee,
      note: 'Deducted from technician earnings'
    };

    // 11. Calculate tax (deducted from technician's earnings) - AFTER platform fee
    if (pricingConfig.tax.enabled) {
      // Tax is calculated on the platform fee (VAT on our service fee)
      breakdown.tax = (breakdown.platformFee * pricingConfig.tax.rate) / 100;
      breakdown.details.tax = {
        name: pricingConfig.tax.name,
        rate: pricingConfig.tax.rate,
        amount: breakdown.tax,
        note: 'VAT on platform fee, deducted from technician earnings'
      };
    }

    // 12. Calculate technician payout (what technician receives) - AFTER fees
    breakdown.technicianPayout = breakdown.totalAmount - breakdown.platformFee - breakdown.tax;

    // 13. Calculate booking fee (20% refundable deposit) - AFTER min/max adjustment
    const bookingFeePercentage = 20;
    breakdown.bookingFee = (breakdown.totalAmount * bookingFeePercentage) / 100;
    breakdown.remainingAmount = breakdown.totalAmount - breakdown.bookingFee;
    breakdown.details.bookingFee = {
      percentage: bookingFeePercentage,
      amount: breakdown.bookingFee,
      remainingAmount: breakdown.remainingAmount,
      description: 'Refundable booking deposit (required before matching)',
      refundable: true,
      heldInEscrow: true
    };

    // Round all prices to 2 decimal places
    breakdown.basePrice = Math.round(breakdown.basePrice * 100) / 100;
    breakdown.distanceFee = Math.round(breakdown.distanceFee * 100) / 100;
    breakdown.subtotal = Math.round(breakdown.subtotal * 100) / 100;
    breakdown.platformFee = Math.round(breakdown.platformFee * 100) / 100;
    breakdown.tax = Math.round(breakdown.tax * 100) / 100;
    breakdown.discount = Math.round(breakdown.discount * 100) / 100;
    breakdown.totalAmount = Math.round(breakdown.totalAmount * 100) / 100;
    breakdown.technicianPayout = Math.round(breakdown.technicianPayout * 100) / 100;
    breakdown.bookingFee = Math.round(breakdown.bookingFee * 100) / 100;
    breakdown.remainingAmount = Math.round(breakdown.remainingAmount * 100) / 100;

    return {
      success: true,
      breakdown,
      configVersion: pricingConfig.version
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get technician tier name based on their stats
 */
function getTierName(pricingConfig, technicianData) {
  if (!pricingConfig.technicianTiers.enabled) return 'Standard';

  const sortedTiers = [...pricingConfig.technicianTiers.tiers].sort(
    (a, b) => b.minExperience - a.minExperience
  );

  for (const tier of sortedTiers) {
    const meetsExperience = technicianData.experience >= tier.minExperience;
    const meetsRating = !tier.minRating || technicianData.rating >= tier.minRating;
    const meetsJobs = !tier.minCompletedJobs || technicianData.completedJobs >= tier.minCompletedJobs;

    if (meetsExperience && meetsRating && meetsJobs) {
      return tier.tierName;
    }
  }

  return 'Standard';
}

/**
 * Get price estimate without technician (for customer browsing)
 */
async function getEstimate(params) {
  const {
    serviceCategory,
    serviceType,
    urgency = 'medium',
    serviceLocation,
    customerLocation,
    scheduledDateTime = new Date(),
    customerId,
    quantity = 1
  } = params;

  // Use customer location as technician location for estimate
  return calculatePrice({
    serviceCategory,
    serviceType,
    urgency,
    serviceLocation,
    technicianLocation: customerLocation || serviceLocation,
    scheduledDateTime,
    customerId,
    quantity
  });
}

/**
 * Compare prices from multiple technicians
 */
async function compareTechnicianPrices(baseParams, technicianIds) {
  const prices = [];

  for (const technicianId of technicianIds) {
    const technician = await User.findById(technicianId)
      .select('firstName lastName rating experience stats location');

    if (!technician) continue;

    const result = await calculatePrice({
      ...baseParams,
      technicianId,
      technicianLocation: technician.location
    });

    if (result.success) {
      prices.push({
        technician: {
          id: technician._id,
          name: `${technician.firstName} ${technician.lastName}`,
          rating: technician.rating?.average || 0,
          completedJobs: technician.stats?.completedBookings || 0,
          experience: technician.experience || 0
        },
        pricing: result.breakdown,
        distance: result.breakdown.details.distance?.kilometers || 0
      });
    }
  }

  // Sort by total amount
  prices.sort((a, b) => a.pricing.totalAmount - b.pricing.totalAmount);

  return {
    success: true,
    comparisons: prices,
    cheapest: prices[0],
    mostExpensive: prices[prices.length - 1]
  };
}

/**
 * Get available services with prices for a category
 */
async function getServiceCatalog(category, customerLocation) {
  try {
    const pricingConfig = await PricingConfig.getActivePricing();
    if (!pricingConfig) {
      throw new Error('No active pricing configuration found');
    }

    const services = pricingConfig.servicePrices
      .filter(sp => sp.serviceCategory === category && sp.isActive)
      .map(service => ({
        serviceCategory: service.serviceCategory,
        serviceType: service.serviceType,
        basePrice: service.basePrice,
        priceUnit: service.priceUnit,
        estimatedDuration: service.estimatedDuration,
        description: service.description,
        priceRange: {
          min: service.basePrice,
          max: service.basePrice * 2.5 // Approximate max with multipliers
        }
      }));

    return {
      success: true,
      services,
      category,
      currency: pricingConfig.currency
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  calculatePrice,
  getEstimate,
  compareTechnicianPrices,
  getServiceCatalog,
  calculateDistance
};
