/**
 * Booking Notifications Module
 * Real-time booking status notifications for DumuWaks platform
 *
 * Usage:
 * import { useBookingNotifications, BookingNotificationToast } from '@/booking-notifications';
 */

// Hook
export { useBookingNotifications, default as useBookingNotificationsDefault } from '../hooks/useBookingNotifications';

// Components
export { default as BookingNotificationToast, BookingNotificationList, BookingNotificationBadge } from '../components/notifications/BookingNotificationToast';

// Types
export type {
  BookingStatus,
  PaymentStatus,
  CounterOfferStatus,
  BookingStatusChangedPayload,
  BookingNotificationTechnician,
  BookingNotificationCustomer,
  BookingAssignedPayload,
  CounterOfferInfo,
  BookingCounterOfferPayload,
  BookingPaymentUpdatePayload,
  BookingNotificationPayload,
  BookingNotificationType,
  BookingNotification,
  BookingNotificationState,
} from '../types/bookingNotification';

// Constants and utilities
export {
  BOOKING_NOTIFICATION_EVENTS,
  getBookingNotificationTitle,
  getStatusIcon,
  getStatusUrgency,
} from '../types/bookingNotification';
