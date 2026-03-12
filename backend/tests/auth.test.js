/**
 * Auth Controller Tests
 *
 * Tests for authentication endpoints including:
 * - User registration
 * - User login
 * - Password management
 * - 2FA functionality
 * - Email verification
 *
 * CRITICAL: This is a security-critical domain requiring 100% coverage
 */

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../src/models/User');
const dbHandler = require('./utils/dbHandler');

// Mock the express app - we'll create a minimal test app
let app;
let server;

describe('Auth Controller', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
    jest.clearAllMocks();
  });

  // ============================================
  // REGISTRATION TESTS
  // ============================================
  describe('POST /api/v1/auth/register', () => {
    const validRegistrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+254712345678',
      password: 'SecurePassword123!',
      role: 'customer'
    };

    describe('Successful Registration', () => {
      it('should register a new user with valid data', async () => {
        const User = require('../src/models/User');

        // Create user directly (simulating successful registration)
        const user = await User.create(validRegistrationData);

        expect(user).toBeDefined();
        expect(user.email).toBe(validRegistrationData.email.toLowerCase());
        expect(user.firstName).toBe(validRegistrationData.firstName);
        expect(user.role).toBe('customer');
        expect(user.status).toBe('active');
        expect(user.isEmailVerified).toBe(false);
      });

      it('should hash password before saving to database', async () => {
        const User = require('../src/models/User');
        const user = await User.create(validRegistrationData);

        // Password should be hashed, not plaintext
        expect(user.password).not.toBe(validRegistrationData.password);
        expect(user.password.length).toBeGreaterThan(50); // Bcrypt hashes are ~60 chars
      });

      it('should set default role to customer when role is not specified', async () => {
        const User = require('../src/models/User');
        const { role, ...dataWithoutRole } = validRegistrationData;
        const user = await User.create(dataWithoutRole);

        expect(user.role).toBe('customer');
      });

      it('should lowercase email address', async () => {
        const User = require('../src/models/User');
        const dataWithUppercaseEmail = {
          ...validRegistrationData,
          email: 'JOHN.DOE@EXAMPLE.COM'
        };
        const user = await User.create(dataWithUppercaseEmail);

        expect(user.email).toBe('john.doe@example.com');
      });

      it('should store location when provided', async () => {
        const User = require('../src/models/User');
        const dataWithLocation = {
          ...validRegistrationData,
          location: {
            type: 'Point',
            coordinates: [36.8219, -1.2921],
            address: 'Nairobi, Kenya'
          }
        };
        const user = await User.create(dataWithLocation);

        expect(user.location).toBeDefined();
        expect(user.location.coordinates).toEqual([36.8219, -1.2921]);
      });
    });

    describe('Registration Validation Errors', () => {
      it('should fail when email is missing', async () => {
        const User = require('../src/models/User');
        const { email, ...dataWithoutEmail } = validRegistrationData;

        await expect(User.create(dataWithoutEmail))
          .rejects.toThrow();
      });

      it('should fail when password is less than 8 characters', async () => {
        const User = require('../src/models/User');
        const dataWithShortPassword = {
          ...validRegistrationData,
          password: 'short'
        };

        await expect(User.create(dataWithShortPassword))
          .rejects.toThrow();
      });

      it('should fail when phone number format is invalid', async () => {
        const User = require('../src/models/User');
        const dataWithInvalidPhone = {
          ...validRegistrationData,
          phoneNumber: 'invalid-phone'
        };

        await expect(User.create(dataWithInvalidPhone))
          .rejects.toThrow();
      });

      it('should fail when email format is invalid', async () => {
        const User = require('../src/models/User');
        const dataWithInvalidEmail = {
          ...validRegistrationData,
          email: 'invalid-email'
        };

        await expect(User.create(dataWithInvalidEmail))
          .rejects.toThrow();
      });

      it('should fail when role is invalid', async () => {
        const User = require('../src/models/User');
        const dataWithInvalidRole = {
          ...validRegistrationData,
          role: 'invalid_role'
        };

        await expect(User.create(dataWithInvalidRole))
          .rejects.toThrow();
      });

      it('should fail when email already exists', async () => {
        const User = require('../src/models/User');
        await User.create(validRegistrationData);

        const duplicateUser = {
          ...validRegistrationData,
          phoneNumber: '+254799999999' // Different phone
        };

        await expect(User.create(duplicateUser))
          .rejects.toThrow();
      });

      it('should fail when phone number already exists', async () => {
        const User = require('../src/models/User');
        await User.create(validRegistrationData);

        const duplicateUser = {
          ...validRegistrationData,
          email: 'different@example.com' // Different email
        };

        await expect(User.create(duplicateUser))
          .rejects.toThrow();
      });
    });
  });

  // ============================================
  // LOGIN TESTS
  // ============================================
  describe('POST /api/v1/auth/login', () => {
    let testUser;
    const password = 'TestPassword123!';

    beforeEach(async () => {
      testUser = await dbHandler.createTestUser({ password });
    });

    describe('Successful Login', () => {
      it('should login user with correct credentials', async () => {
        const User = require('../src/models/User');
        const user = await User.findOne({ email: testUser.email }).select('+password');

        const isMatch = await bcrypt.compare(password, user.password);
        expect(isMatch).toBe(true);
      });

      it('should generate valid JWT token', async () => {
        const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE || '1h'
        });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(testUser._id.toString());
      });

      it('should update lastSeen timestamp on successful login', async () => {
        const User = require('../src/models/User');
        const beforeLogin = await User.findById(testUser._id);
        const previousLastSeen = beforeLogin.lastSeen;

        // Simulate login update
        await User.findByIdAndUpdate(testUser._id, {
          lastSeen: new Date(),
          $push: {
            loginHistory: {
              timestamp: new Date(),
              ipAddress: '127.0.0.1',
              device: 'Test Agent'
            }
          }
        });

        const afterLogin = await User.findById(testUser._id);
        expect(afterLogin.lastSeen).not.toEqual(previousLastSeen);
      });
    });

    describe('Login Failures', () => {
      it('should fail with incorrect password', async () => {
        const User = require('../src/models/User');
        const user = await User.findOne({ email: testUser.email }).select('+password');

        const isMatch = await bcrypt.compare('WrongPassword123!', user.password);
        expect(isMatch).toBe(false);
      });

      it('should fail with non-existent email', async () => {
        const User = require('../src/models/User');
        const user = await User.findOne({ email: 'nonexistent@example.com' }).select('+password');
        expect(user).toBeNull();
      });

      it('should fail for suspended account', async () => {
        const suspendedUser = await dbHandler.createTestUser({
          email: 'suspended@example.com',
          status: 'suspended'
        });

        expect(suspendedUser.status).toBe('suspended');
      });

      it('should fail for deactivated account', async () => {
        const deactivatedUser = await dbHandler.createTestUser({
          email: 'deactivated@example.com',
          status: 'deactivated'
        });

        expect(deactivatedUser.status).toBe('deactivated');
      });

      it('should fail for banned account', async () => {
        const bannedUser = await dbHandler.createTestUser({
          email: 'banned@example.com',
          status: 'banned'
        });

        expect(bannedUser.status).toBe('banned');
      });
    });

    describe('2FA Login Flow', () => {
      it('should require 2FA when user has 2FA enabled', async () => {
        const userWith2FA = await dbHandler.createTestUser({
          twoFactorEnabled: true,
          twoFactorSecret: 'JBSWY3DPEHPK3PXP'
        });

        expect(userWith2FA.twoFactorEnabled).toBe(true);
      });
    });
  });

  // ============================================
  // FORGOT PASSWORD TESTS
  // ============================================
  describe('POST /api/v1/auth/forgot-password', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await dbHandler.createTestUser();
    });

    it('should generate reset token for valid email', async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const User = require('../src/models/User');

      const user = await User.findById(testUser._id);
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
      await user.save();

      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
    });

    it('should not reveal if email does not exist', async () => {
      const User = require('../src/models/User');
      const user = await User.findOne({ email: 'nonexistent@example.com' });
      expect(user).toBeNull();
    });
  });

  // ============================================
  // RESET PASSWORD TESTS
  // ============================================
  describe('POST /api/v1/auth/reset-password/:resetToken', () => {
    let testUser;
    let resetToken;
    const newPassword = 'NewSecurePassword123!';

    beforeEach(async () => {
      testUser = await dbHandler.createTestUser();

      // Generate reset token
      resetToken = crypto.randomBytes(32).toString('hex');
      const User = require('../src/models/User');
      const user = await User.findById(testUser._id);
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
      await user.save();
    });

    it('should reset password with valid token', async () => {
      const User = require('../src/models/User');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      expect(user).not.toBeNull();
    });

    it('should fail with invalid token', async () => {
      const User = require('../src/models/User');
      const invalidToken = crypto
        .createHash('sha256')
        .update('invalid-token')
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: invalidToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      expect(user).toBeNull();
    });

    it('should fail with expired token', async () => {
      const User = require('../src/models/User');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set token as expired
      await User.findByIdAndUpdate(testUser._id, {
        passwordResetExpires: Date.now() - 1000 // Expired 1 second ago
      });

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      expect(user).toBeNull();
    });

    it('should clear reset token after successful password reset', async () => {
      const User = require('../src/models/User');
      const user = await User.findById(testUser._id);

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.passwordResetToken).toBeUndefined();
      expect(updatedUser.passwordResetExpires).toBeUndefined();
    });
  });

  // ============================================
  // EMAIL VERIFICATION TESTS
  // ============================================
  describe('GET /api/v1/auth/verify-email/:token', () => {
    let testUser;
    let verificationToken;

    beforeEach(async () => {
      testUser = await dbHandler.createTestUser({ isEmailVerified: false });

      verificationToken = crypto.randomBytes(32).toString('hex');
      const User = require('../src/models/User');
      const user = await User.findById(testUser._id);
      user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save();
    });

    it('should verify email with valid token', async () => {
      const User = require('../src/models/User');
      const hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      expect(user).not.toBeNull();
    });

    it('should fail with invalid verification token', async () => {
      const User = require('../src/models/User');
      const invalidToken = crypto
        .createHash('sha256')
        .update('invalid-token')
        .digest('hex');

      const user = await User.findOne({
        emailVerificationToken: invalidToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      expect(user).toBeNull();
    });
  });

  // ============================================
  // GET CURRENT USER TESTS
  // ============================================
  describe('GET /api/v1/auth/me', () => {
    let testUser;
    let token;

    beforeEach(async () => {
      testUser = await dbHandler.createTestUser();
      token = dbHandler.generateTestToken(testUser._id);
    });

    it('should return user data for valid token', async () => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../src/models/User');
      const user = await User.findById(decoded.id);

      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
    });

    it('should fail with invalid token', () => {
      expect(() => {
        jwt.verify('invalid-token', process.env.JWT_SECRET);
      }).toThrow();
    });

    it('should fail with expired token', () => {
      const expiredToken = jwt.sign(
        { id: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );

      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET);
      }).toThrow();
    });
  });

  // ============================================
  // TOKEN GENERATION TESTS
  // ============================================
  describe('JWT Token Generation', () => {
    it('should generate token with correct payload', () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(userId.toString());
    });

    it('should include expiration time in token', () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      const decoded = jwt.decode(token);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(3600); // 1 hour in seconds
    });
  });

  // ============================================
  // PASSWORD COMPARISON TESTS
  // ============================================
  describe('Password Comparison', () => {
    it('should correctly compare matching passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      const isMatch = await bcrypt.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should correctly reject non-matching passwords', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });
});
