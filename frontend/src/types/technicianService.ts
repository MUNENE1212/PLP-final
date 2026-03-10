/**
 * Technician Service Types
 * Type definitions for technician's services integration with WORD BANK
 */

import type { Service, ServiceCategory } from './service';

/**
 * Pricing type options for technician services
 */
export type PricingType = 'hourly' | 'fixed' | 'negotiable';

/**
 * Pricing data for a technician's service offering
 */
export interface PricingData {
  pricingType: PricingType;
  hourlyRate?: number;
  fixedPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  estimatedDuration: string;
  description?: string;
  callOutFee?: number;
  negotiable?: boolean;
}

/**
 * Portfolio image for a technician service
 */
export interface PortfolioImage {
  url: string;
  publicId: string;
  caption?: string;
  order: number;
  uploadedAt: string;
}

/**
 * Availability schedule item
 */
export interface ScheduleItem {
  dayOfWeek: number; // 0-6, Sunday to Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

/**
 * Service availability settings
 */
export interface ServiceAvailability {
  isActive: boolean;
  emergencyAvailable: boolean;
  emergencyPremium: number; // Percentage markup
  schedule: ScheduleItem[];
  serviceRadius: number; // kilometers
}

/**
 * Service rating breakdown
 */
export interface RatingBreakdown {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
}

/**
 * Service rating information
 */
export interface ServiceRating {
  average: number;
  count: number;
  breakdown: RatingBreakdown;
}

/**
 * Service statistics
 */
export interface ServiceStats {
  jobsCompleted: number;
  jobsInProgress: number;
  jobsCancelled: number;
  totalRevenue: number;
  averageCompletionTime: number; // minutes
  repeatCustomerRate: number; // percentage
  averageResponseTime: number; // minutes
}

/**
 * Certification for a service
 */
export interface Certification {
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
  documentUrl?: string;
  verified: boolean;
}

/**
 * Qualifications for a service
 */
export interface Qualifications {
  yearsOfExperience: number;
  certifications: Certification[];
  equipment: string[];
}

/**
 * Verification status for a service
 */
export interface VerificationStatus {
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationDocuments: Array<{
    url: string;
    publicId: string;
    type: string;
    uploadedAt: string;
  }>;
}

/**
 * Promotion status for a service
 */
export interface PromotionStatus {
  isPromoted: boolean;
  promotedAt?: string;
  promotedUntil?: string;
  promotionType: 'none' | 'featured' | 'highlighted' | 'priority';
}

/**
 * Technician Service interface
 * Represents a service offered by a specific technician
 * Links technicians to services from the WORD BANK with custom pricing
 */
export interface TechnicianService {
  _id: string;
  technician: string; // Technician user ID
  service: Service; // Reference to service from WORD BANK
  category: ServiceCategory; // Reference to category
  pricing: {
    minPrice?: number;
    maxPrice?: number;
    useCustomPricing: boolean;
    negotiable: boolean;
    callOutFee: number;
    currency: string;
  };
  description: string;
  portfolioImages: PortfolioImage[];
  availability: ServiceAvailability;
  rating: ServiceRating;
  stats: ServiceStats;
  qualifications: Qualifications;
  verification: VerificationStatus;
  promotion: PromotionStatus;
  customerNotes?: string;
  internalNotes?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  effectivePriceRange?: string;
  completionRate?: number;
}

/**
 * Input for creating a new technician service
 */
export interface TechnicianServiceInput {
  serviceId: string;
  categoryId: string;
  pricing: PricingData;
  description?: string;
  customerNotes?: string;
  availability?: Partial<ServiceAvailability>;
  qualifications?: Partial<Qualifications>;
}

/**
 * Input for updating an existing technician service
 */
export interface TechnicianServiceUpdateInput {
  pricing?: Partial<PricingData>;
  description?: string;
  customerNotes?: string;
  availability?: Partial<ServiceAvailability>;
  qualifications?: Partial<Qualifications>;
  portfolioImages?: PortfolioImage[];
}

/**
 * Technician Service API Response
 */
export interface TechnicianServiceApiResponse {
  success: boolean;
  data: TechnicianService | TechnicianService[];
  message?: string;
}

/**
 * Technician Services List Response
 */
export interface TechnicianServicesListResponse {
  success: boolean;
  data: TechnicianService[];
  message?: string;
}

/**
 * Technician Service State for Redux
 */
export interface TechnicianServicesState {
  services: TechnicianService[];
  loading: boolean;
  error: string | null;
  currentService: TechnicianService | null;
  actionLoading: boolean;
}

/**
 * Duration options for service estimation
 */
export const ESTIMATED_DURATION_OPTIONS = [
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
 * Pricing type display labels
 */
export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  hourly: 'Hourly Rate',
  fixed: 'Fixed Price',
  negotiable: 'Negotiable',
};

/**
 * Pricing type descriptions
 */
export const PRICING_TYPE_DESCRIPTIONS: Record<PricingType, string> = {
  hourly: 'Charge by the hour. Set your hourly rate.',
  fixed: 'Set a fixed price for this service.',
  negotiable: 'Price is negotiable based on the job requirements.',
};

/**
 * Validation constraints for technician service input
 */
export const TECHNICIAN_SERVICE_CONSTRAINTS = {
  MIN_PRICE: 100,
  MAX_PRICE: 1000000,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 500,
  MAX_PORTFOLIO_IMAGES: 15,
  MIN_SERVICE_RADIUS: 1,
  MAX_SERVICE_RADIUS: 100,
  MAX_EMERGENCY_PREMIUM: 100,
} as const;

/**
 * Day of week labels for schedule
 */
export const DAY_OF_WEEK_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
