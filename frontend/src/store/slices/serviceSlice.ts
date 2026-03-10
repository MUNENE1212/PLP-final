import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  ServiceCategory,
  ServiceState,
  CustomServiceFormData,
  PendingService,
  ApprovalStats,
  ApprovalFilterStatus,
} from '@/types/service';
import {
  getCategories,
  getCategoryServices,
  searchServices,
  submitCustomService,
  getPendingServices,
  approveService,
  rejectService,
  getApprovalStats,
} from '@/services/service.service';

// Initial state
const initialState: ServiceState = {
  categories: [],
  services: [],
  selectedCategory: null,
  searchQuery: '',
  loading: false,
  error: null,
  // Admin approval state
  pendingServices: [],
  approvalStats: null,
  filterStatus: 'pending',
  currentPage: 1,
  itemsPerPage: 10,
  actionLoading: false,
};

// ===== Async Thunks =====

/**
 * Fetch all service categories
 */
export const fetchCategories = createAsyncThunk(
  'services/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategories();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch categories');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

/**
 * Fetch services by category
 */
export const fetchServicesByCategory = createAsyncThunk(
  'services/fetchServicesByCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await getCategoryServices(categoryId);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch services');
      }
      return {
        categoryId,
        services: response.data,
      };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch services'
      );
    }
  }
);

/**
 * Search services by query
 */
export const searchServicesAction = createAsyncThunk(
  'services/searchServices',
  async (query: string, { rejectWithValue }) => {
    try {
      if (!query.trim()) {
        return { services: [], categories: [], totalCount: 0 };
      }
      const response = await searchServices(query);
      return response;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Search failed'
      );
    }
  }
);

/**
 * Submit custom service for approval
 */
export const submitCustomServiceAction = createAsyncThunk(
  'services/submitCustomService',
  async (data: CustomServiceFormData, { rejectWithValue }) => {
    try {
      const response = await submitCustomService(data);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to submit service');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to submit service'
      );
    }
  }
);

// ===== Admin Approval Async Thunks =====

/**
 * Fetch pending services for admin approval
 */
export const fetchPendingServices = createAsyncThunk(
  'services/fetchPendingServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPendingServices();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch pending services');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch pending services'
      );
    }
  }
);

/**
 * Fetch approval statistics
 */
export const fetchApprovalStats = createAsyncThunk(
  'services/fetchApprovalStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getApprovalStats();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch approval stats');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch approval stats'
      );
    }
  }
);

/**
 * Approve a pending service
 */
export const approveServiceAction = createAsyncThunk(
  'services/approveService',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await approveService(id);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to approve service');
      }
      return { id, data: response.data };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to approve service'
      );
    }
  }
);

/**
 * Reject a pending service
 */
export const rejectServiceAction = createAsyncThunk(
  'services/rejectService',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await rejectService(id, reason);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to reject service');
      }
      return { id, data: response.data };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to reject service'
      );
    }
  }
);

// ===== Slice =====

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    /**
     * Set the selected category
     */
    setSelectedCategory: (state, action: PayloadAction<ServiceCategory | null>) => {
      state.selectedCategory = action.payload;
      // Clear services when clearing category
      if (!action.payload) {
        state.services = [];
      }
    },

    /**
     * Set the search query
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    /**
     * Clear selection and search
     */
    clearSelection: (state) => {
      state.selectedCategory = null;
      state.searchQuery = '';
      state.services = [];
      state.error = null;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Reset state to initial
     */
    resetServiceState: () => initialState,

    // ===== Admin Approval Reducers =====

    /**
     * Set filter status for approval list
     */
    setApprovalFilterStatus: (state, action: PayloadAction<ApprovalFilterStatus>) => {
      state.filterStatus = action.payload;
      state.currentPage = 1; // Reset to first page when filter changes
    },

    /**
     * Set current page for pagination
     */
    setApprovalCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    /**
     * Clear pending services and stats
     */
    clearApprovalData: (state) => {
      state.pendingServices = [];
      state.approvalStats = null;
      state.filterStatus = 'pending';
      state.currentPage = 1;
      state.actionLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Services by Category
    builder
      .addCase(fetchServicesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.services;
        // Update selected category if not set
        if (!state.selectedCategory) {
          const category = state.categories.find(
            (c) => c._id === action.payload.categoryId
          );
          if (category) {
            state.selectedCategory = category;
          }
        }
      })
      .addCase(fetchServicesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search Services
    builder
      .addCase(searchServicesAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchServicesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.services;
      })
      .addCase(searchServicesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Submit Custom Service
    builder
      .addCase(submitCustomServiceAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCustomServiceAction.fulfilled, (state, _action) => {
        state.loading = false;
        // Optionally add the new service to the list if approved immediately
        // For now, just clear any errors
        state.error = null;
      })
      .addCase(submitCustomServiceAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ===== Admin Approval Extra Reducers =====

    // Fetch Pending Services
    builder
      .addCase(fetchPendingServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingServices.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingServices = action.payload as PendingService[];
      })
      .addCase(fetchPendingServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Approval Stats
    builder
      .addCase(fetchApprovalStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovalStats.fulfilled, (state, action) => {
        state.loading = false;
        state.approvalStats = action.payload;
      })
      .addCase(fetchApprovalStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Approve Service
    builder
      .addCase(approveServiceAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(approveServiceAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Remove the approved service from pending list
        state.pendingServices = state.pendingServices.filter(
          (service) => service._id !== action.payload.id
        );
        // Update stats if available
        if (state.approvalStats) {
          state.approvalStats.pending = Math.max(0, state.approvalStats.pending - 1);
          state.approvalStats.approved += 1;
        }
      })
      .addCase(approveServiceAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Reject Service
    builder
      .addCase(rejectServiceAction.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(rejectServiceAction.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Remove the rejected service from pending list
        state.pendingServices = state.pendingServices.filter(
          (service) => service._id !== action.payload.id
        );
        // Update stats if available
        if (state.approvalStats) {
          state.approvalStats.pending = Math.max(0, state.approvalStats.pending - 1);
          state.approvalStats.rejected += 1;
        }
      })
      .addCase(rejectServiceAction.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSelectedCategory,
  setSearchQuery,
  clearSelection,
  clearError,
  resetServiceState,
  setApprovalFilterStatus,
  setApprovalCurrentPage,
  clearApprovalData,
} = serviceSlice.actions;

// Export reducer
export default serviceSlice.reducer;

// ===== Selectors =====

/**
 * Select all categories
 */
export const selectCategories = (state: { services: ServiceState }) =>
  state.services.categories;

/**
 * Select services for current category/search
 */
export const selectServices = (state: { services: ServiceState }) =>
  state.services.services;

/**
 * Select selected category
 */
export const selectSelectedCategory = (state: { services: ServiceState }) =>
  state.services.selectedCategory;

/**
 * Select search query
 */
export const selectSearchQuery = (state: { services: ServiceState }) =>
  state.services.searchQuery;

/**
 * Select loading state
 */
export const selectServicesLoading = (state: { services: ServiceState }) =>
  state.services.loading;

/**
 * Select error state
 */
export const selectServicesError = (state: { services: ServiceState }) =>
  state.services.error;

/**
 * Select active categories only
 */
export const selectActiveCategories = (state: { services: ServiceState }) =>
  state.services.categories.filter((cat) => cat.isActive);

/**
 * Select category by ID
 */
export const selectCategoryById = (categoryId: string) => (state: { services: ServiceState }) =>
  state.services.categories.find((cat) => cat._id === categoryId);

/**
 * Select services by category ID
 */
export const selectServicesByCategory = (categoryId: string) => (state: { services: ServiceState }) =>
  state.services.services.filter((service) => service.categoryId === categoryId);

/**
 * Select active services only
 */
export const selectActiveServices = (state: { services: ServiceState }) =>
  state.services.services.filter((service) => service.isActive);

// ===== Admin Approval Selectors =====

/**
 * Select pending services for admin approval
 */
export const selectPendingServices = (state: { services: ServiceState }) =>
  state.services.pendingServices;

/**
 * Select filtered pending services based on filter status
 */
export const selectFilteredPendingServices = (state: { services: ServiceState }) => {
  const { pendingServices, filterStatus } = state.services;

  if (filterStatus === 'all') {
    return pendingServices;
  }

  return pendingServices.filter((service) => service.approvalStatus === filterStatus);
};

/**
 * Select paginated pending services
 */
export const selectPaginatedPendingServices = (state: { services: ServiceState }) => {
  const filtered = selectFilteredPendingServices(state);
  const { currentPage, itemsPerPage } = state.services;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    services: filtered.slice(startIndex, endIndex),
    totalCount: filtered.length,
    totalPages: Math.ceil(filtered.length / itemsPerPage),
    currentPage,
    itemsPerPage,
  };
};

/**
 * Select approval stats
 */
export const selectApprovalStats = (state: { services: ServiceState }) =>
  state.services.approvalStats;

/**
 * Select approval filter status
 */
export const selectApprovalFilterStatus = (state: { services: ServiceState }) =>
  state.services.filterStatus;

/**
 * Select approval loading state
 */
export const selectApprovalLoading = (state: { services: ServiceState }) =>
  state.services.loading;

/**
 * Select approval action loading state
 */
export const selectApprovalActionLoading = (state: { services: ServiceState }) =>
  state.services.actionLoading;

/**
 * Select approval error state
 */
export const selectApprovalError = (state: { services: ServiceState }) =>
  state.services.error;

/**
 * Select pending service by ID
 */
export const selectPendingServiceById = (id: string) => (state: { services: ServiceState }) =>
  state.services.pendingServices.find((service) => service._id === id);
