/**
 * Tracking Service for DumuWaks
 *
 * Provides real-time technician location tracking functionality.
 * Uses Socket.IO for real-time communication between technicians and customers.
 *
 * Features:
 * - Start/end tracking sessions
 * - Real-time position updates
 * - ETA calculations
 * - Privacy controls (pause/resume)
 */

import { socketService } from './socket';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Geographic coordinates [longitude, latitude]
 */
export type Coordinates = [number, number];

/**
 * Position with timestamp
 */
export interface Position {
  coordinates: Coordinates;
  timestamp: Date | string;
}

/**
 * ETA information
 */
export interface ETA {
  minutes: number | null;
  text: string | null;
  distance?: number;
  distanceText?: string;
  lastCalculated?: Date | string;
}

/**
 * Destination information
 */
export interface Destination {
  coordinates: Coordinates;
  address: string;
}

/**
 * Tracking session status
 */
export type TrackingStatus = 'active' | 'paused' | 'completed';

/**
 * Full tracking session
 */
export interface TrackingSession {
  bookingId: string;
  technicianId: string;
  customerId: string;
  startTime: Date | string;
  currentPosition: Position | null;
  destination: Destination;
  eta: ETA;
  isPaused: boolean;
  status: TrackingStatus;
}

/**
 * Tracking update event data
 */
export interface TrackingPositionUpdate {
  bookingId: string;
  position: Position;
  eta: ETA;
  isPaused: boolean;
}

/**
 * Tracking started event data
 */
export interface TrackingStartedEvent {
  bookingId: string;
  technicianId: string;
  startTime: Date | string;
  destination: Destination;
  message?: string;
}

/**
 * Tracking completed event data
 */
export interface TrackingCompletedEvent {
  bookingId: string;
  arrivalTime: Date | string;
  duration: number;
  message?: string;
}

/**
 * Tracking paused event data
 */
export interface TrackingPausedEvent {
  bookingId: string;
  pausedAt: Date | string;
  message?: string;
}

/**
 * Tracking resumed event data
 */
export interface TrackingResumedEvent {
  bookingId: string;
  resumedAt: Date | string;
  message?: string;
}

/**
 * Tracking error event data
 */
export interface TrackingErrorEvent {
  bookingId: string | null;
  error: string;
}

/**
 * Tracking state event data
 */
export interface TrackingStateEvent {
  bookingId: string;
  position: Position | null;
  eta: ETA;
  isPaused: boolean;
  status: TrackingStatus;
  startTime: Date | string;
}

// ============================================
// TRACKING SERVICE CLASS
// ============================================

class TrackingService {
  private connected: boolean = false;

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return socketService.isConnected();
  }

  // ============================================
  // TECHNICIAN METHODS
  // ============================================

  /**
   * Start a tracking session (Technician only)
   *
   * @param bookingId - The booking ID
   */
  startTracking(bookingId: string): void {
    socketService.emit('tracking:start', { bookingId });
  }

  /**
   * Send location update (Technician only)
   *
   * @param bookingId - The booking ID
   * @param coordinates - [longitude, latitude]
   */
  updateLocation(bookingId: string, coordinates: Coordinates): void {
    socketService.emit('tracking:update', {
      bookingId,
      coordinates
    });
  }

  /**
   * Pause tracking - privacy control (Technician only)
   *
   * @param bookingId - The booking ID
   */
  pauseTracking(bookingId: string): void {
    socketService.emit('tracking:pause', { bookingId });
  }

  /**
   * Resume tracking after pause (Technician only)
   *
   * @param bookingId - The booking ID
   */
  resumeTracking(bookingId: string): void {
    socketService.emit('tracking:resume', { bookingId });
  }

  /**
   * End tracking session when arrived (Technician only)
   *
   * @param bookingId - The booking ID
   */
  endTracking(bookingId: string): void {
    socketService.emit('tracking:end', { bookingId });
  }

  // ============================================
  // CUSTOMER METHODS
  // ============================================

  /**
   * Subscribe to tracking updates for a booking (Customer only)
   *
   * @param bookingId - The booking ID
   */
  subscribeToTracking(bookingId: string): void {
    socketService.emit('tracking:subscribe', { bookingId });
  }

  /**
   * Unsubscribe from tracking updates (Customer only)
   *
   * @param bookingId - The booking ID
   */
  unsubscribeFromTracking(bookingId: string): void {
    socketService.emit('tracking:unsubscribe', { bookingId });
  }

  // ============================================
  // EVENT LISTENERS - CUSTOMER
  // ============================================

  /**
   * Listen for tracking started event
   * Emitted when technician starts tracking
   *
   * @param callback - Callback function
   */
  onTrackingStarted(callback: (data: TrackingStartedEvent) => void): void {
    socketService.on('tracking:started', callback);
  }

  /**
   * Listen for position updates
   * Emitted when technician's location is updated
   *
   * @param callback - Callback function
   */
  onPositionUpdate(callback: (data: TrackingPositionUpdate) => void): void {
    socketService.on('tracking:position', callback);
  }

  /**
   * Listen for tracking paused event
   * Emitted when technician pauses location sharing
   *
   * @param callback - Callback function
   */
  onTrackingPaused(callback: (data: TrackingPausedEvent) => void): void {
    socketService.on('tracking:paused', callback);
  }

  /**
   * Listen for tracking resumed event
   * Emitted when technician resumes location sharing
   *
   * @param callback - Callback function
   */
  onTrackingResumed(callback: (data: TrackingResumedEvent) => void): void {
    socketService.on('tracking:resumed', callback);
  }

  /**
   * Listen for tracking completed event
   * Emitted when technician arrives and ends tracking
   *
   * @param callback - Callback function
   */
  onTrackingCompleted(callback: (data: TrackingCompletedEvent) => void): void {
    socketService.on('tracking:completed', callback);
  }

  /**
   * Listen for tracking state event
   * Emitted when customer subscribes and there's an active session
   *
   * @param callback - Callback function
   */
  onTrackingState(callback: (data: TrackingStateEvent) => void): void {
    socketService.on('tracking:state', callback);
  }

  /**
   * Listen for tracking errors
   *
   * @param callback - Callback function
   */
  onTrackingError(callback: (data: TrackingErrorEvent) => void): void {
    socketService.on('tracking:error', callback);
  }

  // ============================================
  // CLEANUP METHODS
  // ============================================

  /**
   * Remove all tracking event listeners
   */
  removeAllListeners(): void {
    socketService.off('tracking:started');
    socketService.off('tracking:position');
    socketService.off('tracking:paused');
    socketService.off('tracking:resumed');
    socketService.off('tracking:completed');
    socketService.off('tracking:state');
    socketService.off('tracking:error');
  }

  /**
   * Remove specific tracking event listener
   *
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  removeListener(
    event: 'started' | 'position' | 'paused' | 'resumed' | 'completed' | 'state' | 'error',
    callback?: (...args: any[]) => void
  ): void {
    socketService.off(`tracking:${event}`, callback);
  }
}

// Export singleton instance
export const trackingService = new TrackingService();
export default trackingService;
