import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { STORAGE_KEYS } from '@/config/constants';
import { Message, BOOKING_NOTIFICATION_EVENTS } from '@/types';
import type {
  BookingStatusChangedPayload,
  BookingAssignedPayload,
  BookingCounterOfferPayload,
  BookingPaymentUpdatePayload,
} from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private wasConnected = false;
  private disconnectToastId: string | null = null;

  connect(userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    // Socket.IO connects to the root server URL, not the API path
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    // Remove /api/v1 from the URL to get the base server URL
    const backendUrl = apiUrl.replace(/\/api\/v\d+$/, '');

    this.socket = io(backendUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners(userId);
  }

  private setupEventListeners(userId: string): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      // Dismiss disconnect toast and show reconnect notice if this was a reconnection
      if (this.wasConnected && this.disconnectToastId) {
        toast.dismiss(this.disconnectToastId);
        this.disconnectToastId = null;
        toast.success('Connection restored', { duration: 2000 });
      }
      this.reconnectAttempts = 0;
      this.wasConnected = true;

      // Join user's personal room
      this.socket?.emit('user:join', userId);
    });

    this.socket.on('disconnect', (reason) => {
      // Only notify for unexpected disconnects (not intentional logout)
      if (reason !== 'io client disconnect' && this.wasConnected) {
        this.disconnectToastId = toast.loading('Connection lost. Reconnecting...', {
          duration: Infinity,
        });
      }
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts && this.disconnectToastId) {
        toast.dismiss(this.disconnectToastId);
        this.disconnectToastId = null;
        toast.error('Unable to connect to server. Please refresh the page.', { duration: 8000 });
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.wasConnected = false;
      if (this.disconnectToastId) {
        toast.dismiss(this.disconnectToastId);
        this.disconnectToastId = null;
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Message events
  onNewMessage(callback: (message: Message) => void): void {
    this.socket?.on('message:new', callback);
  }

  offNewMessage(callback?: (message: Message) => void): void {
    if (callback) {
      this.socket?.off('message:new', callback);
    } else {
      this.socket?.off('message:new');
    }
  }

  onMessageDelivered(callback: (data: { messageId: string; userId: string }) => void): void {
    this.socket?.on('message:delivered', callback);
  }

  offMessageDelivered(callback?: (data: { messageId: string; userId: string }) => void): void {
    if (callback) {
      this.socket?.off('message:delivered', callback);
    } else {
      this.socket?.off('message:delivered');
    }
  }

  onMessageRead(callback: (data: { messageId: string; userId: string }) => void): void {
    this.socket?.on('message:read', callback);
  }

  offMessageRead(callback?: (data: { messageId: string; userId: string }) => void): void {
    if (callback) {
      this.socket?.off('message:read', callback);
    } else {
      this.socket?.off('message:read');
    }
  }

  onMessageDeletedLegacy(callback: (data: { messageId: string; conversationId: string }) => void): void {
    this.socket?.on('message:deleted', callback);
  }

  offMessageDeletedLegacy(callback?: (data: { messageId: string; conversationId: string }) => void): void {
    if (callback) {
      this.socket?.off('message:deleted', callback);
    } else {
      this.socket?.off('message:deleted');
    }
  }

  onMessageReaction(
    callback: (data: { messageId: string; reactions: any[] }) => void
  ): void {
    this.socket?.on('message:reaction', callback);
  }

  // Typing indicators
  onTypingStart(callback: (data: { conversationId: string; userId: string; userName: string }) => void): void {
    this.socket?.on('typing:start', callback);
  }

  onTypingStop(callback: (data: { conversationId: string; userId: string }) => void): void {
    this.socket?.on('typing:stop', callback);
  }

  emitTypingStart(conversationId: string): void {
    this.socket?.emit('typing:start', { conversationId });
  }

  emitTypingStop(conversationId: string): void {
    this.socket?.emit('typing:stop', { conversationId });
  }

  // ===== MESSAGE DELIVERY STATUS =====

  /**
   * Emit message delivered event
   */
  emitMessageDelivered(messageId: string, conversationId: string): void {
    this.socket?.emit('message:delivered', { messageId, conversationId });
  }

  /**
   * Emit message read event
   */
  emitMessageRead(messageId: string, conversationId: string): void {
    this.socket?.emit('message:read', { messageId, conversationId });
  }

  /**
   * Emit mark conversation as read
   */
  emitMarkConversationRead(conversationId: string): void {
    this.socket?.emit('conversation:mark_read', { conversationId });
  }

  /**
   * Listen for message delivered event
   */
  onMessageDeliveredStatus(callback: (data: { messageId: string; conversationId: string; deliveredAt: string }) => void): void {
    this.socket?.on('message:delivered', callback);
  }

  /**
   * Listen for message read event
   */
  onMessageReadStatus(callback: (data: { messageId: string; conversationId: string; readAt: string; readBy: string }) => void): void {
    this.socket?.on('message:read', callback);
  }

  /**
   * Listen for conversation marked as read
   */
  onConversationMarkedRead(callback: (data: { conversationId: string; updatedCount: number }) => void): void {
    this.socket?.on('conversation:marked_read', callback);
  }

  // ===== MESSAGE REACTIONS VIA SOCKET =====

  /**
   * Emit message reaction via socket
   */
  emitMessageReaction(messageId: string, emoji: string): void {
    this.socket?.emit('message:react', { messageId, emoji });
  }

  // ===== MESSAGE DELETION =====

  /**
   * Emit message deleted event
   */
  emitMessageDeleted(messageId: string, conversationId: string, deleteForEveryone: boolean): void {
    this.socket?.emit('message:deleted', { messageId, conversationId, deleteForEveryone });
  }

  /**
   * Listen for message deleted event
   */
  onMessageDeletedEvent(callback: (data: { messageId: string; conversationId: string; deletedBy?: string }) => void): void {
    this.socket?.on('message:deleted', callback);
  }

  /**
   * Remove message deleted listener
   */
  offMessageDeletedEvent(callback?: (data: { messageId: string; conversationId: string; deletedBy?: string }) => void): void {
    if (callback) {
      this.socket?.off('message:deleted', callback);
    } else {
      this.socket?.off('message:deleted');
    }
  }

  // ===== MESSAGE EDITING =====

  /**
   * Emit message edited event
   */
  emitMessageEdited(messageId: string, conversationId: string, newText: string): void {
    this.socket?.emit('message:edited', { messageId, conversationId, newText });
  }

  /**
   * Listen for message edited event
   */
  onMessageEdited(callback: (data: { messageId: string; conversationId: string; text: string; isEdited: boolean; editedAt: string }) => void): void {
    this.socket?.on('message:edited', callback);
  }

  // Conversation events
  onConversationCreated(callback: (data: any) => void): void {
    this.socket?.on('conversation:created', callback);
  }

  onConversationUpdated(callback: (data: any) => void): void {
    this.socket?.on('conversation:updated', callback);
  }

  // Join/leave conversation rooms
  joinConversation(conversationId: string): void {
    this.socket?.emit('conversation:join', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('conversation:leave', conversationId);
  }

  // User presence
  onUserOnline(callback: (data: { userId: string }) => void): void {
    this.socket?.on('user:online', callback);
  }

  onUserOffline(callback: (data: { userId: string; lastSeen: string }) => void): void {
    this.socket?.on('user:offline', callback);
  }

  // Call events (for future video/audio calls)
  onCallIncoming(callback: (data: any) => void): void {
    this.socket?.on('call:incoming', callback);
  }

  onCallAccepted(callback: (data: any) => void): void {
    this.socket?.on('call:accepted', callback);
  }

  onCallRejected(callback: (data: any) => void): void {
    this.socket?.on('call:rejected', callback);
  }

  onCallEnded(callback: (data: any) => void): void {
    this.socket?.on('call:ended', callback);
  }

  emitCallInitiate(data: { conversationId: string; type: 'voice' | 'video' }): void {
    this.socket?.emit('call:initiate', data);
  }

  emitCallAccept(callId: string): void {
    this.socket?.emit('call:accept', { callId });
  }

  emitCallReject(callId: string): void {
    this.socket?.emit('call:reject', { callId });
  }

  emitCallEnd(callId: string): void {
    this.socket?.emit('call:end', { callId });
  }

  // Generic event listener
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // ===== BOOKING NOTIFICATION EVENTS =====

  /**
   * Subscribe to booking updates for a specific booking
   */
  subscribeToBooking(bookingId: string): void {
    this.socket?.emit(BOOKING_NOTIFICATION_EVENTS.SUBSCRIBE, { bookingId });
  }

  /**
   * Unsubscribe from booking updates
   */
  unsubscribeFromBooking(bookingId: string): void {
    this.socket?.emit(BOOKING_NOTIFICATION_EVENTS.UNSUBSCRIBE, { bookingId });
  }

  /**
   * Listen for booking status changes
   */
  onBookingStatusChanged(callback: (data: BookingStatusChangedPayload) => void): void {
    this.socket?.on(BOOKING_NOTIFICATION_EVENTS.STATUS_CHANGED, callback as any);
  }

  /**
   * Remove booking status change listener
   */
  offBookingStatusChanged(callback?: (data: BookingStatusChangedPayload) => void): void {
    if (callback) {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.STATUS_CHANGED, callback as any);
    } else {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.STATUS_CHANGED);
    }
  }

  /**
   * Listen for booking assignment notifications
   */
  onBookingAssigned(callback: (data: BookingAssignedPayload) => void): void {
    this.socket?.on(BOOKING_NOTIFICATION_EVENTS.ASSIGNED, callback as any);
  }

  /**
   * Remove booking assignment listener
   */
  offBookingAssigned(callback?: (data: BookingAssignedPayload) => void): void {
    if (callback) {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.ASSIGNED, callback as any);
    } else {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.ASSIGNED);
    }
  }

  /**
   * Listen for counter-offer notifications
   */
  onBookingCounterOffer(callback: (data: BookingCounterOfferPayload) => void): void {
    this.socket?.on(BOOKING_NOTIFICATION_EVENTS.COUNTER_OFFER, callback as any);
  }

  /**
   * Remove counter-offer listener
   */
  offBookingCounterOffer(callback?: (data: BookingCounterOfferPayload) => void): void {
    if (callback) {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.COUNTER_OFFER, callback as any);
    } else {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.COUNTER_OFFER);
    }
  }

  /**
   * Listen for payment update notifications
   */
  onBookingPaymentUpdate(callback: (data: BookingPaymentUpdatePayload) => void): void {
    this.socket?.on(BOOKING_NOTIFICATION_EVENTS.PAYMENT_UPDATE, callback as any);
  }

  /**
   * Remove payment update listener
   */
  offBookingPaymentUpdate(callback?: (data: BookingPaymentUpdatePayload) => void): void {
    if (callback) {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.PAYMENT_UPDATE, callback as any);
    } else {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.PAYMENT_UPDATE);
    }
  }

  /**
   * Listen for booking errors
   */
  onBookingError(callback: (error: { error: string }) => void): void {
    this.socket?.on(BOOKING_NOTIFICATION_EVENTS.ERROR, callback);
  }

  /**
   * Remove booking error listener
   */
  offBookingError(callback?: (error: { error: string }) => void): void {
    if (callback) {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.ERROR, callback);
    } else {
      this.socket?.off(BOOKING_NOTIFICATION_EVENTS.ERROR);
    }
  }

  // ===== AVAILABILITY EVENTS (Task #73) =====

  /**
   * Emit availability status update
   */
  emitAvailabilityUpdate(status: string, currentBookingId?: string): void {
    this.socket?.emit('availability:update', { status, currentBookingId });
  }

  /**
   * Request online technician count for a category
   */
  getOnlineCount(category: string): void {
    this.socket?.emit('availability:get_online_count', { category });
  }

  /**
   * Subscribe to queue position updates
   */
  subscribeToQueue(bookingId: string): void {
    this.socket?.emit('queue:subscribe', { bookingId });
  }

  /**
   * Unsubscribe from queue updates
   */
  unsubscribeFromQueue(bookingId: string): void {
    this.socket?.emit('queue:unsubscribe', { bookingId });
  }

  /**
   * Listen for availability status changes
   */
  onAvailabilityChanged(callback: (data: any) => void): void {
    this.socket?.on('availability:changed', callback);
  }

  /**
   * Remove availability status change listener
   */
  offAvailabilityChanged(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('availability:changed', callback);
    } else {
      this.socket?.off('availability:changed');
    }
  }

  /**
   * Listen for queue position updates
   */
  onQueuePositionUpdate(callback: (data: any) => void): void {
    this.socket?.on('queue:position_update', callback);
  }

  /**
   * Remove queue position update listener
   */
  offQueuePositionUpdate(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('queue:position_update', callback);
    } else {
      this.socket?.off('queue:position_update');
    }
  }

  /**
   * Listen for category online count updates
   */
  onCategoryOnlineCount(callback: (data: { category: string; count: number }) => void): void {
    this.socket?.on('category:online_count', callback);
  }

  /**
   * Remove category online count listener
   */
  offCategoryOnlineCount(callback?: (data: { category: string; count: number }) => void): void {
    if (callback) {
      this.socket?.off('category:online_count', callback);
    } else {
      this.socket?.off('category:online_count');
    }
  }

  // ===== PRICING EVENTS (Task #74) =====

  /**
   * Subscribe to pricing updates (surge alerts, market rates)
   */
  subscribeToPricing(): void {
    this.socket?.emit('pricing:subscribe');
  }

  /**
   * Unsubscribe from pricing updates
   */
  unsubscribeFromPricing(): void {
    this.socket?.emit('pricing:unsubscribe');
  }

  /**
   * Listen for market rates updates
   */
  onMarketRates(callback: (data: any) => void): void {
    this.socket?.on('pricing:market_rates', callback);
  }

  /**
   * Remove market rates listener
   */
  offMarketRates(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('pricing:market_rates', callback);
    } else {
      this.socket?.off('pricing:market_rates');
    }
  }

  /**
   * Listen for surge alerts
   */
  onSurgeAlert(callback: (data: any) => void): void {
    this.socket?.on('pricing:surge_alert', callback);
  }

  /**
   * Remove surge alert listener
   */
  offSurgeAlert(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('pricing:surge_alert', callback);
    } else {
      this.socket?.off('pricing:surge_alert');
    }
  }

  /**
   * Request price estimate
   */
  requestPriceEstimate(params: {
    serviceCategory: string;
    serviceType?: string;
    urgency?: string;
    scheduledDateTime?: string;
    basePrice?: number;
    distanceFee?: number;
  }): void {
    this.socket?.emit('pricing:get_estimate', params);
  }

  /**
   * Listen for price estimate
   */
  onPriceEstimate(callback: (data: any) => void): void {
    this.socket?.on('pricing:estimate', callback);
  }

  /**
   * Remove price estimate listener
   */
  offPriceEstimate(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('pricing:estimate', callback);
    } else {
      this.socket?.off('pricing:estimate');
    }
  }

  /**
   * Listen for pricing errors
   */
  onPricingError(callback: (error: { error: string }) => void): void {
    this.socket?.on('pricing:error', callback);
  }

  /**
   * Remove pricing error listener
   */
  offPricingError(callback?: (error: { error: string }) => void): void {
    if (callback) {
      this.socket?.off('pricing:error', callback);
    } else {
      this.socket?.off('pricing:error');
    }
  }

  // ===== COUNTER-OFFER EVENTS (Task #74) =====

  /**
   * Subscribe to counter-offer updates for a booking
   */
  subscribeToCounterOffer(bookingId: string): void {
    this.socket?.emit('counter_offer:subscribe', { bookingId });
  }

  /**
   * Unsubscribe from counter-offer updates
   */
  unsubscribeFromCounterOffer(bookingId: string): void {
    this.socket?.emit('counter_offer:unsubscribe', { bookingId });
  }

  /**
   * Listen for new counter-offer
   */
  onCounterOfferNew(callback: (data: any) => void): void {
    this.socket?.on('counter_offer:new', callback);
  }

  /**
   * Remove new counter-offer listener
   */
  offCounterOfferNew(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('counter_offer:new', callback);
    } else {
      this.socket?.off('counter_offer:new');
    }
  }

  /**
   * Listen for counter-offer accepted
   */
  onCounterOfferAccepted(callback: (data: any) => void): void {
    this.socket?.on('counter_offer:accepted', callback);
  }

  /**
   * Remove counter-offer accepted listener
   */
  offCounterOfferAccepted(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('counter_offer:accepted', callback);
    } else {
      this.socket?.off('counter_offer:accepted');
    }
  }

  /**
   * Listen for counter-offer rejected
   */
  onCounterOfferRejected(callback: (data: any) => void): void {
    this.socket?.on('counter_offer:rejected', callback);
  }

  /**
   * Remove counter-offer rejected listener
   */
  offCounterOfferRejected(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('counter_offer:rejected', callback);
    } else {
      this.socket?.off('counter_offer:rejected');
    }
  }

  /**
   * Listen for counter-offer state
   */
  onCounterOfferState(callback: (data: any) => void): void {
    this.socket?.on('counter_offer:state', callback);
  }

  /**
   * Remove counter-offer state listener
   */
  offCounterOfferState(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('counter_offer:state', callback);
    } else {
      this.socket?.off('counter_offer:state');
    }
  }

  /**
   * Listen for counter-offer errors
   */
  onCounterOfferError(callback: (error: { error: string }) => void): void {
    this.socket?.on('counter_offer:error', callback);
  }

  /**
   * Remove counter-offer error listener
   */
  offCounterOfferError(callback?: (error: { error: string }) => void): void {
    if (callback) {
      this.socket?.off('counter_offer:error', callback);
    } else {
      this.socket?.off('counter_offer:error');
    }
  }

  // ===== ANALYTICS EVENTS (Task #75) =====

  /**
   * Subscribe to analytics updates
   */
  subscribeToAnalytics(): void {
    this.socket?.emit('analytics:subscribe');
  }

  /**
   * Unsubscribe from analytics updates
   */
  unsubscribeFromAnalytics(): void {
    this.socket?.emit('analytics:unsubscribe');
  }

  /**
   * Request current real-time metrics
   */
  requestRealtimeMetrics(): void {
    this.socket?.emit('analytics:get_realtime');
  }

  /**
   * Request historical trends
   */
  requestTrends(period: '24h' | '7d' | '30d' | '90d' = '7d'): void {
    this.socket?.emit('analytics:get_trends', { period });
  }

  /**
   * Listen for metrics update
   */
  onAnalyticsMetricsUpdate(callback: (data: any) => void): void {
    this.socket?.on('analytics:metrics_update', callback);
  }

  /**
   * Remove metrics update listener
   */
  offAnalyticsMetricsUpdate(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('analytics:metrics_update', callback);
    } else {
      this.socket?.off('analytics:metrics_update');
    }
  }

  /**
   * Listen for status distribution update
   */
  onAnalyticsStatusDistribution(callback: (data: any) => void): void {
    this.socket?.on('analytics:status_distribution', callback);
  }

  /**
   * Remove status distribution listener
   */
  offAnalyticsStatusDistribution(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('analytics:status_distribution', callback);
    } else {
      this.socket?.off('analytics:status_distribution');
    }
  }

  /**
   * Listen for new activity event
   */
  onAnalyticsActivity(callback: (data: any) => void): void {
    this.socket?.on('analytics:activity', callback);
  }

  /**
   * Remove activity listener
   */
  offAnalyticsActivity(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('analytics:activity', callback);
    } else {
      this.socket?.off('analytics:activity');
    }
  }

  /**
   * Listen for activity feed
   */
  onAnalyticsActivityFeed(callback: (data: any[]) => void): void {
    this.socket?.on('analytics:activity_feed', callback);
  }

  /**
   * Remove activity feed listener
   */
  offAnalyticsActivityFeed(callback?: (data: any[]) => void): void {
    if (callback) {
      this.socket?.off('analytics:activity_feed', callback);
    } else {
      this.socket?.off('analytics:activity_feed');
    }
  }

  /**
   * Listen for trends data
   */
  onAnalyticsTrends(callback: (data: any) => void): void {
    this.socket?.on('analytics:trends', callback);
  }

  /**
   * Remove trends listener
   */
  offAnalyticsTrends(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('analytics:trends', callback);
    } else {
      this.socket?.off('analytics:trends');
    }
  }

  /**
   * Listen for analytics errors
   */
  onAnalyticsError(callback: (error: { error: string }) => void): void {
    this.socket?.on('analytics:error', callback);
  }

  /**
   * Remove analytics error listener
   */
  offAnalyticsError(callback?: (error: { error: string }) => void): void {
    if (callback) {
      this.socket?.off('analytics:error', callback);
    } else {
      this.socket?.off('analytics:error');
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
