/**
 * Utility Helper Functions
 * Common helper functions used throughout the application
 */

/**
 * Format phone number to international format
 */
exports.formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // Handle international numbers - if it doesn't start with country code, assume Kenyan
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('254')) {
    // Already in correct format
  } else if (cleaned.length === 9) {
    // Assume Kenyan number without prefix
    cleaned = '254' + cleaned;
  }
  // For other international numbers, keep as is

  return `+${cleaned}`;
};

/**
 * Generate random code
 */
exports.generateCode = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Generate unique reference number
 */
exports.generateReferenceNumber = (prefix = 'REF') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${timestamp}${random}`.toUpperCase();
};

/**
 * Paginate results
 */
exports.paginate = (page = 1, limit = 20) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum,
    page: pageNum
  };
};

/**
 * Build pagination response
 */
exports.buildPaginationResponse = (data, total, page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const totalPages = Math.ceil(total / limitNum);

  return {
    data,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    }
  };
};

/**
 * Sanitize user input (remove HTML tags)
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/<[^>]*>/g, '').trim();
};

/**
 * Generate slug from string
 */
exports.generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Check if date is past
 */
exports.isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is future
 */
exports.isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Get time difference in human-readable format
 */
exports.getTimeDifference = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return past.toLocaleDateString();
};

/**
 * Validate email format
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate international phone number
 */
exports.isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+?\d{7,15}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Mask sensitive data
 */
exports.maskEmail = (email) => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '***' + username.slice(-1);
  return `${maskedUsername}@${domain}`;
};

exports.maskPhone = (phoneNumber) => {
  return phoneNumber.replace(/(\d{3})\d{6}(\d{2})/, '$1******$2');
};

/**
 * Generate random color
 */
exports.generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Deep clone object
 */
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
exports.isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter
 */
exports.capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate initials from name
 */
exports.getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Calculate percentage
 */
exports.calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Sleep/delay function
 */
exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
exports.retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await this.sleep(delay * Math.pow(2, i));
    }
  }
};

module.exports = exports;
