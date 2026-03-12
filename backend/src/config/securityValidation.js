/**
 * Security Configuration Validation
 *
 * SECURITY: This module validates that all required secrets and security
 * configuration are properly set before the application starts.
 *
 * The application will FAIL TO START if required secrets are missing in production.
 *
 * @module config/securityValidation
 */

const logger = require('../utils/logger') || console;

/**
 * Required environment variables by environment
 */
const REQUIRED_VARS = {
  production: [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'MPESA_CALLBACK_SECRET',
    'ENCRYPTION_KEY',
  ],
  development: [], // No required vars in development
  test: [], // No required vars in test
};

/**
 * Environment variables that must not have default/example values in production
 */
const NO_DEFAULT_VALUES = {
  JWT_SECRET: [
    'secret',
    'jwt-secret',
    'your-secret-key',
    'change-me',
    'default',
    'example',
    'test',
    'development',
  ],
  JWT_REFRESH_SECRET: [
    'refresh',
    'refresh-secret',
    'your-refresh-secret',
    'change-me',
    'default',
    'example',
    'test',
    'development',
  ],
  MONGODB_URI: [
    'localhost',
    '127.0.0.1',
  ],
  MPESA_CALLBACK_SECRET: [
    'test',
    'secret',
    'default',
    'example',
    'callback',
  ],
  ENCRYPTION_KEY: [
    'test',
    'default',
    'example',
    'your-32-byte',
  ],
};

/**
 * Validate that a secret doesn't have a default/example value
 * @param {string} varName - Environment variable name
 * @param {string} value - Current value
 * @returns {{ valid: boolean, warning?: string }}
 */
const validateNoDefaultValue = (varName, value) => {
  const defaultPatterns = NO_DEFAULT_VALUES[varName] || [];

  for (const pattern of defaultPatterns) {
    if (value.toLowerCase().includes(pattern.toLowerCase())) {
      return {
        valid: false,
        warning: `${varName} appears to contain a default/example value: "${pattern}"`,
      };
    }
  }

  return { valid: true };
};

/**
 * Validate security configuration
 * Throws an error if critical secrets are missing in production
 *
 * @param {string} environment - The current NODE_ENV
 * @throws {Error} If required secrets are missing in production
 */
const validateSecurityConfig = (environment = process.env.NODE_ENV) => {
  const isProduction = environment === 'production';
  const errors = [];
  const warnings = [];

  // Check required variables
  const requiredVars = REQUIRED_VARS[environment] || REQUIRED_VARS.production;

  for (const varName of requiredVars) {
    const value = process.env[varName];

    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`);
      continue;
    }

    // Check for default values (production only)
    if (isProduction) {
      const validation = validateNoDefaultValue(varName, value);
      if (!validation.valid) {
        errors.push(validation.warning);
      }
    }

    // Check minimum length for secrets (production only)
    if (isProduction && (varName.includes('SECRET') || varName.includes('KEY'))) {
      if (value.length < 32) {
        warnings.push(`${varName} should be at least 32 characters for security (current: ${value.length})`);
      }
    }
  }

  // Production-specific checks
  if (isProduction) {
    // Check that NODE_ENV is explicitly set
    if (!process.env.NODE_ENV) {
      errors.push('NODE_ENV must be explicitly set to "production"');
    }

    // Warn about debug/development settings
    if (process.env.DEBUG === 'true') {
      warnings.push('DEBUG=true should not be set in production');
    }

    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      warnings.push('DISABLE_RATE_LIMIT=true should not be set in production');
    }

    // Check M-Pesa security
    if (process.env.MPESA_ENVIRONMENT === 'sandbox') {
      warnings.push('MPESA_ENVIRONMENT is set to "sandbox" - production should use "production"');
    }

    // Validate M-Pesa credentials are not test credentials
    if (process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_KEY.length < 10) {
      errors.push('MPESA_CONSUMER_KEY appears to be a test credential');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    warnings.forEach(warning => {
      if (isProduction) {
        logger.warn(`SECURITY WARNING: ${warning}`);
      } else {
        logger.info(`Security advisory: ${warning}`);
      }
    });
  }

  // Throw error if there are critical errors
  if (errors.length > 0) {
    const errorMessage = isProduction
      ? `SECURITY CONFIGURATION ERROR - Application cannot start:\n${errors.map(e => `  - ${e}`).join('\n')}`
      : `Security configuration warnings:\n${errors.map(e => `  - ${e}`).join('\n')}`;

    if (isProduction) {
      logger.error(errorMessage);
      throw new Error(errorMessage);
    } else {
      logger.warn(errorMessage);
    }
  }

  logger.info('Security configuration validation passed');
  return { valid: true, errors, warnings };
};

/**
 * Quick check if required secrets are configured
 * @returns {boolean}
 */
const hasRequiredSecrets = () => {
  try {
    validateSecurityConfig();
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  validateSecurityConfig,
  hasRequiredSecrets,
  REQUIRED_VARS,
  NO_DEFAULT_VALUES,
};
