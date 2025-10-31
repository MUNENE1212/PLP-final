import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

// Types
export interface ServiceLocation {
  type: string;
  coordinates: [number, number];
  address: string;
  city?: string;
  county?: string;
  landmarks?: string;
  accessInstructions?: string;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  estimatedDuration?: number;
}

export interface BookingPricing {
  basePrice?: number;
  serviceCharge?: number;
  platformFee?: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  currency: string;
  bookingFee?: number;
}

export interface BookingFee {
  required: boolean;
  percentage: number;
  amount: number;
  status: 'pending' | 'paid' | 'held' | 'released' | 'refunded';
  paidAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  heldInEscrow?: boolean;
  escrowReleaseCondition?: 'job_verified' | 'support_approved' | 'auto_released';
  transactionId?: string;
  refundTransactionId?: string;
  notes?: string;
}

export interface BookingUser {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture?: string;
  rating?: number;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  customer: BookingUser;
  technician?: BookingUser;
  serviceCategory: string;
  serviceType: string;
  description: string;
  urgency: string;
  serviceLocation: ServiceLocation;
  timeSlot: TimeSlot;
  status: string;
  pricing: BookingPricing;
  bookingFee?: BookingFee;
  images?: Array<{ url: string; caption?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  serviceType: string;
  serviceCategory?: string;
  description: string;
  scheduledDate: string;
  scheduledTime?: string;
  estimatedDuration?: number;
  serviceLocation: {
    coordinates: [number, number];
    address: string;
    landmarks?: string;
    accessInstructions?: string;
  };
  technician?: string;
  urgency?: string;
  images?: string[];
  quantity?: number;
}

export interface UpdateBookingStatusData {
  bookingId: string;
  status: string;
  notes?: string;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
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
  stats: {
    total: number;
    byStatus: Array<{ _id: string; count: number; totalRevenue: number }>;
  } | null;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  stats: null,
};

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData: CreateBookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/bookings', bookingData);
      toast.success('Booking created successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create booking';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (
    params: { status?: string; page?: number; limit?: number; sort?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get('/bookings', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBooking = createAsyncThunk(
  'bookings/fetchOne',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async (data: UpdateBookingStatusData, { rejectWithValue }) => {
    try {
      const { bookingId, ...updateData } = data;
      const response = await axios.put(`/bookings/${bookingId}/status`, updateData);
      toast.success(response.data.message || 'Booking updated successfully');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update booking';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchBookingStats = createAsyncThunk(
  'bookings/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/bookings/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// Slice
const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreating = false;
        state.bookings.unshift(action.payload.booking);
        state.currentBooking = action.payload.booking;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Fetch bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          pages: action.payload.pages || 0,
        };
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single booking
    builder
      .addCase(fetchBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload.booking;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update booking status
    builder
      .addCase(updateBookingStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedBooking = action.payload.booking;
        // Update in bookings list
        const index = state.bookings.findIndex((b) => b._id === updatedBooking._id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        // Update current booking
        if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchBookingStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookingStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = {
          total: action.payload.total || 0,
          byStatus: action.payload.stats || [],
        };
      })
      .addCase(fetchBookingStats.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearError, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
