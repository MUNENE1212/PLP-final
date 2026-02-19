/**
 * Distance/ETA Calculation Service for DumuWaks
 *
 * Provides distance and estimated arrival time calculations between
 * technician and customer locations using Kenya-specific road factors.
 *
 * Features:
 * - Haversine formula for straight-line distance
 * - Kenya road factor adjustment (1.4x for urban, 1.8x for rural)
 * - Travel time estimation with area-specific average speeds
 * - Human-readable ETA formatting
 */

/**
 * Kenya-specific area configurations
 *
 * Road factors account for:
 * - Traffic congestion
 * - Road conditions (potholes, unpaved sections)
 * - Indirect routes (no straight-line roads)
 * - Matatu stops and traffic calming measures
 *
 * Average speeds based on typical Kenyan road conditions:
 * - Urban: Heavy traffic, many stops, lower average speed
 * - Peri-urban: Moderate traffic, better flow
 * - Rural: Less traffic but rougher roads
 */
const KENYA_AREA_CONFIGS = {
  urban: {
    roadFactor: 1.4,
    averageSpeed: 25, // km/h - accounts for Nairobi/Mombasa/Kisumu traffic
    description: 'Urban areas (Nairobi, Mombasa, Kisumu)'
  },
  'peri-urban': {
    roadFactor: 1.6,
    averageSpeed: 35, // km/h - growing towns with moderate traffic
    description: 'Peri-urban areas (growing towns)'
  },
  rural: {
    roadFactor: 1.8,
    averageSpeed: 45, // km/h - less traffic but rougher roads
    description: 'Rural areas (less traffic, rougher roads)'
  }
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * The Haversine formula determines the great-circle distance between
 * two points on a sphere given their longitudes and latitudes.
 *
 * @param {number} lat1 - Latitude of point 1 in decimal degrees
 * @param {number} lon1 - Longitude of point 1 in decimal degrees
 * @param {number} lat2 - Latitude of point 2 in decimal degrees
 * @param {number} lon2 - Longitude of point 2 in decimal degrees
 * @returns {number} Distance in kilometers, rounded to 1 decimal place
 *
 * @example
 * // Distance from Nairobi CBD to Westlands
 * const distance = calculateDistance(-1.286389, 36.817223, -1.2634, 36.8036);
 * // Returns approximately 3.2 km
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  // Round to 1 decimal place for readability
  return Math.round(distance * 10) / 10;
}

/**
 * Get area configuration for a given area type
 *
 * @param {string} area - Area type ('urban', 'peri-urban', 'rural')
 * @returns {Object} Area configuration with roadFactor, averageSpeed, description
 */
function getAreaConfig(area = 'urban') {
  const normalizedArea = area.toLowerCase().trim();

  // Check if valid area, default to urban if not
  if (!KENYA_AREA_CONFIGS[normalizedArea]) {
    return KENYA_AREA_CONFIGS.urban;
  }

  return KENYA_AREA_CONFIGS[normalizedArea];
}

/**
 * Estimate travel time based on distance and area type
 *
 * Applies Kenya-specific road factors to account for actual road distances
 * being longer than straight-line distances, and uses area-specific
 * average speeds.
 *
 * @param {number} distance - Straight-line distance in kilometers
 * @param {string} area - Area type ('urban', 'peri-urban', 'rural')
 * @returns {Object} Travel time estimation
 * @returns {number} returns.estimatedMinutes - Estimated travel time in minutes
 * @returns {number} returns.roadDistance - Adjusted road distance in km
 * @returns {number} returns.averageSpeed - Average speed used (km/h)
 * @returns {number} returns.roadFactor - Road factor applied
 *
 * @example
 * // Estimate travel time for 10km in urban Nairobi
 * const estimate = estimateTravelTime(10, 'urban');
 * // Returns { estimatedMinutes: 34, roadDistance: 14, averageSpeed: 25, roadFactor: 1.4 }
 */
function estimateTravelTime(distance, area = 'urban') {
  const config = getAreaConfig(area);

  // Handle zero distance edge case
  if (distance <= 0) {
    return {
      estimatedMinutes: 0,
      roadDistance: 0,
      averageSpeed: config.averageSpeed,
      roadFactor: config.roadFactor
    };
  }

  // Apply road factor to get actual road distance
  const roadDistance = distance * config.roadFactor;

  // Calculate time: time = distance / speed (in hours)
  const timeInHours = roadDistance / config.averageSpeed;

  // Convert to minutes and round
  const estimatedMinutes = Math.round(timeInHours * 60);

  // Ensure minimum of 1 minute for very short distances
  return {
    estimatedMinutes: Math.max(1, estimatedMinutes),
    roadDistance: Math.round(roadDistance * 10) / 10,
    averageSpeed: config.averageSpeed,
    roadFactor: config.roadFactor
  };
}

/**
 * Format estimated minutes as human-readable ETA text
 *
 * @param {number} minutes - Estimated minutes
 * @returns {string} Formatted ETA string like "~15 min"
 *
 * @example
 * formatETA(18); // Returns "~18 min"
 * formatETA(0);  // Returns "~0 min"
 */
function formatETA(minutes) {
  const roundedMinutes = Math.round(minutes);
  return `~${roundedMinutes} min`;
}

/**
 * Calculate complete ETA between technician and customer locations
 *
 * This is the main function that combines distance calculation,
 * road factor adjustment, and time estimation into a single result.
 *
 * @param {Object} technicianLocation - Technician's location
 * @param {number} technicianLocation.lat - Latitude
 * @param {number} technicianLocation.lon - Longitude
 * @param {Object} customerLocation - Customer's location
 * @param {number} customerLocation.lat - Latitude
 * @param {number} customerLocation.lon - Longitude
 * @param {string} area - Area type ('urban', 'peri-urban', 'rural')
 * @returns {Object} Complete ETA information
 *
 * @example
 * const result = calculateETA(
 *   { lat: -1.2921, lon: 36.8219 },
 *   { lat: -1.2634, lon: 36.8036 },
 *   'urban'
 * );
 * // Returns:
 * // {
 * //   distance: 3.5,
 * //   distanceText: "3.5 km",
 * //   estimatedMinutes: 12,
 * //   etaText: "~12 min",
 * //   area: "urban",
 * //   roadFactor: 1.4
 * // }
 */
function calculateETA(technicianLocation, customerLocation, area = 'urban') {
  const config = getAreaConfig(area);

  // Calculate straight-line distance
  const distance = calculateDistance(
    technicianLocation.lat,
    technicianLocation.lon,
    customerLocation.lat,
    customerLocation.lon
  );

  // Estimate travel time
  const timeEstimate = estimateTravelTime(distance, area);

  return {
    distance: distance,
    distanceText: `${distance} km`,
    estimatedMinutes: timeEstimate.estimatedMinutes,
    etaText: formatETA(timeEstimate.estimatedMinutes),
    area: area,
    roadFactor: config.roadFactor
  };
}

module.exports = {
  calculateDistance,
  estimateTravelTime,
  calculateETA,
  formatETA,
  getAreaConfig,
  KENYA_AREA_CONFIGS
};
