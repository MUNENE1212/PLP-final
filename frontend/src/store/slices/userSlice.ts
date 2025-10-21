import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  location?: {
    address?: string;
    city?: string;
    county?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  skills?: any[];
  portfolio?: any[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  stats?: any;
  createdAt: string;
}

interface UserState {
  currentProfile: UserProfile | null;
  profilePosts: any[];
  followers: UserProfile[];
  following: UserProfile[];
  loading: boolean;
  error: string | null;
  isFollowing: boolean;
}

const initialState: UserState = {
  currentProfile: null,
  profilePosts: [],
  followers: [],
  following: [],
  loading: false,
  error: null,
  isFollowing: false,
};

// Fetch user profile by ID
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      // Validate userId before making request
      if (!userId || userId === 'undefined') {
        return rejectWithValue('Invalid user ID');
      }

      const response = await axios.get(`/users/${userId}`);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile'
      );
    }
  }
);

// Fetch user's posts
export const fetchUserPosts = createAsyncThunk(
  'user/fetchPosts',
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      // Validate userId before making request
      if (!userId || userId === 'undefined') {
        return rejectWithValue('Invalid user ID');
      }

      const response = await axios.get(`/posts?author=${userId}`);
      return response.data.posts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user posts'
      );
    }
  }
);

// Toggle follow/unfollow
export const toggleFollow = createAsyncThunk(
  'user/toggleFollow',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/users/${userId}/follow`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update follow status'
      );
    }
  }
);

// Fetch user's followers
export const fetchFollowers = createAsyncThunk(
  'user/fetchFollowers',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${userId}/followers`);
      return response.data.followers;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch followers'
      );
    }
  }
);

// Fetch user's following
export const fetchFollowing = createAsyncThunk(
  'user/fetchFollowing',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/users/${userId}/following`);
      return response.data.following;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch following'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.currentProfile = null;
      state.profilePosts = [];
      state.followers = [];
      state.following = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.profilePosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Toggle follow
      .addCase(toggleFollow.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        state.loading = false;
        state.isFollowing = action.payload.isFollowing;

        // Update followers count
        if (state.currentProfile) {
          state.currentProfile.followersCount = action.payload.isFollowing
            ? state.currentProfile.followersCount + 1
            : state.currentProfile.followersCount - 1;
        }
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch followers
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload;
      })

      // Fetch following
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload;
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
