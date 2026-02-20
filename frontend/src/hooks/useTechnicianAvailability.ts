/**
 * useTechnicianAvailability Hook
 * Hook for technicians to manage their availability status
 *
 * Task #73: Real-Time Availability & Queue System
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '@/services/socket';
import {
  AvailabilityStatus,
  AVAILABILITY_EVENTS,
  AvailabilityUpdatePayload,
  AvailabilityChangedPayload,
  QueuePositionUpdatePayload,
  AvailabilityErrorPayload,
  AutoAwayPayload,
} from '@/types/availability';
import { RootState } from '@/store';

interface UseTechnicianAvailabilityOptions {
  autoOnline?: boolean; // Automatically set online on mount
  heartbeatInterval?: number; // Heartbeat interval in ms (default: 60000)
  onStatusChange?: (status: AvailabilityStatus) => void;
  onError?: (error: string) => void;
}

interface UseTechnicianAvailabilityReturn {
  status: AvailabilityStatus;
  isOnline: boolean;
  isBusy: boolean;
  isAway: boolean;
  isOffline: boolean;
  lastSeen: string | null;
  currentBookingId: string | null;
  queuePosition: number;
  updateStatus: (newStatus: AvailabilityStatus, bookingId?: string) => Promise<void>;
  setOnline: () => Promise<void>;
  setBusy: (bookingId: string) => Promise<void>;
  setAway: () => Promise<void>;
  setOffline: () => Promise<void>;
  error: string | null;
}

/**
 * Hook for managing technician availability
 */
export function useTechnicianAvailability(
  options: UseTechnicianAvailabilityOptions = {}
): UseTechnicianAvailabilityReturn {
  const {
    autoOnline = false,
    heartbeatInterval = 60000,
    onStatusChange,
    onError,
  } = options;

  const { user } = useSelector((state: RootState) => state.auth);
  const [status, setStatus] = useState<AvailabilityStatus>('offline');
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Update availability status
   */
  const updateStatus = useCallback(
    async (newStatus: AvailabilityStatus, bookingId?: string) => {
      try {
        setError(null);

        const payload: AvailabilityUpdatePayload = {
          status: newStatus,
          currentBookingId: bookingId !== undefined ? bookingId : currentBookingId,
        };

        socketService.emit(AVAILABILITY_EVENTS.UPDATE_STATUS, payload);

        // Optimistically update local state
        setStatus(newStatus);
        if (bookingId !== undefined) {
          setCurrentBookingId(bookingId);
        }

        onStatusChange?.(newStatus);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [currentBookingId, onStatusChange, onError]
  );

  /**
   * Convenience methods
   */
  const setOnline = useCallback(() => updateStatus('online'), [updateStatus]);
  const setBusy = useCallback((bookingId: string) => updateStatus('busy', bookingId), [updateStatus]);
  const setAway = useCallback(() => updateStatus('away'), [updateStatus]);
  const setOffline = useCallback(() => updateStatus('offline'), [updateStatus]);

  /**
   * Start heartbeat to maintain online status
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    heartbeatTimerRef.current = setInterval(() => {
      if (status === 'online' || status === 'busy') {
        socketService.emit(AVAILABILITY_EVENTS.HEARTBEAT);
      }
    }, heartbeatInterval);
  }, [status, heartbeatInterval]);

  /**
   * Stop heartbeat
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!user || user.role !== 'technician') {
      return;
    }

    /**
     * Handle status update confirmation
     */
    const handleStatusUpdated = (data: AvailabilityChangedPayload) => {
      setStatus(data.status);
      setLastSeen(data.lastSeen);
      setCurrentBookingId(data.currentBookingId);
    };

    /**
     * Handle auto-away notification
     */
    const handleAutoAway = (data: AutoAwayPayload) => {
      setStatus('away');
      setError(data.message);
      onStatusChange?.('away');
    };

    /**
     * Handle errors
     */
    const handleError = (data: AvailabilityErrorPayload) => {
      setError(data.error);
      onError?.(data.error);
    };

    // Register event listeners
    socketService.on(AVAILABILITY_EVENTS.STATUS_UPDATED, handleStatusUpdated);
    socketService.on(AVAILABILITY_EVENTS.AUTO_AWAY, handleAutoAway);
    socketService.on(AVAILABILITY_EVENTS.ERROR, handleError);

    // Auto-set online if enabled
    if (autoOnline) {
      setOnline();
    }

    // Start heartbeat
    startHeartbeat();

    // Cleanup
    return () => {
      socketService.off(AVAILABILITY_EVENTS.STATUS_UPDATED, handleStatusUpdated);
      socketService.off(AVAILABILITY_EVENTS.AUTO_AWAY, handleAutoAway);
      socketService.off(AVAILABILITY_EVENTS.ERROR, handleError);
      stopHeartbeat();
    };
  }, [user, autoOnline, startHeartbeat, stopHeartbeat, setOnline, onStatusChange, onError]);

  // Update heartbeat when status changes
  useEffect(() => {
    if (status === 'online' || status === 'busy') {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  }, [status, startHeartbeat, stopHeartbeat]);

  return {
    status,
    isOnline: status === 'online',
    isBusy: status === 'busy',
    isAway: status === 'away',
    isOffline: status === 'offline',
    lastSeen,
    currentBookingId,
    queuePosition,
    updateStatus,
    setOnline,
    setBusy,
    setAway,
    setOffline,
    error,
  };
}

export default useTechnicianAvailability;
