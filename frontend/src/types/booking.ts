/**
 * Booking Types
 * Type definitions for the booking system with WORD BANK integration
 */

import type { Service, ServiceCategory } from './service';
import type { User } from './index';

// Re-export Service for convenience
export type { Service, ServiceCategory } from './service';

/**
 * Booking step status
 */
export type BookingStepStatus = 'pending' | 'active' | 'completed';

/**
 * Booking step definition
 */
export interface BookingStep {
  id: number;
  title: string;
  description: string;
  status: BookingStepStatus;
}

/**
 * Payment plan frequency
 */
export type PaymentFrequency = 'one_time' | 'milestone' | 'installment';

/**
 * Completion media type
 */
export type CompletionMediaType = 'image' | 'video';

/**
 * Completion media item
 */
export interface CompletionMedia {
  _id: string;
  url: string;
  publicId: string;
  type: CompletionMediaType;
  caption?: string;
  uploadedAt: string;
  uploadedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Problem image for booking
 */
export interface BookingImage {
  url: string;
  publicId?: string;
  caption?: string;
}

/**
 * Payment plan definition
 */
export interface PaymentPlan {
  _id: string;
  technicianId: string;
  name: string;
  description: string;
  frequency: PaymentFrequency;
  installments?: number;
  depositPercentage: number;
  milestones?: Array<{
    name: string;
    percentage: number;
    dueDate?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Escrow status
 */
export type EscrowStatus =
  | 'pending'
  | 'funded'
  | 'partially_released'
  | 'released'
  | 'refunded'
  | 'disputed';

/**
 * Escrow definition
 */
export interface Escrow {
  _id: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  totalAmount: number;
  depositAmount: number;
  status: EscrowStatus;
  fundedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  releaseConditions: string;
  transactions: Array<{
    type: 'deposit' | 'release' | 'refund';
    amount: number;
    transactionId: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service location for booking
 */
export interface BookingServiceLocation {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  city?: string;
  county?: string;
  landmarks?: string;
  accessInstructions?: string;
}

/**
 * Create booking data with WORD BANK integration
 */
export interface CreateBookingData {
  // WORD BANK service reference
  service: string; // Service ID from WORD BANK
  serviceCategory?: string; // Category ID
  serviceType?: string; // For backward compatibility

  // Technician and payment plan
  technician: string;
  paymentPlan?: string; // Selected payment plan ID

  // Scheduling
  scheduledDate: Date | string;
  scheduledTime: string;

  // Location
  location: BookingServiceLocation;

  // Job details
  description: string;
  attachments?: File[];
  quantity?: number;

  // Pricing
  escrowDeposit: number;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';

  // Legacy fields for backward compatibility
  serviceLocation?: {
    coordinates: [number, number];
    address: string;
    landmarks?: string;
    accessInstructions?: string;
  };
  estimatedDuration?: number;
  images?: string[];
}

/**
 * Booking with WORD BANK integration
 */
export interface BookingWithService {
  _id: string;
  bookingNumber: string;

  // Customer and technician
  customer: User;
  technician?: User;

  // WORD BANK service reference
  service: Service | string;
  serviceCategory: ServiceCategory | string;
  serviceType: string;

  // Payment plan
  paymentPlan?: PaymentPlan | string;

  // Escrow
  escrow?: Escrow | string;
  depositPaid: boolean;
  depositAmount: number;

  // Job details
  description: string;
  urgency: string;
  images?: Array<{ url: string; caption?: string }>;
  quantity?: number;

  // Location
  serviceLocation: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city?: string;
    county?: string;
    landmarks?: string;
    accessInstructions?: string;
  };

  // Scheduling
  timeSlot: {
    date: Date | string;
    startTime: string;
    endTime: string;
    estimatedDuration?: number;
  };

  // Status
  status: string;

  // Pricing
  pricing: {
    basePrice?: number;
    serviceCharge?: number;
    platformFee?: number;
    tax?: number;
    discount?: number;
    totalAmount: number;
    currency: string;
    bookingFee?: number;
  };

  // Booking fee (escrow deposit)
  bookingFee?: {
    required: boolean;
    percentage: number;
    amount: number;
    status: 'pending' | 'paid' | 'held' | 'released' | 'refunded';
    paidAt?: string;
    releasedAt?: string;
    refundedAt?: string;
    heldInEscrow?: boolean;
    escrowReleaseCondition?: 'job_verified' | 'support_approved' | 'auto_released';
    transactionId?: string;
    refundTransactionId?: string;
    notes?: string;
  };

  // Privacy
  contactsHidden?: boolean;
  contactsHiddenReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Available technician for service
 */
export interface AvailableTechnician {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  rating: {
    average: number;
    count: number;
  };
  hourlyRate?: number;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  skills: Array<{
    name: string;
    category: string;
    yearsOfExperience: number;
  }>;
  availability: {
    isAvailable: boolean;
    nextAvailable?: string;
  };
  completedJobs: number;
  responseTime?: number; // in minutes
  distance?: number; // in km
  priceRange: {
    min: number;
    max: number;
  };
  paymentPlans: PaymentPlan[];
}

/**
 * Booking summary data for review step
 */
export interface BookingSummaryData {
  service: Service;
  technician: AvailableTechnician;
  paymentPlan?: PaymentPlan;
  scheduledDate: string;
  scheduledTime: string;
  location: BookingServiceLocation;
  description: string;
  escrowDeposit: number;
  platformFee: number;
  totalAmount: number;
  quantity?: number;
}

/**
 * Booking confirmation data
 */
export interface BookingConfirmationData {
  bookingId: string;
  bookingNumber: string;
  escrowStatus: EscrowStatus;
  escrowDeposit: number;
  service: {
    name: string;
    category: string;
  };
  technician: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profilePicture?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  nextSteps: string[];
}

/**
 * Price estimate from pricing service
 */
export interface PriceEstimate {
  basePrice: number;
  distanceFee: number;
  urgencyMultiplier: number;
  timeMultiplier: number;
  technicianMultiplier: number;
  subtotal: number;
  platformFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  technicianPayout: number;
  bookingFee: number;
  remainingAmount: number;
  currency: string;
  details?: {
    servicePrice?: any;
    distance?: any;
    urgency?: {
      level: string;
      multiplier: number;
      reason: string;
    };
    timing?: any;
    technician?: any;
    platformFee?: {
      type: string;
      value: number;
      amount: number;
      note: string;
    };
    tax?: {
      name: string;
      rate: number;
      amount: number;
      note: string;
    };
    discount?: any;
    bookingFee?: {
      percentage: number;
      amount: number;
      remainingAmount: number;
      description: string;
      refundable: boolean;
      heldInEscrow: boolean;
    };
  };
}

/**
 * Booking flow state
 */
export interface BookingFlowState {
  currentStep: number;
  selectedService: Service | null;
  selectedTechnician: AvailableTechnician | null;
  selectedPaymentPlan: PaymentPlan | null;
  availableTechnicians: AvailableTechnician[];
  scheduledDate: string;
  scheduledTime: string;
  location: BookingServiceLocation;
  description: string;
  attachments: File[];
  quantity: number;
  escrowDeposit: number;
  isSubmitting: boolean;
  createdBooking: BookingWithService | null;
  // Pre-selection state for matching flow integration
  preSelectedTechnicianId: string | null;
  preSelectedServiceId: string | null;
  matchingRequestId: string | null;
  isFromMatching: boolean;
  // Price estimation state
  priceEstimate: PriceEstimate | null;
  isLoadingEstimate: boolean;
  // Urgency display
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  // Estimated duration in minutes
  estimatedDuration: number;
}

/**
 * Initial booking flow state
 */
export const initialBookingFlowState: BookingFlowState = {
  currentStep: 1,
  selectedService: null,
  selectedTechnician: null,
  selectedPaymentPlan: null,
  availableTechnicians: [],
  scheduledDate: '',
  scheduledTime: '',
  location: {
    address: '',
    coordinates: undefined,
  },
  description: '',
  attachments: [],
  quantity: 1,
  escrowDeposit: 0,
  isSubmitting: false,
  createdBooking: null,
  // Pre-selection state
  preSelectedTechnicianId: null,
  preSelectedServiceId: null,
  matchingRequestId: null,
  isFromMatching: false,
  // Price estimation
  priceEstimate: null,
  isLoadingEstimate: false,
  // Urgency and duration
  urgency: 'medium',
  estimatedDuration: 120,
};

/**
 * Booking step definitions
 */
export const BOOKING_STEPS: BookingStep[] = [
  {
    id: 1,
    title: 'Select Service',
    description: 'Choose a service from our WORD BANK',
    status: 'active',
  },
  {
    id: 2,
    title: 'Choose Technician',
    description: 'Select a qualified technician',
    status: 'pending',
  },
  {
    id: 3,
    title: 'Payment Plan',
    description: 'Review payment options',
    status: 'pending',
  },
  {
    id: 4,
    title: 'Schedule & Details',
    description: 'Set date, time, and location',
    status: 'pending',
  },
  {
    id: 5,
    title: 'Confirm & Pay',
    description: 'Review and pay deposit',
    status: 'pending',
  },
];

/**
 * Calculate escrow deposit
 */
export function calculateEscrowDeposit(
  totalAmount: number,
  depositPercentage: number = 20
): number {
  return Math.round(totalAmount * (depositPercentage / 100));
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(totalAmount: number): number {
  // Platform fee is typically 10% of total
  return Math.round(totalAmount * 0.1);
}
