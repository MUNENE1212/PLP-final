/**
 * Payment Plan Types
 * Type definitions for the Technician Payment Plans System
 */

/**
 * Plan type enumeration
 */
export type PlanType = 'hourly' | 'fixed' | 'milestone' | 'per_project' | 'negotiable';

/**
 * Hourly rate configuration
 */
export interface HourlyRate {
  amount: number;
  currency: string;
  minimumHours: number;
}

/**
 * Fixed price configuration
 */
export interface FixedPrice {
  amount: number;
  currency: string;
  includesMaterials: boolean;
  estimatedDuration?: number;
}

/**
 * Milestone configuration
 */
export interface Milestone {
  _id?: string;
  name: string;
  description?: string;
  percentage: number;
  amount?: number;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
}

/**
 * Per-project configuration
 */
export interface PerProjectConfig {
  baseAmount?: number;
  requiresQuote: boolean;
  estimatedRange?: {
    min: number;
    max: number;
  };
  typicalDuration?: 'hours' | 'days' | 'weeks' | 'varies';
}

/**
 * Deposit configuration
 */
export interface DepositConfig {
  required: boolean;
  percentage?: number;
  minimumAmount?: number;
}

/**
 * Cancellation policy configuration
 */
export interface CancellationPolicy {
  freeCancellationHours: number;
  cancellationFeePercent: number;
}

/**
 * Payment plan statistics
 */
export interface PaymentPlanStats {
  timesUsed: number;
  totalRevenue: number;
  averageRating: number;
}

/**
 * Main Payment Plan interface
 */
export interface PaymentPlan {
  _id: string;
  technician: string | TechnicianInfo;
  service: string | ServiceInfo;
  planType: PlanType;
  hourlyRate?: HourlyRate;
  fixedPrice?: FixedPrice;
  milestones?: Milestone[];
  perProject?: PerProjectConfig;
  deposit?: DepositConfig;
  isActive: boolean;
  isValid?: boolean;
  validFrom?: string;
  validUntil?: string;
  terms?: string;
  cancellationPolicy?: CancellationPolicy;
  stats?: PaymentPlanStats;
  displayPrice?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Technician info (populated)
 */
export interface TechnicianInfo {
  _id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  rating?: {
    average: number;
    count: number;
  };
  hourlyRate?: number;
  stats?: {
    completedBookings: number;
  };
  location?: {
    coordinates: [number, number];
    city?: string;
  };
}

/**
 * Service info (populated)
 */
export interface ServiceInfo {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: {
    min: number;
    max: number;
  };
}

/**
 * Payment plan form data for creation/update
 */
export interface PaymentPlanFormData {
  service: string;
  planType: PlanType;
  hourlyRate?: HourlyRate;
  fixedPrice?: FixedPrice;
  milestones?: Milestone[];
  perProject?: PerProjectConfig;
  deposit?: DepositConfig;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  terms?: string;
  cancellationPolicy?: CancellationPolicy;
}

/**
 * Price calculation options
 */
export interface CalculateOptions {
  hours?: number;
  quantity?: number;
}

/**
 * Price calculation result
 */
export interface CalculationResult {
  success: boolean;
  planType: PlanType;
  currency: string;
  breakdown: Record<string, unknown>;
  totalAmount: number;
  depositAmount: number;
  error?: string;
}

/**
 * Payment plan analytics
 */
export interface PaymentPlanAnalytics {
  totalPlans: number;
  activePlans: number;
  planTypeBreakdown: Record<PlanType, {
    count: number;
    totalRevenue: number;
    timesUsed: number;
  }>;
  totalRevenue: number;
  averageRating: number;
  mostUsedPlanType: PlanType | null;
}

/**
 * Payment plan type info
 */
export interface PlanTypeInfo {
  type: PlanType;
  name: string;
  description: string;
  fields: string[];
  recommended: string;
}

/**
 * Payment plan validation result
 */
export interface PaymentPlanValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Payment plan state
 */
export interface PaymentPlanState {
  plans: PaymentPlan[];
  selectedPlan: PaymentPlan | null;
  planTypes: PlanTypeInfo[];
  analytics: PaymentPlanAnalytics | null;
  calculationResult: CalculationResult | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

/**
 * API Response types
 */
export interface PaymentPlanResponse {
  success: boolean;
  data?: PaymentPlan;
  message?: string;
  error?: string;
}

export interface PaymentPlansResponse {
  success: boolean;
  data: PaymentPlan[];
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  error?: string;
}

export interface PlanTypesResponse {
  success: boolean;
  data: PlanTypeInfo[];
  message?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data: PaymentPlanAnalytics;
  message?: string;
  error?: string;
}

export interface CalculateResponse {
  success: boolean;
  data: CalculationResult;
  error?: string;
}

export interface ValidateResponse {
  success: boolean;
  isValid: boolean;
  errors: string[];
}

/**
 * Payment plan constants
 */
export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  hourly: 'Hourly Rate',
  fixed: 'Fixed Price',
  milestone: 'Milestone-based',
  per_project: 'Per Project',
  negotiable: 'Negotiable'
};

export const PLAN_TYPE_DESCRIPTIONS: Record<PlanType, string> = {
  hourly: 'Charge clients based on the number of hours worked',
  fixed: 'Set a single price for the entire job',
  milestone: 'Break down payment into multiple milestones or phases',
  per_project: 'Provide custom quotes for each project',
  negotiable: 'Allow clients to negotiate the price'
};

export const CURRENCY_OPTIONS = [
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' }
];

export const DURATION_OPTIONS = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'varies', label: 'Varies' }
];

/**
 * Validation constraints
 */
export const PAYMENT_PLAN_CONSTRAINTS = {
  MIN_HOURLY_RATE: 100,
  MAX_HOURLY_RATE: 100000,
  MIN_FIXED_PRICE: 100,
  MAX_FIXED_PRICE: 10000000,
  MIN_MINIMUM_HOURS: 0.5,
  MAX_MINIMUM_HOURS: 24,
  MIN_MILESTONES: 1,
  MAX_MILESTONES: 10,
  MAX_TERMS_LENGTH: 2000,
  MIN_CANCELLATION_HOURS: 0,
  MAX_CANCELLATION_HOURS: 720,
  MAX_CANCELLATION_FEE: 100
} as const;
