/**
 * Tests for Distance/ETA Calculation Service
 *
 * Tests cover:
 * - Haversine formula for straight-line distance
 * - Kenya road factor adjustments
 * - Travel time estimation
 * - ETA formatting
 */

const {
  calculateDistance,
  estimateTravelTime,
  calculateETA,
  formatETA,
  getAreaConfig,
  KENYA_AREA_CONFIGS
} = require('../src/services/distance.service');

describe('Distance Service', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates using Haversine formula', () => {
      // Nairobi CBD to Westlands (approx 5.5 km)
      const nairobiCBD = { lat: -1.286389, lon: 36.817223 };
      const westlands = { lat: -1.2634, lon: 36.8036 };

      const distance = calculateDistance(
        nairobiCBD.lat, nairobiCBD.lon,
        westlands.lat, westlands.lon
      );

      expect(distance).toBeGreaterThan(2);
      expect(distance).toBeLessThan(4);
    });

    it('should return 0 for identical coordinates', () => {
      const location = { lat: -1.286389, lon: 36.817223 };

      const distance = calculateDistance(
        location.lat, location.lon,
        location.lat, location.lon
      );

      expect(distance).toBe(0);
    });

    it('should handle negative coordinates (Southern Hemisphere)', () => {
      // Nairobi to Mombasa (approx 440-500 km)
      const nairobi = { lat: -1.2921, lon: 36.8219 };
      const mombasa = { lat: -4.0435, lon: 39.6682 };

      const distance = calculateDistance(
        nairobi.lat, nairobi.lon,
        mombasa.lat, mombasa.lon
      );

      expect(distance).toBeGreaterThan(400);
      expect(distance).toBeLessThan(500);
    });

    it('should calculate long distances correctly', () => {
      // Nairobi to Kisumu (approx 260-300 km)
      const nairobi = { lat: -1.2921, lon: 36.8219 };
      const kisumu = { lat: -0.1022, lon: 34.7617 };

      const distance = calculateDistance(
        nairobi.lat, nairobi.lon,
        kisumu.lat, kisumu.lon
      );

      expect(distance).toBeGreaterThan(250);
      expect(distance).toBeLessThan(320);
    });

    it('should round distance to 1 decimal place', () => {
      const distance = calculateDistance(-1.286389, 36.817223, -1.2634, 36.8036);

      // Check that distance has at most 1 decimal place
      expect(distance.toString()).toMatch(/^\d+(\.\d)?$/);
    });
  });

  describe('estimateTravelTime', () => {
    it('should estimate travel time for urban areas (Nairobi)', () => {
      // 10 km in urban Nairobi
      const result = estimateTravelTime(10, 'urban');

      expect(result).toHaveProperty('estimatedMinutes');
      expect(result).toHaveProperty('roadDistance');
      expect(result).toHaveProperty('averageSpeed');
      expect(result).toHaveProperty('roadFactor');

      // Road factor 1.4, avg speed 25 km/h
      // Road distance: 10 * 1.4 = 14 km
      // Time: 14 / 25 * 60 = 33.6 minutes
      expect(result.roadFactor).toBe(1.4);
      expect(result.averageSpeed).toBe(25);
      expect(result.roadDistance).toBe(14);
      expect(result.estimatedMinutes).toBe(34); // rounded
    });

    it('should estimate travel time for peri-urban areas', () => {
      // 15 km in peri-urban area
      const result = estimateTravelTime(15, 'peri-urban');

      // Road factor 1.6, avg speed 35 km/h
      // Road distance: 15 * 1.6 = 24 km
      // Time: 24 / 35 * 60 = 41.1 minutes
      expect(result.roadFactor).toBe(1.6);
      expect(result.averageSpeed).toBe(35);
      expect(result.roadDistance).toBe(24);
      expect(result.estimatedMinutes).toBe(41);
    });

    it('should estimate travel time for rural areas', () => {
      // 20 km in rural area
      const result = estimateTravelTime(20, 'rural');

      // Road factor 1.8, avg speed 45 km/h
      // Road distance: 20 * 1.8 = 36 km
      // Time: 36 / 45 * 60 = 48 minutes
      expect(result.roadFactor).toBe(1.8);
      expect(result.averageSpeed).toBe(45);
      expect(result.roadDistance).toBe(36);
      expect(result.estimatedMinutes).toBe(48);
    });

    it('should default to urban area if not specified', () => {
      const result = estimateTravelTime(10);

      expect(result.roadFactor).toBe(1.4);
      expect(result.averageSpeed).toBe(25);
    });

    it('should handle very short distances', () => {
      const result = estimateTravelTime(0.5, 'urban');

      expect(result.estimatedMinutes).toBeGreaterThanOrEqual(1);
    });

    it('should handle edge case of zero distance', () => {
      const result = estimateTravelTime(0, 'urban');

      expect(result.estimatedMinutes).toBe(0);
      expect(result.roadDistance).toBe(0);
    });
  });

  describe('formatETA', () => {
    it('should format minutes as "~X min"', () => {
      expect(formatETA(15)).toBe('~15 min');
      expect(formatETA(5)).toBe('~5 min');
      expect(formatETA(120)).toBe('~120 min');
    });

    it('should handle 0 minutes', () => {
      expect(formatETA(0)).toBe('~0 min');
    });

    it('should handle large values', () => {
      expect(formatETA(180)).toBe('~180 min');
    });

    it('should handle decimal values by rounding', () => {
      expect(formatETA(15.4)).toBe('~15 min');
      expect(formatETA(15.5)).toBe('~16 min');
    });
  });

  describe('calculateETA', () => {
    it('should calculate complete ETA between two locations', () => {
      const technicianLocation = { lat: -1.286389, lon: 36.817223 };
      const customerLocation = { lat: -1.2634, lon: 36.8036 };

      const result = calculateETA(technicianLocation, customerLocation, 'urban');

      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('distanceText');
      expect(result).toHaveProperty('estimatedMinutes');
      expect(result).toHaveProperty('etaText');
      expect(result).toHaveProperty('area');
      expect(result).toHaveProperty('roadFactor');

      expect(result.distance).toBeGreaterThan(0);
      expect(result.distanceText).toMatch(/^\d+(\.\d)? km$/);
      expect(result.etaText).toMatch(/^~\d+ min$/);
      expect(result.area).toBe('urban');
    });

    it('should return correct API output format', () => {
      const result = calculateETA(
        { lat: -1.2921, lon: 36.8219 },
        { lat: -1.2634, lon: 36.8036 },
        'urban'
      );

      // Verify the exact output format required
      expect(result).toEqual({
        distance: expect.any(Number),
        distanceText: expect.stringMatching(/^\d+(\.\d)? km$/),
        estimatedMinutes: expect.any(Number),
        etaText: expect.stringMatching(/^~\d+ min$/),
        area: 'urban',
        roadFactor: 1.4
      });
    });

    it('should handle different area types', () => {
      const loc1 = { lat: -1.286389, lon: 36.817223 };
      const loc2 = { lat: -1.2634, lon: 36.8036 };

      const urbanResult = calculateETA(loc1, loc2, 'urban');
      expect(urbanResult.roadFactor).toBe(1.4);

      const periUrbanResult = calculateETA(loc1, loc2, 'peri-urban');
      expect(periUrbanResult.roadFactor).toBe(1.6);

      const ruralResult = calculateETA(loc1, loc2, 'rural');
      expect(ruralResult.roadFactor).toBe(1.8);
    });

    it('should default to urban area when not specified', () => {
      const result = calculateETA(
        { lat: -1.286389, lon: 36.817223 },
        { lat: -1.2634, lon: 36.8036 }
      );

      expect(result.area).toBe('urban');
      expect(result.roadFactor).toBe(1.4);
    });

    it('should return 0 minutes for same location', () => {
      const location = { lat: -1.286389, lon: 36.817223 };

      const result = calculateETA(location, location, 'urban');

      expect(result.distance).toBe(0);
      expect(result.estimatedMinutes).toBe(0);
      expect(result.etaText).toBe('~0 min');
    });
  });

  describe('getAreaConfig', () => {
    it('should return urban config for Nairobi', () => {
      const config = getAreaConfig('urban');

      expect(config).toEqual({
        roadFactor: 1.4,
        averageSpeed: 25,
        description: 'Urban areas (Nairobi, Mombasa, Kisumu)'
      });
    });

    it('should return peri-urban config', () => {
      const config = getAreaConfig('peri-urban');

      expect(config).toEqual({
        roadFactor: 1.6,
        averageSpeed: 35,
        description: 'Peri-urban areas (growing towns)'
      });
    });

    it('should return rural config', () => {
      const config = getAreaConfig('rural');

      expect(config).toEqual({
        roadFactor: 1.8,
        averageSpeed: 45,
        description: 'Rural areas (less traffic, rougher roads)'
      });
    });

    it('should default to urban for unknown area', () => {
      const config = getAreaConfig('unknown');

      expect(config.roadFactor).toBe(1.4);
      expect(config.averageSpeed).toBe(25);
    });
  });

  describe('KENYA_AREA_CONFIGS', () => {
    it('should export Kenya area configurations', () => {
      expect(KENYA_AREA_CONFIGS).toHaveProperty('urban');
      expect(KENYA_AREA_CONFIGS).toHaveProperty('peri-urban');
      expect(KENYA_AREA_CONFIGS).toHaveProperty('rural');
    });

    it('should have correct urban settings', () => {
      expect(KENYA_AREA_CONFIGS.urban).toEqual({
        roadFactor: 1.4,
        averageSpeed: 25,
        description: 'Urban areas (Nairobi, Mombasa, Kisumu)'
      });
    });

    it('should have correct peri-urban settings', () => {
      expect(KENYA_AREA_CONFIGS['peri-urban']).toEqual({
        roadFactor: 1.6,
        averageSpeed: 35,
        description: 'Peri-urban areas (growing towns)'
      });
    });

    it('should have correct rural settings', () => {
      expect(KENYA_AREA_CONFIGS.rural).toEqual({
        roadFactor: 1.8,
        averageSpeed: 45,
        description: 'Rural areas (less traffic, rougher roads)'
      });
    });
  });
});
