// Subscription Types
export interface Subscription {
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate?: string;
  endDate?: string;
  trialEndsAt?: string;
  autoRenew: boolean;
  features: {
    boostedVisibility: boolean;
    boostedPosts: boolean;
    prioritySupport: boolean;
    unlimitedPortfolio: boolean;
    advancedAnalytics: boolean;
    customBadge: boolean;
    featuredListing: boolean;
  };
}

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'customer' | 'technician' | 'admin' | 'corporate' | 'support';
  profilePicture?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  rating?: {
    average: number;
    count: number;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
    city?: string;
    country?: string;
  };
  skills?: Array<{
    name: string;
    category: string;
    yearsOfExperience: number;
    certifications?: string[];
  }>;
  availability?: {
    isAvailable: boolean;
    schedule?: Record<string, unknown>;
  };
  subscription?: Subscription;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'customer' | 'technician';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: User;
  requires2FA?: boolean;
}

// Booking Types
export interface Booking {
  _id: string;
  customer: User;
  technician?: User;
  serviceType: string;
  description: string;
  status: string;
  scheduledDate: string;
  serviceLocation: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  pricing?: {
    estimatedCost: number;
    finalCost?: number;
    currency: string;
  };
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total: number;
  page: number;
  pages: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Error Types
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Filter Types
export interface UserFilters extends PaginationParams {
  role?: string;
  status?: string;
  search?: string;
  skills?: string;
  minRating?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface BookingFilters extends PaginationParams {
  status?: string;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
}

// Match Types
export interface Match {
  _id: string;
  technician: User;
  scores: {
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
  };
  distance: number;
  matchReasons: Array<{
    reason: string;
    weight: number;
    score: number;
  }>;
  createdAt: string;
}

// Message Types
export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  type: 'text' | 'image' | 'video' | 'document' | 'location';
  content?: string;
  mediaUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'direct' | 'group' | 'booking' | 'support';
  createdAt: string;
  updatedAt: string;
}
