import axios from '@/lib/axios';
import type {
  TechnicianService,
  TechnicianServiceInput,
  TechnicianServiceUpdateInput,
  TechnicianServiceApiResponse,
  TechnicianServicesListResponse,
  PricingData,
} from '@/types/technicianService';

/**
 * Technician Service API Service
 * API client for technician's services management
 * Integrates technicians with the WORD BANK services
 */

const API_BASE = '/technician-services';

/**
 * Get all services offered by the current technician
 * @returns Promise with technician services array
 */
export const getMyTechnicianServices = async (): Promise<TechnicianServicesListResponse> => {
  const response = await axios.get(`${API_BASE}/my-services`);
  return response.data;
};

/**
 * Get services offered by a specific technician (public)
 * @param technicianId - The technician's user ID
 * @returns Promise with technician services array
 */
export const getTechnicianServicesByTechnicianId = async (
  technicianId: string
): Promise<TechnicianServicesListResponse> => {
  const response = await axios.get(`${API_BASE}/technician/${technicianId}`);
  return response.data;
};

/**
 * Add a new service to the technician's offerings
 * @param data - Technician service input data
 * @returns Promise with created technician service
 */
export const addTechnicianService = async (
  data: TechnicianServiceInput
): Promise<TechnicianServiceApiResponse> => {
  const response = await axios.post(API_BASE, data);
  return response.data;
};

/**
 * Update an existing technician service
 * @param id - The technician service ID
 * @param data - Update data
 * @returns Promise with updated technician service
 */
export const updateTechnicianService = async (
  id: string,
  data: TechnicianServiceUpdateInput
): Promise<TechnicianServiceApiResponse> => {
  const response = await axios.put(`${API_BASE}/${id}`, data);
  return response.data;
};

/**
 * Remove a service from the technician's offerings
 * @param id - The technician service ID
 * @returns Promise with deletion confirmation
 */
export const removeTechnicianService = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
};

/**
 * Toggle service availability
 * @param id - The technician service ID
 * @param isActive - New availability status
 * @returns Promise with updated technician service
 */
export const toggleServiceAvailability = async (
  id: string,
  isActive: boolean
): Promise<TechnicianServiceApiResponse> => {
  const response = await axios.put(`${API_BASE}/${id}/availability`, { isActive });
  return response.data;
};

/**
 * Get a single technician service by ID
 * @param id - The technician service ID
 * @returns Promise with technician service data
 */
export const getTechnicianServiceById = async (
  id: string
): Promise<TechnicianServiceApiResponse> => {
  const response = await axios.get(`${API_BASE}/${id}`);
  return response.data;
};

/**
 * Add portfolio image to a technician service
 * @param id - The technician service ID
 * @param imageData - Image data with URL and publicId
 * @returns Promise with updated technician service
 */
export const addPortfolioImage = async (
  id: string,
  imageData: { url: string; publicId: string; caption?: string }
): Promise<TechnicianServiceApiResponse> => {
  const response = await axios.post(`${API_BASE}/${id}/portfolio`, imageData);
  return response.data;
};

/**
 * Remove portfolio image from a technician service
 * @param id - The technician service ID
 * @param publicId - Cloudinary public ID of the image
 * @returns Promise with updated technician service
 */
export const removePortfolioImage = async (
  id: string,
  publicId: string
): Promise<TechnicianServiceApiResponse> => {
  const response = await axios.delete(`${API_BASE}/${id}/portfolio/${publicId}`);
  return response.data;
};

/**
 * Validate technician service input data
 * @param data - Pricing data to validate
 * @returns Object with validation result and errors
 */
export const validatePricingData = (data: PricingData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate pricing type
  if (!['hourly', 'fixed', 'negotiable'].includes(data.pricingType)) {
    errors.push('Invalid pricing type');
  }

  // Validate based on pricing type
  switch (data.pricingType) {
    case 'hourly':
      if (!data.hourlyRate || data.hourlyRate < 100) {
        errors.push('Hourly rate must be at least KES 100');
      }
      if (data.hourlyRate && data.hourlyRate > 1000000) {
        errors.push('Hourly rate cannot exceed KES 1,000,000');
      }
      break;

    case 'fixed':
      if (!data.fixedPrice || data.fixedPrice < 100) {
        errors.push('Fixed price must be at least KES 100');
      }
      if (data.fixedPrice && data.fixedPrice > 1000000) {
        errors.push('Fixed price cannot exceed KES 1,000,000');
      }
      break;

    case 'negotiable':
      if (data.minPrice !== undefined && data.minPrice < 100) {
        errors.push('Minimum price must be at least KES 100');
      }
      if (data.maxPrice !== undefined && data.maxPrice > 1000000) {
        errors.push('Maximum price cannot exceed KES 1,000,000');
      }
      if (
        data.minPrice !== undefined &&
        data.maxPrice !== undefined &&
        data.maxPrice < data.minPrice
      ) {
        errors.push('Maximum price must be greater than or equal to minimum price');
      }
      break;
  }

  // Validate estimated duration
  if (!data.estimatedDuration) {
    errors.push('Please select an estimated duration');
  }

  // Validate description length
  if (data.description && data.description.length > 1000) {
    errors.push('Description must not exceed 1,000 characters');
  }

  // Validate call-out fee
  if (data.callOutFee !== undefined && data.callOutFee < 0) {
    errors.push('Call-out fee cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate technician service input
 * @param data - Technician service input to validate
 * @returns Object with validation result and errors
 */
export const validateTechnicianServiceInput = (data: TechnicianServiceInput): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate service ID
  if (!data.serviceId) {
    errors.push('Service selection is required');
  }

  // Validate category ID
  if (!data.categoryId) {
    errors.push('Category selection is required');
  }

  // Validate pricing data
  const pricingValidation = validatePricingData(data.pricing);
  errors.push(...pricingValidation.errors);

  // Validate description
  if (data.description && data.description.length > 1000) {
    errors.push('Description must not exceed 1,000 characters');
  }

  // Validate customer notes
  if (data.customerNotes && data.customerNotes.length > 500) {
    errors.push('Customer notes must not exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format price for display in KES
 * @param price - Price value
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Get price display string based on pricing type
 * @param pricing - Pricing data
 * @returns Formatted price display string
 */
export const getPriceDisplay = (pricing: PricingData): string => {
  switch (pricing.pricingType) {
    case 'hourly':
      return `${formatPrice(pricing.hourlyRate || 0)}/hr`;
    case 'fixed':
      return formatPrice(pricing.fixedPrice || 0);
    case 'negotiable':
      if (pricing.minPrice && pricing.maxPrice) {
        return `${formatPrice(pricing.minPrice)} - ${formatPrice(pricing.maxPrice)}`;
      }
      if (pricing.minPrice) {
        return `From ${formatPrice(pricing.minPrice)}`;
      }
      if (pricing.maxPrice) {
        return `Up to ${formatPrice(pricing.maxPrice)}`;
      }
      return 'Negotiable';
    default:
      return 'Contact for price';
  }
};

/**
 * Get effective price range from technician service
 * @param technicianService - Technician service object
 * @returns Formatted price range string
 */
export const getEffectivePriceRange = (technicianService: TechnicianService): string => {
  // If custom pricing is enabled and set
  if (
    technicianService.pricing.useCustomPricing &&
    technicianService.pricing.minPrice !== undefined
  ) {
    const min = technicianService.pricing.minPrice;
    const max = technicianService.pricing.maxPrice || min;
    if (min === max) {
      return formatPrice(min);
    }
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }

  // Use service's base price
  const service = technicianService.service;
  if (service && 'basePriceMin' in service && 'basePriceMax' in service) {
    if (service.basePriceMin === service.basePriceMax) {
      return formatPrice(service.basePriceMin);
    }
    return `${formatPrice(service.basePriceMin)} - ${formatPrice(service.basePriceMax)}`;
  }

  return 'Contact for price';
};

/**
 * Technician service service object for named exports
 */
export const technicianServiceService = {
  getMyTechnicianServices,
  getTechnicianServicesByTechnicianId,
  addTechnicianService,
  updateTechnicianService,
  removeTechnicianService,
  toggleServiceAvailability,
  getTechnicianServiceById,
  addPortfolioImage,
  removePortfolioImage,
  validatePricingData,
  validateTechnicianServiceInput,
  formatPrice,
  getPriceDisplay,
  getEffectivePriceRange,
};

export default technicianServiceService;
