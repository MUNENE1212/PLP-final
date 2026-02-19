/**
 * Real-time Technician Location Tracking Service for DumuWaks
 *
 * Provides real-time tracking capabilities for technicians during en_route status.
 * Uses in-memory storage for ephemeral tracking data with automatic cleanup.
 *
 * Features:
 * - Start/end tracking sessions
 * - Real-time position updates with ETA recalculation
 * - Privacy controls (pause/resume sharing)
 * - Kenya bounds validation
 * - Automatic session cleanup on completion
 *
 * Security:
 * - Only booking's technician can send updates
 * - Only booking's customer can receive updates
 * - Coordinates validated within Kenya bounds
 */

const { calculateETA } = require('./distance.service');

// Kenya geographical bounds for coordinate validation
const KENYA_BOUNDS = {
  minLat: -4.7,
  maxLat: 4.6,
  minLng: 33.9,
  maxLng: 41.9
};

/**
 * In-memory storage for active tracking sessions
 * Key: bookingId, Value: TrackingSession
 *
 * Note: For production at scale, consider using Redis for:
 * - Distributed deployments
 * - Persistence across restarts
 * - Better memory management
 */
const activeSessions = new Map();

/**
 * Booking status to tracking status mapping
 */
const TRACKING_ELIGIBLE_STATUSES = ['en_route', 'arrived'];

/**
 * Validate coordinates are within Kenya bounds
 *
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateKenyaBounds(longitude, latitude) {
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return {
      isValid: false,
      error: 'Coordinates must be numbers'
    };
  }

  if (isNaN(longitude) || isNaN(latitude)) {
    return {
      isValid: false,
      error: 'Coordinates must be valid numbers'
    };
  }

  if (longitude < KENYA_BOUNDS.minLng || longitude > KENYA_BOUNDS.maxLng) {
    return {
      isValid: false,
      error: `Longitude must be between ${KENYA_BOUNDS.minLng} and ${KENYA_BOUNDS.maxLng} for Kenya`
    };
  }

  if (latitude < KENYA_BOUNDS.minLat || latitude > KENYA_BOUNDS.maxLat) {
    return {
      isValid: false,
      error: `Latitude must be between ${KENYA_BOUNDS.minLat} and ${KENYA_BOUNDS.maxLat} for Kenya`
    };
  }

  return { isValid: true };
}

/**
 * Create a new tracking session for a booking
 *
 * @param {string} bookingId - The booking ID
 * @param {string} technicianId - The technician's user ID
 * @param {string} customerId - The customer's user ID
 * @param {Object} destination - The service location
 * @param {number[]} destination.coordinates - [longitude, latitude]
 * @param {string} destination.address - Service address
 * @param {string} area - Area type for ETA calculation ('urban', 'peri-urban', 'rural')
 * @returns {Object} The created tracking session
 */
function startTrackingSession(bookingId, technicianId, customerId, destination, area = 'urban') {
  if (!bookingId || !technicianId || !customerId) {
    throw new Error('bookingId, technicianId, and customerId are required');
  }

  if (!destination || !destination.coordinates || !Array.isArray(destination.coordinates)) {
    throw new Error('Destination with coordinates [lng, lat] is required');
  }

  // Validate destination coordinates
  const [destLng, destLat] = destination.coordinates;
  const destValidation = validateKenyaBounds(destLng, destLat);
  if (!destValidation.isValid) {
    throw new Error(`Invalid destination: ${destValidation.error}`);
  }

  // End any existing session for this booking
  if (activeSessions.has(bookingId)) {
    activeSessions.delete(bookingId);
  }

  const session = {
    bookingId,
    technicianId,
    customerId,
    startTime: new Date(),
    currentPosition: null,
    destination: {
      coordinates: destination.coordinates,
      address: destination.address || ''
    },
    eta: {
      minutes: null,
      text: null,
      lastCalculated: null
    },
    isPaused: false,
    status: 'active',
    area,
    positionHistory: [] // Store recent positions for analysis
  };

  activeSessions.set(bookingId, session);

  return session;
}

/**
 * Update technician's current position
 *
 * @param {string} bookingId - The booking ID
 * @param {string} technicianId - The technician's user ID (for authorization)
 * @param {number[]} coordinates - [longitude, latitude]
 * @returns {Object} Updated tracking session with new ETA
 */
function updateTechnicianLocation(bookingId, technicianId, coordinates) {
  const session = activeSessions.get(bookingId);

  if (!session) {
    throw new Error('No active tracking session for this booking');
  }

  // Security: Only the assigned technician can update location
  if (session.technicianId !== technicianId) {
    throw new Error('Unauthorized: Only the assigned technician can update location');
  }

  // Check if tracking is paused
  if (session.isPaused) {
    throw new Error('Tracking is currently paused. Resume tracking to send updates.');
  }

  // Validate coordinates
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('Coordinates must be an array [longitude, latitude]');
  }

  const [lng, lat] = coordinates;
  const validation = validateKenyaBounds(lng, lat);
  if (!validation.isValid) {
    throw new Error(`Invalid coordinates: ${validation.error}`);
  }

  // Update position
  const timestamp = new Date();
  const newPosition = {
    coordinates: [lng, lat],
    timestamp
  };

  // Keep position history (last 10 positions)
  session.positionHistory.push(newPosition);
  if (session.positionHistory.length > 10) {
    session.positionHistory.shift();
  }

  session.currentPosition = newPosition;

  // Calculate new ETA
  const eta = calculateETA(
    { lat, lon: lng },
    { lat: session.destination.coordinates[1], lon: session.destination.coordinates[0] },
    session.area
  );

  session.eta = {
    minutes: eta.estimatedMinutes,
    text: eta.etaText,
    distance: eta.distance,
    distanceText: eta.distanceText,
    lastCalculated: timestamp
  };

  return {
    bookingId: session.bookingId,
    position: session.currentPosition,
    eta: session.eta,
    status: session.status,
    isPaused: session.isPaused
  };
}

/**
 * Get current tracking session data
 *
 * @param {string} bookingId - The booking ID
 * @param {string} requesterId - The user requesting the data (for authorization)
 * @returns {Object|null} The tracking session or null if not found
 */
function getTrackingSession(bookingId, requesterId) {
  const session = activeSessions.get(bookingId);

  if (!session) {
    return null;
  }

  // Security: Only the customer or technician can view tracking data
  if (session.customerId !== requesterId && session.technicianId !== requesterId) {
    throw new Error('Unauthorized: Only the customer or technician can view tracking data');
  }

  // Return public-facing tracking data
  return {
    bookingId: session.bookingId,
    technicianId: session.technicianId,
    customerId: session.customerId,
    startTime: session.startTime,
    currentPosition: session.currentPosition,
    destination: session.destination,
    eta: session.eta,
    isPaused: session.isPaused,
    status: session.status
  };
}

/**
 * End a tracking session (when technician arrives)
 *
 * @param {string} bookingId - The booking ID
 * @param {string} technicianId - The technician's user ID (for authorization)
 * @returns {Object} The completed session summary
 */
function endTrackingSession(bookingId, technicianId) {
  const session = activeSessions.get(bookingId);

  if (!session) {
    throw new Error('No active tracking session for this booking');
  }

  // Security: Only the assigned technician can end tracking
  if (session.technicianId !== technicianId) {
    throw new Error('Unauthorized: Only the assigned technician can end tracking');
  }

  // Mark session as completed
  session.status = 'completed';
  session.endTime = new Date();
  session.isPaused = false;

  // Create summary before removing
  const summary = {
    bookingId: session.bookingId,
    technicianId: session.technicianId,
    customerId: session.customerId,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: Math.round((session.endTime - session.startTime) / 1000 / 60), // in minutes
    finalPosition: session.currentPosition,
    destination: session.destination,
    status: 'completed'
  };

  // Remove from active sessions
  activeSessions.delete(bookingId);

  return summary;
}

/**
 * Pause tracking (privacy control for technician)
 *
 * @param {string} bookingId - The booking ID
 * @param {string} technicianId - The technician's user ID (for authorization)
 * @returns {Object} Updated session status
 */
function pauseTracking(bookingId, technicianId) {
  const session = activeSessions.get(bookingId);

  if (!session) {
    throw new Error('No active tracking session for this booking');
  }

  // Security: Only the assigned technician can pause tracking
  if (session.technicianId !== technicianId) {
    throw new Error('Unauthorized: Only the assigned technician can pause tracking');
  }

  if (session.isPaused) {
    throw new Error('Tracking is already paused');
  }

  session.isPaused = true;
  session.status = 'paused';
  session.pausedAt = new Date();

  return {
    bookingId: session.bookingId,
    isPaused: session.isPaused,
    status: session.status,
    pausedAt: session.pausedAt
  };
}

/**
 * Resume tracking (after pause)
 *
 * @param {string} bookingId - The booking ID
 * @param {string} technicianId - The technician's user ID (for authorization)
 * @returns {Object} Updated session status
 */
function resumeTracking(bookingId, technicianId) {
  const session = activeSessions.get(bookingId);

  if (!session) {
    throw new Error('No active tracking session for this booking');
  }

  // Security: Only the assigned technician can resume tracking
  if (session.technicianId !== technicianId) {
    throw new Error('Unauthorized: Only the assigned technician can resume tracking');
  }

  if (!session.isPaused) {
    throw new Error('Tracking is not paused');
  }

  session.isPaused = false;
  session.status = 'active';
  session.resumedAt = new Date();

  return {
    bookingId: session.bookingId,
    isPaused: session.isPaused,
    status: session.status,
    resumedAt: session.resumedAt
  };
}

/**
 * Check if a booking has an active tracking session
 *
 * @param {string} bookingId - The booking ID
 * @returns {boolean} True if tracking is active
 */
function isTrackingActive(bookingId) {
  const session = activeSessions.get(bookingId);
  return session !== undefined && session.status === 'active' && !session.isPaused;
}

/**
 * Get all active tracking sessions (for admin/debugging)
 *
 * @returns {Array} Array of active session summaries
 */
function getAllActiveSessions() {
  const sessions = [];
  activeSessions.forEach((session, bookingId) => {
    sessions.push({
      bookingId,
      technicianId: session.technicianId,
      customerId: session.customerId,
      status: session.status,
      isPaused: session.isPaused,
      startTime: session.startTime
    });
  });
  return sessions;
}

/**
 * Clean up expired sessions (sessions older than maxAge minutes)
 *
 * @param {number} maxAge - Maximum age in minutes (default: 240 = 4 hours)
 * @returns {number} Number of sessions cleaned up
 */
function cleanupExpiredSessions(maxAge = 240) {
  const now = new Date();
  let cleanedCount = 0;

  activeSessions.forEach((session, bookingId) => {
    const sessionAge = (now - session.startTime) / 1000 / 60; // in minutes
    if (sessionAge > maxAge) {
      activeSessions.delete(bookingId);
      cleanedCount++;
    }
  });

  return cleanedCount;
}

/**
 * Get tracking statistics
 *
 * @returns {Object} Statistics about active tracking sessions
 */
function getTrackingStats() {
  let active = 0;
  let paused = 0;

  activeSessions.forEach((session) => {
    if (session.isPaused) {
      paused++;
    } else if (session.status === 'active') {
      active++;
    }
  });

  return {
    totalSessions: activeSessions.size,
    activeSessions: active,
    pausedSessions: paused,
    kenyaBounds: KENYA_BOUNDS
  };
}

module.exports = {
  // Main functions
  startTrackingSession,
  updateTechnicianLocation,
  getTrackingSession,
  endTrackingSession,
  pauseTracking,
  resumeTracking,

  // Utility functions
  validateKenyaBounds,
  isTrackingActive,
  getAllActiveSessions,
  cleanupExpiredSessions,
  getTrackingStats,

  // Constants
  KENYA_BOUNDS,
  TRACKING_ELIGIBLE_STATUSES
};
