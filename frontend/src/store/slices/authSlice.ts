import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;

      // Store tokens and user in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      toast.success('Login successful!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/register', userData);
      const { token, refreshToken, user } = response.data;

      // Store tokens and user in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      toast.success('Registration successful! Welcome to BaiTech.');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ success: boolean; user: User }>('/auth/me');
      const { user } = response.data;

      // Update user in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch user data.';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear localStorage
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);

  toast.success('Logged out successfully.');
  return null;
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User> & { userId: string }, { rejectWithValue }) => {
    try {
      const { userId, ...updates } = userData;
      const response = await axios.put(`/users/${userId}`, updates);

      // Update user in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));

      toast.success('Profile updated successfully!');
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'auth/updateAvailability',
  async (
    { userId, isAvailable, schedule }: { userId: string; isAvailable?: boolean; schedule?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(`/users/${userId}/availability`, {
        isAvailable,
        schedule,
      });

      toast.success('Availability updated successfully!');
      return response.data.availability;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update availability';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update availability
    builder
      .addCase(updateAvailability.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.availability = action.payload;
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
        }
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
