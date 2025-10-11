#!/usr/bin/env node

/**
 * Generate Encryption Key for BaiTech Messaging
 *
 * This script generates a secure 32-byte (256-bit) encryption key
 * for use with AES-256-CBC encryption.
 *
 * Usage:
 *   node generate-encryption-key.js
 *
 * Add the output to your .env file:
 *   ENCRYPTION_KEY=<generated_key>
 */

const crypto = require('crypto');

console.log('\n🔐 BaiTech Encryption Key Generator\n');
console.log('Generating secure 256-bit encryption key...\n');

// Generate 32 random bytes and convert to hex string
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated encryption key:\n');
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);
console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('   - Add this to your .env file');
console.log('   - NEVER commit this key to version control');
console.log('   - Use different keys for dev/staging/production');
console.log('   - Store production keys in a secure vault');
console.log('   - If you change the key, existing messages won\'t decrypt\n');

// Also show some test usage
console.log('📝 Example .env entry:');
console.log(`   ENCRYPTION_KEY=${encryptionKey}\n`);

// Verify the key works
const { encrypt, decrypt } = require('./src/utils/encryption');
process.env.ENCRYPTION_KEY = encryptionKey;

try {
  const testMessage = "Hello, World!";
  const encrypted = encrypt(testMessage);
  const decrypted = decrypt(encrypted);

  if (decrypted === testMessage) {
    console.log('✅ Encryption test passed!');
    console.log(`   Original:  "${testMessage}"`);
    console.log(`   Encrypted: "${encrypted.substring(0, 40)}..."`);
    console.log(`   Decrypted: "${decrypted}"\n`);
  } else {
    console.log('❌ Encryption test failed!\n');
  }
} catch (error) {
  console.log('⚠️  Could not verify encryption (this is normal if utils are not yet set up)\n');
}

console.log('🚀 Ready to use! Add the key to .env and restart your server.\n');
