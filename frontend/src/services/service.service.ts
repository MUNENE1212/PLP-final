import axios from '@/lib/axios';
import type {
  Service,
  CustomServiceFormData,
  CategoryApiResponse,
  ServiceApiResponse,
  CustomServiceApiResponse,
  PendingServiceResponse,
  ServiceApprovalResponse,
  ServiceSearchResult,
  ApprovalStatsResponse,
  ApprovalActionRequest,
} from '@/types/service';

/**
 * Service Service
 * API service for WORD BANK service discovery operations
 */

const API_BASE = '/services';

/**
 * Get all active service categories
 * @returns Promise with categories array
 */
export const getCategories = async (): Promise<CategoryApiResponse> => {
  const response = await axios.get(`${API_BASE}/categories`);
  return response.data;
};

/**
 * Get services by category ID
 * @param categoryId - The category ID to filter services
 * @returns Promise with services array
 */
export const getCategoryServices = async (
  categoryId: string
): Promise<ServiceApiResponse> => {
  const response = await axios.get(`${API_BASE}/category/${categoryId}`);
  return response.data;
};

/**
 * Search services by query
 * @param query - Search query string
 * @returns Promise with search results
 */
export const searchServices = async (
  query: string
): Promise<ServiceSearchResult> => {
  const response = await axios.get(`${API_BASE}/search`, {
    params: { q: query },
  });
  return response.data;
};

/**
 * Submit custom service for admin approval
 * @param data - Custom service form data
 * @returns Promise with created service data
 */
export const submitCustomService = async (
  data: CustomServiceFormData
): Promise<CustomServiceApiResponse> => {
  // Create FormData for multipart upload if icon is present
  if (data.icon instanceof File) {
    const formDataObj = new FormData();
    formDataObj.append('name', data.name.toUpperCase());
    formDataObj.append('categoryId', data.categoryId);
    formDataObj.append('description', data.description);
    formDataObj.append('basePriceMin', String(data.basePriceMin));
    formDataObj.append('basePriceMax', String(data.basePriceMax));
    formDataObj.append('estimatedDuration', data.estimatedDuration);
    formDataObj.append('icon', data.icon);

    const response = await axios.post(`${API_BASE}/custom`, formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Regular JSON submission without icon
  const response = await axios.post(`${API_BASE}/custom`, {
    ...data,
    name: data.name.toUpperCase(),
  });
  return response.data;
};

/**
 * Get pending custom services (Admin only)
 * @returns Promise with pending services array
 */
export const getPendingServices = async (): Promise<PendingServiceResponse> => {
  const response = await axios.get(`${API_BASE}/pending`);
  return response.data;
};

/**
 * Approve a pending service (Admin only)
 * @param id - Service ID to approve
 * @returns Promise with approval confirmation
 */
export const approveService = async (
  id: string
): Promise<ServiceApprovalResponse> => {
  const response = await axios.put(`${API_BASE}/${id}/approve`);
  return response.data;
};

/**
 * Reject a pending service (Admin only)
 * @param id - Service ID to reject
 * @param reason - Reason for rejection
 * @returns Promise with rejection confirmation
 */
export const rejectService = async (
  id: string,
  reason: string
): Promise<ServiceApprovalResponse> => {
  const response = await axios.put(`${API_BASE}/${id}/reject`, { reason });
  return response.data;
};

/**
 * Get approval statistics (Admin only)
 * @returns Promise with approval stats data
 */
export const getApprovalStats = async (): Promise<ApprovalStatsResponse> => {
  const response = await axios.get(`${API_BASE}/stats/approvals`);
  return response.data;
};

/**
 * Approve a pending service with optional notes (Admin only)
 * @param id - Service ID to approve
 * @param notes - Optional notes for approval
 * @returns Promise with approval confirmation
 */
export const approveServiceWithNotes = async (
  id: string,
  notes?: string
): Promise<ServiceApprovalResponse> => {
  const response = await axios.put(`${API_BASE}/${id}/approve`, { notes } as ApprovalActionRequest);
  return response.data;
};

/**
 * Get service by ID
 * @param serviceId - The service ID
 * @returns Promise with service data
 */
export const getServiceById = async (serviceId: string): Promise<Service> => {
  const response = await axios.get(`${API_BASE}/${serviceId}`);
  return response.data.data;
};

/**
 * Validate custom service form data
 * @param data - Form data to validate
 * @returns Object with validation result
 */
export const validateCustomService = (data: CustomServiceFormData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate name
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Service name must be at least 3 characters');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Service name must not exceed 100 characters');
  }

  // Validate category
  if (!data.categoryId) {
    errors.push('Please select a category');
  }

  // Validate description
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (data.description && data.description.length > 500) {
    errors.push('Description must not exceed 500 characters');
  }

  // Validate price range
  if (!data.basePriceMin || data.basePriceMin < 100) {
    errors.push('Minimum price must be at least KES 100');
  }
  if (!data.basePriceMax || data.basePriceMax < data.basePriceMin) {
    errors.push('Maximum price must be greater than minimum price');
  }
  if (data.basePriceMax && data.basePriceMax > 1000000) {
    errors.push('Maximum price cannot exceed KES 1,000,000');
  }

  // Validate duration
  if (!data.estimatedDuration) {
    errors.push('Please select estimated duration');
  }

  // Validate icon if provided
  if (data.icon && data.icon instanceof File) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(data.icon.type)) {
      errors.push('Icon must be JPG, PNG, WebP, or SVG format');
    }
    if (data.icon.size > 500 * 1024) {
      errors.push('Icon size must be less than 500KB');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format price for display
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
 * Get price range display string
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Formatted price range string
 */
export const getPriceRangeDisplay = (min: number, max: number): string => {
  if (min === max) {
    return formatPrice(min);
  }
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

/**
 * Service service object for named exports
 */
export const serviceService = {
  getCategories,
  getCategoryServices,
  searchServices,
  submitCustomService,
  getPendingServices,
  approveService,
  approveServiceWithNotes,
  rejectService,
  getApprovalStats,
  getServiceById,
  validateCustomService,
  formatPrice,
  getPriceRangeDisplay,
};

export default serviceService;
