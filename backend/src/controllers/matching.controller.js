const Matching = require('../models/Matching');
const MatchingPreference = require('../models/MatchingPreference');
const MatchingInteraction = require('../models/MatchingInteraction');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get smart-matched technician recommendations for a service request
 * @route   POST /api/v1/matching/find-technicians
 * @access  Private (Customer)
 */
exports.findTechnicians = async (req, res) => {
  try {
    const {
      serviceCategory,
      location,
      urgency = 'medium',
      budget,
      preferredDate,
      description
    } = req.body;

    const customerId = req.user.id;

    // Get user preferences
    const preferences = await MatchingPreference.getOrCreate(customerId);

    // Create matching interaction record for analytics
    const sessionId = uuidv4();
    const matchingInteraction = new MatchingInteraction({
      user: customerId,
      interactionType: 'matching',
      sessionId,
      input: {
        type: 'structured_data',
        data: { serviceCategory, location, urgency, budget, preferredDate, description }
      },
      processing: {
        startTime: new Date(),
        status: 'processing'
      }
    });

    // Find available technicians with the required skill
    const techniciansQuery = {
      role: 'technician',
      status: 'active', // Fixed: status is a string, not nested object
      'skills.category': serviceCategory,
      'location.coordinates': { $exists: true, $ne: null } // Ensure location exists
    };

    console.log('Finding technicians with query:', JSON.stringify(techniciansQuery, null, 2));
    console.log('Service category:', serviceCategory);
    console.log('Location:', location);

    // First, let's count total technicians
    const totalTechsCount = await User.countDocuments({ role: 'technician' });
    console.log(`Total technicians in database: ${totalTechsCount}`);

    // Apply preference filters
    // Only apply minRating filter if it's greater than 0
    // This allows new technicians without ratings to show up
    if (preferences.technicianPreferences.minRating && preferences.technicianPreferences.minRating > 0) {
      // Include technicians with no ratings (count: 0) OR ratings >= minRating
      techniciansQuery.$or = [
        { 'rating.count': 0 }, // New technicians with no ratings
        { 'rating.average': { $gte: preferences.technicianPreferences.minRating } } // Rated technicians meeting minimum
      ];
      console.log('Added minRating filter:', preferences.technicianPreferences.minRating, '(allowing unrated technicians)');
    }

    if (preferences.technicianPreferences.requireCertifications) {
      techniciansQuery['certifications.0'] = { $exists: true };
      console.log('Added certifications filter');
    }

    if (preferences.technicianPreferences.requireBackgroundCheck) {
      techniciansQuery['verification.backgroundCheck'] = true;
      console.log('Added background check filter');
    }

    if (preferences.technicianPreferences.requireInsurance) {
      techniciansQuery['verification.insurance'] = true;
      console.log('Added insurance filter');
    }

    console.log('Final query:', JSON.stringify(techniciansQuery, null, 2));

    // Find technicians
    let technicians = await User.find(techniciansQuery)
      .select('firstName lastName profilePicture rating skills location availability hourlyRate yearsOfExperience completedJobs avgResponseTime completionRate')
      .lean();

    console.log(`Found ${technicians.length} technicians matching query`);

    if (technicians.length > 0) {
      console.log('Technicians found:');
      technicians.forEach(t => {
        console.log(`  - ${t.firstName} ${t.lastName}: skills=${JSON.stringify(t.skills)}, location=${JSON.stringify(t.location)}`);
      });
    }

    // Calculate distances and filter by max distance
    const maxDistance = preferences.general.maxDistance || 50;
    console.log(`Max distance setting: ${maxDistance} km`);
    console.log(`Customer location coordinates:`, location?.coordinates);

    technicians = technicians.filter(tech => {
      if (!tech.location?.coordinates || !location?.coordinates) {
        console.log(`Technician ${tech._id} skipped - missing location coordinates`);
        console.log(`  Tech location:`, tech.location);
        console.log(`  Customer location:`, location);
        return false;
      }

      const distance = calculateDistance(
        location.coordinates[1], location.coordinates[0],
        tech.location.coordinates[1], tech.location.coordinates[0]
      );

      tech.distance = distance;
      const withinRange = distance <= maxDistance;
      console.log(`Technician ${tech._id}: ${tech.firstName} ${tech.lastName} - ${distance}km away - ${withinRange ? 'INCLUDED' : 'EXCLUDED'}`);
      return withinRange;
    });

    console.log(`After distance filter: ${technicians.length} technicians`);

    // Check for blocked technicians
    const blockedIds = preferences.learnedPreferences.blockedTechnicians.map(
      b => b.technician.toString()
    );
    technicians = technicians.filter(tech => !blockedIds.includes(tech._id.toString()));

    console.log(`After blocked filter: ${technicians.length} technicians`);

    // Calculate match scores for each technician
    const matches = [];
    for (const technician of technicians) {
      const context = {
        serviceCategory,
        location,
        urgency,
        budget,
        distance: technician.distance
      };

      // Use custom weights if available
      const scoring = Matching.calculateMatchScore(
        { id: customerId },
        technician,
        context
      );

      // Get technician subscription boost
      const techUser = await User.findById(technician._id);
      const boostMultiplier = techUser.getBoostMultiplier();
      const isPro = techUser.isPro();

      // Apply pro boost to overall score
      const boostedScore = scoring.scores.overall * boostMultiplier;

      // Add pro reason if applicable
      const matchReasons = generateMatchReasons(scoring.scores, technician);
      if (isPro) {
        matchReasons.unshift({
          reason: techUser.subscription.plan === 'premium' ? 'Premium Verified Technician' : 'Pro Verified Technician',
          weight: boostMultiplier - 1.0,
          score: 100,
          isPro: true
        });
      }

      // Create matching record
      const matching = new Matching({
        customer: customerId,
        technician: technician._id,
        serviceCategory,
        location,
        urgency,
        scores: {
          ...scoring.scores,
          overall: boostedScore, // Use boosted score
          baseScore: scoring.scores.overall, // Store original score
          proBoost: boostMultiplier
        },
        distance: technician.distance,
        algorithm: {
          version: '1.1',
          model: 'weighted_scoring_with_subscription_boost',
          factors: scoring.weights,
          boostApplied: isPro,
          boostMultiplier
        },
        matchReasons
      });

      await matching.save();
      matches.push(matching);
    }

    console.log(`Created ${matches.length} match records`);

    // Sort by overall score (now includes pro boost)
    matches.sort((a, b) => b.scores.overall - a.scores.overall);

    // Take top matches
    const topMatches = matches.slice(0, 10);

    console.log(`Returning top ${topMatches.length} matches`);

    // Populate technician details
    await Matching.populate(topMatches, {
      path: 'technician',
      select: 'firstName lastName profilePicture rating skills location availability hourlyRate yearsOfExperience completedJobs subscription'
    });

    // Update matching interaction with results
    matchingInteraction.processing.endTime = new Date();
    matchingInteraction.processing.status = 'completed';
    matchingInteraction.output = {
      type: 'recommendation',
      data: {
        matchCount: topMatches.length,
        topScore: topMatches[0]?.scores.overall || 0
      },
      confidence: topMatches[0]?.scores.overall / 100 || 0
    };
    await matchingInteraction.save();

    // Update preference stats
    preferences.lastMatchRequest = new Date();
    preferences.totalMatches += topMatches.length;
    await preferences.save();

    const response = {
      success: true,
      count: topMatches.length,
      data: topMatches,
      sessionId,
      preferences: {
        maxDistance: preferences.general.maxDistance,
        minRating: preferences.technicianPreferences.minRating
      }
    };

    console.log('Sending response with', topMatches.length, 'matches');
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in findTechnicians:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error finding technicians',
      error: error.message
    });
  }
};

/**
 * @desc    Get matching details
 * @route   GET /api/v1/matching/:id
 * @access  Private
 */
exports.getMatching = async (req, res) => {
  try {
    const matching = await Matching.findById(req.params.id)
      .populate('customer', 'firstName lastName profilePicture')
      .populate('technician', 'firstName lastName profilePicture rating skills location availability hourlyRate yearsOfExperience completedJobs');

    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    // Check authorization
    if (matching.customer._id.toString() !== req.user.id &&
        matching.technician._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this matching'
      });
    }

    // Mark as viewed if customer is viewing
    if (matching.customer._id.toString() === req.user.id && matching.status === 'suggested') {
      await matching.markAsViewed();
    }

    res.status(200).json({
      success: true,
      data: matching
    });
  } catch (error) {
    console.error('Error in getMatching:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matching details',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's active matches
 * @route   GET /api/v1/matching/my-matches
 * @access  Private
 */
exports.getMyMatches = async (req, res) => {
  try {
    const { serviceCategory, status } = req.query;

    const options = {};
    if (serviceCategory) options.serviceCategory = serviceCategory;
    if (status) options.status = status;

    const matches = await Matching.getActiveMatches(req.user.id, options);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('Error in getMyMatches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message
    });
  }
};

/**
 * @desc    Accept a match and create booking
 * @route   POST /api/v1/matching/:id/accept
 * @access  Private (Customer)
 */
exports.acceptMatch = async (req, res) => {
  try {
    const matching = await Matching.findById(req.params.id);

    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    // Check authorization
    if (matching.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { scheduledDate, scheduledTime, description, estimatedDuration, serviceType, quantity } = req.body;

    // Parse the time to calculate end time
    const [hours, minutes] = scheduledTime.split(':');
    const startDate = new Date(scheduledDate);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);

    const durationMinutes = estimatedDuration || 120; // default 2 hours
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    // Calculate pricing with technician
    const pricingService = require('../services/pricing.service');
    const User = require('../models/User');

    const technician = await User.findById(matching.technician);

    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const pricingParams = {
      serviceCategory: matching.serviceCategory,
      serviceType: serviceType || `${matching.serviceCategory}_general`,
      urgency: matching.urgency || 'medium',
      serviceLocation: matching.location,
      technicianLocation: technician?.location,
      technicianId: matching.technician,
      scheduledDateTime: scheduledDateTime.toISOString(),
      customerId: matching.customer,
      quantity: quantity || 1
    };

    console.log('=== MATCH ACCEPTANCE PRICING PARAMS ===');
    console.log('Service Category:', pricingParams.serviceCategory);
    console.log('Service Type:', pricingParams.serviceType);
    console.log('Urgency:', pricingParams.urgency);
    console.log('Quantity:', pricingParams.quantity);
    console.log('Scheduled DateTime:', pricingParams.scheduledDateTime);
    console.log('Customer ID:', pricingParams.customerId);
    console.log('Technician ID:', pricingParams.technicianId);
    console.log('========================================');

    const pricingResult = await pricingService.calculatePrice(pricingParams);

    console.log('=== MATCH ACCEPTANCE PRICING RESULT ===');
    console.log('Pricing Success:', pricingResult.success);
    console.log('Base Price:', pricingResult.breakdown?.basePrice);
    console.log('Distance Fee:', pricingResult.breakdown?.distanceFee);
    console.log('Urgency Multiplier:', pricingResult.breakdown?.urgencyMultiplier);
    console.log('Time Multiplier:', pricingResult.breakdown?.timeMultiplier);
    console.log('Technician Multiplier:', pricingResult.breakdown?.technicianMultiplier);
    console.log('Subtotal:', pricingResult.breakdown?.subtotal);
    console.log('Discount:', pricingResult.breakdown?.discount);
    console.log('Total Amount:', pricingResult.breakdown?.totalAmount);
    console.log('Booking Fee:', pricingResult.breakdown?.bookingFee);
    console.log('========================================');

    if (!pricingResult.success || !pricingResult.breakdown.bookingFee || pricingResult.breakdown.bookingFee <= 0) {
      console.error('ERROR: Failed to calculate pricing for match acceptance');
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate booking price. Please try again.',
        error: pricingResult.error || 'Booking fee not calculated'
      });
    }

    // Create booking from match
    const booking = new Booking({
      customer: matching.customer,
      technician: matching.technician,
      serviceCategory: matching.serviceCategory,
      serviceType: serviceType || `${matching.serviceCategory} service`,
      description: description || 'Booking from AI match',
      serviceLocation: matching.location,
      urgency: matching.urgency,
      timeSlot: {
        date: scheduledDate,
        startTime: scheduledTime,
        endTime: endTime,
        estimatedDuration: durationMinutes
      },
      pricing: pricingResult.breakdown,
      bookingFee: {
        required: true,
        percentage: 20,
        amount: pricingResult.breakdown.bookingFee,
        status: 'pending'
      },
      source: 'ai_matching',
      status: 'assigned'
    });

    console.log('=== MATCH BOOKING DATA DEBUG ===');
    console.log('Booking Fee Amount:', booking.bookingFee.amount);
    console.log('Pricing Total:', booking.pricing.totalAmount);
    console.log('================================');

    await booking.save();

    // Update matching record
    await matching.acceptMatch(booking._id);

    // Update preferences
    const preferences = await MatchingPreference.findOne({ user: req.user.id });
    if (preferences) {
      preferences.successfulBookings++;
      await preferences.save();
    }

    res.status(201).json({
      success: true,
      message: 'Match accepted and booking created',
      data: {
        matching,
        booking
      }
    });
  } catch (error) {
    console.error('Error in acceptMatch:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting match',
      error: error.message
    });
  }
};

/**
 * @desc    Reject a match
 * @route   POST /api/v1/matching/:id/reject
 * @access  Private (Customer)
 */
exports.rejectMatch = async (req, res) => {
  try {
    const matching = await Matching.findById(req.params.id);

    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    // Check authorization
    if (matching.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { reason } = req.body;
    await matching.rejectMatch(reason);

    res.status(200).json({
      success: true,
      message: 'Match rejected',
      data: matching
    });
  } catch (error) {
    console.error('Error in rejectMatch:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting match',
      error: error.message
    });
  }
};

/**
 * @desc    Add feedback to a match
 * @route   POST /api/v1/matching/:id/feedback
 * @access  Private
 */
exports.addMatchFeedback = async (req, res) => {
  try {
    const matching = await Matching.findById(req.params.id);

    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    // Check authorization
    if (matching.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { helpful, rating, accuracy, comment } = req.body;
    await matching.addFeedback({ helpful, rating, accuracy, comment });

    // Update preferences based on feedback
    const preferences = await MatchingPreference.findOne({ user: req.user.id });
    if (preferences) {
      await preferences.updateFromFeedback(matching, { helpful, rating, accuracy, comment });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback added',
      data: matching
    });
  } catch (error) {
    console.error('Error in addMatchFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding feedback',
      error: error.message
    });
  }
};

/**
 * @desc    Get or create user matching preferences
 * @route   GET /api/v1/matching/preferences
 * @access  Private
 */
exports.getPreferences = async (req, res) => {
  try {
    const preferences = await MatchingPreference.getOrCreate(req.user.id);

    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error in getPreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

/**
 * @desc    Update user matching preferences
 * @route   PUT /api/v1/matching/preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res) => {
  try {
    let preferences = await MatchingPreference.findOne({ user: req.user.id });

    if (!preferences) {
      preferences = new MatchingPreference({ user: req.user.id });
    }

    // Update fields
    const allowedFields = ['general', 'technicianPreferences', 'scheduling', 'communication', 'ai', 'customWeights'];
    allowedFields.forEach(field => {
      if (req.body[field]) {
        preferences[field] = { ...preferences[field], ...req.body[field] };
      }
    });

    // Normalize weights if custom weights were updated
    if (req.body.customWeights) {
      preferences.normalizeWeights();
    }

    await preferences.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated',
      data: preferences
    });
  } catch (error) {
    console.error('Error in updatePreferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

/**
 * @desc    Block a technician
 * @route   POST /api/v1/matching/block/:technicianId
 * @access  Private
 */
exports.blockTechnician = async (req, res) => {
  try {
    const preferences = await MatchingPreference.getOrCreate(req.user.id);
    const { reason } = req.body;

    await preferences.blockTechnician(req.params.technicianId, reason);

    res.status(200).json({
      success: true,
      message: 'Technician blocked',
      data: preferences
    });
  } catch (error) {
    console.error('Error in blockTechnician:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking technician',
      error: error.message
    });
  }
};

/**
 * @desc    Unblock a technician
 * @route   DELETE /api/v1/matching/block/:technicianId
 * @access  Private
 */
exports.unblockTechnician = async (req, res) => {
  try {
    const preferences = await MatchingPreference.getOrCreate(req.user.id);

    await preferences.unblockTechnician(req.params.technicianId);

    res.status(200).json({
      success: true,
      message: 'Technician unblocked',
      data: preferences
    });
  } catch (error) {
    console.error('Error in unblockTechnician:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking technician',
      error: error.message
    });
  }
};

// Helper functions

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Generate human-readable reasons for match
 * @param {Object} scores - Match scores
 * @param {Object} technician - Technician data
 * @returns {Array} Array of match reasons
 */
function generateMatchReasons(scores, technician) {
  const reasons = [];

  if (scores.skillMatch >= 90) {
    reasons.push({
      reason: 'Expert in required service category',
      weight: 0.25,
      score: scores.skillMatch
    });
  } else if (scores.skillMatch >= 75) {
    reasons.push({
      reason: 'Highly skilled in required service',
      weight: 0.25,
      score: scores.skillMatch
    });
  }

  if (scores.locationProximity >= 85) {
    reasons.push({
      reason: 'Very close to your location',
      weight: 0.20,
      score: scores.locationProximity
    });
  }

  if (scores.availability >= 90) {
    reasons.push({
      reason: 'Immediately available',
      weight: 0.15,
      score: scores.availability
    });
  }

  if (scores.rating >= 80) {
    reasons.push({
      reason: `Highly rated (${technician.rating}/5.0)`,
      weight: 0.15,
      score: scores.rating
    });
  }

  if (scores.experienceLevel >= 80) {
    reasons.push({
      reason: `${technician.yearsOfExperience}+ years of experience`,
      weight: 0.10,
      score: scores.experienceLevel
    });
  }

  if (scores.completionRate >= 85) {
    reasons.push({
      reason: 'High job completion rate',
      weight: 0.03,
      score: scores.completionRate
    });
  }

  if (scores.responseTime >= 85) {
    reasons.push({
      reason: 'Fast response time',
      weight: 0.05,
      score: scores.responseTime
    });
  }

  return reasons;
}
