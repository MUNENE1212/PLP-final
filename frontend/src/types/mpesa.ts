/**
 * M-Pesa Types
 *
 * Type definitions for M-Pesa payment integration with escrow system.
 */

// Payment status enum
export type MPesaPaymentStatus =
  | 'initiated'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

// Payment type enum
export type MPesaPaymentType =
  | 'booking_fee'
  | 'booking_payment'
  | 'escrow_funding'
  | 'escrow_payout'
  | 'technician_payout'
  | 'refund'
  | 'tip';

// STK Push request
export interface STKPushRequest {
  phoneNumber: string;
  bookingId: string;
  amount: number;
  type: MPesaPaymentType;
}

// STK Push response
export interface STKPushResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    checkoutRequestId: string;
    customerMessage: string;
    merchantRequestId?: string;
    responseCode?: string;
    responseDescription?: string;
  };
  error?: string;
}

// Payment status response
export interface PaymentStatusResponse {
  success: boolean;
  transaction: {
    id: string;
    status: MPesaPaymentStatus;
    amount: number;
    currency: string;
    paymentMethod: string;
    mpesaReceiptNumber?: string;
    createdAt: string;
    completedAt?: string;
    failedAt?: string;
    failureReason?: string;
  };
}

// Transaction history item
export interface MPesaTransaction {
  _id: string;
  transactionNumber: string;
  type: MPesaPaymentType;
  status: MPesaPaymentStatus;
  amount: {
    gross: number;
    net: number;
    currency: string;
    platformFee?: number;
    processingFee?: number;
  };
  paymentMethod: 'mpesa';
  mpesaDetails?: {
    checkoutRequestId?: string;
    merchantRequestId?: string;
    mpesaReceiptNumber?: string;
    phoneNumber?: string;
    transactionDate?: string;
    resultCode?: string;
    resultDescription?: string;
  };
  booking?: {
    _id: string;
    bookingNumber: string;
    serviceType: string;
    serviceCategory?: string;
  };
  payer?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  payee?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  completedAt?: string;
  description?: string;
}

// Transaction history response
export interface TransactionHistoryResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  transactions: MPesaTransaction[];
}

// B2C payout request
export interface B2CPayoutRequest {
  phoneNumber: string;
  amount: number;
  bookingId: string;
  transactionId: string;
  occasion?: string;
}

// B2C payout response
export interface B2CPayoutResponse {
  success: boolean;
  message: string;
  data?: {
    conversationId: string;
    originatorConversationId: string;
    responseCode: string;
    responseDescription: string;
  };
  error?: string;
}

// Escrow payment request
export interface EscrowPaymentRequest {
  phoneNumber: string;
  amount: number;
  escrowId: string;
  bookingId: string;
  description?: string;
}

// Payment polling options
export interface PaymentPollingOptions {
  maxAttempts?: number;
  intervalMs?: number;
  onSuccess?: (transactionId: string) => void;
  onFailure?: (error: string) => void;
  onTimeout?: () => void;
}

// Phone number validation result
export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  error?: string;
}

// M-Pesa state for Redux
export interface MPesaState {
  // Current payment
  currentPayment: {
    transactionId: string | null;
    checkoutRequestId: string | null;
    status: MPesaPaymentStatus | null;
    amount: number | null;
    phoneNumber: string | null;
  } | null;

  // Payment history
  transactions: MPesaTransaction[];
  totalTransactions: number;
  currentPage: number;
  totalPages: number;

  // Loading states
  isInitiatingPayment: boolean;
  isCheckingStatus: boolean;
  isLoadingHistory: boolean;

  // Error state
  error: string | null;

  // Payment modal state
  isPaymentModalOpen: boolean;
  paymentModalData: {
    amount: number;
    bookingId: string;
    type: MPesaPaymentType;
    onsuccess?: (transactionId: string) => void;
  } | null;
}
