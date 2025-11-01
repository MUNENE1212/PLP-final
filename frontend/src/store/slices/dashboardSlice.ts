import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDashboardStats, getRecentActivity, DashboardStats, ActivityItem } from '@/services/dashboard.service';
import toast from 'react-hot-toast';

interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getDashboardStats();
      return stats;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard stats';
      return rejectWithValue(message);
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchActivity',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const activity = await getRecentActivity(limit);
      return activity;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch recent activity';
      return rejectWithValue(message);
    }
  }
);

export const refreshDashboard = createAsyncThunk(
  'dashboard/refresh',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchRecentActivity(10))
      ]);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to refresh dashboard';
      return rejectWithValue(message);
    }
  }
);

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.stats = null;
      state.recentActivity = [];
      state.error = null;
      state.lastFetched = null;
    },
    // Optimistically update stats (useful for real-time updates)
    updateStatsOptimistically: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    // Add new activity item (useful for real-time updates)
    addActivityItem: (state, action: PayloadAction<ActivityItem>) => {
      state.recentActivity = [action.payload, ...state.recentActivity].slice(0, 10);
    },
  },
  extraReducers: (builder) => {
    // Fetch stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    // Fetch recent activity
    builder
      .addCase(fetchRecentActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentActivity = action.payload;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    // Refresh dashboard
    builder
      .addCase(refreshDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state) => {
        state.isLoading = false;
        state.lastFetched = Date.now();
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const {
  clearDashboardError,
  clearDashboard,
  updateStatsOptimistically,
  addActivityItem,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
