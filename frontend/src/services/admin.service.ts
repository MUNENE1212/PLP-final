import axios from '@/lib/axios';

// ===== TYPES =====

export interface AdminDashboardStats {
  users: {
    total: number;
    newToday: number;
    technicians: number;
    activeTechnicians: number;
    customers: number;
  };
  bookings: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    completionRate: string | number;
  };
  revenue: {
    total: number;
    pendingPayouts: number;
    averageBookingValue: number;
  };
  platform: {
    averageRating: string | number;
    uptime: string;
    avgResponseTime: string;
    errorRate: string;
  };
  timeRange: string;
}

export interface AdminActivityItem {
  _id: string;
  type: 'user' | 'booking' | 'post' | 'payment' | 'support';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface TopTechnician {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  rating: number;
  ratingCount: number;
  bookings: number;
  earnings: number;
}

export interface UserListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status: string;
  createdAt: string;
  profilePicture?: string;
}

export interface PaginatedUsers {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AnalyticsData {
  bookingTrends?: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  userGrowth?: Array<{
    _id: {
      date: string;
      role: string;
    };
    count: number;
  }>;
}

// ===== API FUNCTIONS =====

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (timeRange: 'today' | 'week' | 'month' | 'all' = 'week'): Promise<AdminDashboardStats> => {
  try {
    const response = await axios.get('/admin/stats', {
      params: { timeRange }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * Get recent platform activity
 */
export const getRecentActivity = async (limit: number = 20): Promise<AdminActivityItem[]> => {
  try {
    const response = await axios.get('/admin/activity', {
      params: { limit }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

/**
 * Get top performing technicians
 */
export const getTopTechnicians = async (
  limit: number = 10,
  sortBy: 'earnings' | 'bookings' | 'rating' = 'earnings'
): Promise<TopTechnician[]> => {
  try {
    const response = await axios.get('/admin/top-technicians', {
      params: { limit, sortBy }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching top technicians:', error);
    throw error;
  }
};

/**
 * Get all users with filtering and pagination
 */
export const getUsers = async (params: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<PaginatedUsers> => {
  try {
    const response = await axios.get('/admin/users', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Update user status (activate/suspend/ban)
 */
export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'suspended' | 'banned',
  reason?: string
): Promise<UserListItem> => {
  try {
    const response = await axios.patch(`/admin/users/${userId}/status`, {
      status,
      reason
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Get platform analytics
 */
export const getAnalytics = async (
  type: 'overview' | 'bookings' | 'users' = 'overview',
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData> => {
  try {
    const response = await axios.get('/admin/analytics', {
      params: { type, startDate, endDate }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

/**
 * Get complete dashboard data (stats + activity + top technicians)
 */
export const getCompleteDashboard = async (timeRange: 'today' | 'week' | 'month' | 'all' = 'week') => {
  try {
    const [stats, activity, topTechnicians] = await Promise.all([
      getDashboardStats(timeRange),
      getRecentActivity(20),
      getTopTechnicians(10, 'earnings')
    ]);

    return {
      stats,
      activity,
      topTechnicians
    };
  } catch (error: any) {
    console.error('Error fetching complete dashboard:', error);
    throw error;
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (userId: string): Promise<UserListItem> => {
  try {
    const response = await axios.get(`/admin/users/${userId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Update user details
 */
export const updateUser = async (userId: string, updates: Partial<UserListItem>): Promise<UserListItem> => {
  try {
    const response = await axios.patch(`/admin/users/${userId}`, updates);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (userId: string, reason?: string): Promise<void> => {
  try {
    await axios.delete(`/admin/users/${userId}`, {
      data: { reason }
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Restore deleted user
 */
export const restoreUser = async (userId: string): Promise<UserListItem> => {
  try {
    const response = await axios.post(`/admin/users/${userId}/restore`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error restoring user:', error);
    throw error;
  }
};

/**
 * Get pricing configuration
 */
export const getPricingConfig = async (): Promise<any> => {
  try {
    const response = await axios.get('/admin/settings/pricing');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching pricing config:', error);
    throw error;
  }
};

/**
 * Update platform fee
 */
export const updatePlatformFee = async (type: 'percentage' | 'fixed', value: number): Promise<any> => {
  try {
    const response = await axios.patch('/admin/settings/platform-fee', { type, value });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating platform fee:', error);
    throw error;
  }
};

/**
 * Update tax configuration
 */
export const updateTax = async (tax: { enabled?: boolean; rate?: number; name?: string }): Promise<any> => {
  try {
    const response = await axios.patch('/admin/settings/tax', tax);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating tax:', error);
    throw error;
  }
};

/**
 * Update discount configuration
 */
export const updateDiscounts = async (discounts: any): Promise<any> => {
  try {
    const response = await axios.patch('/admin/settings/discounts', discounts);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating discounts:', error);
    throw error;
  }
};

/**
 * Update service rates
 */
export const updateServiceRates = async (rateData: {
  serviceCategory: string;
  serviceType: string;
  basePrice: number;
  priceUnit?: string;
  estimatedDuration?: number;
}): Promise<any> => {
  try {
    const response = await axios.patch('/admin/settings/service-rates', rateData);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating service rates:', error);
    throw error;
  }
};

/**
 * Get comprehensive reports
 */
export const getReports = async (startDate?: string, endDate?: string): Promise<any> => {
  try {
    const response = await axios.get('/admin/reports', {
      params: { startDate, endDate }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getRecentActivity,
  getTopTechnicians,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  restoreUser,
  getAnalytics,
  getCompleteDashboard,
  getPricingConfig,
  updatePlatformFee,
  updateTax,
  updateDiscounts,
  updateServiceRates,
  getReports
};
