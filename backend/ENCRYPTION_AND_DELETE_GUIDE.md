# Message Encryption & Delete for Everyone - Implementation Guide

## Overview

This guide covers two major features implemented in the BaiTech messaging system:
1. **End-to-End Encryption** for messages
2. **Delete for Everyone** functionality for messages and posts

---

## 🔐 Message Encryption

### What's Encrypted?

- All text messages between users are automatically encrypted using **AES-256-CBC**
- Encryption happens transparently at the model level
- System messages are NOT encrypted (they don't contain sensitive data)

### How It Works

1. **When a message is sent:**
   - Text content is automatically encrypted before being saved to the database
   - A unique IV (Initialization Vector) is generated for each message
   - Encrypted format: `[IV]:[encrypted_data]`

2. **When a message is retrieved:**
   - Text is automatically decrypted when accessed
   - Original message content is returned to the user

3. **Security Features:**
   - Uses AES-256-CBC encryption (industry standard)
   - Each message has a unique IV for added security
   - Encryption key stored securely in environment variables

### Setup Instructions

#### 1. Generate Encryption Key

Run the following Node.js script to generate a secure encryption key:

\`\`\`javascript
// generate-key.js
const crypto = require('crypto');
const key = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + key);
\`\`\`

\`\`\`bash
node generate-key.js
\`\`\`

#### 2. Add to Environment Variables

Add the generated key to your `.env` file:

\`\`\`env
ENCRYPTION_KEY=your_generated_key_here_64_characters_hex
\`\`\`

**⚠️ IMPORTANT SECURITY NOTES:**
- Never commit the encryption key to version control
- Use different keys for development and production
- Store production keys securely (e.g., AWS Secrets Manager, Azure Key Vault)
- If you change the key, existing encrypted messages won't be decryptable

#### 3. Backward Compatibility

The encryption system is designed to handle:
- Existing unencrypted messages (they'll be returned as-is)
- Migration from unencrypted to encrypted system
- Decryption failures (falls back to original text)

---

## 🗑️ Delete for Everyone

### Message Deletion

Two types of deletion are supported:

#### 1. Delete for Self (Personal Delete)
- Removes message from your view only
- Other participants can still see the message
- **Endpoint:** `DELETE /api/v1/messages/:id`

#### 2. Delete for Everyone
- Removes message for all participants
- Only available to the message sender
- **Time limit:** Can only delete within 1 hour of sending
- **Endpoint:** `DELETE /api/v1/messages/:id/everyone`

### Post Deletion

Posts use soft deletion:
- **Author** can delete their own posts
- **Admin** can delete any post
- Deleted posts are marked but kept in database for audit purposes
- **Endpoint:** `DELETE /api/v1/posts/:id`

### API Usage Examples

#### Delete Message for Self

\`\`\`javascript
DELETE /api/v1/messages/507f1f77bcf86cd799439011
Authorization: Bearer <token>
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "message": "Message deleted for you"
}
\`\`\`

#### Delete Message for Everyone

\`\`\`javascript
DELETE /api/v1/messages/507f1f77bcf86cd799439011/everyone
Authorization: Bearer <token>
\`\`\`

Response (Success):
\`\`\`json
{
  "success": true,
  "message": "Message deleted for everyone"
}
\`\`\`

Response (Time Limit Exceeded):
\`\`\`json
{
  "success": false,
  "message": "Messages can only be deleted for everyone within 1 hour of sending"
}
\`\`\`

Response (Not Authorized):
\`\`\`json
{
  "success": false,
  "message": "You can only delete your own messages for everyone"
}
\`\`\`

#### Delete Post

\`\`\`javascript
DELETE /api/v1/posts/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Inappropriate content" // Optional
}
\`\`\`

---

## 📊 Database Schema Changes

### Message Model

New/Updated fields:

\`\`\`javascript
{
  text: String,           // Automatically encrypted/decrypted
  isEncrypted: Boolean,   // Encryption status flag
  isDeleted: Boolean,     // Deleted for everyone flag
  deletedAt: Date,        // When deleted for everyone
  deletedBy: ObjectId,    // Who deleted it for everyone
  deletedFor: [ObjectId]  // Users who deleted for themselves
}
\`\`\`

### Post Model

New/Updated fields:

\`\`\`javascript
{
  isDeleted: Boolean,     // Soft delete flag
  deletedAt: Date,        // When deleted
  deletedBy: ObjectId,    // Who deleted it (author or admin)
  deleteReason: String    // Why it was deleted
}
\`\`\`

---

## 🔧 Technical Implementation

### Encryption Utility (`src/utils/encryption.js`)

Functions available:

- `encrypt(text)` - Encrypt text
- `decrypt(text)` - Decrypt text
- `hash(text)` - One-way hash (for passwords, etc.)
- `generateToken()` - Generate secure random tokens
- `generateEncryptionKey()` - Generate encryption key for setup
- `isEncrypted(text)` - Check if text is encrypted

### Model Hooks

**Message Model:**
\`\`\`javascript
// Automatic encryption on save
text: {
  set: (value) => encrypt(value),
  get: (value) => decrypt(value)
}
\`\`\`

**Methods:**
- `message.deleteForEveryone(userId)` - Delete for all participants
- `message.deleteForUser(userId)` - Delete for specific user only

**Post Model:**

**Methods:**
- `post.deletePost(userId, reason)` - Soft delete post

---

## 🚀 Testing

### Test Encryption

\`\`\`bash
# 1. Send a message
POST /api/v1/messages
{
  "conversation": "conv_id",
  "type": "text",
  "text": "Hello World"
}

# 2. Check database directly
# You should see encrypted text like: "3f7a2b1c4d5e6f7a:8b9c0d1e2f3a4b5c..."

# 3. Retrieve message via API
GET /api/v1/messages?conversation=conv_id
# You should see: "Hello World" (decrypted automatically)
\`\`\`

### Test Delete for Everyone

\`\`\`bash
# 1. Send a message and note the ID
# 2. Immediately try to delete for everyone
DELETE /api/v1/messages/{id}/everyone
# Should succeed

# 3. Wait 1+ hours and try again
# Should fail with time limit error

# 4. Try with a different user
# Should fail with authorization error
\`\`\`

---

## 🔒 Security Best Practices

### For Production:

1. **Encryption Key Management:**
   - Use a secrets management service
   - Rotate keys periodically (with migration plan)
   - Never log encryption keys
   - Use different keys per environment

2. **Access Control:**
   - Verify user permissions before deletion
   - Log all deletion activities
   - Implement rate limiting on delete operations

3. **Data Retention:**
   - Keep soft-deleted data for compliance/audit
   - Implement hard delete after retention period
   - Encrypt backups

4. **Monitoring:**
   - Monitor failed decryption attempts
   - Alert on suspicious deletion patterns
   - Track encryption/decryption performance

### For Development:

1. **Use a test encryption key**
2. **Clear test data regularly**
3. **Test with different time zones**
4. **Test concurrent deletion scenarios**

---

## 📱 Client Integration

### Frontend Considerations

1. **Message Display:**
   - Show "Message deleted" placeholder for deleted messages
   - Display different UI for self-deleted vs everyone-deleted
   - Show deletion timestamp

2. **Delete UI:**
   - Show "Delete for me" and "Delete for everyone" options
   - Only show "Delete for everyone" for:
     - Message sender
     - Messages less than 1 hour old
   - Confirm before deletion

3. **Real-time Updates:**
   - Listen for Socket.IO events for deletions
   - Update UI immediately when messages are deleted
   - Handle offline scenarios

### Example Frontend Code

\`\`\`javascript
// Delete for self
async function deleteForSelf(messageId) {
  await fetch(\`/api/v1/messages/\${messageId}\`, {
    method: 'DELETE',
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
}

// Delete for everyone
async function deleteForEveryone(messageId) {
  try {
    const response = await fetch(\`/api/v1/messages/\${messageId}/everyone\`, {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${token}\`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle time limit or permission errors
      alert(error.message);
    }
  } catch (error) {
    console.error('Delete failed:', error);
  }
}

// Check if can delete for everyone
function canDeleteForEveryone(message, currentUser) {
  const ONE_HOUR = 60 * 60 * 1000;
  const messageAge = Date.now() - new Date(message.createdAt);
  return message.sender === currentUser.id && messageAge < ONE_HOUR;
}
\`\`\`

---

## 🐛 Troubleshooting

### Messages Not Decrypting

**Problem:** Messages show encrypted text like "abc123:def456..."

**Solutions:**
1. Check ENCRYPTION_KEY is set in .env
2. Verify key is 64 hex characters (32 bytes)
3. Check server logs for decryption errors
4. Ensure mongoose schema includes getters: `toJSON: { getters: true }`

### Can't Delete for Everyone

**Problem:** Delete for everyone fails

**Solutions:**
1. Verify user is the message sender
2. Check message is less than 1 hour old
3. Verify route is correct: `/messages/:id/everyone`
4. Check authorization token is valid

### Performance Issues

**Problem:** Slow message retrieval with encryption

**Solutions:**
1. Use pagination (limit messages per request)
2. Consider caching decrypted messages briefly
3. Index commonly queried fields
4. Monitor encryption/decryption performance

---

## 📈 Future Enhancements

Potential improvements:

1. **Key Rotation:**
   - Implement encryption key rotation
   - Re-encrypt old messages with new keys

2. **Enhanced Security:**
   - Add client-side encryption layer
   - Implement Perfect Forward Secrecy
   - Add message verification/signing

3. **Flexible Time Limits:**
   - Make deletion time limit configurable
   - Different limits for different user roles
   - Unlimited deletion for admins

4. **Audit Trail:**
   - Track who deleted what and when
   - Provide deletion reports for compliance
   - Add undo/restore functionality (with time limit)

5. **Encryption Analytics:**
   - Monitor encryption performance
   - Track decryption failures
   - Alert on suspicious patterns

---

## 📚 Additional Resources

- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [AES-256-CBC Encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

**Last Updated:** 2025-10-11
**Version:** 1.0.0
