/**
 * Profile Completeness Redux Slice
 *
 * State management for profile completeness feature.
 * Handles fetching, updating, and caching of profile scores.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import profileService from '@/services/profile.service';
import type {
  ProfileCompleteness,
  Suggestion,
  MissingItem,
  ProfileSection
} from '@/types/profile';

/**
 * Profile state interface
 */
interface ProfileState {
  completeness: ProfileCompleteness | null;
  suggestions: Suggestion[];
  missingItems: MissingItem[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

/**
 * Initial state
 */
const initialState: ProfileState = {
  completeness: null,
  suggestions: [],
  missingItems: [],
  loading: false,
  error: null,
  lastFetched: null
};

/**
 * Fetch profile completeness
 */
export const fetchProfileCompleteness = createAsyncThunk(
  'profile/fetchCompleteness',
  async (_, { rejectWithValue }) => {
    try {
      const completeness = await profileService.getProfileCompleteness();
      return completeness;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile completeness'
      );
    }
  }
);

/**
 * Recalculate profile completeness
 */
export const recalculateProfileCompleteness = createAsyncThunk(
  'profile/recalculateCompleteness',
  async (_, { rejectWithValue }) => {
    try {
      const completeness = await profileService.recalculateCompleteness();
      return completeness;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to recalculate profile completeness'
      );
    }
  }
);

/**
 * Fetch profile suggestions
 */
export const fetchProfileSuggestions = createAsyncThunk(
  'profile/fetchSuggestions',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const suggestions = await profileService.getSuggestions(limit);
      return suggestions;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch suggestions'
      );
    }
  }
);

/**
 * Fetch missing items
 */
export const fetchMissingItems = createAsyncThunk(
  'profile/fetchMissingItems',
  async (_, { rejectWithValue }) => {
    try {
      const missingItems = await profileService.getMissingItems();
      return missingItems;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch missing items'
      );
    }
  }
);

/**
 * Fetch section completeness
 */
export const fetchSectionCompleteness = createAsyncThunk(
  'profile/fetchSectionCompleteness',
  async (section: ProfileSection, { rejectWithValue }) => {
    try {
      const sectionData = await profileService.getSectionCompleteness(section);
      return { section, data: sectionData };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch section completeness'
      );
    }
  }
);

/**
 * Profile slice
 */
const profileSlice = createSlice({
  name: 'profileCompleteness',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.completeness = null;
      state.suggestions = [];
      state.missingItems = [];
      state.error = null;
      state.lastFetched = null;
    },
    updateSectionProgress: (
      state,
      action: PayloadAction<{ section: ProfileSection; completed: boolean }>
    ) => {
      if (state.completeness) {
        const section = state.completeness.sections[action.payload.section];
        if (section) {
          section.completed = action.payload.completed;
        }
      }
    },
    setCompleteness: (state, action: PayloadAction<ProfileCompleteness>) => {
      state.completeness = action.payload;
      state.lastFetched = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile completeness
      .addCase(fetchProfileCompleteness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileCompleteness.fulfilled, (state, action: PayloadAction<ProfileCompleteness>) => {
        state.loading = false;
        state.completeness = action.payload;
        state.lastFetched = new Date().toISOString();
        state.suggestions = action.payload.suggestions || [];
      })
      .addCase(fetchProfileCompleteness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Recalculate profile completeness
      .addCase(recalculateProfileCompleteness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recalculateProfileCompleteness.fulfilled, (state, action: PayloadAction<ProfileCompleteness>) => {
        state.loading = false;
        state.completeness = action.payload;
        state.lastFetched = new Date().toISOString();
        state.suggestions = action.payload.suggestions || [];
      })
      .addCase(recalculateProfileCompleteness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch suggestions
      .addCase(fetchProfileSuggestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfileSuggestions.fulfilled, (state, action: PayloadAction<Suggestion[]>) => {
        state.loading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchProfileSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch missing items
      .addCase(fetchMissingItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMissingItems.fulfilled, (state, action: PayloadAction<MissingItem[]>) => {
        state.loading = false;
        state.missingItems = action.payload;
      })
      .addCase(fetchMissingItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch section completeness
      .addCase(fetchSectionCompleteness.fulfilled, (state, action) => {
        if (state.completeness) {
          const { section, data } = action.payload;
          state.completeness.sections[section] = {
            ...state.completeness.sections[section],
            ...data
          };
        }
      });
  }
});

export const { clearProfile, updateSectionProgress, setCompleteness } = profileSlice.actions;
export default profileSlice.reducer;
