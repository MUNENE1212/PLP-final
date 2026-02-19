/**
 * M-Pesa Redux Slice
 *
 * State management for M-Pesa payment processing with escrow integration.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { MPesaState, MPesaTransaction, MPesaPaymentStatus, MPesaPaymentType } from '@/types/mpesa';
import mpesaService from '@/services/mpesa.service';

// Initial state
const initialState: MPesaState = {
  currentPayment: null,
  transactions: [],
  totalTransactions: 0,
  currentPage: 1,
  totalPages: 1,
  isInitiatingPayment: false,
  isCheckingStatus: false,
  isLoadingHistory: false,
  error: null,
  isPaymentModalOpen: false,
  paymentModalData: null,
};

// Async thunks

/**
 * Initiate STK Push payment
 */
export const initiatePayment = createAsyncThunk(
  'mpesa/initiatePayment',
  async (
    payload: {
      phoneNumber: string;
      amount: number;
      bookingId: string;
      type: MPesaPaymentType;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await mpesaService.initiatePayment(
        payload.phoneNumber,
        payload.amount,
        payload.bookingId,
        payload.type
      );

      if (!response.success) {
        return rejectWithValue(response.error || response.message);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Check payment status
 */
export const checkPaymentStatus = createAsyncThunk(
  'mpesa/checkPaymentStatus',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await mpesaService.checkPaymentStatus(transactionId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Poll payment status until completion
 */
export const pollPaymentStatus = createAsyncThunk(
  'mpesa/pollPaymentStatus',
  async (
    payload: {
      transactionId: string;
      maxAttempts?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await mpesaService.pollPaymentStatus(payload.transactionId, {
        maxAttempts: payload.maxAttempts || 30,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch transaction history
 */
export const fetchTransactionHistory = createAsyncThunk(
  'mpesa/fetchTransactionHistory',
  async (
    payload: {
      page?: number;
      limit?: number;
      status?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await mpesaService.getTransactionHistory(
        payload.page || 1,
        payload.limit || 10,
        payload.status
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const mpesaSlice = createSlice({
  name: 'mpesa',
  initialState,
  reducers: {
    // Clear current payment
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Open payment modal
    openPaymentModal: (
      state,
      action: PayloadAction<{
        amount: number;
        bookingId: string;
        type: MPesaPaymentType;
        onSuccess?: (transactionId: string) => void;
      }>
    ) => {
      state.isPaymentModalOpen = true;
      state.paymentModalData = action.payload;
      state.error = null;
    },

    // Close payment modal
    closePaymentModal: (state) => {
      state.isPaymentModalOpen = false;
      state.paymentModalData = null;
      state.currentPayment = null;
      state.error = null;
    },

    // Update current payment status (for real-time updates)
    updatePaymentStatus: (
      state,
      action: PayloadAction<{
        status: MPesaPaymentStatus;
        transactionId?: string;
      }>
    ) => {
      if (state.currentPayment) {
        state.currentPayment.status = action.payload.status;
        if (action.payload.transactionId) {
          state.currentPayment.transactionId = action.payload.transactionId;
        }
      }
    },

    // Reset state
    resetMPesaState: () => initialState,
  },

  extraReducers: (builder) => {
    // Initiate payment
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.isInitiatingPayment = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.isInitiatingPayment = false;
        if (action.payload.data) {
          state.currentPayment = {
            transactionId: action.payload.data.transactionId,
            checkoutRequestId: action.payload.data.checkoutRequestId,
            status: 'pending',
            amount: null,
            phoneNumber: null,
          };
        }
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.isInitiatingPayment = false;
        state.error = action.payload as string;
      });

    // Check payment status
    builder
      .addCase(checkPaymentStatus.pending, (state) => {
        state.isCheckingStatus = true;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.isCheckingStatus = false;
        if (state.currentPayment && action.payload.transaction) {
          state.currentPayment.status = action.payload.transaction.status;
        }
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.isCheckingStatus = false;
        state.error = action.payload as string;
      });

    // Poll payment status
    builder
      .addCase(pollPaymentStatus.pending, (state) => {
        state.isCheckingStatus = true;
      })
      .addCase(pollPaymentStatus.fulfilled, (state, action) => {
        state.isCheckingStatus = false;
        if (state.currentPayment && action.payload.transaction) {
          state.currentPayment.status = action.payload.transaction.status;
        }
      })
      .addCase(pollPaymentStatus.rejected, (state, action) => {
        state.isCheckingStatus = false;
        state.error = action.payload as string;
      });

    // Fetch transaction history
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.transactions = action.payload.transactions as MPesaTransaction[];
        state.totalTransactions = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.pages;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearCurrentPayment,
  clearError,
  openPaymentModal,
  closePaymentModal,
  updatePaymentStatus,
  resetMPesaState,
} = mpesaSlice.actions;

// Export reducer
export default mpesaSlice.reducer;
