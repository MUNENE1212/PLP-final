const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  verify2FA,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  setup2FA,
  enable2FA,
  disable2FA
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  twoFactorLimiter
} = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @rateLimit 3 requests per hour per IP
 */
router.post(
  '/register',
  registerLimiter,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phoneNumber')
      .matches(/^\+?\d{7,15}$/)
      .withMessage('Please enter a valid phone number'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
    body('role')
      .optional()
      .isIn(['customer', 'technician', 'corporate', 'support'])
      .withMessage('Invalid role'),
    validate
  ],
  register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 * @rateLimit 5 requests per 15 minutes per IP+email
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

/**
 * @route   POST /api/v1/auth/verify-2fa
 * @desc    Verify 2FA code during login
 * @access  Public
 * @rateLimit 5 requests per 15 minutes per IP
 */
router.post(
  '/verify-2fa',
  twoFactorLimiter,
  [
    body('tempToken').notEmpty().withMessage('Temp token is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid 2FA code'),
    validate
  ],
  verify2FA
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * @rateLimit 3 requests per hour per email
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate
  ],
  forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password/:resetToken
 * @desc    Reset password using token
 * @access  Public
 * @rateLimit Uses general API limiter
 */
router.post(
  '/reset-password/:resetToken',
  authLimiter,
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
    validate
  ],
  resetPassword
);

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route   POST /api/v1/auth/resend-verification-email
 * @desc    Resend email verification link
 * @access  Public
 * @rateLimit 3 requests per hour per IP (reuses passwordResetLimiter)
 */
router.post(
  '/resend-verification-email',
  passwordResetLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate
  ],
  resendVerificationEmail
);

// Protected routes

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout and revoke current JWT
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /api/v1/auth/setup-2fa
 * @desc    Setup 2FA for authenticated user
 * @access  Private
 */
router.post('/setup-2fa', protect, setup2FA);

/**
 * @route   POST /api/v1/auth/enable-2fa
 * @desc    Enable 2FA after verification
 * @access  Private
 */
router.post(
  '/enable-2fa',
  protect,
  [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code'),
    validate
  ],
  enable2FA
);

/**
 * @route   POST /api/v1/auth/disable-2fa
 * @desc    Disable 2FA for authenticated user
 * @access  Private
 */
router.post(
  '/disable-2fa',
  protect,
  [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid 2FA code'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  disable2FA
);

module.exports = router;
