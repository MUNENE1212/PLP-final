/**
 * Availability Types
 * Type definitions for real-time availability & queue system
 *
 * Task #73: Real-Time Availability & Queue System
 */

/**
 * Technician availability status
 */
export type AvailabilityStatus = 'online' | 'busy' | 'away' | 'offline';

/**
 * Socket event names for availability
 */
export const AVAILABILITY_EVENTS = {
  // Client -> Server
  UPDATE_STATUS: 'availability:update',
  GET_STATUS: 'availability:get_status',
  GET_ONLINE_COUNT: 'availability:get_online_count',
  HEARTBEAT: 'availability:heartbeat',
  QUEUE_SUBSCRIBE: 'queue:subscribe',
  QUEUE_UNSUBSCRIBE: 'queue:unsubscribe',

  // Server -> Client
  STATUS_CHANGED: 'availability:changed',
  STATUS_UPDATED: 'availability:updated',
  STATUS: 'availability:status',
  ONLINE_COUNT: 'availability:online_count',
  CATEGORY_ONLINE_COUNT: 'category:online_count',
  AUTO_AWAY: 'availability:auto_away',
  ERROR: 'availability:error',

  // Queue events
  POSITION_UPDATE: 'queue:position_update',
  QUEUE_ERROR: 'queue:error',
} as const;

/**
 * Technician availability data
 */
export interface TechnicianAvailability {
  technicianId: string;
  status: AvailabilityStatus;
  lastSeen: string | null;
  currentBookingId: string | null;
  queuePosition: number;
}

/**
 * Availability update payload
 */
export interface AvailabilityUpdatePayload {
  status: AvailabilityStatus;
  currentBookingId?: string | null;
}

/**
 * Availability status changed event payload
 */
export interface AvailabilityChangedPayload {
  technicianId: string;
  status: AvailabilityStatus;
  lastSeen: string;
  currentBookingId: string | null;
}

/**
 * Queue position update payload
 */
export interface QueuePositionUpdatePayload {
  bookingId: string;
  position: number;
  estimatedWait: number; // in minutes
  technicianName?: string;
  technicianId?: string;
  message?: string;
}

/**
 * Online count by category
 */
export interface OnlineCountPayload {
  category: string;
  count: number;
}

/**
 * Auto-away notification payload
 */
export interface AutoAwayPayload {
  message: string;
  minutes: number;
}

/**
 * Availability error payload
 */
export interface AvailabilityErrorPayload {
  error: string;
}

/**
 * Online technician info
 */
export interface OnlineTechnician {
  technicianId: string;
  name: string;
  profilePicture?: string;
  rating: {
    average: number;
    count: number;
  };
  status: AvailabilityStatus;
  skills: Array<{
    name: string;
    category: string;
    yearsOfExperience?: number;
  }>;
}
