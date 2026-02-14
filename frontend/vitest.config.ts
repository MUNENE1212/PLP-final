/**
 * Vitest Configuration for DumuWaks Frontend
 *
 * Testing Standards:
 * - Unit Tests: 70% - Test individual components, hooks, utilities
 * - Integration Tests: 20% - Test component interactions
 * - E2E Tests: 10% - Test complete user workflows (separate config)
 *
 * Coverage Thresholds:
 * - Overall: >= 80%
 * - Critical components (auth, forms, payments): >= 100%
 * - UI components: >= 70%
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM simulation
    environment: 'jsdom',

    // Global test setup
    setupFiles: ['./src/test/setup.tsx'],

    // Global test APIs (describe, it, expect, etc.)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        'dist/'
      ],
      thresholds: {
        lines: 80,
        functions: 75,
        branches: 70,
        statements: 80
      }
    },

    // Include patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Restore mocks after each test
    restoreMocks: true,

    // Clear mocks after each test
    clearMocks: true,

    // Mock reset after each test
    mockReset: true,

    // Watch exclude
    watchExclude: ['**/node_modules/**', '**/dist/**'],

    // Slow test threshold
    slowTestThreshold: 300,

    // Pool options for parallel tests
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    }
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/config': path.resolve(__dirname, './src/config')
    }
  },

  // Define environment variables for tests
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5000/api/v1'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('DumuWaks Test'),
    'import.meta.env.MODE': JSON.stringify('test')
  }
});
