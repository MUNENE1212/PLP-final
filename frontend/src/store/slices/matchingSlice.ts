import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// Types
export interface Location {
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface MatchScores {
  overall: number;
  skillMatch: number;
  locationProximity: number;
  availability: number;
  rating: number;
  experienceLevel: number;
  pricing: number;
  responseTime: number;
  completionRate: number;
  customerPreference: number;
}

export interface MatchReason {
  reason: string;
  weight: number;
  score: number;
}

export interface TechnicianBasic {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  rating: number;
  skills: Array<{
    category: string;
    proficiency: string;
  }>;
  location?: Location;
  availability?: {
    status: string;
  };
  hourlyRate?: number;
  yearsOfExperience?: number;
  completedJobs?: number;
}

export interface Match {
  _id: string;
  customer: string;
  technician: TechnicianBasic;
  serviceCategory: string;
  location: Location;
  urgency: string;
  scores: MatchScores;
  distance: number;
  matchReasons: MatchReason[];
  status: string;
  action: string;
  createdAt: string;
  expiresAt: string;
  matchQuality?: string;
}

export interface MatchingPreference {
  _id: string;
  user: string;
  general: {
    maxDistance: number;
    priceRange: {
      min?: number;
      max?: number;
      preference: string;
    };
    responseTime: string;
    languages?: string[];
    defaultUrgency: string;
  };
  technicianPreferences: {
    ratingImportance: number;
    minRating: number;
    experienceLevel?: string;
    minYearsExperience: number;
    requireCertifications: boolean;
    requireBackgroundCheck: boolean;
    requireInsurance: boolean;
  };
  communication?: {
    preferredMethod: string;
    expectedResponseTime?: string;
    notifyOnMatch: boolean;
    notifyOnBetterMatch: boolean;
    matchNotificationFrequency: string;
  };
  ai: {
    enableAIRecommendations: boolean;
    autoMatch: boolean;
    enableSmartScheduling: boolean;
    enablePricePrediction?: boolean;
    allowBehaviorLearning?: boolean;
    personalizationLevel: string;
  };
  customWeights?: Partial<{
    skillMatch: number;
    locationProximity: number;
    availability: number;
    rating: number;
    experienceLevel: number;
    pricing: number;
    responseTime: number;
    completionRate: number;
    customerPreference: number;
  }>;
}

export interface FindTechniciansParams {
  serviceCategory: string;
  location: Location;
  urgency?: string;
  budget?: number;
  preferredDate?: string;
  description?: string;
}

export interface AcceptMatchParams {
  matchId: string;
  scheduledDate: string;
  scheduledTime: string;
  description?: string;
  estimatedDuration?: number;
}

interface MatchingState {
  matches: Match[];
  currentMatch: Match | null;
  preferences: MatchingPreference | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  sessionId: string | null;
}

const initialState: MatchingState = {
  matches: [],
  currentMatch: null,
  preferences: null,
  isLoading: false,
  isSearching: false,
  error: null,
  sessionId: null,
};

// Async thunks
export const findTechnicians = createAsyncThunk(
  'matching/findTechnicians',
  async (params: FindTechniciansParams, { rejectWithValue }) => {
    try {
      const response = await axios.post('/matching/find-technicians', params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to find technicians');
    }
  }
);

export const getMyMatches = createAsyncThunk(
  'matching/getMyMatches',
  async (params: { serviceCategory?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/matching/my-matches', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

export const getMatch = createAsyncThunk(
  'matching/getMatch',
  async (matchId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/matching/${matchId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch match details');
    }
  }
);

export const acceptMatch = createAsyncThunk(
  'matching/acceptMatch',
  async (params: AcceptMatchParams, { rejectWithValue }) => {
    try {
      const { matchId, ...bookingData } = params;
      const response = await axios.post(`/matching/${matchId}/accept`, bookingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept match');
    }
  }
);

export const rejectMatch = createAsyncThunk(
  'matching/rejectMatch',
  async ({ matchId, reason }: { matchId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/matching/${matchId}/reject`, { reason });
      return { matchId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject match');
    }
  }
);

export const addMatchFeedback = createAsyncThunk(
  'matching/addMatchFeedback',
  async (
    {
      matchId,
      feedback,
    }: {
      matchId: string;
      feedback: { helpful?: boolean; rating?: number; accuracy?: string; comment?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`/matching/${matchId}/feedback`, feedback);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

export const getPreferences = createAsyncThunk(
  'matching/getPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/matching/preferences');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch preferences');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'matching/updatePreferences',
  async (preferences: Partial<MatchingPreference>, { rejectWithValue }) => {
    try {
      const response = await axios.put('/matching/preferences', preferences);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  }
);

export const blockTechnician = createAsyncThunk(
  'matching/blockTechnician',
  async ({ technicianId, reason }: { technicianId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/matching/block/${technicianId}`, { reason });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block technician');
    }
  }
);

export const unblockTechnician = createAsyncThunk(
  'matching/unblockTechnician',
  async (technicianId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/matching/block/${technicianId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unblock technician');
    }
  }
);

// Slice
const matchingSlice = createSlice({
  name: 'matching',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMatches: (state) => {
      state.matches = [];
      state.sessionId = null;
    },
    clearCurrentMatch: (state) => {
      state.currentMatch = null;
    },
  },
  extraReducers: (builder) => {
    // Find technicians
    builder
      .addCase(findTechnicians.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(findTechnicians.fulfilled, (state, action) => {
        state.isSearching = false;
        state.matches = action.payload.data;
        state.sessionId = action.payload.sessionId;
      })
      .addCase(findTechnicians.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Get my matches
    builder
      .addCase(getMyMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matches = action.payload.data;
      })
      .addCase(getMyMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get match
    builder
      .addCase(getMatch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMatch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMatch = action.payload.data;
      })
      .addCase(getMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Accept match
    builder
      .addCase(acceptMatch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptMatch.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update match status
        const matchId = action.payload.data.matching._id;
        state.matches = state.matches.map((match) =>
          match._id === matchId ? { ...match, status: 'accepted', action: 'booked' } : match
        );
        if (state.currentMatch && state.currentMatch._id === matchId) {
          state.currentMatch = action.payload.data.matching;
        }
      })
      .addCase(acceptMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reject match
    builder
      .addCase(rejectMatch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectMatch.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove rejected match from list
        const matchId = action.payload.matchId;
        state.matches = state.matches.filter((match) => match._id !== matchId);
        if (state.currentMatch && state.currentMatch._id === matchId) {
          state.currentMatch = null;
        }
      })
      .addCase(rejectMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get preferences
    builder
      .addCase(getPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload.data;
      })
      .addCase(getPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update preferences
    builder
      .addCase(updatePreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload.data;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearMatches, clearCurrentMatch } = matchingSlice.actions;
export default matchingSlice.reducer;
