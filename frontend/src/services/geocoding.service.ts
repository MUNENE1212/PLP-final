/**
 * Geocoding Service
 * Converts addresses to coordinates and vice versa
 */

interface GeocodingResult {
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress: string;
  city?: string;
  county?: string;
  country?: string;
}

interface ReverseGeocodingResult {
  address: string;
  city?: string;
  county?: string;
  country?: string;
}

/**
 * Forward geocoding: Convert address to coordinates
 * Using Nominatim (OpenStreetMap) - free and no API key required
 */
export const geocodeAddress = async (
  address: string,
  city?: string,
  country?: string
): Promise<GeocodingResult | null> => {
  try {
    // Build query string
    const parts = [address, city, country].filter(Boolean);
    const query = encodeURIComponent(parts.join(', '));

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      {
        headers: {
          'User-Agent': 'EmEnTech-App', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
        formattedAddress: result.display_name,
        city: city,
        county: extractCounty(result.display_name),
        country: country || 'Kenya',
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocoding: Convert coordinates to address
 */
export const reverseGeocode = async (
  longitude: number,
  latitude: number
): Promise<ReverseGeocodingResult | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'EmEnTech-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();

    if (data && data.display_name) {
      return {
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        county: data.address?.county || data.address?.state,
        country: data.address?.country || 'Kenya',
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Get current user location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Get coordinates from current browser location
 */
export const getCurrentCoordinates = async (): Promise<[number, number] | null> => {
  try {
    const position = await getCurrentLocation();
    return [position.coords.longitude, position.coords.latitude];
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Calculate distance between two points in kilometers
 * Uses Haversine formula
 */
export const calculateDistance = (
  coords1: [number, number],
  coords2: [number, number]
): number => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Helper function to convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Extract county from formatted address
 */
const extractCounty = (address: string): string | undefined => {
  // This is a simple implementation - you might want to improve this
  // based on your specific address format
  const parts = address.split(',');
  if (parts.length >= 3) {
    return parts[parts.length - 3]?.trim();
  }
  return undefined;
};

/**
 * Validate coordinates
 */
export const validateCoordinates = (coordinates: [number, number]): boolean => {
  const [lon, lat] = coordinates;
  return (
    lon >= -180 &&
    lon <= 180 &&
    lat >= -90 &&
    lat <= 90 &&
    !(lon === 0 && lat === 0)
  );
};

export default {
  geocodeAddress,
  reverseGeocode,
  getCurrentLocation,
  getCurrentCoordinates,
  calculateDistance,
  validateCoordinates,
};
