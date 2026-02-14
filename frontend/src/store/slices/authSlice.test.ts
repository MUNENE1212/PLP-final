/**
 * Auth Slice Tests
 *
 * Tests for authentication Redux slice covering:
 * - Initial state
 * - Synchronous actions
 * - Async thunks (login, register, logout)
 * - State transitions
 * - Error handling
 *
 * CRITICAL: This is a security-critical domain requiring 100% coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, {
  login,
  register,
  logout,
  fetchCurrentUser,
  updateProfile,
  updateAvailability,
  setCredentials,
  updateUser,
  clearError,
  AuthState
} from './authSlice';
import { createMockUser, createMockAuthState } from '@/test/setup';

// Mock localStorage
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
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ============================================
// INITIAL STATE TESTS
// ============================================
describe('Auth Slice - Initial State', () => {
  it('should return the initial state', () => {
    const initialState = authReducer(undefined, { type: 'unknown' });

    expect(initialState).toEqual({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  it('should have null user by default', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.user).toBeNull();
  });

  it('should have false isAuthenticated by default', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.isAuthenticated).toBe(false);
  });

  it('should have false isLoading by default', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.isLoading).toBe(false);
  });
});

// ============================================
// SYNC ACTIONS TESTS
// ============================================
describe('Auth Slice - Sync Actions', () => {
  describe('setCredentials', () => {
    it('should set user credentials', () => {
      const mockUser = createMockUser();
      const initialState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

      const newState = authReducer(
        initialState,
        setCredentials({
          user: mockUser,
          token: 'test-token',
          refreshToken: 'test-refresh-token'
        })
      );

      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe('test-token');
      expect(newState.refreshToken).toBe('test-refresh-token');
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should override existing credentials', () => {
      const mockUser1 = createMockUser({ _id: 'user1' });
      const mockUser2 = createMockUser({ _id: 'user2' });
      const initialState: AuthState = createMockAuthState({ user: mockUser1 });

      const newState = authReducer(
        initialState,
        setCredentials({
          user: mockUser2,
          token: 'new-token',
          refreshToken: 'new-refresh-token'
        })
      );

      expect(newState.user?._id).toBe('user2');
      expect(newState.token).toBe('new-token');
    });
  });

  describe('updateUser', () => {
    it('should update user properties', () => {
      const mockUser = createMockUser();
      const initialState: AuthState = createMockAuthState({ user: mockUser });

      const newState = authReducer(
        initialState,
        updateUser({ firstName: 'Updated' })
      );

      expect(newState.user?.firstName).toBe('Updated');
      expect(newState.user?.email).toBe(mockUser.email); // Other props unchanged
    });

    it('should not update if user is null', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

      const newState = authReducer(
        initialState,
        updateUser({ firstName: 'Updated' })
      );

      expect(newState.user).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const initialState: AuthState = createMockAuthState({
        error: 'Some error message'
      });

      const newState = authReducer(initialState, clearError());

      expect(newState.error).toBeNull();
    });

    it('should not affect other state properties', () => {
      const mockUser = createMockUser();
      const initialState: AuthState = createMockAuthState({
        user: mockUser,
        token: 'test-token',
        error: 'Some error'
      });

      const newState = authReducer(initialState, clearError());

      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe('test-token');
      expect(newState.error).toBeNull();
    });
  });
});

// ============================================
// LOGIN ASYNC THUNK TESTS
// ============================================
describe('Auth Slice - Login Thunk', () => {
  describe('login.pending', () => {
    it('should set loading state', () => {
      const initialState: AuthState = createMockAuthState({
        isLoading: false,
        error: 'Previous error'
      });

      const action = { type: login.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('login.fulfilled', () => {
    it('should set user and token on successful login', () => {
      const mockUser = createMockUser();
      const initialState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
      };

      const action = {
        type: login.fulfilled.type,
        payload: {
          user: mockUser,
          token: 'jwt-token',
          refreshToken: 'refresh-token'
        }
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe('jwt-token');
      expect(newState.refreshToken).toBe('refresh-token');
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle null refreshToken', () => {
      const mockUser = createMockUser();
      const initialState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
      };

      const action = {
        type: login.fulfilled.type,
        payload: {
          user: mockUser,
          token: 'jwt-token',
          refreshToken: null
        }
      };
      const newState = authReducer(initialState, action);

      expect(newState.refreshToken).toBeNull();
      expect(newState.isAuthenticated).toBe(true);
    });
  });

  describe('login.rejected', () => {
    it('should set error on failed login', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
      };

      const action = {
        type: login.rejected.type,
        payload: 'Invalid credentials'
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Invalid credentials');
      expect(newState.isAuthenticated).toBe(false);
    });

    it('should not authenticate on failure', () => {
      const initialState: AuthState = createMockAuthState({
        isAuthenticated: false,
        isLoading: true
      });

      const action = {
        type: login.rejected.type,
        payload: 'Network error'
      };
      const newState = authReducer(initialState, action);

      expect(newState.isAuthenticated).toBe(false);
    });
  });
});

// ============================================
// REGISTER ASYNC THUNK TESTS
// ============================================
describe('Auth Slice - Register Thunk', () => {
  describe('register.pending', () => {
    it('should set loading state', () => {
      const initialState: AuthState = createMockAuthState({
        isLoading: false,
        error: 'Previous error'
      });

      const action = { type: register.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('register.fulfilled', () => {
    it('should set user and token on successful registration', () => {
      const mockUser = createMockUser({ _id: 'new_user' });
      const initialState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
      };

      const action = {
        type: register.fulfilled.type,
        payload: {
          user: mockUser,
          token: 'jwt-token',
          refreshToken: 'refresh-token'
        }
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe('jwt-token');
      expect(newState.isAuthenticated).toBe(true);
    });
  });

  describe('register.rejected', () => {
    it('should set error on failed registration', () => {
      const initialState: AuthState = {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
      };

      const action = {
        type: register.rejected.type,
        payload: 'Email already exists'
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Email already exists');
    });
  });
});

// ============================================
// LOGOUT ASYNC THUNK TESTS
// ============================================
describe('Auth Slice - Logout Thunk', () => {
  describe('logout.fulfilled', () => {
    it('should clear all auth state on logout', () => {
      const mockUser = createMockUser();
      const initialState: AuthState = createMockAuthState({
        user: mockUser,
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        isAuthenticated: true
      });

      const action = { type: logout.fulfilled.type };
      const newState = authReducer(initialState, action);

      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
      expect(newState.refreshToken).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('should clear error on logout', () => {
      const initialState: AuthState = createMockAuthState({
        error: 'Some error'
      });

      const action = { type: logout.fulfilled.type };
      const newState = authReducer(initialState, action);

      expect(newState.error).toBeNull();
    });
  });
});

// ============================================
// FETCH CURRENT USER THUNK TESTS
// ============================================
describe('Auth Slice - FetchCurrentUser Thunk', () => {
  describe('fetchCurrentUser.pending', () => {
    it('should set loading state', () => {
      const initialState: AuthState = createMockAuthState({
        isLoading: false
      });

      const action = { type: fetchCurrentUser.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });
  });

  describe('fetchCurrentUser.fulfilled', () => {
    it('should update user data', () => {
      const mockUser = createMockUser({ firstName: 'Updated' });
      const initialState: AuthState = createMockAuthState({
        isLoading: true
      });

      const action = {
        type: fetchCurrentUser.fulfilled.type,
        payload: mockUser
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(mockUser);
      expect(newState.user?.firstName).toBe('Updated');
    });
  });

  describe('fetchCurrentUser.rejected', () => {
    it('should clear user and set unauthenticated', () => {
      const mockUser = createMockUser();
      const initialState: AuthState = createMockAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: true
      });

      const action = { type: fetchCurrentUser.rejected.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });
});

// ============================================
// UPDATE PROFILE THUNK TESTS
// ============================================
describe('Auth Slice - UpdateProfile Thunk', () => {
  describe('updateProfile.pending', () => {
    it('should set loading state and clear error', () => {
      const initialState: AuthState = createMockAuthState({
        isLoading: false,
        error: 'Previous error'
      });

      const action = { type: updateProfile.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });
  });

  describe('updateProfile.fulfilled', () => {
    it('should update user with new data', () => {
      const mockUser = createMockUser();
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      const initialState: AuthState = createMockAuthState({
        user: mockUser,
        isLoading: true
      });

      const action = {
        type: updateProfile.fulfilled.type,
        payload: updatedUser
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(updatedUser);
    });
  });

  describe('updateProfile.rejected', () => {
    it('should set error on failure', () => {
      const initialState: AuthState = createMockAuthState({
        isLoading: true
      });

      const action = {
        type: updateProfile.rejected.type,
        payload: 'Update failed'
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Update failed');
    });
  });
});

// ============================================
// UPDATE AVAILABILITY THUNK TESTS
// ============================================
describe('Auth Slice - UpdateAvailability Thunk', () => {
  describe('updateAvailability.pending', () => {
    it('should set loading state', () => {
      const initialState: AuthState = createMockAuthState({
        isLoading: false
      });

      const action = { type: updateAvailability.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });
  });

  describe('updateAvailability.fulfilled', () => {
    it('should update user availability', () => {
      const mockUser = createMockUser({ role: 'technician' });
      const initialState: AuthState = createMockAuthState({
        user: mockUser,
        isLoading: true
      });

      const newAvailability = { isAvailable: true, schedule: [] };
      const action = {
        type: updateAvailability.fulfilled.type,
        payload: newAvailability
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user?.availability).toEqual(newAvailability);
    });
  });

  describe('updateAvailability.rejected', () => {
    it('should set error on failure', () => {
      const initialState: AuthState = createMockAuthState({
        isLoading: true
      });

      const action = {
        type: updateAvailability.rejected.type,
        payload: 'Availability update failed'
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Availability update failed');
    });
  });
});

// ============================================
// STATE IMMUTABILITY TESTS
// ============================================
describe('Auth Slice - Immutability', () => {
  it('should not mutate state on any action', () => {
    const initialState: AuthState = createMockAuthState();
    const frozenState = JSON.parse(JSON.stringify(initialState));

    // Dispatch various actions
    authReducer(initialState, clearError());
    authReducer(initialState, { type: login.pending.type });
    authReducer(initialState, { type: register.pending.type });

    expect(initialState).toEqual(frozenState);
  });
});
