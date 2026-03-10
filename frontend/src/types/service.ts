/**
 * Service Types
 * Type definitions for the WORD BANK service discovery feature
 */

/**
 * Service Category interface
 * Represents a category of services (e.g., Plumbing, Electrical)
 */
export interface ServiceCategory {
  _id: string;
  name: string;
  icon: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  serviceCount: number;
}

/**
 * Service interface
 * Represents a specific service within a category
 */
export interface Service {
  _id: string;
  categoryId: string;
  name: string; // UPPERCASE
  description: string;
  icon: string;
  basePriceMin: number;
  basePriceMax: number;
  estimatedDuration: string;
  isActive: boolean;
  isCustom: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

/**
 * Technician Service interface
 * Represents a service offered by a specific technician
 */
export interface TechnicianService {
  _id: string;
  technicianId: string;
  serviceId: string;
  customPrice?: number;
  description: string;
  portfolioImages: string[];
  isAvailable: boolean;
  rating: number;
  jobsCompleted: number;
}

/**
 * Custom Service Input interface
 * Used when submitting a custom service for admin approval
 */
export interface CustomServiceInput {
  name: string;
  categoryId: string;
  description: string;
  basePriceMin: number;
  basePriceMax: number;
  estimatedDuration: string;
  icon?: File;
}

/**
 * Custom Service Form Data
 * Form data for custom service submission
 */
export interface CustomServiceFormData {
  name: string;
  categoryId: string;
  description: string;
  basePriceMin: number;
  basePriceMax: number;
  estimatedDuration: string;
  icon?: File | null;
}

/**
 * Service Search Result
 * Returned from search API
 */
export interface ServiceSearchResult {
  services: Service[];
  categories: ServiceCategory[];
  totalCount: number;
}

/**
 * Service State interface
 * Redux state for service discovery
 */
export interface ServiceState {
  categories: ServiceCategory[];
  services: Service[];
  selectedCategory: ServiceCategory | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  // Admin approval state
  pendingServices: PendingService[];
  approvalStats: ApprovalStats | null;
  filterStatus: ApprovalFilterStatus;
  currentPage: number;
  itemsPerPage: number;
  actionLoading: boolean;
}

/**
 * Category API Response
 */
export interface CategoryApiResponse {
  success: boolean;
  data: ServiceCategory[];
  message?: string;
}

/**
 * Service API Response
 */
export interface ServiceApiResponse {
  success: boolean;
  data: Service[];
  message?: string;
}

/**
 * Custom Service API Response
 */
export interface CustomServiceApiResponse {
  success: boolean;
  data: Service;
  message: string;
}

/**
 * Pending Service Response
 */
export interface PendingServiceResponse {
  success: boolean;
  data: Service[];
  message?: string;
}

/**
 * Service Approval Response
 */
export interface ServiceApprovalResponse {
  success: boolean;
  message: string;
  data?: Service;
}

/**
 * Default service icon mappings
 */
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  plumbing: 'wrench',
  electrical: 'zap',
  carpentry: 'hammer',
  masonry: 'box',
  painting: 'paintbrush',
  hvac: 'thermometer',
  welding: 'flame',
  other: 'settings',
};

/**
 * Service validation constraints
 */
export const SERVICE_CONSTRAINTS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PRICE: 100,
  MAX_PRICE: 1000000,
  ALLOWED_ICON_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
  MAX_ICON_SIZE: 500 * 1024, // 500KB
} as const;

/**
 * Estimated duration options for services
 */
export const DURATION_OPTIONS = [
  { value: '15-30 min', label: '15-30 minutes' },
  { value: '30-60 min', label: '30 minutes - 1 hour' },
  { value: '1-2 hrs', label: '1-2 hours' },
  { value: '2-4 hrs', label: '2-4 hours' },
  { value: '4-8 hrs', label: 'Half day (4-8 hours)' },
  { value: '1-2 days', label: '1-2 days' },
  { value: '3-5 days', label: '3-5 days' },
  { value: '1+ week', label: 'More than a week' },
] as const;

/**
 * Pending Service interface
 * Represents a custom service awaiting admin approval
 * Extends Service with technician request information
 */
export interface PendingService extends Service {
  requestedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  requestedAt: string;
  rejectionReason?: string;
}

/**
 * Approval Stats interface
 * Statistics for the admin approval dashboard
 */
export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  avgProcessingTime: number;
}

/**
 * Approval Stats API Response
 */
export interface ApprovalStatsResponse {
  success: boolean;
  data: ApprovalStats;
  message?: string;
}

/**
 * Approval Action Request
 */
export interface ApprovalActionRequest {
  reason?: string;
  notes?: string;
}

/**
 * Approval Filter Types
 */
export type ApprovalFilterStatus = 'pending' | 'approved' | 'rejected' | 'all';

/**
 * Admin Service State interface
 * Extended Redux state for admin service approvals
 */
export interface AdminServiceState {
  pendingServices: PendingService[];
  approvalStats: ApprovalStats | null;
  filterStatus: ApprovalFilterStatus;
  currentPage: number;
  itemsPerPage: number;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}
