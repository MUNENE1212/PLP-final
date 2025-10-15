const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
      location
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Phone number already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password, // Will be hashed by pre-save hook
      role: role || 'customer',
      location: location ? {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      } : undefined
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profilePicture: user.profilePicture?.url || user.profilePicture,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact support.`
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorAuth?.enabled) {
      // Generate temp token for 2FA verification
      const tempToken = jwt.sign(
        { id: user._id, requires2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        message: 'Please enter your 2FA code'
      });
    }

    // Update login history
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profilePicture: user.profilePicture?.url || user.profilePicture,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        rating: user.rating,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

/**
 * @desc    Verify 2FA code
 * @route   POST /api/v1/auth/verify-2fa
 * @access  Public (with temp token)
 */
exports.verify2FA = async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide temp token and 2FA code'
      });
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (!decoded.requires2FA) {
      return res.status(400).json({
        success: false,
        message: 'Invalid temp token'
      });
    }

    // Get user
    const user = await User.findById(decoded.id);

    if (!user || !user.twoFactorAuth?.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA code'
      });
    }

    // Update login history
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    user.lastLogin = new Date();
    await user.save();

    // Generate full access token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profilePicture: user.profilePicture?.url || user.profilePicture,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        rating: user.rating,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying 2FA code',
      error: error.message
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // TODO: Send reset email
    // const resetUrl = `${process.env.CLIENT_WEB_URL}/reset-password/${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // For development only
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request'
    });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    // Hash the token from params
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email'
    });
  }
};

/**
 * @desc    Setup 2FA
 * @route   POST /api/v1/auth/setup-2fa
 * @access  Private
 */
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.twoFactorAuth?.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `BaiTech (${user.email})`
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret (but don't enable yet)
    user.twoFactorAuth = {
      secret: secret.base32,
      enabled: false
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Scan QR code with your authenticator app',
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up 2FA'
    });
  }
};

/**
 * @desc    Enable 2FA
 * @route   POST /api/v1/auth/enable-2fa
 * @access  Private
 */
exports.enable2FA = async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.twoFactorAuth?.secret) {
      return res.status(400).json({
        success: false,
        message: 'Please setup 2FA first'
      });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable 2FA
    user.twoFactorAuth.enabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enabling 2FA'
    });
  }
};

/**
 * @desc    Disable 2FA
 * @route   POST /api/v1/auth/disable-2fa
 * @access  Private
 */
exports.disable2FA = async (req, res) => {
  try {
    const { code, password } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code'
      });
    }

    // Disable 2FA
    user.twoFactorAuth = {
      enabled: false,
      secret: undefined
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disabling 2FA'
    });
  }
};
