# State Management - Redux Slice Designs

## Overview

This document defines the Redux Toolkit slices for managing frontend state related to the new service discovery (WORD BANK), payment plans, and escrow system. All slices follow Redux Toolkit best practices with TypeScript typing.

---

## Table of Contents

1. [Service Discovery Slice](#1-service-discovery-slice)
2. [Technician Services Slice](#2-technician-services-slice)
3. [Booking Flow Slice](#3-booking-flow-slice)
4. [Payment Slice](#4-payment-slice)
5. [Escrow Slice](#5-escrow-slice)
6. [Payout Slice](#6-payout-slice)
7. [Type Definitions](#7-type-definitions)
8. [Store Configuration](#8-store-configuration)

---

## 1. Service Discovery Slice

### File: `frontend/src/store/slices/serviceDiscoverySlice.ts`

Manages WORD BANK state for browsing and selecting services.

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// ===== TYPES =====

export interface ServiceCategory {
  _id: string;
  slug: string;
  name: string;
  icon: string;
  imageUrl: string;
  color: {
    primary: string;
    secondary: string;
  };
  group: ServiceCategoryGroup;
  displayOrder: number;
  isPopular: boolean;
  servicesCount: number;
  stats: {
    totalBookings: number;
    activeTechnicians: number;
    averageRating: number;
  };
}

export type ServiceCategoryGroup = 
  | 'home_maintenance'
  | 'cleaning_pest'
  | 'appliances_hvac'
  | 'security_outdoor'
  | 'specialty_services';

export interface Service {
  _id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  defaultPricing: {
    model: PricingModel;
    baseRate: number;
    unitLabel: string;
    priceRange: {
      min: number;
      max: number;
    };
    estimatedDuration: {
      min: number;
      max: number;
      typical?: number;
    };
  };
  typicalRequirements?: string[];
  stats: {
    bookingCount: number;
    averagePrice: number;
  };
}

export type PricingModel = 'hourly' | 'fixed' | 'per_unit' | 'quote_required';

export interface SelectedService {
  service: Service;
  quantity?: number;
  notes?: string;
}

interface ServiceDiscoveryState {
  // Categories
  categories: ServiceCategory[];
  categoriesLoading: boolean;
  selectedCategory: ServiceCategory | null;
  
  // Services
  services: Service[];
  servicesLoading: boolean;
  
  // Search
  searchQuery: string;
  searchResults: Service[];
  searchLoading: boolean;
  
  // Selection (for booking flow)
  selectedServices: SelectedService[];
  customServiceDescription: string | null;
  
  // Popular
  popularServices: Service[];
  
  // UI State
  viewMode: 'categories' | 'services' | 'search';
  
  // Error
  error: string | null;
}

const initialState: ServiceDiscoveryState = {
  categories: [],
  categoriesLoading: false,
  selectedCategory: null,
  services: [],
  servicesLoading: false,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  selectedServices: [],
  customServiceDescription: null,
  popularServices: [],
  viewMode: 'categories',
  error: null,
};

// ===== ASYNC THUNKS =====

export const fetchCategories = createAsyncThunk(
  'serviceDiscovery/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/services/categories');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchServicesByCategory = createAsyncThunk(
  'serviceDiscovery/fetchServicesByCategory',
  async (categorySlug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/services/categories/${categorySlug}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const searchServices = createAsyncThunk(
  'serviceDiscovery/searchServices',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await axios.get('/services/search', { params: { q: query } });
      return { query, results: response.data.data.results };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchPopularServices = createAsyncThunk(
  'serviceDiscovery/fetchPopularServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/services/popular');
      return response.data.data.services;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular services');
    }
  }
);

// ===== SLICE =====

const serviceDiscoverySlice = createSlice({
  name: 'serviceDiscovery',
  initialState,
  reducers: {
    // Category selection
    selectCategory: (state, action: PayloadAction<ServiceCategory>) => {
      state.selectedCategory = action.payload;
      state.viewMode = 'services';
    },
    clearCategorySelection: (state) => {
      state.selectedCategory = null;
      state.services = [];
      state.viewMode = 'categories';
    },
    
    // Service selection (multi-select for booking)
    addServiceToSelection: (state, action: PayloadAction<Service>) => {
      const exists = state.selectedServices.find(s => s.service._id === action.payload._id);
      if (!exists) {
        state.selectedServices.push({ service: action.payload });
      }
    },
    removeServiceFromSelection: (state, action: PayloadAction<string>) => {
      state.selectedServices = state.selectedServices.filter(
        s => s.service._id !== action.payload
      );
    },
    updateServiceQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.selectedServices.find(s => s.service._id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    updateServiceNotes: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      const item = state.selectedServices.find(s => s.service._id === action.payload.id);
      if (item) {
        item.notes = action.payload.notes;
      }
    },
    clearServiceSelection: (state) => {
      state.selectedServices = [];
      state.customServiceDescription = null;
    },
    
    // Custom service
    setCustomServiceDescription: (state, action: PayloadAction<string | null>) => {
      state.customServiceDescription = action.payload;
    },
    
    // View mode
    setViewMode: (state, action: PayloadAction<'categories' | 'services' | 'search'>) => {
      state.viewMode = action.payload;
    },
    
    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      if (!action.payload) {
        state.searchResults = [];
        state.viewMode = 'categories';
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.categories;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload as string;
      });
    
    // Fetch services by category
    builder
      .addCase(fetchServicesByCategory.pending, (state) => {
        state.servicesLoading = true;
        state.error = null;
      })
      .addCase(fetchServicesByCategory.fulfilled, (state, action) => {
        state.servicesLoading = false;
        state.services = action.payload.category.services || [];
        state.selectedCategory = action.payload.category;
      })
      .addCase(fetchServicesByCategory.rejected, (state, action) => {
        state.servicesLoading = false;
        state.error = action.payload as string;
      });
    
    // Search services
    builder
      .addCase(searchServices.pending, (state) => {
        state.searchLoading = true;
        state.viewMode = 'search';
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchQuery = action.payload.query;
        state.searchResults = action.payload.results;
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      });
    
    // Fetch popular services
    builder
      .addCase(fetchPopularServices.fulfilled, (state, action) => {
        state.popularServices = action.payload;
      });
  },
});

export const {
  selectCategory,
  clearCategorySelection,
  addServiceToSelection,
  removeServiceFromSelection,
  updateServiceQuantity,
  updateServiceNotes,
  clearServiceSelection,
  setCustomServiceDescription,
  setViewMode,
  setSearchQuery,
  clearError,
} = serviceDiscoverySlice.actions;

export default serviceDiscoverySlice.reducer;
```

---

## 2. Technician Services Slice

### File: `frontend/src/store/slices/technicianServicesSlice.ts`

Manages technician's service offerings and pricing.

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

// ===== TYPES =====

export interface TechnicianService {
  _id: string;
  technician: string;
  service: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  customService?: {
    name: string;
    description: string;
    isApproved: boolean;
  };
  pricing: {
    model: 'hourly' | 'fixed' | 'per_unit' | 'quote_required';
    rate: number;
    unitLabel: string | null;
    minimumCharge: number | null;
    estimatedDuration: {
      min?: number;
      max?: number;
      typical?: number;
    };
  };
  serviceArea: {
    maxDistance: number;
    counties: string[];
  };
  availability: {
    isAvailable: boolean;
    availableDays: number[];
    timeSlots: Array<{ start: string; end: string }>;
  };
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalEarnings: number;
    averageRating: number;
    reviewCount: number;
  };
  status: 'active' | 'paused' | 'inactive';
  workSamples: Array<{
    imageUrl: string;
    caption: string;
  }>;
  isCustom: boolean;
}

export interface CreateTechnicianServiceData {
  service?: string;
  category: string;
  customService?: {
    name: string;
    description: string;
  };
  pricing: {
    model: 'hourly' | 'fixed' | 'per_unit' | 'quote_required';
    rate: number;
    unitLabel?: string;
    minimumCharge?: number;
    estimatedDuration?: {
      min?: number;
      max?: number;
      typical?: number;
    };
  };
  serviceArea?: {
    maxDistance?: number;
    counties?: string[];
  };
  availability?: {
    isAvailable?: boolean;
    availableDays?: number[];
    timeSlots?: Array<{ start: string; end: string }>;
  };
}

interface TechnicianServicesState {
  services: TechnicianService[];
  currentService: TechnicianService | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Stats summary
  summary: {
    totalServices: number;
    activeServices: number;
    categories: string[];
  } | null;
}

const initialState: TechnicianServicesState = {
  services: [],
  currentService: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  summary: null,
};

// ===== ASYNC THUNKS =====

export const fetchTechnicianServices = createAsyncThunk(
  'technicianServices/fetchAll',
  async (technicianId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/technicians/${technicianId}/services`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const createTechnicianService = createAsyncThunk(
  'technicianServices/create',
  async (
    { technicianId, data }: { technicianId: string; data: CreateTechnicianServiceData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/technicians/${technicianId}/services`,
        data
      );
      toast.success('Service added successfully');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add service';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createCustomService = createAsyncThunk(
  'technicianServices/createCustom',
  async (
    { technicianId, data }: { technicianId: string; data: CreateTechnicianServiceData },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/technicians/${technicianId}/services/custom`,
        data
      );
      toast.success('Custom service created. Pending approval.');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create custom service';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTechnicianService = createAsyncThunk(
  'technicianServices/update',
  async (
    { technicianId, serviceId, data }: {
      technicianId: string;
      serviceId: string;
      data: Partial<CreateTechnicianServiceData>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `/technicians/${technicianId}/services/${serviceId}`,
        data
      );
      toast.success('Service updated');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update service';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTechnicianService = createAsyncThunk(
  'technicianServices/delete',
  async (
    { technicianId, serviceId }: { technicianId: string; serviceId: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.delete(`/technicians/${technicianId}/services/${serviceId}`);
      toast.success('Service removed');
      return serviceId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove service';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ===== SLICE =====

const technicianServicesSlice = createSlice({
  name: 'technicianServices',
  initialState,
  reducers: {
    setCurrentService: (state, action: PayloadAction<TechnicianService | null>) => {
      state.currentService = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchTechnicianServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.services;
        state.summary = action.payload.summary;
      })
      .addCase(fetchTechnicianServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Create
    builder
      .addCase(createTechnicianService.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createTechnicianService.fulfilled, (state, action) => {
        state.isCreating = false;
        state.services.push(action.payload.technicianService);
      })
      .addCase(createTechnicianService.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
    
    // Create custom
    builder
      .addCase(createCustomService.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createCustomService.fulfilled, (state, action) => {
        state.isCreating = false;
        state.services.push(action.payload.technicianService);
      })
      .addCase(createCustomService.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
    
    // Update
    builder
      .addCase(updateTechnicianService.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateTechnicianService.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.services.findIndex(
          s => s._id === action.payload.technicianService._id
        );
        if (index !== -1) {
          state.services[index] = action.payload.technicianService;
        }
        if (state.currentService?._id === action.payload.technicianService._id) {
          state.currentService = action.payload.technicianService;
        }
      })
      .addCase(updateTechnicianService.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
    
    // Delete
    builder
      .addCase(deleteTechnicianService.fulfilled, (state, action) => {
        state.services = state.services.filter(s => s._id !== action.payload);
        if (state.currentService?._id === action.payload) {
          state.currentService = null;
        }
      });
  },
});

export const { setCurrentService, clearError } = technicianServicesSlice.actions;
export default technicianServicesSlice.reducer;
```

---

## 3. Booking Flow Slice

### File: `frontend/src/store/slices/bookingFlowSlice.ts`

Manages the multi-step booking creation flow.

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service, SelectedService } from './serviceDiscoverySlice';

// ===== TYPES =====

export type BookingFlowStep = 
  | 'service'      // Step 1: What
  | 'schedule'     // Step 2: When
  | 'location'     // Step 3: Where
  | 'technician'   // Step 4: Who (optional)
  | 'review'       // Step 5: Review
  | 'payment';     // Step 6: Pay

export interface BookingFlowLocation {
  coordinates: [number, number];
  address: string;
  city?: string;
  county?: string;
  landmarks?: string;
  accessInstructions?: string;
}

export interface BookingFlowSchedule {
  date: string;
  startTime: string;
  estimatedDuration?: number;
}

export interface BookingFlowPricing {
  model: 'hourly' | 'fixed' | 'per_unit' | 'quote';
  baseRate: number;
  estimatedHours?: number;
  unitCount?: number;
  subtotal: number;
  urgencyPremium: number;
  platformFee: number;
  totalAmount: number;
  bookingFee: number;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

interface BookingFlowState {
  // Current step
  currentStep: BookingFlowStep;
  completedSteps: BookingFlowStep[];
  
  // Step 1: Service Selection
  selectedServices: SelectedService[];
  customServiceDescription: string | null;
  selectedCategory: string | null;
  
  // Step 2: Schedule
  schedule: BookingFlowSchedule | null;
  urgency: UrgencyLevel;
  
  // Step 3: Location
  location: BookingFlowLocation | null;
  
  // Step 4: Technician (optional)
  selectedTechnician: string | null;
  technicianService: string | null;
  
  // Step 5: Review
  description: string;
  images: string[];
  
  // Step 6: Payment
  pricing: BookingFlowPricing | null;
  paymentMethod: 'mpesa' | 'card' | null;
  
  // Flow control
  isEditing: boolean;
  canProceed: boolean;
  
  // Error
  error: string | null;
}

const initialState: BookingFlowState = {
  currentStep: 'service',
  completedSteps: [],
  selectedServices: [],
  customServiceDescription: null,
  selectedCategory: null,
  schedule: null,
  urgency: 'medium',
  location: null,
  selectedTechnician: null,
  technicianService: null,
  description: '',
  images: [],
  pricing: null,
  paymentMethod: null,
  isEditing: false,
  canProceed: false,
  error: null,
};

// Step order for navigation
const STEP_ORDER: BookingFlowStep[] = [
  'service',
  'schedule',
  'location',
  'technician',
  'review',
  'payment',
];

// ===== SLICE =====

const bookingFlowSlice = createSlice({
  name: 'bookingFlow',
  initialState,
  reducers: {
    // Navigation
    setStep: (state, action: PayloadAction<BookingFlowStep>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex < STEP_ORDER.length - 1) {
        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
        state.currentStep = STEP_ORDER[currentIndex + 1];
      }
    },
    previousStep: (state) => {
      const currentIndex = STEP_ORDER.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = STEP_ORDER[currentIndex - 1];
      }
    },
    
    // Step 1: Service Selection
    setServices: (state, action: PayloadAction<SelectedService[]>) => {
      state.selectedServices = action.payload;
      state.canProceed = action.payload.length > 0 || !!state.customServiceDescription;
    },
    setCustomDescription: (state, action: PayloadAction<string | null>) => {
      state.customServiceDescription = action.payload;
      state.canProceed = !!action.payload || state.selectedServices.length > 0;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    
    // Step 2: Schedule
    setSchedule: (state, action: PayloadAction<BookingFlowSchedule>) => {
      state.schedule = action.payload;
    },
    setUrgency: (state, action: PayloadAction<UrgencyLevel>) => {
      state.urgency = action.payload;
    },
    
    // Step 3: Location
    setLocation: (state, action: PayloadAction<BookingFlowLocation>) => {
      state.location = action.payload;
    },
    
    // Step 4: Technician
    setTechnician: (state, action: PayloadAction<{ technicianId: string; serviceId: string } | null>) => {
      if (action.payload) {
        state.selectedTechnician = action.payload.technicianId;
        state.technicianService = action.payload.serviceId;
      } else {
        state.selectedTechnician = null;
        state.technicianService = null;
      }
    },
    
    // Step 5: Review
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setImages: (state, action: PayloadAction<string[]>) => {
      state.images = action.payload;
    },
    addImage: (state, action: PayloadAction<string>) => {
      state.images.push(action.payload);
    },
    removeImage: (state, action: PayloadAction<number>) => {
      state.images.splice(action.payload, 1);
    },
    
    // Step 6: Payment
    setPricing: (state, action: PayloadAction<BookingFlowPricing>) => {
      state.pricing = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<'mpesa' | 'card'>) => {
      state.paymentMethod = action.payload;
    },
    
    // Edit mode
    startEditing: (state, action: PayloadAction<BookingFlowStep>) => {
      state.isEditing = true;
      state.currentStep = action.payload;
    },
    finishEditing: (state) => {
      state.isEditing = false;
    },
    
    // Reset
    resetFlow: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setStep,
  nextStep,
  previousStep,
  setServices,
  setCustomDescription,
  setCategory,
  setSchedule,
  setUrgency,
  setLocation,
  setTechnician,
  setDescription,
  setImages,
  addImage,
  removeImage,
  setPricing,
  setPaymentMethod,
  startEditing,
  finishEditing,
  resetFlow,
  clearError,
} = bookingFlowSlice.actions;

export default bookingFlowSlice.reducer;

// ===== SELECTORS =====

export const selectCanProceedToNext = (state: BookingFlowState): boolean => {
  switch (state.currentStep) {
    case 'service':
      return state.selectedServices.length > 0 || !!state.customServiceDescription;
    case 'schedule':
      return state.schedule !== null;
    case 'location':
      return state.location !== null;
    case 'technician':
      return true; // Optional step
    case 'review':
      return state.description.length > 0;
    case 'payment':
      return state.paymentMethod !== null;
    default:
      return false;
  }
};
```

---

## 4. Payment Slice

### File: `frontend/src/store/slices/paymentSlice.ts`

Manages payment state, methods, and transactions.

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

// ===== TYPES =====

export interface PaymentMethod {
  type: 'mpesa' | 'card' | 'bank_transfer' | 'wallet';
  name: string;
  icon: string;
  fee: number;
  feeType: 'free' | 'percentage' | 'fixed';
  available: boolean;
  estimatedTime: string;
}

export interface Transaction {
  _id: string;
  transactionNumber: string;
  type: TransactionType;
  amount: {
    gross: number;
    platformFee: number;
    net: number;
    currency: string;
  };
  paymentMethod: string;
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
  mpesaDetails?: {
    phoneNumber: string;
    mpesaReceiptNumber: string;
  };
}

export type TransactionType = 
  | 'booking_payment'
  | 'booking_fee'
  | 'booking_fee_release'
  | 'booking_fee_refund'
  | 'technician_payout'
  | 'refund'
  | 'tip';

export type TransactionStatus = 
  | 'initiated'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

interface PaymentState {
  methods: PaymentMethod[];
  currentTransaction: Transaction | null;
  pendingTransactions: Transaction[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // M-Pesa specific
  mpesaPolling: boolean;
  mpesaCheckoutId: string | null;
}

const initialState: PaymentState = {
  methods: [],
  currentTransaction: null,
  pendingTransactions: [],
  isLoading: false,
  isProcessing: false,
  error: null,
  mpesaPolling: false,
  mpesaCheckoutId: null,
};

// ===== ASYNC THUNKS =====

export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/payments/methods');
      return response.data.data.methods;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

export const initiateMpesaPayment = createAsyncThunk(
  'payment/initiateMpesa',
  async (
    { bookingId, phoneNumber, amount, type }: {
      bookingId: string;
      phoneNumber: string;
      amount: number;
      type: 'booking_fee' | 'final_payment';
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/payments/mpesa/initiate', {
        bookingId,
        phoneNumber,
        amount,
        type,
      });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initiate payment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const initiateCardPayment = createAsyncThunk(
  'payment/initiateCard',
  async (
    { bookingId, amount, type }: {
      bookingId: string;
      amount: number;
      type: 'booking_fee' | 'final_payment';
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/payments/card/initiate', {
        bookingId,
        amount,
        type,
      });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initiate card payment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const checkPaymentStatus = createAsyncThunk(
  'payment/checkStatus',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/payments/transactions/${transactionId}`);
      return response.data.data.transaction;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check status');
    }
  }
);

// ===== SLICE =====

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setCurrentTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.currentTransaction = action.payload;
    },
    setMpesaPolling: (state, action: PayloadAction<boolean>) => {
      state.mpesaPolling = action.payload;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
      state.mpesaCheckoutId = null;
      state.mpesaPolling = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch methods
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.methods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Initiate M-Pesa
    builder
      .addCase(initiateMpesaPayment.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(initiateMpesaPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentTransaction = action.payload.transaction;
        state.mpesaCheckoutId = action.payload.transaction.mpesaDetails?.checkoutRequestId || null;
        state.mpesaPolling = true;
      })
      .addCase(initiateMpesaPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });
    
    // Check status
    builder
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.currentTransaction = action.payload;
        if (action.payload.status === 'completed' || action.payload.status === 'failed') {
          state.mpesaPolling = false;
        }
      });
  },
});

export const {
  setCurrentTransaction,
  setMpesaPolling,
  clearCurrentTransaction,
  clearError,
} = paymentSlice.actions;

export default paymentSlice.reducer;
```

---

## 5. Escrow Slice

### File: `frontend/src/store/slices/escrowSlice.ts`

Manages escrow state for bookings.

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';

// ===== TYPES =====

export interface Escrow {
  _id: string;
  booking: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  technician: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  amounts: {
    held: number;
    released: number;
    refunded: number;
    pending: number;
  };
  status: EscrowStatus;
  releaseConditions: {
    type: string;
    autoReleaseAfter: number;
    requirePhotoEvidence: boolean;
  };
  releaseSchedule?: {
    scheduledAt: string;
    releasedAt?: string;
    releaseMethod?: string;
  };
  dispute?: {
    raisedAt: string;
    raisedBy: string;
    reason: string;
    resolution?: string;
    outcome?: 'customer_favor' | 'technician_favor' | 'split';
  };
  events: EscrowEvent[];
  fundedAt?: string;
  releasedAt?: string;
}

export interface EscrowEvent {
  type: string;
  amount?: number;
  triggeredBy?: string;
  triggeredAt: string;
  notes?: string;
}

export type EscrowStatus = 
  | 'pending'
  | 'funded'
  | 'partially_released'
  | 'released'
  | 'refunded'
  | 'disputed'
  | 'resolved';

interface EscrowState {
  currentEscrow: Escrow | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EscrowState = {
  currentEscrow: null,
  isLoading: false,
  error: null,
};

// ===== ASYNC THUNKS =====

export const fetchEscrow = createAsyncThunk(
  'escrow/fetch',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/bookings/${bookingId}/escrow`);
      return response.data.data.escrow;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch escrow');
    }
  }
);

export const raiseDispute = createAsyncThunk(
  'escrow/raiseDispute',
  async (
    { bookingId, reason, description }: {
      bookingId: string;
      reason: string;
      description: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `/bookings/${bookingId}/escrow/dispute`,
        { reason, description }
      );
      return response.data.data.escrow;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to raise dispute');
    }
  }
);

// ===== SLICE =====

const escrowSlice = createSlice({
  name: 'escrow',
  initialState,
  reducers: {
    clearEscrow: (state) => {
      state.currentEscrow = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
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
      })
      .addCase(raiseDispute.fulfilled, (state, action) => {
        state.currentEscrow = action.payload;
      });
  },
});

export const { clearEscrow, clearError } = escrowSlice.actions;
export default escrowSlice.reducer;
```

---

## 6. Payout Slice

### File: `frontend/src/store/slices/payoutSlice.ts`

Manages technician payout state.

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

// ===== TYPES =====

export interface Payout {
  _id: string;
  payoutNumber: string;
  payoutType: 'instant' | 'daily' | 'weekly' | 'monthly' | 'manual';
  amounts: {
    grossAmount: number;
    platformFees: number;
    adjustments: number;
    netAmount: number;
  };
  items: PayoutItem[];
  itemCount: number;
  paymentMethod: {
    type: 'mpesa' | 'bank_transfer' | 'wallet';
    mpesaNumber?: string;
    bankName?: string;
  };
  status: PayoutStatus;
  scheduledAt?: string;
  completedAt?: string;
  transactionReference?: string;
  period?: {
    startDate: string;
    endDate: string;
  };
}

export interface PayoutItem {
  booking: {
    _id: string;
    bookingNumber: string;
    serviceType: string;
  };
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'included' | 'processing' | 'paid';
}

export type PayoutStatus = 
  | 'pending'
  | 'processing'
  | 'submitted'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface PayoutPreferences {
  defaultMethod: 'mpesa' | 'bank_transfer' | 'wallet';
  schedule: 'instant' | 'same_day' | 'next_day' | 'weekly';
  minimumAmount: number;
  mpesaNumber?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

interface PayoutState {
  payouts: Payout[];
  currentPayout: Payout | null;
  preferences: PayoutPreferences | null;
  summary: {
    totalEarnings: number;
    pendingPayouts: number;
    nextPayout?: string;
  } | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: PayoutState = {
  payouts: [],
  currentPayout: null,
  preferences: null,
  summary: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// ===== ASYNC THUNKS =====

export const fetchPayouts = createAsyncThunk(
  'payouts/fetchAll',
  async (params: { page?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/payouts', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payouts');
    }
  }
);

export const fetchPayout = createAsyncThunk(
  'payouts/fetchOne',
  async (payoutId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/payouts/${payoutId}`);
      return response.data.data.payout;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payout');
    }
  }
);

export const fetchPayoutPreferences = createAsyncThunk(
  'payouts/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/payouts/preferences');
      return response.data.data.preferences;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch preferences');
    }
  }
);

export const updatePayoutPreferences = createAsyncThunk(
  'payouts/updatePreferences',
  async (preferences: Partial<PayoutPreferences>, { rejectWithValue }) => {
    try {
      const response = await axios.patch('/payouts/preferences', preferences);
      toast.success('Preferences updated');
      return response.data.data.preferences;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const requestInstantPayout = createAsyncThunk(
  'payouts/requestInstant',
  async ({ amount, method }: { amount: number; method: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/payouts/instant', { amount, method });
      toast.success('Instant payout initiated');
      return response.data.data.payout;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to request payout';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ===== SLICE =====

const payoutSlice = createSlice({
  name: 'payouts',
  initialState,
  reducers: {
    setCurrentPayout: (state, action: PayloadAction<Payout | null>) => {
      state.currentPayout = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchPayouts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPayouts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payouts = action.payload.payouts;
        state.pagination = action.payload.pagination;
        state.summary = action.payload.summary;
      })
      .addCase(fetchPayouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Fetch one
    builder
      .addCase(fetchPayout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPayout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayout = action.payload;
      })
      .addCase(fetchPayout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Preferences
    builder
      .addCase(fetchPayoutPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(updatePayoutPreferences.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updatePayoutPreferences.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.preferences = action.payload;
      })
      .addCase(updatePayoutPreferences.rejected, (state) => {
        state.isUpdating = false;
      });
    
    // Instant payout
    builder
      .addCase(requestInstantPayout.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(requestInstantPayout.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.payouts.unshift(action.payload);
        state.currentPayout = action.payload;
      })
      .addCase(requestInstantPayout.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPayout, clearError } = payoutSlice.actions;
export default payoutSlice.reducer;
```

---

## 7. Type Definitions

### File: `frontend/src/types/services.ts`

```typescript
// Shared type definitions for the service system

export type PricingModel = 'hourly' | 'fixed' | 'per_unit' | 'quote_required' | 'milestone';

export interface PricingConfig {
  model: PricingModel;
  rate: number;
  unitLabel?: string;
  minimumCharge?: number;
  estimatedDuration?: {
    min?: number;
    max?: number;
    typical?: number;
  };
}

export interface PriceBreakdown {
  baseAmount: number;
  materialsCost?: number;
  transportFee?: number;
  urgencyPremium?: number;
  weekendPremium?: number;
  discount?: number;
  subtotal: number;
  platformFee: number;
  platformFeePercentage: number;
  tax?: number;
  totalAmount: number;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type EscrowReleaseType =
  | 'auto_on_completion'
  | 'customer_confirmation'
  | 'manual_review'
  | 'milestone_based';
```

---

## 8. Store Configuration

### File: `frontend/src/store/index.ts` (Updates)

Add the new reducers to the existing store configuration:

```typescript
import { configureStore } from '@reduxjs/toolkit';

// Existing reducers
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import userReducer from './slices/userSlice';
// ... other existing reducers

// New reducers
import serviceDiscoveryReducer from './slices/serviceDiscoverySlice';
import technicianServicesReducer from './slices/technicianServicesSlice';
import bookingFlowReducer from './slices/bookingFlowSlice';
import paymentReducer from './slices/paymentSlice';
import escrowReducer from './slices/escrowSlice';
import payoutReducer from './slices/payoutSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingReducer,
    users: userReducer,
    // ... other existing reducers
    
    // New reducers
    serviceDiscovery: serviceDiscoveryReducer,
    technicianServices: technicianServicesReducer,
    bookingFlow: bookingFlowReducer,
    payment: paymentReducer,
    escrow: escrowReducer,
    payouts: payoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Usage Examples

### Using Service Discovery in Components

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  selectCategory,
  addServiceToSelection,
} from '@/store/slices/serviceDiscoverySlice';
import { RootState } from '@/store';

function ServiceSelectionPage() {
  const dispatch = useDispatch();
  const { categories, selectedCategory, services, selectedServices } = 
    useSelector((state: RootState) => state.serviceDiscovery);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategorySelect = (category) => {
    dispatch(selectCategory(category));
  };

  const handleServiceSelect = (service) => {
    dispatch(addServiceToSelection(service));
  };

  // ... render logic
}
```

### Using Booking Flow

```typescript
import { useDispatch, useSelector } from 'react-redux';
import {
  nextStep,
  previousStep,
  setSchedule,
  setLocation,
} from '@/store/slices/bookingFlowSlice';
import { RootState } from '@/store';

function BookingWizard() {
  const dispatch = useDispatch();
  const { currentStep, schedule, location } = 
    useSelector((state: RootState) => state.bookingFlow);

  const handleNext = () => {
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  // ... render logic based on currentStep
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-17 | System Architect | Initial state management design |
