/**
 * Regression tests for encryption key validation (Issue #4)
 *
 * Verifies:
 * - Production throws when ENCRYPTION_KEY is missing
 * - Throws when key is not valid hex
 * - Throws when key is wrong length
 * - Uses random fallback in dev/test with warning
 * - Encrypts and decrypts correctly with valid key
 */

const crypto = require('crypto');

// Valid 32-byte hex key for testing
const VALID_KEY = crypto.randomBytes(32).toString('hex');

describe('Encryption Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset module registry so encryption.js re-evaluates on each require
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Key validation', () => {
    it('should throw in production when ENCRYPTION_KEY is missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ENCRYPTION_KEY;

      expect(() => {
        require('../src/utils/encryption');
      }).toThrow('ENCRYPTION_KEY is required in production');
    });

    it('should throw when key is not valid hex or wrong length', () => {
      // Buffer.from with invalid hex silently produces fewer bytes,
      // so this triggers the length check
      process.env.ENCRYPTION_KEY = 'not-a-valid-hex-string-at-all!!not-a-valid-hex-string-at-all!!';

      expect(() => {
        require('../src/utils/encryption');
      }).toThrow('must be exactly 32 bytes');
    });

    it('should throw when key is wrong length (not 32 bytes)', () => {
      // 16 bytes = 32 hex chars (too short)
      process.env.ENCRYPTION_KEY = crypto.randomBytes(16).toString('hex');

      expect(() => {
        require('../src/utils/encryption');
      }).toThrow('must be exactly 32 bytes');
    });

    it('should use random fallback in dev/test when key is missing', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.ENCRYPTION_KEY;

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const encryption = require('../src/utils/encryption');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('using random key')
      );
      // Module should load without throwing
      expect(encryption.encrypt).toBeDefined();
      expect(encryption.decrypt).toBeDefined();
    });

    it('should accept a valid 32-byte hex key', () => {
      process.env.ENCRYPTION_KEY = VALID_KEY;

      expect(() => {
        require('../src/utils/encryption');
      }).not.toThrow();
    });
  });

  describe('encrypt / decrypt', () => {
    let encryption;

    beforeEach(() => {
      process.env.ENCRYPTION_KEY = VALID_KEY;
      encryption = require('../src/utils/encryption');
    });

    it('should encrypt and decrypt correctly', () => {
      const plaintext = 'Hello, Dumu Waks!';
      const encrypted = encryption.encrypt(plaintext);
      const decrypted = encryption.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(encrypted).not.toBe(plaintext);
    });

    it('should produce different ciphertexts for the same plaintext (random IV)', () => {
      const plaintext = 'same input';
      const encrypted1 = encryption.encrypt(plaintext);
      const encrypted2 = encryption.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      // Both should decrypt to the same value
      expect(encryption.decrypt(encrypted1)).toBe(plaintext);
      expect(encryption.decrypt(encrypted2)).toBe(plaintext);
    });

    it('should return falsy input unchanged', () => {
      expect(encryption.encrypt('')).toBe('');
      expect(encryption.encrypt(null)).toBeNull();
      expect(encryption.encrypt(undefined)).toBeUndefined();
      expect(encryption.decrypt('')).toBe('');
      expect(encryption.decrypt(null)).toBeNull();
    });

    it('should return non-encrypted text unchanged from decrypt', () => {
      // Text without ':' is treated as not encrypted
      expect(encryption.decrypt('plaintext')).toBe('plaintext');
    });

    it('should handle unicode text', () => {
      const plaintext = 'Karibu! Habari yako? 🔧';
      const encrypted = encryption.encrypt(plaintext);
      expect(encryption.decrypt(encrypted)).toBe(plaintext);
    });
  });

  describe('isEncrypted', () => {
    let encryption;

    beforeEach(() => {
      process.env.ENCRYPTION_KEY = VALID_KEY;
      encryption = require('../src/utils/encryption');
    });

    it('should return true for encrypted text', () => {
      const encrypted = encryption.encrypt('test');
      expect(encryption.isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(encryption.isEncrypted('just plain text')).toBe(false);
      expect(encryption.isEncrypted(null)).toBe(false);
      expect(encryption.isEncrypted('')).toBe(false);
    });
  });

  describe('hash', () => {
    it('should produce consistent SHA-256 hashes', () => {
      process.env.ENCRYPTION_KEY = VALID_KEY;
      const encryption = require('../src/utils/encryption');

      const hash1 = encryption.hash('test');
      const hash2 = encryption.hash('test');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 = 64 hex chars
    });
  });

  describe('generateToken', () => {
    it('should generate tokens of specified length', () => {
      process.env.ENCRYPTION_KEY = VALID_KEY;
      const encryption = require('../src/utils/encryption');

      const token = encryption.generateToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });
});
