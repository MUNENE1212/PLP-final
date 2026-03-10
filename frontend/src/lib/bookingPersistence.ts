/**
 * Booking Persistence Utility
 *
 * Manages saving and restoring booking flow state to/from localStorage.
 * This allows users to resume their booking if they refresh the page or leave and come back.
 *
 * Features:
 * - Auto-save booking flow state to localStorage
 * - Restore state on page load (within 24 hours)
 * - Clear state on successful booking completion
 * - Manual clear option
 */

import type { BookingFlowState, Service, AvailableTechnician, PaymentPlan } from '@/types/booking';

/**
 * Storage key for booking draft
 */
const STORAGE_KEY = 'dumuwaks_booking_draft';

/**
 * Maximum age for a draft in milliseconds (24 hours)
 */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Serializable version of booking flow state (without File objects)
 * Files cannot be stored in localStorage, so we only store filenames
 */
export interface SerializableBookingDraft {
  currentStep: number;
  selectedService: Service | null;
  selectedTechnician: AvailableTechnician | null;
  selectedPaymentPlan: PaymentPlan | null;
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    landmarks?: string;
    accessInstructions?: string;
  };
  description: string;
  attachmentFileNames: string[];
  quantity: number;
  escrowDeposit: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  estimatedDuration: number;
  preSelectedTechnicianId: string | null;
  preSelectedServiceId: string | null;
  matchingRequestId: string | null;
  isFromMatching: boolean;
  timestamp: number;
}

/**
 * Full draft data stored in localStorage
 */
interface StoredBookingDraft {
  version: number;
  data: SerializableBookingDraft;
  timestamp: number;
}

/**
 * Current version of the draft format
 * Increment this when making breaking changes to the draft structure
 */
const CURRENT_VERSION = 1;

/**
 * Check if localStorage is available
 * Some browsers may have localStorage disabled or in private mode
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save booking flow state to localStorage
 *
 * Converts the full BookingFlowState to a serializable format
 * by extracting only file names from File objects.
 *
 * @param state - Current booking flow state
 * @returns true if save was successful, false otherwise
 */
export function saveBookingDraft(state: BookingFlowState): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('BookingPersistence: localStorage is not available');
    return false;
  }

  try {
    // Extract file names from File objects
    const attachmentFileNames = state.attachments.map((file) => file.name);

    const draft: SerializableBookingDraft = {
      currentStep: state.currentStep,
      selectedService: state.selectedService,
      selectedTechnician: state.selectedTechnician,
      selectedPaymentPlan: state.selectedPaymentPlan,
      scheduledDate: state.scheduledDate,
      scheduledTime: state.scheduledTime,
      location: state.location,
      description: state.description,
      attachmentFileNames,
      quantity: state.quantity,
      escrowDeposit: state.escrowDeposit,
      urgency: state.urgency,
      estimatedDuration: state.estimatedDuration,
      preSelectedTechnicianId: state.preSelectedTechnicianId,
      preSelectedServiceId: state.preSelectedServiceId,
      matchingRequestId: state.matchingRequestId,
      isFromMatching: state.isFromMatching,
      timestamp: Date.now(),
    };

    const storedDraft: StoredBookingDraft = {
      version: CURRENT_VERSION,
      data: draft,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedDraft));
    return true;
  } catch (error) {
    // Handle QuotaExceededError or other storage errors
    console.error('BookingPersistence: Failed to save draft', error);
    return false;
  }
}

/**
 * Load booking draft from localStorage
 *
 * Checks if a valid draft exists and is not expired.
 *
 * @returns The serializable draft data, or null if none exists or is expired
 */
export function loadBookingDraft(): SerializableBookingDraft | null {
  if (!isLocalStorageAvailable()) {
    console.warn('BookingPersistence: localStorage is not available');
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const draft: StoredBookingDraft = JSON.parse(stored);

    // Check version compatibility
    if (draft.version !== CURRENT_VERSION) {
      console.warn('BookingPersistence: Draft version mismatch, clearing old draft');
      clearBookingDraft();
      return null;
    }

    // Check if draft is expired
    const age = Date.now() - draft.timestamp;
    if (age > MAX_AGE_MS) {
      console.info('BookingPersistence: Draft is older than 24 hours, clearing');
      clearBookingDraft();
      return null;
    }

    return draft.data;
  } catch (error) {
    console.error('BookingPersistence: Failed to load draft', error);
    clearBookingDraft();
    return null;
  }
}

/**
 * Clear the booking draft from localStorage
 *
 * @returns true if clear was successful, false otherwise
 */
export function clearBookingDraft(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('BookingPersistence: Failed to clear draft', error);
    return false;
  }
}

/**
 * Check if a valid booking draft exists
 *
 * @returns true if a non-expired draft exists, false otherwise
 */
export function hasBookingDraft(): boolean {
  const draft = loadBookingDraft();
  return draft !== null;
}

/**
 * Get the age of the current draft in milliseconds
 *
 * @returns Age in milliseconds, or null if no draft exists
 */
export function getDraftAge(): number | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const draft: StoredBookingDraft = JSON.parse(stored);
    return Date.now() - draft.timestamp;
  } catch {
    return null;
  }
}

/**
 * Format the draft age for display
 *
 * @returns Human-readable string like "2 hours ago" or "just now"
 */
export function formatDraftAge(): string {
  const age = getDraftAge();
  if (age === null) {
    return '';
  }

  const minutes = Math.floor(age / (1000 * 60));
  const hours = Math.floor(age / (1000 * 60 * 60));

  if (minutes < 1) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    return 'over 24 hours ago';
  }
}

/**
 * Get a summary of the draft for display in the resume modal
 *
 * @returns Object with key information about the draft
 */
export function getDraftSummary(): {
  serviceName: string;
  technicianName: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  savedAt: string;
} | null {
  const draft = loadBookingDraft();
  if (!draft) {
    return null;
  }

  return {
    serviceName: draft.selectedService?.name || 'Unknown service',
    technicianName: draft.selectedTechnician
      ? `${draft.selectedTechnician.firstName} ${draft.selectedTechnician.lastName}`
      : 'No technician selected',
    scheduledDate: draft.scheduledDate,
    scheduledTime: draft.scheduledTime,
    address: draft.location.address || 'No address provided',
    savedAt: formatDraftAge(),
  };
}

/**
 * Constants for external use
 */
export const BOOKING_PERSISTENCE_CONSTANTS = {
  STORAGE_KEY,
  MAX_AGE_MS,
  CURRENT_VERSION,
} as const;
