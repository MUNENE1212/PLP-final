/**
 * Fee Configuration Controller
 *
 * Handles admin fee configuration management including booking fee tiers.
 * Provides endpoints to view, update, and preview fee calculations.
 *
 * @module controllers/feeConfig
 */

const PricingConfig = require('../models/PricingConfig');

/**
 * Get current fee configuration
 * @route GET /api/v1/admin/fee-config
 * @access Private (Admin only)
 */
exports.getFeeConfig = async (req, res) => {
  try {
    const config = await PricingConfig.getOrCreateDefault();

    res.json({
      success: true,
      data: {
        bookingFeeTiers: config.bookingFeeTiers,
        defaultBookingFeePercentage: config.defaultBookingFeePercentage,
        version: config.version,
        lastModifiedBy: config.lastModifiedBy,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching fee config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee configuration',
    });
  }
};

/**
 * Validate booking fee tiers
 * @param {Array} tiers - Array of fee tier objects
 * @returns {Object} Validation result with isValid and errors
 */
const validateFeeTiers = (tiers) => {
  const errors = [];

  if (!Array.isArray(tiers) || tiers.length === 0) {
    errors.push('At least one fee tier is required');
    return { isValid: false, errors };
  }

  // Validate each tier
  const activeTiers = tiers.filter(tier => tier.isActive !== false);

  for (let i = 0; i < activeTiers.length; i++) {
    const tier = activeTiers[i];

    // Validate label
    if (!tier.label || typeof tier.label !== 'string' || tier.label.trim() === '') {
      errors.push(`Tier ${i + 1}: Label is required`);
    }

    // Validate percentage
    if (typeof tier.percentage !== 'number' || tier.percentage < 0 || tier.percentage > 100) {
      errors.push(`Tier ${i + 1} (${tier.label || 'unnamed'}): Percentage must be between 0 and 100`);
    }

    // Validate minAmount
    if (typeof tier.minAmount !== 'number' || tier.minAmount < 0) {
      errors.push(`Tier ${i + 1} (${tier.label || 'unnamed'}): minAmount must be a non-negative number`);
    }

    // Validate maxAmount if not null
    if (tier.maxAmount !== null && tier.maxAmount !== undefined) {
      if (typeof tier.maxAmount !== 'number' || tier.maxAmount <= tier.minAmount) {
        errors.push(`Tier ${i + 1} (${tier.label || 'unnamed'}): maxAmount must be greater than minAmount`);
      }
    }
  }

  // Sort tiers by minAmount for overlap and coverage checking
  const sortedTiers = [...activeTiers].sort((a, b) => a.minAmount - b.minAmount);

  // First tier should start at 0
  if (sortedTiers.length > 0 && sortedTiers[0].minAmount !== 0) {
    errors.push(`First tier must start at minAmount 0. Currently starts at ${sortedTiers[0].minAmount}`);
  }

  // Check for gaps and overlaps between tiers
  for (let i = 1; i < sortedTiers.length; i++) {
    const previous = sortedTiers[i - 1];
    const current = sortedTiers[i];

    // Previous tier should have maxAmount defined
    if (previous.maxAmount === null || previous.maxAmount === undefined) {
      errors.push(
        `Tier "${previous.label}" has no upper limit (maxAmount: null), but there's another tier "${current.label}" after it. ` +
        `Only the last tier can have no upper limit.`
      );
      continue;
    }

    const expectedMin = previous.maxAmount + 1;

    if (current.minAmount > expectedMin) {
      errors.push(
        `Gap in fee tiers: No coverage between ${previous.maxAmount} and ${current.minAmount}. ` +
        `Tiers must be contiguous.`
      );
    } else if (current.minAmount < expectedMin) {
      errors.push(
        `Overlap in fee tiers: "${previous.label}" (${previous.minAmount}-${previous.maxAmount}) ` +
        `overlaps with "${current.label}" (${current.minAmount}-${current.maxAmount || 'null'}). ` +
        `Expected ${current.label} to start at ${expectedMin}.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Update fee configuration
 * @route PUT /api/v1/admin/fee-config
 * @access Private (Admin only)
 */
exports.updateFeeConfig = async (req, res) => {
  try {
    const { bookingFeeTiers, defaultBookingFeePercentage } = req.body;

    // Validate fee tiers if provided
    if (bookingFeeTiers) {
      const validation = validateFeeTiers(bookingFeeTiers);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fee tier configuration',
          errors: validation.errors,
        });
      }
    }

    // Validate default percentage if provided
    if (defaultBookingFeePercentage !== undefined) {
      if (typeof defaultBookingFeePercentage !== 'number' ||
          defaultBookingFeePercentage < 0 ||
          defaultBookingFeePercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Default booking fee percentage must be between 0 and 100',
        });
      }
    }

    // Get current active config
    let config = await PricingConfig.getOrCreateDefault();

    // Create new version
    const newConfig = await config.cloneForNewVersion();

    // Apply updates
    if (bookingFeeTiers) {
      newConfig.bookingFeeTiers = bookingFeeTiers;
    }
    if (defaultBookingFeePercentage !== undefined) {
      newConfig.defaultBookingFeePercentage = defaultBookingFeePercentage;
    }
    newConfig.lastModifiedBy = req.user._id;

    await newConfig.save();

    res.json({
      success: true,
      message: 'Fee configuration updated successfully',
      data: {
        bookingFeeTiers: newConfig.bookingFeeTiers,
        defaultBookingFeePercentage: newConfig.defaultBookingFeePercentage,
        version: newConfig.version,
        lastModifiedBy: newConfig.lastModifiedBy,
        updatedAt: newConfig.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating fee config:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update fee configuration',
    });
  }
};

/**
 * Preview fee calculation for an amount
 * @route POST /api/v1/admin/fee-config/calculate-preview
 * @access Private (Admin only)
 */
exports.previewFee = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a non-negative number',
      });
    }

    // Get current config
    const config = await PricingConfig.getOrCreateDefault();

    // Calculate fee
    const result = config.calculateBookingFee(amount);

    res.json({
      success: true,
      data: {
        amount,
        feeAmount: result.feeAmount,
        percentage: result.percentage,
        tierLabel: result.tierLabel,
        isDefault: result.isDefault,
        tier: result.tier ? {
          label: result.tier.label,
          minAmount: result.tier.minAmount,
          maxAmount: result.tier.maxAmount,
          percentage: result.tier.percentage,
        } : null,
        breakdown: {
          originalAmount: amount,
          feePercentage: `${result.percentage}%`,
          feeAmount: result.feeAmount,
          remainingAmount: amount - result.feeAmount,
        },
      },
    });
  } catch (error) {
    console.error('Error calculating fee preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fee preview',
    });
  }
};

/**
 * Validate tier configuration (without saving)
 * @route POST /api/v1/admin/fee-config/validate
 * @access Private (Admin only)
 */
exports.validateTiers = async (req, res) => {
  try {
    const { bookingFeeTiers } = req.body;

    if (!bookingFeeTiers) {
      return res.status(400).json({
        success: false,
        message: 'bookingFeeTiers is required',
      });
    }

    const validation = validateFeeTiers(bookingFeeTiers);

    res.json({
      success: true,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        tiers: validation.isValid ? bookingFeeTiers : null,
      },
    });
  } catch (error) {
    console.error('Error validating tiers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate tiers',
    });
  }
};
