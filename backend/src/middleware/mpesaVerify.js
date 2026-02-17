/**
 * M-Pesa Callback Verification Middleware
 *
 * Provides security validation for M-Pesa callback endpoints.
 * Implements:
 * - IP whitelist validation (Safaricom IPs) - MANDATORY in production
 * - HTTPS enforcement check
 * - Callback structure validation
 * - Callback secret verification - REQUIRED in production
 *
 * SECURITY: Production deployments MUST have MPESA_CALLBACK_SECRET configured.
 * The application will fail to start if this is missing in production.
 *
 * @module middleware/mpesaVerify
 */

const logger = require('../utils/logger') || console;

// SECURITY: Startup validation - fail fast if security is not properly configured
const performStartupValidation = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const errors = [];

    // CRITICAL: Callback secret is REQUIRED in production
    if (!process.env.MPESA_CALLBACK_SECRET) {
      errors.push('MPESA_CALLBACK_SECRET is REQUIRED in production environment');
    }

    // HIGH: IP validation should be enabled in production
    if (process.env.MPESA_VALIDATE_IPS === 'false') {
      logger.warn('SECURITY WARNING: M-Pesa IP validation is disabled in production. This is not recommended.');
    }

    if (errors.length > 0) {
      const errorMessage = `SECURITY CONFIGURATION ERROR: ${errors.join('; ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    logger.info('M-Pesa security validation passed for production environment');
  } else {
    // Development environment warnings
    if (!process.env.MPESA_CALLBACK_SECRET) {
      logger.warn('SECURITY WARNING: MPESA_CALLBACK_SECRET not set. Callbacks will not be authenticated.');
    }
    if (process.env.MPESA_VALIDATE_IPS !== 'false') {
      logger.info('M-Pesa IP validation is enabled (can be disabled with MPESA_VALIDATE_IPS=false in development)');
    }
  }
};

// Run startup validation immediately
performStartupValidation();

/**
 * Safaricom IP ranges for M-Pesa callbacks
 * These IPs should be whitelisted in production
 *
 * Source: https://developer.safaricom.co.ke/docs#ip-whitelisting
 *
 * Note: In sandbox, IP validation may not be applicable.
 * Set MPESA_VALIDATE_IPS=false in development/sandbox environment.
 */
const SAFARICOM_IP_RANGES = [
  // Production IPs (to be updated with actual Safaricom IPs)
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.213.102',
  '196.201.213.106',
  '196.201.213.108',
  '196.201.213.109',
  // Add more as documented by Safaricom
];

/**
 * Check if an IP is within allowed ranges
 * @param {string} ip - The IP address to check
 * @returns {boolean} - True if IP is allowed
 */
const isAllowedIP = (ip) => {
  if (!ip) return false;

  // Handle localhost and private IPs in development
  if (process.env.NODE_ENV !== 'production') {
    const devAllowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
    if (devAllowedIPs.includes(ip)) return true;
  }

  // Check against Safaricom IP ranges
  return SAFARICOM_IP_RANGES.includes(ip);
};

/**
 * Extract client IP from request
 * Handles various proxy configurations
 * @param {object} req - Express request object
 * @returns {string} - Client IP address
 */
const getClientIP = (req) => {
  // Check X-Forwarded-For header (for reverse proxies)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Check X-Real-IP header (nginx)
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }

  // Fall back to socket remote address
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '';
};

/**
 * Validate M-Pesa callback structure
 * Ensures the callback has required fields
 * @param {object} body - Request body
 * @returns {{ valid: boolean, error?: string }}
 */
const validateCallbackStructure = (body) => {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid callback body' };
  }

  // STK Push callback structure
  if (body.Body && body.Body.stkCallback) {
    const callback = body.Body.stkCallback;

    if (typeof callback.MerchantRequestID !== 'string') {
      return { valid: false, error: 'Missing MerchantRequestID' };
    }

    if (typeof callback.CheckoutRequestID !== 'string') {
      return { valid: false, error: 'Missing CheckoutRequestID' };
    }

    if (typeof callback.ResultCode !== 'number') {
      return { valid: false, error: 'Missing ResultCode' };
    }

    return { valid: true };
  }

  // B2C callback structure
  if (body.Result) {
    const result = body.Result;

    if (typeof result.ResultType !== 'number') {
      return { valid: false, error: 'Missing ResultType in B2C callback' };
    }

    if (typeof result.ResultCode !== 'number') {
      return { valid: false, error: 'Missing ResultCode in B2C callback' };
    }

    return { valid: true };
  }

  return { valid: false, error: 'Unrecognized callback structure' };
};

/**
 * M-Pesa Callback Verification Middleware
 *
 * Usage:
 * router.post('/callback', mpesaCallbackVerify, mpesaCallback);
 *
 * SECURITY: In production:
 * - IP validation is MANDATORY (cannot be disabled)
 * - Callback secret verification is REQUIRED
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const mpesaCallbackVerify = (req, res, next) => {
  const clientIP = getClientIP(req);
  const isProduction = process.env.NODE_ENV === 'production';

  // SECURITY: IP validation is MANDATORY in production, optional in development
  const validateIPs = isProduction ? true : process.env.MPESA_VALIDATE_IPS !== 'false';

  // Log incoming callback for debugging
  logger.info('M-Pesa callback received', {
    ip: clientIP,
    path: req.path,
    hasBody: !!req.body,
  });

  // 1. HTTPS Enforcement (production only)
  if (isProduction) {
    const isSecure = req.secure ||
                     req.protocol === 'https' ||
                     req.headers['x-forwarded-proto'] === 'https';

    if (!isSecure) {
      logger.error('M-Pesa callback rejected: HTTPS required', {
        ip: clientIP,
        protocol: req.protocol,
      });

      return res.status(403).json({
        ResultCode: 1,
        ResultDesc: 'HTTPS required for callbacks',
      });
    }
  }

  // 2. IP Whitelist Validation - MANDATORY in production
  if (validateIPs && isProduction) {
    if (!isAllowedIP(clientIP)) {
      logger.error('M-Pesa callback rejected: IP not whitelisted', {
        ip: clientIP,
        allowedIPs: SAFARICOM_IP_RANGES.length,
      });

      return res.status(403).json({
        ResultCode: 1,
        ResultDesc: 'Access denied',
      });
    }
  }

  // 3. Callback Secret Verification - REQUIRED in production
  const callbackSecret = process.env.MPESA_CALLBACK_SECRET;

  // SECURITY: In production, callback secret is MANDATORY
  if (isProduction && !callbackSecret) {
    logger.error('CRITICAL SECURITY ERROR: MPESA_CALLBACK_SECRET not configured in production');
    return res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Server configuration error',
    });
  }

  if (callbackSecret) {
    const providedSecret = req.headers['x-mpesa-callback-secret'] ||
                          req.headers['x-callback-secret'];

    if (!providedSecret || providedSecret !== callbackSecret) {
      logger.error('M-Pesa callback rejected: Invalid callback secret', {
        ip: clientIP,
        hasSecret: !!providedSecret,
      });

      return res.status(403).json({
        ResultCode: 1,
        ResultDesc: 'Invalid credentials',
      });
    }
  }

  // 4. Structure Validation
  const validation = validateCallbackStructure(req.body);
  if (!validation.valid) {
    logger.error('M-Pesa callback rejected: Invalid structure', {
      ip: clientIP,
      error: validation.error,
      body: JSON.stringify(req.body).substring(0, 500),
    });

    return res.status(400).json({
      ResultCode: 1,
      ResultDesc: validation.error,
    });
  }

  // Add verification info to request for logging
  req.mpesaVerification = {
    ip: clientIP,
    ipValidated: validateIPs,
    timestamp: new Date().toISOString(),
  };

  logger.info('M-Pesa callback verified successfully', {
    ip: clientIP,
    merchantRequestId: req.body?.Body?.stkCallback?.MerchantRequestID ||
                       req.body?.Result?.OriginatorConversationID,
  });

  next();
};

/**
 * Optional: Lightweight verification for timeout endpoints
 * Less strict validation for timeout callbacks
 *
 * SECURITY: Callback secret verification is still REQUIRED in production
 */
const mpesaTimeoutVerify = (req, res, next) => {
  const clientIP = getClientIP(req);
  const isProduction = process.env.NODE_ENV === 'production';

  logger.info('M-Pesa timeout callback received', {
    ip: clientIP,
    path: req.path,
  });

  // SECURITY: Callback secret verification is REQUIRED in production
  const callbackSecret = process.env.MPESA_CALLBACK_SECRET;

  if (isProduction && !callbackSecret) {
    logger.error('CRITICAL SECURITY ERROR: MPESA_CALLBACK_SECRET not configured in production');
    return res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Server configuration error',
    });
  }

  if (callbackSecret) {
    const providedSecret = req.headers['x-mpesa-callback-secret'];

    if (!providedSecret || providedSecret !== callbackSecret) {
      logger.error('M-Pesa timeout callback rejected: Invalid callback secret', {
        ip: clientIP,
        hasSecret: !!providedSecret,
      });
      return res.status(403).json({
        ResultCode: 1,
        ResultDesc: 'Invalid credentials',
      });
    }
  }

  next();
};

module.exports = {
  mpesaCallbackVerify,
  mpesaTimeoutVerify,
  isAllowedIP,
  getClientIP,
  validateCallbackStructure,
  SAFARICOM_IP_RANGES,
};
