/**
 * Escrow Redux Slice
 *
 * State management for the platform escrow system.
 *
 * @module store/slices/escrowSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import * as escrowService from '@/services/escrow.service';
import type {
  Escrow,
  EscrowStatus,
  CreateEscrowRequest,
  FundEscrowRequest,
  ReleaseEscrowRequest,
  ReleaseMilestoneRequest,
  RefundEscrowRequest,
  OpenDisputeRequest,
  ResolveDisputeRequest,
  EscrowFilters,
  EscrowStats
} from '@/types/escrow';

/**
 * Escrow State Interface
 */
interface EscrowState {
  escrows: Escrow[];
  currentEscrow: Escrow | null;
  stats: EscrowStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: EscrowFilters;
}

/**
 * Initial State
 */
const initialState: EscrowState = {
  escrows: [],
  currentEscrow: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  filters: {}
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Create escrow
 */
export const createEscrow = createAsyncThunk(
  'escrow/create',
  async (data: CreateEscrowRequest, { rejectWithValue }) => {
    try {
      const escrow = await escrowService.createEscrow(data);
      toast.success('Escrow created successfully');
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create escrow';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch escrow by ID
 */
export const fetchEscrow = createAsyncThunk(
  'escrow/fetchOne',
  async (escrowId: string, { rejectWithValue }) => {
    try {
      const escrow = await escrowService.getEscrow(escrowId);
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch escrow';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch escrow by booking ID
 */
export const fetchEscrowByBooking = createAsyncThunk(
  'escrow/fetchByBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const escrow = await escrowService.getEscrowByBooking(bookingId);
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch escrow';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fund escrow
 */
export const fundEscrow = createAsyncThunk(
  'escrow/fund',
  async (
    { escrowId, data }: { escrowId: string; data: FundEscrowRequest },
    { rejectWithValue }
  ) => {
    try {
      const escrow = await escrowService.fundEscrow(escrowId, data);
      toast.success('Escrow funded successfully');
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fund escrow';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Release escrow
 */
export const releaseEscrow = createAsyncThunk(
  'escrow/release',
  async (
    { escrowId, data }: { escrowId: string; data?: ReleaseEscrowRequest },
    { rejectWithValue }
  ) => {
    try {
      const escrow = await escrowService.releaseEscrow(escrowId, data);
      toast.success('Funds released to technician');
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to release escrow';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Release milestone
 */
export const releaseMilestone = createAsyncThunk(
  'escrow/releaseMilestone',
  async (
    { escrowId, data }: { escrowId: string; data: ReleaseMilestoneRequest },
    { rejectWithValue }
  ) => {
    try {
      const escrow = await escrowService.releaseMilestone(escrowId, data);
      toast.success('Milestone released successfully');
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to release milestone';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Refund escrow
 */
export const refundEscrow = createAsyncThunk(
  'escrow/refund',
  async (
    { escrowId, data }: { escrowId: string; data: RefundEscrowRequest },
    { rejectWithValue }
  ) => {
    try {
      const escrow = await escrowService.refundEscrow(escrowId, data);
      toast.success('Escrow refunded successfully');
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to refund escrow';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Open dispute
 */
export const openDispute = createAsyncThunk(
  'escrow/openDispute',
  async (
    { escrowId, data }: { escrowId: string; data: OpenDisputeRequest },
    { rejectWithValue }
  ) => {
    try {
      const escrow = await escrowService.openDispute(escrowId, data);
      toast.success('Dispute opened successfully');
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to open dispute';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Resolve dispute
 */
export const resolveDispute = createAsyncThunk(
  'escrow/resolveDispute',
  async (
    { escrowId, data }: { escrowId: string; data: ResolveDisputeRequest },
    { rejectWithValue }
  ) => {
    try {
      const escrow = await escrowService.resolveDispute(escrowId, data);
      toast.success('Dispute resolved successfully');
      return escrow;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to resolve dispute';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch my escrows
 */
export const fetchMyEscrows = createAsyncThunk(
  'escrow/fetchMyEscrows',
  async (filters: EscrowFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await escrowService.getMyEscrows(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch escrows';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch all escrows (admin)
 */
export const fetchAllEscrows = createAsyncThunk(
  'escrow/fetchAll',
  async (filters: EscrowFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await escrowService.getAllEscrows(filters);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch escrows';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch escrow stats
 */
export const fetchEscrowStats = createAsyncThunk(
  'escrow/fetchStats',
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const stats = await escrowService.getEscrowStats(startDate, endDate);
      return stats;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

// ============================================
// SLICE
// ============================================

const escrowSlice = createSlice({
  name: 'escrow',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEscrow: (state) => {
      state.currentEscrow = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateEscrowInList: (state, action) => {
      const index = state.escrows.findIndex(e => e._id === action.payload._id);
      if (index !== -1) {
        state.escrows[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    // Create escrow
    builder
      .addCase(createEscrow.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createEscrow.fulfilled, (state, action) => {
        state.isCreating = false;
        state.escrows.unshift(action.payload);
        state.currentEscrow = action.payload;
      })
      .addCase(createEscrow.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch single escrow
    builder
      .addCase(fetchEscrow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEscrow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEscrow = action.payload;
      })
      .addCase(fetchEscrow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch escrow by booking
    builder
      .addCase(fetchEscrowByBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEscrowByBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEscrow = action.payload;
      })
      .addCase(fetchEscrowByBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fund escrow
    builder
      .addCase(fundEscrow.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(fundEscrow.fulfilled, (state, action) => {
        state.isUpdating = false;
        const escrow = action.payload;
        // Update in list
        const index = state.escrows.findIndex(e => e._id === escrow._id);
        if (index !== -1) {
          state.escrows[index] = escrow;
        }
        // Update current
        if (state.currentEscrow?._id === escrow._id) {
          state.currentEscrow = escrow;
        }
      })
      .addCase(fundEscrow.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Release escrow
    builder
      .addCase(releaseEscrow.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(releaseEscrow.fulfilled, (state, action) => {
        state.isUpdating = false;
        const escrow = action.payload;
        const index = state.escrows.findIndex(e => e._id === escrow._id);
        if (index !== -1) {
          state.escrows[index] = escrow;
        }
        if (state.currentEscrow?._id === escrow._id) {
          state.currentEscrow = escrow;
        }
      })
      .addCase(releaseEscrow.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Release milestone
    builder
      .addCase(releaseMilestone.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(releaseMilestone.fulfilled, (state, action) => {
        state.isUpdating = false;
        const escrow = action.payload;
        const index = state.escrows.findIndex(e => e._id === escrow._id);
        if (index !== -1) {
          state.escrows[index] = escrow;
        }
        if (state.currentEscrow?._id === escrow._id) {
          state.currentEscrow = escrow;
        }
      })
      .addCase(releaseMilestone.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Refund escrow
    builder
      .addCase(refundEscrow.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(refundEscrow.fulfilled, (state, action) => {
        state.isUpdating = false;
        const escrow = action.payload;
        const index = state.escrows.findIndex(e => e._id === escrow._id);
        if (index !== -1) {
          state.escrows[index] = escrow;
        }
        if (state.currentEscrow?._id === escrow._id) {
          state.currentEscrow = escrow;
        }
      })
      .addCase(refundEscrow.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Open dispute
    builder
      .addCase(openDispute.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(openDispute.fulfilled, (state, action) => {
        state.isUpdating = false;
        const escrow = action.payload;
        const index = state.escrows.findIndex(e => e._id === escrow._id);
        if (index !== -1) {
          state.escrows[index] = escrow;
        }
        if (state.currentEscrow?._id === escrow._id) {
          state.currentEscrow = escrow;
        }
      })
      .addCase(openDispute.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Resolve dispute
    builder
      .addCase(resolveDispute.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(resolveDispute.fulfilled, (state, action) => {
        state.isUpdating = false;
        const escrow = action.payload;
        const index = state.escrows.findIndex(e => e._id === escrow._id);
        if (index !== -1) {
          state.escrows[index] = escrow;
        }
        if (state.currentEscrow?._id === escrow._id) {
          state.currentEscrow = escrow;
        }
      })
      .addCase(resolveDispute.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch my escrows
    builder
      .addCase(fetchMyEscrows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyEscrows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.escrows = action.payload.escrows;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyEscrows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch all escrows
    builder
      .addCase(fetchAllEscrows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEscrows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.escrows = action.payload.escrows;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllEscrows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchEscrowStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEscrowStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchEscrowStats.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export const {
  clearError,
  clearCurrentEscrow,
  setFilters,
  clearFilters,
  updateEscrowInList
} = escrowSlice.actions;

// Selectors
export const selectEscrow = (state: { escrow: EscrowState }) => state.escrow;
export const selectCurrentEscrow = (state: { escrow: EscrowState }) => state.escrow.currentEscrow;
export const selectEscrows = (state: { escrow: EscrowState }) => state.escrow.escrows;
export const selectEscrowLoading = (state: { escrow: EscrowState }) => state.escrow.isLoading;
export const selectEscrowError = (state: { escrow: EscrowState }) => state.escrow.error;

export default escrowSlice.reducer;
