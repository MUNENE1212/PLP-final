/**
 * Admin Types
 * Type definitions for admin dashboard features including
 * WORD BANK, escrow, and payment management
 */

/**
 * Dashboard Metrics Interface
 * Comprehensive metrics for admin dashboard overview
 */
export interface DashboardMetrics {
  // Services
  pendingApprovals: number;
  totalServices: number;

  // Escrow
  activeEscrows: number;
  totalInEscrow: number; // KES
  pendingPayouts: number;

  // Transactions
  todayTransactions: number;
  todayVolume: number; // KES

  // Users
  newUsersToday: number;
  activeTechnicians: number;

  // Platform
  platformFeesToday: number;
  totalBookingsToday: number;
}

/**
 * Escrow Status Types
 */
export type EscrowStatus = 'pending' | 'funded' | 'held' | 'disputed' | 'released' | 'refunded';

/**
 * Escrow Record Interface
 */
export interface EscrowRecord {
  _id: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  technicianId: string;
  technicianName: string;
  technicianPhone: string;
  amount: number;
  platformFee: number;
  technicianAmount: number;
  status: EscrowStatus;
  fundedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
  serviceType: string;
  serviceCategory: string;
}

/**
 * Escrow Statistics Interface
 */
export interface EscrowStats {
  totalActive: number;
  totalHeld: number;
  totalDisputed: number;
  pendingRelease: number;
  totalValue: number;
  averageHoldTime: number; // in hours
}

/**
 * Transaction Type
 */
export type TransactionType = 'payment' | 'payout' | 'refund' | 'platform_fee' | 'booking_fee';

/**
 * Transaction Status
 */
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Transaction Record Interface
 */
export interface TransactionRecord {
  _id: string;
  transactionId: string;
  bookingId?: string;
  bookingNumber?: string;
  userId: string;
  userName: string;
  userType: 'customer' | 'technician';
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: 'mpesa' | 'card' | 'wallet' | 'internal';
  mpesaReceipt?: string;
  mpesaReference?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

/**
 * Transaction Filter Interface
 */
export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  paymentMethod?: string;
  search?: string;
}

/**
 * Revenue Data Point for Charts
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
  platformFees: number;
  payouts: number;
}

/**
 * Service Statistics Interface
 */
export interface ServiceStatistics {
  category: string;
  count: number;
  revenue: number;
  avgPrice: number;
  growth: number; // percentage
}

/**
 * Technician Performance Interface
 */
export interface TechnicianPerformance {
  _id: string;
  name: string;
  profilePicture?: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number; // in minutes
  completionRate: number; // percentage
  joinedAt: string;
}

/**
 * User Growth Data Point
 */
export interface UserGrowthDataPoint {
  date: string;
  customers: number;
  technicians: number;
  total: number;
}

/**
 * Platform Statistics Interface
 */
export interface PlatformStatistics {
  revenueOverTime: RevenueDataPoint[];
  bookingsByCategory: ServiceStatistics[];
  topServices: ServiceStatistics[];
  technicianPerformance: TechnicianPerformance[];
  userGrowth: UserGrowthDataPoint[];
  platformFeesBreakdown: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
  };
}

/**
 * Admin User Interface
 */
export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'customer' | 'technician' | 'admin';
  status: 'active' | 'suspended' | 'banned' | 'deactivated';
  profilePicture?: string;
  isOnline: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  stats: {
    totalBookings: number;
    totalSpent: number;
    totalEarned: number;
    averageRating: number;
  };
}

/**
 * Admin Activity Log Interface
 */
export interface AdminActivityLog {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/**
 * Report Generation Parameters
 */
export interface ReportParams {
  startDate: string;
  endDate: string;
  type: 'financial' | 'service' | 'technician' | 'user';
  format: 'csv' | 'pdf';
}

/**
 * Financial Report Interface
 */
export interface FinancialReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalRevenue: number;
    totalPayouts: number;
    totalRefunds: number;
    platformFees: number;
    netRevenue: number;
  };
  breakdown: {
    payments: number;
    payouts: number;
    refunds: number;
    pendingPayouts: number;
    escrowHeld: number;
  };
  transactions: TransactionRecord[];
}

/**
 * Service Report Interface
 */
export interface ServiceReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalServices: number;
    activeServices: number;
    pendingApprovals: number;
    avgApprovalTime: number; // in hours
  };
  categories: ServiceStatistics[];
  topServices: Array<{
    name: string;
    category: string;
    bookings: number;
    revenue: number;
  }>;
}

/**
 * Technician Report Interface
 */
export interface TechnicianReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalTechnicians: number;
    activeTechnicians: number;
    avgRating: number;
    totalJobsCompleted: number;
  };
  performance: TechnicianPerformance[];
}

/**
 * User Report Interface
 */
export interface UserReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    churnRate: number; // percentage
  };
  growth: UserGrowthDataPoint[];
  demographics: {
    customers: number;
    technicians: number;
    admins: number;
  };
}

/**
 * Dispute Resolution Interface
 */
export interface DisputeResolution {
  disputeId: string;
  escrowId: string;
  bookingId: string;
  raisedBy: 'customer' | 'technician';
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: {
    type: 'release_to_technician' | 'refund_customer' | 'partial_refund' | 'escalate';
    amount?: number;
    notes: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Bulk Action Result Interface
 */
export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    id: string;
    reason: string;
  }>;
}

/**
 * Admin Sidebar Navigation Item
 */
export interface AdminNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: AdminNavItem[];
}

/**
 * Quick Action Interface
 */
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  path?: string;
  action?: () => void;
  variant: 'primary' | 'secondary' | 'warning' | 'danger';
}

/**
 * Admin Dashboard State Interface
 */
export interface AdminDashboardState {
  metrics: DashboardMetrics | null;
  escrowStats: EscrowStats | null;
  escrows: EscrowRecord[];
  transactions: TransactionRecord[];
  platformStats: PlatformStatistics | null;
  users: AdminUser[];
  activityLog: AdminActivityLog[];
  loading: boolean;
  error: string | null;
}

/**
 * Date Range Preset
 */
export type DateRangePreset = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * Date Range Interface
 */
export interface DateRange {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
}
