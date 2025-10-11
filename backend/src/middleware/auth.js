const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please login again.'
        });
      }

      // Check if user account is active
      if (req.user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Account is ${req.user.status}. Please contact support.`
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Authorize specific roles
 * Usage: authorize('admin', 'technician')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Optional authentication - sets user if token present but doesn't require it
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Invalid token - continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

/**
 * Check if user is verified (email and/or phone)
 */
exports.requireVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to continue'
    });
  }

  next();
};

/**
 * Check if user has completed KYC
 */
exports.requireKYC = (req, res, next) => {
  if (req.user.kyc.status !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Please complete KYC verification to access this feature',
      kycStatus: req.user.kyc.status
    });
  }

  next();
};

/**
 * Rate limiting for sensitive operations
 */
exports.sensitiveOpLimit = (req, res, next) => {
  // This would typically integrate with Redis for distributed rate limiting
  // For now, it's a placeholder that can be enhanced
  next();
};
