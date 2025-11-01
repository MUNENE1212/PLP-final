import axios from '@/lib/axios';

export interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalEarnings?: number;
  totalSpent?: number;
  averageRating?: number;
  unreadMessages: number;
}

export interface ActivityItem {
  _id: string;
  type: 'booking' | 'message' | 'review' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  relatedId?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}

/**
 * Fetch dashboard stats including booking counts, ratings, and messages
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await axios.get('/bookings/stats');
    return response.data.stats || response.data;
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch recent activity for the dashboard
 * This combines bookings, messages, and reviews
 */
export const getRecentActivity = async (limit: number = 10): Promise<ActivityItem[]> => {
  try {
    // Fetch recent bookings
    const bookingsResponse = await axios.get('/bookings', {
      params: { limit: 5, sort: '-createdAt' }
    });

    // Fetch recent conversations for unread count
    const conversationsResponse = await axios.get('/conversations', {
      params: { limit: 5, sort: '-lastMessageAt' }
    });

    const activities: ActivityItem[] = [];

    // Add booking activities
    if (bookingsResponse.data.bookings) {
      bookingsResponse.data.bookings.forEach((booking: any) => {
        activities.push({
          _id: booking._id,
          type: 'booking',
          title: getBookingActivityTitle(booking.status),
          description: `${booking.serviceType} - ${booking.description?.substring(0, 50)}...`,
          timestamp: booking.updatedAt || booking.createdAt,
          status: booking.status,
          relatedId: booking._id
        });
      });
    }

    // Add conversation activities
    if (conversationsResponse.data.conversations) {
      conversationsResponse.data.conversations
        .filter((conv: any) => conv.unreadCount > 0)
        .forEach((conv: any) => {
          activities.push({
            _id: conv._id,
            type: 'message',
            title: 'New message',
            description: `${conv.unreadCount} unread message${conv.unreadCount > 1 ? 's' : ''}`,
            timestamp: conv.lastMessageAt || conv.updatedAt,
            relatedId: conv._id
          });
        });
    }

    // Sort by timestamp (most recent first) and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

/**
 * Helper function to generate activity title based on booking status
 */
const getBookingActivityTitle = (status: string): string => {
  const statusTitles: Record<string, string> = {
    pending: 'New booking request',
    awaiting_acceptance: 'Booking awaiting acceptance',
    accepted: 'Booking accepted',
    in_progress: 'Service in progress',
    completed: 'Booking completed',
    cancelled: 'Booking cancelled',
    disputed: 'Booking disputed',
  };

  return statusTitles[status] || 'Booking updated';
};

/**
 * Fetch complete dashboard data (stats + recent activity)
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const [stats, recentActivity] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(10)
    ]);

    return {
      stats,
      recentActivity
    };
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getRecentActivity,
  getDashboardData
};
