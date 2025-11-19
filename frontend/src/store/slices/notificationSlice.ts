import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationService from '@/services/notification.service';
import toast from 'react-hot-toast';

// Types
export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  type: string;
  title: string;
  body: string;
  image?: string;
  actionData?: any;
  deepLink?: string;
  relatedBooking?: string;
  relatedPost?: string;
  relatedReview?: string;
  relatedMessage?: string;
  relatedTransaction?: string;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'booking' | 'payment' | 'social' | 'message' | 'system' | 'achievement';
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isUpdating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (
    params: { page?: number; limit?: number; category?: string; isRead?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await notificationService.getNotifications(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark all as read';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteNotificationAction = createAsyncThunk(
  'notifications/delete',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const clearReadNotifications = createAsyncThunk(
  'notifications/clearRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.clearReadNotifications();
      toast.success('Read notifications cleared');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear notifications';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add notification from real-time updates (socket.io)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.pagination.total += 1;
    },
    // Update notification from real-time updates
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex((n) => n._id === action.payload._id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications[index] = action.payload;
        const isUnread = !action.payload.isRead;

        if (wasUnread && !isUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && isUnread) {
          state.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          pages: action.payload.pages || 0,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isUpdating = false;
        const notification = state.notifications.find((n) => n._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state) => {
        state.isUpdating = false;
      });

    // Mark all as read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.isUpdating = false;
        state.notifications.forEach((n) => {
          n.isRead = true;
          n.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state) => {
        state.isUpdating = false;
      });

    // Delete notification
    builder
      .addCase(deleteNotificationAction.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload);
        if (notification) {
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications = state.notifications.filter((n) => n._id !== action.payload);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      });

    // Clear read notifications
    builder
      .addCase(clearReadNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.filter((n) => !n.isRead);
        state.pagination.total = state.notifications.length;
      });
  },
});

export const { clearError, addNotification, updateNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
