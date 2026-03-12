/**
 * Regression tests for security configuration validation (Issue #4)
 *
 * Verifies:
 * - ENCRYPTION_KEY is in REQUIRED_VARS.production
 * - Default values are rejected for ENCRYPTION_KEY
 * - Production validation throws on missing secrets
 * - Development validation warns but doesn't throw
 */

const {
  validateSecurityConfig,
  hasRequiredSecrets,
  REQUIRED_VARS,
  NO_DEFAULT_VALUES,
} = require('../src/config/securityValidation');

describe('Security Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('REQUIRED_VARS', () => {
    it('should require ENCRYPTION_KEY in production', () => {
      expect(REQUIRED_VARS.production).toContain('ENCRYPTION_KEY');
    });

    it('should require JWT_SECRET in production', () => {
      expect(REQUIRED_VARS.production).toContain('JWT_SECRET');
    });

    it('should require JWT_REFRESH_SECRET in production', () => {
      expect(REQUIRED_VARS.production).toContain('JWT_REFRESH_SECRET');
    });

    it('should require MONGODB_URI in production', () => {
      expect(REQUIRED_VARS.production).toContain('MONGODB_URI');
    });

    it('should require MPESA_CALLBACK_SECRET in production', () => {
      expect(REQUIRED_VARS.production).toContain('MPESA_CALLBACK_SECRET');
    });
  });

  describe('NO_DEFAULT_VALUES', () => {
    it('should reject default values for ENCRYPTION_KEY', () => {
      expect(NO_DEFAULT_VALUES.ENCRYPTION_KEY).toBeDefined();
      expect(NO_DEFAULT_VALUES.ENCRYPTION_KEY).toContain('test');
      expect(NO_DEFAULT_VALUES.ENCRYPTION_KEY).toContain('default');
      expect(NO_DEFAULT_VALUES.ENCRYPTION_KEY).toContain('example');
    });

    it('should reject default values for JWT_SECRET', () => {
      expect(NO_DEFAULT_VALUES.JWT_SECRET).toBeDefined();
      expect(NO_DEFAULT_VALUES.JWT_SECRET).toContain('secret');
      expect(NO_DEFAULT_VALUES.JWT_SECRET).toContain('change-me');
    });
  });

  describe('validateSecurityConfig', () => {
    it('should throw in production when required vars are missing', () => {
      // Clear all required vars
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      delete process.env.MONGODB_URI;
      delete process.env.MPESA_CALLBACK_SECRET;
      delete process.env.ENCRYPTION_KEY;

      expect(() => {
        validateSecurityConfig('production');
      }).toThrow('SECURITY CONFIGURATION ERROR');
    });

    it('should throw in production when ENCRYPTION_KEY has default value', () => {
      process.env.JWT_SECRET = 'a'.repeat(64);
      process.env.JWT_REFRESH_SECRET = 'b'.repeat(64);
      process.env.MONGODB_URI = 'mongodb+srv://prod:pass@cluster.mongodb.net/db';
      process.env.MPESA_CALLBACK_SECRET = 'c'.repeat(64);
      process.env.ENCRYPTION_KEY = 'this-is-a-test-value-that-should-be-rejected';

      expect(() => {
        validateSecurityConfig('production');
      }).toThrow();
    });

    it('should warn but not throw in development for missing vars', () => {
      delete process.env.JWT_SECRET;
      delete process.env.ENCRYPTION_KEY;

      expect(() => {
        validateSecurityConfig('development');
      }).not.toThrow();
    });

    it('should pass in production with all valid secrets', () => {
      process.env.JWT_SECRET = 'a'.repeat(64);
      process.env.JWT_REFRESH_SECRET = 'b'.repeat(64);
      process.env.MONGODB_URI = 'mongodb+srv://prod:pass@cluster.mongodb.net/db';
      process.env.MPESA_CALLBACK_SECRET = 'c'.repeat(64);
      process.env.ENCRYPTION_KEY = require('crypto').randomBytes(32).toString('hex');
      process.env.NODE_ENV = 'production';

      expect(() => {
        validateSecurityConfig('production');
      }).not.toThrow();
    });

    it('should warn about short secrets in production', () => {
      process.env.JWT_SECRET = 'a'.repeat(64);
      process.env.JWT_REFRESH_SECRET = 'short'; // Too short
      process.env.MONGODB_URI = 'mongodb+srv://prod:pass@cluster.mongodb.net/db';
      process.env.MPESA_CALLBACK_SECRET = 'c'.repeat(64);
      process.env.ENCRYPTION_KEY = require('crypto').randomBytes(32).toString('hex');

      // Should still pass (warnings only for short secrets, not errors)
      // But JWT_REFRESH_SECRET being "short" contains no default pattern
      const result = validateSecurityConfig('production');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should return valid:true with errors/warnings arrays', () => {
      process.env.NODE_ENV = 'test';
      const result = validateSecurityConfig('test');

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('hasRequiredSecrets', () => {
    it('should return true when validation passes', () => {
      process.env.NODE_ENV = 'test';
      expect(hasRequiredSecrets()).toBe(true);
    });
  });
});
