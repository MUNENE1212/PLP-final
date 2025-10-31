import axiosInstance from '@/lib/axios';

export interface BookingFeeStatus {
  required: boolean;
  percentage: number;
  amount: number;
  status: 'pending' | 'paid' | 'held' | 'released' | 'refunded';
  paidAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  heldInEscrow: boolean;
  escrowReleaseCondition?: string;
  transactionId?: string;
  refundTransactionId?: string;
  notes?: string;
}

export interface BookingFeeResponse {
  success: boolean;
  bookingFee: BookingFeeStatus;
  bookingStatus: string;
  totalAmount: number;
  remainingAmount: number;
}

export interface ConfirmBookingFeeData {
  transactionId: string;
}

export interface RefundBookingFeeData {
  reason: string;
}

/**
 * Get booking fee status
 */
export const getBookingFeeStatus = async (bookingId: string): Promise<BookingFeeResponse> => {
  const response = await axiosInstance.get(`/bookings/${bookingId}/booking-fee`);
  return response.data;
};

/**
 * Confirm booking fee payment
 */
export const confirmBookingFee = async (
  bookingId: string,
  data: ConfirmBookingFeeData
): Promise<{
  success: boolean;
  message: string;
  booking: any;
}> => {
  const response = await axiosInstance.post(
    `/bookings/${bookingId}/booking-fee/confirm`,
    data
  );
  return response.data;
};

/**
 * Release booking fee to technician (Support/Admin only)
 */
export const releaseBookingFee = async (
  bookingId: string
): Promise<{
  success: boolean;
  message: string;
  booking: any;
  transaction: any;
}> => {
  const response = await axiosInstance.post(
    `/bookings/${bookingId}/booking-fee/release`
  );
  return response.data;
};

/**
 * Refund booking fee to customer (Support/Admin only)
 */
export const refundBookingFee = async (
  bookingId: string,
  data: RefundBookingFeeData
): Promise<{
  success: boolean;
  message: string;
  booking: any;
  transaction: any;
}> => {
  const response = await axiosInstance.post(
    `/bookings/${bookingId}/booking-fee/refund`,
    data
  );
  return response.data;
};
