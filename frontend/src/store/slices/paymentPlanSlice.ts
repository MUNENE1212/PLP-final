import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  PaymentPlanState,
  PaymentPlan,
  PaymentPlanFormData,
  PlanTypeInfo,
  PaymentPlanAnalytics,
  CalculationResult,
  CalculateOptions
} from '@/types/paymentPlan';
import {
  getPaymentPlanTypes,
  createPaymentPlan,
  getMyPaymentPlans,
  getServicePaymentPlans,
  getPaymentPlanById,
  updatePaymentPlan,
  deletePaymentPlan,
  deactivatePaymentPlan,
  calculateTotal,
  getPaymentPlanAnalytics
} from '@/services/paymentPlan.service';

// Initial state
const initialState: PaymentPlanState = {
  plans: [],
  selectedPlan: null,
  planTypes: [],
  analytics: null,
  calculationResult: null,
  loading: false,
  actionLoading: false,
  error: null
};

// ===== Async Thunks =====

/**
 * Fetch all payment plan types
 */
export const fetchPlanTypes = createAsyncThunk(
  'paymentPlans/fetchPlanTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPaymentPlanTypes();
      if (!response.success) {
        return rejectWithValue('Failed to fetch plan types');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch plan types'
      );
    }
  }
);

/**
 * Create a new payment plan
 */
export const createPlan = createAsyncThunk(
  'paymentPlans/createPlan',
  async (data: PaymentPlanFormData, { rejectWithValue }) => {
    try {
      const response = await createPaymentPlan(data);
      if (!response.success) {
        return rejectWithValue(response.error || response.message || 'Failed to create plan');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create payment plan'
      );
    }
  }
);

/**
 * Fetch technician's own payment plans
 */
export const fetchMyPlans = createAsyncThunk(
  'paymentPlans/fetchMyPlans',
  async (activeOnly: boolean = true, { rejectWithValue }) => {
    try {
      const response = await getMyPaymentPlans(activeOnly);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch plans');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch payment plans'
      );
    }
  }
);

/**
 * Fetch payment plans for a service
 */
export const fetchServicePlans = createAsyncThunk(
  'paymentPlans/fetchServicePlans',
  async (
    params: { serviceId: string; page?: number; limit?: number; sortBy?: 'rating' | 'newest' },
    { rejectWithValue }
  ) => {
    try {
      const response = await getServicePaymentPlans(params.serviceId, {
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy
      });
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch service plans');
      }
      return {
        plans: response.data,
        pagination: response.pagination
      };
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch service plans'
      );
    }
  }
);

/**
 * Fetch a single payment plan by ID
 */
export const fetchPlanById = createAsyncThunk(
  'paymentPlans/fetchPlanById',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await getPaymentPlanById(planId);
      if (!response.success) {
        return rejectWithValue(response.error || 'Plan not found');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch payment plan'
      );
    }
  }
);

/**
 * Update a payment plan
 */
export const updatePlan = createAsyncThunk(
  'paymentPlans/updatePlan',
  async (
    params: { planId: string; data: Partial<PaymentPlanFormData> },
    { rejectWithValue }
  ) => {
    try {
      const response = await updatePaymentPlan(params.planId, params.data);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update plan');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update payment plan'
      );
    }
  }
);

/**
 * Delete a payment plan
 */
export const deletePlan = createAsyncThunk(
  'paymentPlans/deletePlan',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await deletePaymentPlan(planId);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to delete plan');
      }
      return planId;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete payment plan'
      );
    }
  }
);

/**
 * Deactivate a payment plan
 */
export const deactivatePlan = createAsyncThunk(
  'paymentPlans/deactivatePlan',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await deactivatePaymentPlan(planId);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to deactivate plan');
      }
      return planId;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to deactivate payment plan'
      );
    }
  }
);

/**
 * Calculate total price for a plan
 */
export const calculatePlanTotal = createAsyncThunk(
  'paymentPlans/calculateTotal',
  async (
    params: { planId: string; options: CalculateOptions },
    { rejectWithValue }
  ) => {
    try {
      const response = await calculateTotal(params.planId, params.options);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to calculate total');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to calculate total'
      );
    }
  }
);

/**
 * Fetch payment plan analytics
 */
export const fetchAnalytics = createAsyncThunk(
  'paymentPlans/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPaymentPlanAnalytics();
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch analytics');
      }
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch analytics'
      );
    }
  }
);

// ===== Slice =====

const paymentPlanSlice = createSlice({
  name: 'paymentPlans',
  initialState,
  reducers: {
    /**
     * Set the selected plan
     */
    setSelectedPlan: (state, action: PayloadAction<PaymentPlan | null>) => {
      state.selectedPlan = action.payload;
    },

    /**
     * Clear calculation result
     */
    clearCalculationResult: (state) => {
      state.calculationResult = null;
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
    resetPaymentPlanState: () => initialState,

    /**
     * Remove plan from list (optimistic update)
     */
    removePlanFromList: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan._id !== action.payload);
    },

    /**
     * Update plan in list (optimistic update)
     */
    updatePlanInList: (state, action: PayloadAction<PaymentPlan>) => {
      const index = state.plans.findIndex(plan => plan._id === action.payload._id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch Plan Types
    builder
      .addCase(fetchPlanTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.planTypes = action.payload as PlanTypeInfo[];
      })
      .addCase(fetchPlanTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Plan
    builder
      .addCase(createPlan.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.plans.push(action.payload as PaymentPlan);
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Plans
    builder
      .addCase(fetchMyPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload as PaymentPlan[];
      })
      .addCase(fetchMyPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Service Plans
    builder
      .addCase(fetchServicePlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicePlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.plans as PaymentPlan[];
      })
      .addCase(fetchServicePlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Plan By ID
    builder
      .addCase(fetchPlanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlan = action.payload as PaymentPlan;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Plan
    builder
      .addCase(updatePlan.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedPlan = action.payload as PaymentPlan;
        const index = state.plans.findIndex(plan => plan._id === updatedPlan._id);
        if (index !== -1) {
          state.plans[index] = updatedPlan;
        }
        if (state.selectedPlan?._id === updatedPlan._id) {
          state.selectedPlan = updatedPlan;
        }
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Delete Plan
    builder
      .addCase(deletePlan.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.plans = state.plans.filter(plan => plan._id !== action.payload);
        if (state.selectedPlan?._id === action.payload) {
          state.selectedPlan = null;
        }
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Deactivate Plan
    builder
      .addCase(deactivatePlan.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deactivatePlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        const plan = state.plans.find(p => p._id === action.payload);
        if (plan) {
          plan.isActive = false;
        }
      })
      .addCase(deactivatePlan.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Calculate Total
    builder
      .addCase(calculatePlanTotal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculatePlanTotal.fulfilled, (state, action) => {
        state.loading = false;
        state.calculationResult = action.payload as CalculationResult;
      })
      .addCase(calculatePlanTotal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload as PaymentPlanAnalytics;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const {
  setSelectedPlan,
  clearCalculationResult,
  clearError,
  resetPaymentPlanState,
  removePlanFromList,
  updatePlanInList
} = paymentPlanSlice.actions;

// Export reducer
export default paymentPlanSlice.reducer;

// ===== Selectors =====

/**
 * Select all payment plans
 */
export const selectPlans = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.plans;

/**
 * Select active payment plans
 */
export const selectActivePlans = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.plans.filter(plan => plan.isActive);

/**
 * Select selected plan
 */
export const selectSelectedPlan = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.selectedPlan;

/**
 * Select plan types
 */
export const selectPlanTypes = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.planTypes;

/**
 * Select analytics
 */
export const selectAnalytics = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.analytics;

/**
 * Select calculation result
 */
export const selectCalculationResult = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.calculationResult;

/**
 * Select loading state
 */
export const selectPaymentPlansLoading = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.loading;

/**
 * Select action loading state
 */
export const selectPaymentPlansActionLoading = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.actionLoading;

/**
 * Select error state
 */
export const selectPaymentPlansError = (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.error;

/**
 * Select plan by ID
 */
export const selectPlanById = (planId: string) => (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.plans.find(plan => plan._id === planId);

/**
 * Select plans by type
 */
export const selectPlansByType = (planType: string) => (state: { paymentPlans: PaymentPlanState }) =>
  state.paymentPlans.plans.filter(plan => plan.planType === planType);
