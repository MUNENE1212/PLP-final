/**
 * Booking Notification Types
 * Type definitions for real-time booking status notifications
 */

/**
 * Booking status type
 */
export type BookingStatus =
  | 'pending'
  | 'matching'
  | 'assigned'
  | 'accepted'
  | 'rejected'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'verified'
  | 'payment_pending'
  | 'paid'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

/**
 * Payment status type
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

/**
 * Counter-offer status type
 */
export type CounterOfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';

/**
 * Booking status changed notification payload
 */
export interface BookingStatusChangedPayload {
  bookingId: string;
  bookingNumber: string;
  oldStatus: BookingStatus;
  newStatus: BookingStatus;
  message: string;
  note?: string;
  timestamp: string;
  serviceType?: string;
  pricing?: {
    totalAmount: number;
    currency: string;
  };
}

/**
 * Technician info for booking assigned notification
 */
export interface BookingNotificationTechnician {
  _id: string;
  name: string;
  profilePicture?: string;
  rating: number;
}

/**
 * Customer info for booking notification
 */
export interface BookingNotificationCustomer {
  _id: string;
  name: string;
}

/**
 * Booking assigned notification payload
 */
export interface BookingAssignedPayload {
  bookingId: string;
  bookingNumber: string;
  technician?: BookingNotificationTechnician;
  customer?: BookingNotificationCustomer;
  serviceType: string;
  serviceLocation?: {
    address: string;
    coordinates: [number, number];
  };
  scheduledDate?: string;
  scheduledTime?: string;
  pricing?: {
    totalAmount: number;
    currency: string;
  };
  eta?: string;
  message: string;
  timestamp: string;
}

/**
 * Counter-offer info
 */
export interface CounterOfferInfo {
  amount: number;
  originalAmount?: number;
  reason?: string;
  additionalNotes?: string;
  status: CounterOfferStatus;
  validUntil?: string;
}

/**
 * Counter-offer notification payload
 */
export interface BookingCounterOfferPayload {
  bookingId: string;
  bookingNumber: string;
  offer: CounterOfferInfo;
  technician?: {
    name: string;
    rating: number;
  };
  customer?: {
    name: string;
  };
  message: string;
  timestamp: string;
}

/**
 * Payment update notification payload
 */
export interface BookingPaymentUpdatePayload {
  bookingId: string;
  bookingNumber: string;
  status: PaymentStatus;
  amount: number;
  method?: string;
  currency: string;
  message: string;
  timestamp: string;
}

/**
 * Union type for all booking notification payloads
 */
export type BookingNotificationPayload =
  | BookingStatusChangedPayload
  | BookingAssignedPayload
  | BookingCounterOfferPayload
  | BookingPaymentUpdatePayload;

/**
 * Booking notification type
 */
export type BookingNotificationType =
  | 'booking:status_changed'
  | 'booking:assigned'
  | 'booking:counter_offer'
  | 'booking:payment_update';

/**
 * Booking notification with metadata
 */
export interface BookingNotification {
  id: string;
  type: BookingNotificationType;
  payload: BookingNotificationPayload;
  read: boolean;
  createdAt: string;
}

/**
 * Booking notification state for hook
 */
export interface BookingNotificationState {
  notifications: BookingNotification[];
  unreadCount: number;
  isConnected: boolean;
}

/**
 * Socket event names for booking notifications
 */
export const BOOKING_NOTIFICATION_EVENTS = {
  STATUS_CHANGED: 'booking:status_changed',
  ASSIGNED: 'booking:assigned',
  COUNTER_OFFER: 'booking:counter_offer',
  PAYMENT_UPDATE: 'booking:payment_update',
  SUBSCRIBE: 'booking:subscribe',
  UNSUBSCRIBE: 'booking:unsubscribe',
  ERROR: 'booking:error',
} as const;

/**
 * Get notification title based on type
 */
export function getBookingNotificationTitle(type: BookingNotificationType): string {
  switch (type) {
    case BOOKING_NOTIFICATION_EVENTS.STATUS_CHANGED:
      return 'Booking Update';
    case BOOKING_NOTIFICATION_EVENTS.ASSIGNED:
      return 'Technician Assigned';
    case BOOKING_NOTIFICATION_EVENTS.COUNTER_OFFER:
      return 'Counter Offer';
    case BOOKING_NOTIFICATION_EVENTS.PAYMENT_UPDATE:
      return 'Payment Update';
    default:
      return 'Booking Notification';
  }
}

/**
 * Get notification icon based on status
 */
export function getStatusIcon(status: BookingStatus): string {
  switch (status) {
    case 'en_route':
      return 'truck';
    case 'arrived':
      return 'map-pin';
    case 'in_progress':
      return 'wrench';
    case 'completed':
      return 'check-circle';
    case 'cancelled':
      return 'x-circle';
    case 'paid':
      return 'dollar-sign';
    default:
      return 'bell';
  }
}

/**
 * Get urgency level based on status
 */
export function getStatusUrgency(status: BookingStatus): 'low' | 'normal' | 'high' | 'urgent' {
  const urgentStatuses: BookingStatus[] = ['en_route', 'arrived', 'in_progress'];
  const highStatuses: BookingStatus[] = ['completed', 'payment_pending'];

  if (urgentStatuses.includes(status)) return 'urgent';
  if (highStatuses.includes(status)) return 'high';
  return 'normal';
}
