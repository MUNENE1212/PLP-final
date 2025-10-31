const PricingConfig = require('../models/PricingConfig');
const pricingService = require('../services/pricing.service');
const User = require('../models/User');

/**
 * @desc    Calculate price for a service
 * @route   POST /api/v1/pricing/calculate
 * @access  Private
 */
exports.calculatePrice = async (req, res) => {
  try {
    const {
      serviceCategory,
      serviceType,
      urgency,
      serviceLocation,
      technicianId,
      scheduledDateTime,
      quantity
    } = req.body;

    // Validate required fields
    if (!serviceCategory || !serviceType || !serviceLocation) {
      return res.status(400).json({
        success: false,
        message: 'Service category, type, and location are required'
      });
    }

    // Get technician location if technicianId provided
    let technicianLocation;
    if (technicianId) {
      const technician = await User.findById(technicianId);
      if (technician && technician.location) {
        technicianLocation = technician.location;
      }
    }

    const result = await pricingService.calculatePrice({
      serviceCategory,
      serviceType,
      urgency,
      serviceLocation,
      technicianLocation,
      technicianId,
      scheduledDateTime,
      customerId: req.user.id,
      quantity
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      pricing: result.breakdown,
      configVersion: result.configVersion
    });

  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating price',
      error: error.message
    });
  }
};

/**
 * @desc    Get price estimate (without specific technician)
 * @route   POST /api/v1/pricing/estimate
 * @access  Private
 */
exports.getEstimate = async (req, res) => {
  try {
    const {
      serviceCategory,
      serviceType,
      urgency,
      serviceLocation,
      scheduledDateTime,
      quantity
    } = req.body;

    if (!serviceCategory || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Service category and type are required'
      });
    }

    // Get customer location for distance estimate
    const customer = await User.findById(req.user.id);
    const customerLocation = customer?.location || serviceLocation;

    const result = await pricingService.getEstimate({
      serviceCategory,
      serviceType,
      urgency,
      serviceLocation,
      customerLocation,
      scheduledDateTime,
      customerId: req.user.id,
      quantity
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      estimate: result.breakdown,
      note: 'This is an estimate. Final price may vary based on assigned technician.',
      configVersion: result.configVersion
    });

  } catch (error) {
    console.error('Get estimate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting price estimate',
      error: error.message
    });
  }
};

/**
 * @desc    Compare prices from multiple technicians
 * @route   POST /api/v1/pricing/compare
 * @access  Private
 */
exports.comparePrices = async (req, res) => {
  try {
    const {
      serviceCategory,
      serviceType,
      urgency,
      serviceLocation,
      scheduledDateTime,
      technicianIds,
      quantity
    } = req.body;

    if (!serviceCategory || !serviceType || !technicianIds || technicianIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Service details and technician IDs are required'
      });
    }

    const baseParams = {
      serviceCategory,
      serviceType,
      urgency,
      serviceLocation,
      scheduledDateTime,
      customerId: req.user.id,
      quantity
    };

    const result = await pricingService.compareTechnicianPrices(baseParams, technicianIds);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Compare prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing prices',
      error: error.message
    });
  }
};

/**
 * @desc    Get service catalog with prices for a category
 * @route   GET /api/v1/pricing/catalog/:category
 * @access  Public
 */
exports.getServiceCatalog = async (req, res) => {
  try {
    const { category } = req.params;

    const validCategories = ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service category'
      });
    }

    const result = await pricingService.getServiceCatalog(category);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Get service catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service catalog',
      error: error.message
    });
  }
};

/**
 * @desc    Get active pricing configuration
 * @route   GET /api/v1/pricing/config
 * @access  Private (Admin only)
 */
exports.getPricingConfig = async (req, res) => {
  try {
    const config = await PricingConfig.getActivePricing();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found'
      });
    }

    res.status(200).json({
      success: true,
      config
    });

  } catch (error) {
    console.error('Get pricing config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing configuration',
      error: error.message
    });
  }
};

/**
 * @desc    Create or update pricing configuration
 * @route   POST /api/v1/pricing/config
 * @access  Private (Admin only)
 */
exports.createPricingConfig = async (req, res) => {
  try {
    const configData = req.body;

    // Check if there's an active config
    const activeConfig = await PricingConfig.getActivePricing();

    if (activeConfig) {
      // Clone and create new version
      const newConfig = await activeConfig.cloneForNewVersion();

      // Update with new data
      Object.assign(newConfig, configData);
      newConfig.lastModifiedBy = req.user.id;

      await newConfig.save();

      return res.status(201).json({
        success: true,
        message: 'New pricing configuration version created',
        config: newConfig
      });
    }

    // Create first config
    const config = await PricingConfig.create({
      ...configData,
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Pricing configuration created successfully',
      config
    });

  } catch (error) {
    console.error('Create pricing config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating pricing configuration',
      error: error.message
    });
  }
};

/**
 * @desc    Update pricing configuration
 * @route   PUT /api/v1/pricing/config/:id
 * @access  Private (Admin only)
 */
exports.updatePricingConfig = async (req, res) => {
  try {
    const config = await PricingConfig.findById(req.params.id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Pricing configuration not found'
      });
    }

    // Update config
    Object.assign(config, req.body);
    config.lastModifiedBy = req.user.id;

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Pricing configuration updated successfully',
      config
    });

  } catch (error) {
    console.error('Update pricing config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing configuration',
      error: error.message
    });
  }
};

/**
 * @desc    Add service price to configuration
 * @route   POST /api/v1/pricing/config/:id/services
 * @access  Private (Admin only)
 */
exports.addServicePrice = async (req, res) => {
  try {
    const { serviceCategory, serviceType, basePrice, priceUnit, estimatedDuration, description } = req.body;

    const config = await PricingConfig.findById(req.params.id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Pricing configuration not found'
      });
    }

    // Check if service already exists
    const existingService = config.servicePrices.find(sp =>
      sp.serviceCategory === serviceCategory && sp.serviceType === serviceType
    );

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service price already exists'
      });
    }

    config.servicePrices.push({
      serviceCategory,
      serviceType,
      basePrice,
      priceUnit,
      estimatedDuration,
      description,
      isActive: true
    });

    config.lastModifiedBy = req.user.id;
    await config.save();

    res.status(201).json({
      success: true,
      message: 'Service price added successfully',
      config
    });

  } catch (error) {
    console.error('Add service price error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding service price',
      error: error.message
    });
  }
};

/**
 * @desc    Update service price
 * @route   PUT /api/v1/pricing/config/:id/services/:serviceCategory/:serviceType
 * @access  Private (Admin only)
 */
exports.updateServicePrice = async (req, res) => {
  try {
    const { serviceCategory, serviceType } = req.params;
    const updates = req.body;

    const config = await PricingConfig.findById(req.params.id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Pricing configuration not found'
      });
    }

    const serviceIndex = config.servicePrices.findIndex(sp =>
      sp.serviceCategory === serviceCategory && sp.serviceType === serviceType
    );

    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service price not found'
      });
    }

    Object.assign(config.servicePrices[serviceIndex], updates);
    config.lastModifiedBy = req.user.id;

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Service price updated successfully',
      servicePrice: config.servicePrices[serviceIndex]
    });

  } catch (error) {
    console.error('Update service price error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service price',
      error: error.message
    });
  }
};

/**
 * @desc    Get available service types for a category
 * @route   GET /api/v1/pricing/service-types/:category
 * @access  Public
 */
exports.getServiceTypes = async (req, res) => {
  try {
    const { category } = req.params;

    const validCategories = ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service category'
      });
    }

    const config = await PricingConfig.getActivePricing();
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found'
      });
    }

    // Get all active services for the category
    const serviceTypes = config.servicePrices
      .filter(sp => sp.serviceCategory === category && sp.isActive)
      .map(sp => ({
        serviceType: sp.serviceType,
        description: sp.description,
        basePrice: sp.basePrice,
        priceUnit: sp.priceUnit,
        estimatedDuration: sp.estimatedDuration,
        isGeneral: sp.serviceType === 'general'
      }))
      .sort((a, b) => {
        // Put 'general' at the end
        if (a.isGeneral) return 1;
        if (b.isGeneral) return -1;
        return a.serviceType.localeCompare(b.serviceType);
      });

    res.status(200).json({
      success: true,
      category,
      serviceTypes,
      count: serviceTypes.length
    });

  } catch (error) {
    console.error('Get service types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service types',
      error: error.message
    });
  }
};

/**
 * @desc    Validate service type and get suggestions
 * @route   POST /api/v1/pricing/validate-service
 * @access  Public
 */
exports.validateServiceType = async (req, res) => {
  try {
    const { serviceCategory, serviceType } = req.body;

    if (!serviceCategory || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Service category and type are required'
      });
    }

    const config = await PricingConfig.getActivePricing();
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found'
      });
    }

    // Check if exact match exists
    const exactMatch = config.getServicePrice(serviceCategory, serviceType);

    if (exactMatch) {
      return res.status(200).json({
        success: true,
        valid: true,
        match: {
          serviceType: exactMatch.serviceType,
          description: exactMatch.description,
          basePrice: exactMatch.basePrice,
          priceUnit: exactMatch.priceUnit
        },
        suggestions: []
      });
    }

    // No exact match - provide suggestions based on fuzzy matching
    const categoryServices = config.servicePrices
      .filter(sp => sp.serviceCategory === serviceCategory && sp.isActive && sp.serviceType !== 'general');

    // Calculate similarity scores
    const suggestions = categoryServices
      .map(sp => ({
        serviceType: sp.serviceType,
        description: sp.description,
        basePrice: sp.basePrice,
        priceUnit: sp.priceUnit,
        similarity: calculateSimilarity(serviceType.toLowerCase(), sp.serviceType.toLowerCase())
      }))
      .filter(s => s.similarity > 0.3) // Only show somewhat relevant suggestions
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Top 5 suggestions

    // Get the general fallback option
    const generalFallback = config.getServicePrice(serviceCategory, 'general');

    res.status(200).json({
      success: true,
      valid: false,
      requestedServiceType: serviceType,
      message: `Service type '${serviceType}' not found. Please select from suggestions or use general ${serviceCategory} service.`,
      suggestions,
      fallback: generalFallback ? {
        serviceType: 'general',
        description: generalFallback.description,
        basePrice: generalFallback.basePrice,
        priceUnit: generalFallback.priceUnit,
        note: 'This is a fallback option that will be used if no specific service is selected'
      } : null
    });

  } catch (error) {
    console.error('Validate service type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating service type',
      error: error.message
    });
  }
};

/**
 * Simple string similarity calculator (Levenshtein distance-based)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  // Check for substring match
  if (longer.includes(shorter)) return 0.8;

  // Check for word overlap
  const words1 = str1.split(/[\s_-]+/);
  const words2 = str2.split(/[\s_-]+/);
  const commonWords = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2)));
  if (commonWords.length > 0) {
    return 0.6 + (commonWords.length / Math.max(words1.length, words2.length)) * 0.3;
  }

  // Levenshtein distance
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * @desc    Get pricing configuration history
 * @route   GET /api/v1/pricing/config/history
 * @access  Private (Admin only)
 */
exports.getConfigHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const configs = await PricingConfig.find()
      .sort({ version: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    const total = await PricingConfig.countDocuments();

    res.status(200).json({
      success: true,
      count: configs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      configs
    });

  } catch (error) {
    console.error('Get config history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching configuration history',
      error: error.message
    });
  }
};

module.exports = exports;
