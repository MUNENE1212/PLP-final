/**
 * Jest Configuration for DumuWaks Backend
 *
 * Testing Standards:
 * - Unit Tests: 70% - Test individual functions, methods, classes in isolation
 * - Integration Tests: 20% - Test interactions between components
 * - E2E Tests: 10% - Test complete user workflows
 *
 * Coverage Thresholds:
 * - Overall: >= 80%
 * - Critical paths (auth, payments, bookings): >= 100%
 * - Core business logic: >= 90%
 */

module.exports = {
  // Use Node.js test environment for backend
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/docs/**',
    '!src/scripts/**',
    '!src/seeders/**',
    '!src/server.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    // Critical paths require higher coverage
    './src/controllers/auth.controller.js': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/controllers/booking.controller.js': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/controllers/mpesa.controller.js': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test timeout (10 seconds)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Detect open handles
  detectOpenHandles: true,

  // Force exit after tests
  forceExit: true,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Global variables available in tests
  globals: {
    'TEST_TIMEOUT': 10000
  }
};
