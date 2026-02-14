/**
 * Vitest Test Setup for DumuWaks Frontend
 *
 * This file runs before each test file and sets up:
 * - @testing-library/jest-dom matchers
 * - LocalStorage mock
 * - Axios mock
 * - Global test utilities
 */

import '@testing-library/jest-dom';
import { vi, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// ============================================
// CLEANUP AFTER EACH TEST
// ============================================
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// ============================================
// LOCAL STORAGE MOCK
// ============================================
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// ============================================
// MATCH MEDIA MOCK (for responsive hooks)
// ============================================
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ============================================
// INTERSECTION OBSERVER MOCK
// ============================================
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// ============================================
// RESIZE OBSERVER MOCK
// ============================================
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// ============================================
// SCROLL TO MOCK
// ============================================
window.scrollTo = vi.fn();

// ============================================
// AXIOS MOCK
// ============================================
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}));

// ============================================
// REACT HOT TOAST MOCK
// ============================================
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn()
  },
  Toaster: () => null
}));

// ============================================
// SOCKET.IO CLIENT MOCK
// ============================================
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    connected: false
  })),
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    connected: false
  }))
}));

// ============================================
// TEST DATA FACTORIES
// ============================================
export const createMockUser = (overrides = {}) => ({
  _id: 'user_123',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phoneNumber: '+254712345678',
  role: 'customer',
  status: 'active',
  isEmailVerified: true,
  profilePicture: null,
  rating: { average: 4.5, count: 10 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockTechnician = (overrides = {}) => createMockUser({
  _id: 'tech_123',
  firstName: 'Tech',
  lastName: 'Nician',
  email: 'tech@example.com',
  role: 'technician',
  skills: [
    { name: 'Plumbing', category: 'plumbing', yearsOfExperience: 5, verified: true }
  ],
  hourlyRate: 1500,
  availability: { isAvailable: true },
  ...overrides
});

export const createMockBooking = (overrides = {}) => ({
  _id: 'booking_123',
  bookingNumber: 'BK240100001',
  customer: 'user_123',
  technician: 'tech_123',
  serviceCategory: 'plumbing',
  serviceType: 'Pipe Repair',
  description: 'Test booking description',
  urgency: 'medium',
  status: 'pending',
  serviceLocation: {
    type: 'Point',
    coordinates: [36.8219, -1.2921],
    address: '123 Test Street, Nairobi'
  },
  timeSlot: {
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    startTime: '09:00',
    endTime: '11:00'
  },
  pricing: {
    basePrice: 2000,
    serviceCharge: 500,
    platformFee: 250,
    tax: 330,
    totalAmount: 3080,
    currency: 'KES'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockAuthState = (overrides = {}) => ({
  user: createMockUser(),
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  ...overrides
});

// ============================================
// MOCK REDUX STORE
// ============================================
export const createMockStore = (initialState = {}) => ({
  getState: () => ({
    auth: createMockAuthState(),
    bookings: { bookings: [], loading: false, error: null },
    users: { users: [], loading: false, error: null },
    ...initialState
  }),
  dispatch: vi.fn(),
  subscribe: vi.fn()
});

// ============================================
// CUSTOM RENDER UTILITY
// ============================================
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';

// Create a basic reducer for testing
const testReducer = (state = {}) => state;

export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: testReducer,
      bookings: testReducer,
      users: testReducer
    },
    preloadedState
  });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Record<string, unknown>;
  store?: ReturnType<typeof createTestStore>;
  route?: string;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    preloadedState = {},
    store = createTestStore(preloadedState),
    route = '/',
    ...renderOptions
  } = options;

  // Set initial route
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };

console.log('[TEST SETUP] Vitest test environment initialized');
