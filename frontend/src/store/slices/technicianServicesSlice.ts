import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  TechnicianService,
  TechnicianServiceInput,
  TechnicianServiceUpdateInput,
  TechnicianServicesState,
} from '@/types/technicianService';
import {
  getMyTechnicianServices,
  addTechnicianService as addService,
  updateTechnicianService as updateService,
  removeTechnicianService as removeService,
  toggleServiceAvailability as toggleAvailability,
} from '@/services/technicianService.service';

/**
 * Technician Services Redux Slice
 * Manages state for technician's services from the WORD BANK
 */

// Initial state
const initialState: TechnicianServicesState = {
  services: [],
  loading: false,
  error: null,
  currentService: null,
  actionLoading: false,
};

// ===== Async Thunks =====

/**
 * Fetch all services for the current technician
 */
export const fetchMyTechnicianServices = createAsyncThunk(
  'technicianServices/fetchMyServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyTechnicianServices();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch services');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch your services'
      );
    }
  }
);

/**
 * Add a new service to technician's offerings
 */
export const addTechnicianService = createAsyncThunk(
  'technicianServices/addService',
  async (data: TechnicianServiceInput, { rejectWithValue }) => {
    try {
      const response = await addService(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to add service');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add service'
      );
    }
  }
);

/**
 * Update an existing technician service
 */
export const updateTechnicianService = createAsyncThunk(
  'technicianServices/updateService',
  async (
    { id, data }: { id: string; data: TechnicianServiceUpdateInput },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateService(id, data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to update service');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update service'
      );
    }
  }
);

/**
 * Remove a service from technician's offerings
 */
export const removeTechnicianService = createAsyncThunk(
  'technicianServices/removeService',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await removeService(id);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to remove service');
      }
      return id;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to remove service'
      );
    }
  }
);

/**
 * Toggle service availability
 */
export const toggleServiceAvailability = createAsyncThunk(
  'technicianServices/toggleAvailability',
  async (
    { id, isActive }: { id: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await toggleAvailability(id, isActive);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to update availability');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update availability'
      );
    }
  }
);

// ===== Slice =====

const technicianServicesSlice = createSlice({
  name: 'technicianServices',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Set current service for editing
     */
    setCurrentService: (state, action: PayloadAction<TechnicianService | null>) => {
      state.currentService = action.payload;
    },

    /**
     * Clear current service
     */
    clearCurrentService: (state) => {
      state.currentService = null;
    },

    /**
     * Reset state to initial
     */
    resetTechnicianServicesState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch My Services
    builder
      .addCase(fetchMyTechnicianServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTechnicianServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload as TechnicianService[];
      })
      .addCase(fetchMyTechnicianServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Service
    builder
      .addCase(addTechnicianService.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addTechnicianService.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.services.push(action.payload as TechnicianService);
      })
      .addCase(addTechnicianService.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Update Service
    builder
      .addCase(updateTechnicianService.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTechnicianService.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedService = action.payload as TechnicianService;
        const index = state.services.findIndex((s) => s._id === updatedService._id);
        if (index !== -1) {
          state.services[index] = updatedService;
        }
        if (state.currentService?._id === updatedService._id) {
          state.currentService = updatedService;
        }
      })
      .addCase(updateTechnicianService.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Remove Service
    builder
      .addCase(removeTechnicianService.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeTechnicianService.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.services = state.services.filter((s) => s._id !== action.payload);
        if (state.currentService?._id === action.payload) {
          state.currentService = null;
        }
      })
      .addCase(removeTechnicianService.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Toggle Availability
    builder
      .addCase(toggleServiceAvailability.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(toggleServiceAvailability.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedService = action.payload as TechnicianService;
        const index = state.services.findIndex((s) => s._id === updatedService._id);
        if (index !== -1) {
          state.services[index] = updatedService;
        }
      })
      .addCase(toggleServiceAvailability.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentService,
  clearCurrentService,
  resetTechnicianServicesState,
} = technicianServicesSlice.actions;

// Export reducer
export default technicianServicesSlice.reducer;

// ===== Selectors =====

/**
 * Select all technician services
 */
export const selectTechnicianServices = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.services;

/**
 * Select loading state
 */
export const selectTechnicianServicesLoading = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.loading;

/**
 * Select error state
 */
export const selectTechnicianServicesError = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.error;

/**
 * Select current service
 */
export const selectCurrentService = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.currentService;

/**
 * Select action loading state
 */
export const selectTechnicianServicesActionLoading = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.actionLoading;

/**
 * Select active services only
 */
export const selectActiveTechnicianServices = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.services.filter((s) => s.availability.isActive);

/**
 * Select service by ID
 */
export const selectTechnicianServiceById =
  (id: string) => (state: { technicianServices: TechnicianServicesState }) =>
    state.technicianServices.services.find((s) => s._id === id);

/**
 * Select service IDs for exclusion (already added services)
 */
export const selectExcludedServiceIds = (state: {
  technicianServices: TechnicianServicesState;
}) =>
  state.technicianServices.services
    .map((s) => (typeof s.service === 'object' ? s.service._id : s.service))
    .filter(Boolean);

/**
 * Select services count
 */
export const selectTechnicianServicesCount = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.services.length;

/**
 * Select active services count
 */
export const selectActiveTechnicianServicesCount = (state: {
  technicianServices: TechnicianServicesState;
}) => state.technicianServices.services.filter((s) => s.availability.isActive).length;
