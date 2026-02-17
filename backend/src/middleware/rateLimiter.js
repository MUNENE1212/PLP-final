/**
 * Rate Limiter Middleware
 *
 * Provides configurable rate limiting for different endpoint types.
 * Implements strict rate limiting for authentication endpoints.
 *
 * SECURITY: Rate limiting for authentication endpoints CANNOT be disabled,
 * even if DISABLE_RATE_LIMIT=true is set. This prevents brute force attacks.
 *
 * @module middleware/rateLimiter
 */

const rateLimit = require('express-rate-limit');

/**
 * Check if rate limiting is disabled
 * SECURITY: This only applies to general API rate limiting, NOT auth endpoints
 * Should only be true in development/testing
 */
const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === 'true';

// Warn if rate limiting is disabled
if (isRateLimitDisabled) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('SECURITY WARNING: Rate limiting is DISABLED in production. This is a security risk.');
  } else {
    console.warn('WARNING: Rate limiting is disabled. This should only be used in testing.');
  }
}

/**
 * Create a rate limiter with common configuration
 * @param {object} options - Rate limiter options
 * @param {boolean} options.canBeDisabled - Whether this limiter can be disabled (default: true)
 * @returns {function} Express middleware
 */
const createRateLimiter = (options) => {
  const { canBeDisabled = true, ...limiterOptions } = options;

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

  // SECURITY: If rate limiting is disabled, only bypass for non-critical limiters
  // Authentication rate limiters (canBeDisabled=false) are ALWAYS enforced
  if (isRateLimitDisabled && canBeDisabled) {
    return (req, res, next) => next();
  }

  return rateLimit({ ...defaultOptions, ...limiterOptions });
};

/**
 * Strict Rate Limiter for Authentication Endpoints
 *
 * SECURITY: This rate limiter CANNOT be disabled, even with DISABLE_RATE_LIMIT=true
 * This prevents brute force attacks on login, register, and password reset.
 *
 * Limits:
 * - 5 requests per 15 minutes per IP for login
 * - 3 requests per hour per IP for register
 * - 3 requests per hour per IP for forgot-password
 */
const authLimiter = createRateLimiter({
  canBeDisabled: false, // SECURITY: Authentication rate limiting CANNOT be disabled
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
 * SECURITY: This rate limiter CANNOT be disabled
 * More restrictive to prevent account spam
 */
const registerLimiter = createRateLimiter({
  canBeDisabled: false, // SECURITY: Registration rate limiting CANNOT be disabled
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts, please try again in 1 hour.',
  },
});

/**
 * Password Reset Rate Limiter
 * SECURITY: This rate limiter CANNOT be disabled
 * Prevents email flooding
 */
const passwordResetLimiter = createRateLimiter({
  canBeDisabled: false, // SECURITY: Password reset rate limiting CANNOT be disabled
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
 * SECURITY: This rate limiter CANNOT be disabled
 * Prevents 2FA code brute forcing
 */
const twoFactorLimiter = createRateLimiter({
  canBeDisabled: false, // SECURITY: 2FA rate limiting CANNOT be disabled
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
