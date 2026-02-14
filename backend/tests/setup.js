/**
 * Jest Test Setup for DumuWaks Backend
 *
 * This file runs before each test file and sets up:
 * - Environment variables for testing
 * - Global test utilities
 * - Database connection handling
 * - Mock configurations
 */

const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_EXPIRE = '1h';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/dumuwaks_test';

// Suppress console.log in tests (uncomment for cleaner output)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test timeout
jest.setTimeout(30000);

// Store original implementations for restoration
const originalConnect = mongoose.connect;
const originalDisconnect = mongoose.disconnect;

/**
 * Global beforeAll hook
 * Setup any global test resources
 */
beforeAll(async () => {
  // Any global setup can go here
});

/**
 * Global afterAll hook
 * Cleanup global test resources
 */
afterAll(async () => {
  // Close any open database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

/**
 * Global afterEach hook
 * Cleanup after each test
 */
afterEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clean up database collections if connected
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

/**
 * Helper to create mock request object
 */
global.mockRequest = (body = {}, params = {}, query = {}, user = null, headers = {}) => ({
  body,
  params,
  query,
  user,
  headers,
  ip: '127.0.0.1',
  get: (header) => headers[header],
});

/**
 * Helper to create mock response object
 */
global.mockResponse = () => {
  const res = {
    statusCode: 200,
    _headers: {},
    _jsonData: null,
    status: jest.fn(function(code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function(data) {
      this._jsonData = data;
      return this;
    }),
    send: jest.fn(function(data) {
      this._sendData = data;
      return this;
    }),
    set: jest.fn(function(key, value) {
      this._headers[key] = value;
      return this;
    }),
    setHeader: jest.fn(function(key, value) {
      this._headers[key] = value;
    }),
  };
  return res;
};

/**
 * Helper to create mock next function
 */
global.mockNext = () => jest.fn();

/**
 * Helper to wait for async operations
 */
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to generate random string
 */
global.randomString = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Helper to generate random email
 */
global.randomEmail = () => `test_${randomString(8)}@example.com`;

/**
 * Helper to generate random phone number (Kenya format)
 */
global.randomPhone = () => `+2547${Math.floor(Math.random() * 90000000 + 10000000)}`;

/**
 * Extend Jest matchers
 */
expect.extend({
  /**
   * Check if response has success status
   */
  toBeSuccessResponse(received) {
    const pass = received.statusCode >= 200 && received.statusCode < 300;
    return {
      pass,
      message: () => pass
        ? `expected status code ${received.statusCode} not to be a success response`
        : `expected status code ${received.statusCode} to be a success response (2xx)`
    };
  },

  /**
   * Check if response has error status
   */
  toBeErrorResponse(received) {
    const pass = received.statusCode >= 400;
    return {
      pass,
      message: () => pass
        ? `expected status code ${received.statusCode} not to be an error response`
        : `expected status code ${received.statusCode} to be an error response (4xx or 5xx)`
    };
  },

  /**
   * Check if object has valid ObjectId format
   */
  toBeValidObjectId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid ObjectId`
        : `expected ${received} to be a valid ObjectId`
    };
  }
});

console.log('[TEST SETUP] Jest test environment initialized');
