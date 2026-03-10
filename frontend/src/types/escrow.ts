/**
 * Escrow Types
 *
 * TypeScript interfaces for the platform escrow system.
 * Matches backend Escrow model.
 */

export type EscrowStatus =
  | 'pending'
  | 'funded'
  | 'partial_release'
  | 'released'
  | 'refunded'
  | 'disputed'
  | 'cancelled';

export type MilestoneStatus = 'pending' | 'released' | 'refunded';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type DisputeResolution =
  | 'customer_favor'
  | 'technician_favor'
  | 'split'
  | 'no_action';

/**
 * Escrow Milestone
 */
export interface EscrowMilestone {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  status: MilestoneStatus;
  releasedAt?: string;
  refundedAt?: string;
  mpesaReference?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Escrow Funding Details
 */
export interface EscrowFunding {
  mpesaReference?: string;
  checkoutRequestID?: string;
  fundedAt?: string;
  amount?: number;
  phoneNumber?: string;
}

/**
 * Escrow Payout Details
 */
export interface EscrowPayout {
  mpesaReference?: string;
  transactionID?: string;
  paidOutAt?: string;
  amount?: number;
  status: PayoutStatus;
  failureReason?: string;
}

/**
 * Escrow Refund Details
 */
export interface EscrowRefund {
  reason?: string;
  amount?: number;
  refundedAt?: string;
  mpesaReference?: string;
  status: PayoutStatus;
  failureReason?: string;
  initiatedBy?: string;
}

/**
 * Dispute Evidence
 */
export interface DisputeEvidence {
  type: 'image' | 'document' | 'video' | 'text';
  url?: string;
  description?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

/**
 * Escrow Dispute Details
 */
export interface EscrowDispute {
  reason: string;
  description?: string;
  openedAt: string;
  openedBy: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  customerShare?: number;
  technicianShare?: number;
  evidence?: DisputeEvidence[];
}

/**
 * Escrow History Entry
 */
export interface EscrowHistoryEntry {
  action: string;
  fromStatus?: EscrowStatus;
  toStatus?: EscrowStatus;
  performedBy: string;
  timestamp: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * User Reference in Escrow
 */
export interface EscrowUser {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * Booking Reference in Escrow
 */
export interface EscrowBooking {
  _id: string;
  bookingNumber?: string;
  serviceType?: string;
  status?: string;
  serviceCategory?: string;
}

/**
 * Main Escrow Interface
 */
export interface Escrow {
  _id: string;
  booking: string | EscrowBooking;
  customer: string | EscrowUser;
  technician: string | EscrowUser;

  // Amounts
  totalAmount: number;
  platformFee: number;
  tax: number;
  technicianPayout: number;
  currency: string;

  // Status
  status: EscrowStatus;

  // Milestones
  milestones: EscrowMilestone[];

  // Details
  funding?: EscrowFunding;
  payout?: EscrowPayout;
  refund?: EscrowRefund;
  dispute?: EscrowDispute;

  // Timestamps
  expiresAt?: string;
  fundedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  cancelledAt?: string;

  // Settings
  autoReleaseEnabled: boolean;
  autoReleaseAfterDays: number;

  // Notes
  notes?: {
    customer?: string;
    technician?: string;
    admin?: string;
  };

  // History
  history: EscrowHistoryEntry[];

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Virtuals
  isActive?: boolean;
  isCompleted?: boolean;
  canRelease?: boolean;
  canRefund?: boolean;
  canDispute?: boolean;
  totalReleased?: number;
  remainingBalance?: number;
}

/**
 * Create Escrow Request
 */
export interface CreateEscrowRequest {
  bookingId: string;
  customerId: string;
  technicianId: string;
  amount: number;
  milestones?: Array<{
    name: string;
    description?: string;
    amount: number;
  }>;
}

/**
 * Fund Escrow Request
 */
export interface FundEscrowRequest {
  mpesaReference: string;
  checkoutRequestID?: string;
  phoneNumber?: string;
}

/**
 * Release Escrow Request
 */
export interface ReleaseEscrowRequest {
  notes?: string;
  mpesaReference?: string;
}

/**
 * Release Milestone Request
 */
export interface ReleaseMilestoneRequest {
  milestoneIndex: number;
}

/**
 * Refund Escrow Request
 */
export interface RefundEscrowRequest {
  reason: string;
  amount?: number;
}

/**
 * Open Dispute Request
 */
export interface OpenDisputeRequest {
  reason: string;
  description?: string;
  evidence?: Array<{
    type: 'image' | 'document' | 'video' | 'text';
    url?: string;
    description?: string;
  }>;
}

/**
 * Resolve Dispute Request
 */
export interface ResolveDisputeRequest {
  resolution: DisputeResolution;
  splitRatio?: {
    customer: number;
    technician: number;
  };
  notes?: string;
}

/**
 * Escrow Statistics
 */
export interface EscrowStats {
  byStatus: Array<{
    _id: EscrowStatus;
    count: number;
    totalAmount: number;
    totalPlatformFee: number;
    totalPayout: number;
  }>;
  totals: {
    totalCount: number;
    totalVolume: number;
    totalFees: number;
    totalPayouts: number;
  };
}

/**
 * Escrow Filters
 */
export interface EscrowFilters {
  status?: EscrowStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated Escrows Response
 */
export interface PaginatedEscrowsResponse {
  success: boolean;
  escrows: Escrow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Status Color Mapping
 */
export const ESCROW_STATUS_COLORS: Record<EscrowStatus, string> = {
  pending: 'yellow',
  funded: 'blue',
  partial_release: 'indigo',
  released: 'green',
  refunded: 'purple',
  disputed: 'red',
  cancelled: 'gray'
};

/**
 * Status Label Mapping
 */
export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  pending: 'Pending Payment',
  funded: 'Funds Held',
  partial_release: 'Partially Released',
  released: 'Released',
  refunded: 'Refunded',
  disputed: 'Under Dispute',
  cancelled: 'Cancelled'
};

/**
 * Dispute Resolution Labels
 */
export const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolution, string> = {
  customer_favor: 'Customer Favor',
  technician_favor: 'Technician Favor',
  split: 'Split Decision',
  no_action: 'No Action Required'
};
