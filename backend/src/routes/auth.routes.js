const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  verify2FA,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  setup2FA,
  enable2FA,
  disable2FA
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post(
  '/register',
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

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

router.post(
  '/verify-2fa',
  [
    body('tempToken').notEmpty().withMessage('Temp token is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid 2FA code'),
    validate
  ],
  verify2FA
);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate
  ],
  forgotPassword
);

router.post(
  '/reset-password/:resetToken',
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

router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);

router.post('/setup-2fa', protect, setup2FA);

router.post(
  '/enable-2fa',
  protect,
  [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code'),
    validate
  ],
  enable2FA
);

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
