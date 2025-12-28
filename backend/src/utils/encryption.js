const crypto = require('crypto');

// Get encryption key from environment or generate a default one for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32); // Must be 32 bytes for AES-256
const IV_LENGTH = 16; // For AES, this is always 16

// Convert to buffer if it's a hex string and ensure consistent usage
let encryptionKeyBuffer;
if (typeof ENCRYPTION_KEY === 'string') {
  try {
    encryptionKeyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

    // Validate key length is exactly 32 bytes for AES-256
    if (encryptionKeyBuffer.length !== 32) {
      console.warn('⚠️  Encryption key must be 32 bytes (64 hex chars), using fallback key');
      encryptionKeyBuffer = crypto.randomBytes(32);
    }
  } catch (error) {
    console.warn('⚠️  Error with encryption key, using fallback key');
    encryptionKeyBuffer = crypto.randomBytes(32);
  }
} else {
  encryptionKeyBuffer = ENCRYPTION_KEY;
}

// Export the key buffer for consistent usage
module.exports.encryptionKeyBuffer = encryptionKeyBuffer;

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV prepended (format: iv:encryptedData)
 */
function encrypt(text) {
  if (!text) return text;

  try {
    // Generate a random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Use the properly prepared key buffer
    const keyBuffer = encryptionKeyBuffer || (typeof ENCRYPTION_KEY === 'string' ? Buffer.from(ENCRYPTION_KEY, 'hex') : ENCRYPTION_KEY);

    // Create cipher
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      keyBuffer,
      iv
    );

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (IV is needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using AES-256-CBC
 * @param {string} text - Encrypted text (format: iv:encryptedData)
 * @returns {string} - Decrypted text
 */
function decrypt(text) {
  if (!text) return text;

  // If text doesn't contain ':', it's not encrypted
  if (!text.includes(':')) return text;

  try {
    // Split IV and encrypted data
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');

    // Use the properly prepared key buffer
    const keyBuffer = encryptionKeyBuffer || (typeof ENCRYPTION_KEY === 'string' ? Buffer.from(ENCRYPTION_KEY, 'hex') : ENCRYPTION_KEY);

    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      keyBuffer,
      iv
    );

    // Decrypt the text
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Silently handle decryption failures (likely due to key mismatch)
    // This happens when messages were encrypted with a different key
    // Return a placeholder to indicate the message is encrypted with old key
    if (error.code === 'ERR_OSSL_BAD_DECRYPT') {
      return '[Message encrypted with different key]';
    }
    // For other errors, log and return original text
    console.error('Unexpected decryption error:', error.code);
    return text;
  }
}

/**
 * Hash sensitive data (one-way, irreversible)
 * @param {string} text - Text to hash
 * @returns {string} - Hashed text
 */
function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Random token as hex string
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate encryption key (for setup)
 * Use this to generate a key for ENCRYPTION_KEY env variable
 * @returns {string} - 32-byte key as hex string
 */
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify if text is encrypted
 * @param {string} text - Text to check
 * @returns {boolean} - True if encrypted
 */
function isEncrypted(text) {
  if (!text || typeof text !== 'string') return false;
  // Check if format matches iv:encryptedData
  const parts = text.split(':');
  return parts.length === 2 && parts[0].length === 32; // IV is 16 bytes = 32 hex chars
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateToken,
  generateEncryptionKey,
  isEncrypted
};
