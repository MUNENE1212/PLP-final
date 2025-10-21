import { io, Socket } from 'socket.io-client';
import { STORAGE_KEYS } from '@/config/constants';
import { Message } from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    // Socket.IO connects to the root server URL, not the API path
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    // Remove /api/v1 from the URL to get the base server URL
    const backendUrl = apiUrl.replace(/\/api\/v\d+$/, '');

    console.log('Connecting to Socket.IO server:', backendUrl);

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
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Join user's personal room
      this.socket?.emit('user:join', userId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
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

  onMessageRead(callback: (data: { messageId: string; userId: string }) => void): void {
    this.socket?.on('message:read', callback);
  }

  onMessageDeleted(callback: (data: { messageId: string; conversationId: string }) => void): void {
    this.socket?.on('message:deleted', callback);
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
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
