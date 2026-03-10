/**
 * Fee Configuration Service
 *
 * Service for admin fee configuration management.
 * Provides API calls for managing booking fee tiers.
 *
 * @module services/feeConfig
 */

import axios from '@/lib/axios';

// ===== TYPES =====

/**
 * Booking fee tier configuration
 */
export interface BookingFeeTier {
  minAmount: number;
  maxAmount: number | null;
  percentage: number;
  label: string;
  isActive: boolean;
}

/**
 * Fee configuration response from API
 */
export interface FeeConfigResponse {
  bookingFeeTiers: BookingFeeTier[];
  defaultBookingFeePercentage: number;
  version: number;
  lastModifiedBy?: string;
  updatedAt: string;
}

/**
 * Fee preview calculation result
 */
export interface FeePreviewResult {
  amount: number;
  feeAmount: number;
  percentage: number;
  tierLabel: string;
  isDefault: boolean;
  tier: BookingFeeTier | null;
  breakdown: {
    originalAmount: number;
    feePercentage: string;
    feeAmount: number;
    remainingAmount: number;
  };
}

/**
 * Tier validation result
 */
export interface TierValidationResult {
  isValid: boolean;
  errors: string[];
  tiers: BookingFeeTier[] | null;
}

// ===== API FUNCTIONS =====

/**
 * Get current fee configuration
 */
export const getFeeConfig = async (): Promise<FeeConfigResponse> => {
  try {
    const response = await axios.get('/admin/fee-config');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching fee config:', error);
    throw error;
  }
};

/**
 * Update fee configuration
 */
export const updateFeeConfig = async (data: {
  bookingFeeTiers?: BookingFeeTier[];
  defaultBookingFeePercentage?: number;
}): Promise<FeeConfigResponse> => {
  try {
    const response = await axios.put('/admin/fee-config', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating fee config:', error);
    throw error;
  }
};

/**
 * Preview fee calculation for an amount
 */
export const previewFee = async (amount: number): Promise<FeePreviewResult> => {
  try {
    const response = await axios.post('/admin/fee-config/calculate-preview', { amount });
    return response.data.data;
  } catch (error: any) {
    console.error('Error calculating fee preview:', error);
    throw error;
  }
};

/**
 * Validate tier configuration without saving
 */
export const validateTiers = async (bookingFeeTiers: BookingFeeTier[]): Promise<TierValidationResult> => {
  try {
    const response = await axios.post('/admin/fee-config/validate', { bookingFeeTiers });
    return response.data.data;
  } catch (error: any) {
    console.error('Error validating tiers:', error);
    throw error;
  }
};

/**
 * Create default fee tiers template
 */
export const createDefaultTiers = (): BookingFeeTier[] => [
  {
    minAmount: 0,
    maxAmount: 5000,
    percentage: 12,
    label: 'Standard',
    isActive: true,
  },
  {
    minAmount: 5001,
    maxAmount: 20000,
    percentage: 10,
    label: 'Medium',
    isActive: true,
  },
  {
    minAmount: 20001,
    maxAmount: null,
    percentage: 8,
    label: 'Large Jobs',
    isActive: true,
  },
];

/**
 * Validate a single tier locally (for immediate feedback)
 */
export const validateSingleTier = (tier: Partial<BookingFeeTier>): string[] => {
  const errors: string[] = [];

  if (!tier.label || tier.label.trim() === '') {
    errors.push('Label is required');
  }

  if (typeof tier.percentage !== 'number' || tier.percentage < 0 || tier.percentage > 100) {
    errors.push('Percentage must be between 0 and 100');
  }

  if (typeof tier.minAmount !== 'number' || tier.minAmount < 0) {
    errors.push('Minimum amount must be a non-negative number');
  }

  if (tier.maxAmount !== null && tier.maxAmount !== undefined) {
    if (typeof tier.maxAmount !== 'number' || tier.maxAmount <= (tier.minAmount || 0)) {
      errors.push('Maximum amount must be greater than minimum amount');
    }
  }

  return errors;
};

export default {
  getFeeConfig,
  updateFeeConfig,
  previewFee,
  validateTiers,
  createDefaultTiers,
  validateSingleTier,
};
