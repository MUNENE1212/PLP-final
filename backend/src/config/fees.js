/**
 * Platform Fee Configuration
 *
 * This module defines the fee structure for the Dumuwaks platform escrow system.
 * Fees are calculated based on transaction amounts and payment methods.
 *
 * @module config/fees
 */

/**
 * Platform fee configuration constants
 */
const feeConfig = {
  /**
   * Base platform fee percentage applied to all transactions
   * This fee is deducted from the technician's payout
   */
  PLATFORM_FEE_PERCENTAGE: 7.5, // 7.5% platform fee

  /**
   * Minimum platform fee in KES
   * Applied when the calculated percentage fee is below this threshold
   */
  MINIMUM_FEE: 50, // Minimum KES 50

  /**
   * Maximum platform fee cap in KES
   * Prevents excessive fees on high-value transactions
   */
  MAXIMUM_FEE: 5000, // Maximum KES 5,000

  /**
   * Extra fee percentage for milestone-based payments
   * Added to base platform fee for partial releases
   */
  MILESTONE_FEE_SURCHARGE: 1, // Extra 1% for milestone payments

  /**
   * Number of days to hold funds during a dispute
   * After resolution, funds are released accordingly
   */
  DISPUTE_HOLD_DAYS: 7,

  /**
   * Number of days before auto-release of funds
   * If no action is taken, funds are released to technician
   */
  AUTO_RELEASE_DAYS: 3,

  /**
   * Number of days before auto-refund if job not started
   * Protects customers from abandoned jobs
   */
  AUTO_REFUND_DAYS: 14,

  /**
   * Cancellation fee percentages based on timing
   */
  CANCELLATION_FEES: {
    MORE_THAN_24H: 0,      // 0% fee
    BETWEEN_6_24H: 25,     // 25% fee
    BETWEEN_2_6H: 50,      // 50% fee
    LESS_THAN_2H: 75       // 75% fee
  },

  /**
   * Tax configuration (VAT on platform fees)
   */
  TAX: {
    ENABLED: true,
    RATE: 16, // 16% VAT
    NAME: 'VAT'
  },

  /**
   * Currency configuration
   */
  CURRENCY: {
    DEFAULT: 'KES',
    SUPPORTED: ['KES', 'USD']
  }
};

/**
 * Calculate platform fee based on transaction amount
 *
 * @param {number} amount - The transaction amount in KES
 * @param {Object} options - Additional options
 * @param {boolean} options.isMilestone - Whether this is a milestone payment
 * @returns {Object} Fee breakdown with platform fee, tax, and totals
 */
function calculatePlatformFee(amount, options = {}) {
  const { isMilestone = false } = options;

  // Validate input
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Invalid amount: must be a positive number');
  }

  // Calculate base fee percentage
  let feePercentage = feeConfig.PLATFORM_FEE_PERCENTAGE;
  if (isMilestone) {
    feePercentage += feeConfig.MILESTONE_FEE_SURCHARGE;
  }

  // Calculate platform fee
  let platformFee = (amount * feePercentage) / 100;

  // Apply minimum fee
  if (platformFee < feeConfig.MINIMUM_FEE) {
    platformFee = feeConfig.MINIMUM_FEE;
  }

  // Apply maximum fee cap
  if (platformFee > feeConfig.MAXIMUM_FEE) {
    platformFee = feeConfig.MAXIMUM_FEE;
  }

  // Round to 2 decimal places
  platformFee = Math.round(platformFee * 100) / 100;

  // Calculate tax on platform fee
  let tax = 0;
  if (feeConfig.TAX.ENABLED) {
    tax = (platformFee * feeConfig.TAX.RATE) / 100;
    tax = Math.round(tax * 100) / 100;
  }

  // Calculate total deduction from technician payout
  const totalDeduction = platformFee + tax;

  // Calculate technician payout
  const technicianPayout = Math.round((amount - totalDeduction) * 100) / 100;

  return {
    originalAmount: amount,
    feePercentage,
    platformFee,
    tax,
    totalDeduction,
    technicianPayout,
    currency: feeConfig.CURRENCY.DEFAULT
  };
}

/**
 * Calculate cancellation fee based on time until service
 *
 * @param {number} totalAmount - The total booking amount
 * @param {Date} scheduledDate - The scheduled service date
 * @param {Date} currentDate - Current date (defaults to now)
 * @returns {Object} Cancellation fee details
 */
function calculateCancellationFee(totalAmount, scheduledDate, currentDate = new Date()) {
  const hoursUntilService = (new Date(scheduledDate) - currentDate) / (1000 * 60 * 60);

  let feePercentage;
  let tier;

  if (hoursUntilService > 24) {
    feePercentage = feeConfig.CANCELLATION_FEES.MORE_THAN_24H;
    tier = 'more_than_24h';
  } else if (hoursUntilService > 6) {
    feePercentage = feeConfig.CANCELLATION_FEES.BETWEEN_6_24H;
    tier = 'between_6_24h';
  } else if (hoursUntilService > 2) {
    feePercentage = feeConfig.CANCELLATION_FEES.BETWEEN_2_6H;
    tier = 'between_2_6h';
  } else {
    feePercentage = feeConfig.CANCELLATION_FEES.LESS_THAN_2H;
    tier = 'less_than_2h';
  }

  const fee = Math.round((totalAmount * feePercentage / 100) * 100) / 100;
  const refundAmount = Math.round((totalAmount - fee) * 100) / 100;

  return {
    feePercentage,
    fee,
    refundAmount,
    tier,
    hoursUntilService: Math.round(hoursUntilService * 10) / 10
  };
}

/**
 * Get auto-release date for escrow
 *
 * @param {Date} fundedAt - Date when escrow was funded
 * @returns {Date} Auto-release date
 */
function getAutoReleaseDate(fundedAt = new Date()) {
  const date = new Date(fundedAt);
  date.setDate(date.getDate() + feeConfig.AUTO_RELEASE_DAYS);
  return date;
}

/**
 * Get auto-refund date for escrow
 *
 * @param {Date} createdAt - Date when escrow was created
 * @returns {Date} Auto-refund date
 */
function getAutoRefundDate(createdAt = new Date()) {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + feeConfig.AUTO_REFUND_DAYS);
  return date;
}

/**
 * Get dispute resolution deadline
 *
 * @param {Date} disputedAt - Date when dispute was opened
 * @returns {Date} Resolution deadline
 */
function getDisputeDeadline(disputedAt = new Date()) {
  const date = new Date(disputedAt);
  date.setDate(date.getDate() + feeConfig.DISPUTE_HOLD_DAYS);
  return date;
}

/**
 * Validate fee calculation parameters
 *
 * @param {number} amount - Amount to validate
 * @throws {Error} If validation fails
 */
function validateFeeParams(amount) {
  if (typeof amount !== 'number') {
    throw new Error('Amount must be a number');
  }
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }
  if (amount > 10000000) {
    throw new Error('Amount exceeds maximum allowed (10,000,000 KES)');
  }
}

module.exports = {
  ...feeConfig,
  calculatePlatformFee,
  calculateCancellationFee,
  getAutoReleaseDate,
  getAutoRefundDate,
  getDisputeDeadline,
  validateFeeParams
};
