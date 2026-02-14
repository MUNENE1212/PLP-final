/**
 * Rate Limiter Middleware
 *
 * Provides configurable rate limiting for different endpoint types.
 * Implements strict rate limiting for authentication endpoints.
 *
 * @module middleware/rateLimiter
 */

const rateLimit = require('express-rate-limit');

/**
 * Check if rate limiting is disabled
 * Should only be true in development/testing
 */
const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === 'true';

/**
 * Create a rate limiter with common configuration
 * @param {object} options - Rate limiter options
 * @returns {function} Express middleware
 */
const createRateLimiter = (options) => {
  const defaultOptions = {
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
  };

  // If rate limiting is disabled, return a pass-through middleware
  if (isRateLimitDisabled) {
    return (req, res, next) => next();
  }

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Strict Rate Limiter for Authentication Endpoints
 *
 * Prevents brute force attacks on login, register, and password reset.
 *
 * Limits:
 * - 5 requests per 15 minutes per IP for login
 * - 3 requests per hour per IP for register
 * - 3 requests per hour per IP for forgot-password
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes.',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => {
    // Use IP + email for more granular limiting
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
});

/**
 * Registration Rate Limiter
 * More restrictive to prevent account spam
 */
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts, please try again in 1 hour.',
  },
});

/**
 * Password Reset Rate Limiter
 * Prevents email flooding
 */
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour per IP
  message: {
    success: false,
    message: 'Too many password reset attempts, please check your email or try again later.',
  },
  keyGenerator: (req) => {
    // Limit by email to prevent abuse targeting one user
    const email = req.body?.email || '';
    return `pwreset-${email}`;
  },
});

/**
 * 2FA Rate Limiter
 * Prevents 2FA code brute forcing
 */
const twoFactorLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many 2FA attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

/**
 * API Rate Limiter
 * General rate limiting for API endpoints
 */
const apiLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // 500 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

/**
 * Strict API Rate Limiter
 * For sensitive operations like payments
 */
const strictApiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation, please try again later.',
  },
});

/**
 * Payment Rate Limiter
 * Prevents payment abuse
 */
const paymentLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 payment requests per hour
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.',
  },
});

/**
 * Upload Rate Limiter
 * Prevents media upload abuse
 */
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 uploads per hour
  message: {
    success: false,
    message: 'Upload limit exceeded, please try again later.',
  },
});

module.exports = {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  twoFactorLimiter,
  apiLimiter,
  strictApiLimiter,
  paymentLimiter,
  uploadLimiter,
  createRateLimiter,
};
