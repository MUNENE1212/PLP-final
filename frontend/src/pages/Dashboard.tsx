import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchDashboardStats, fetchRecentActivity } from '@/store/slices/dashboardSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Calendar, MessageSquare, Star, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Feed from '@/components/social/Feed';
import Loading from '@/components/ui/Loading';
import AdminDashboard from './AdminDashboard';
import SupportDashboard from './SupportDashboard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stats, recentActivity, isLoading } = useAppSelector((state) => state.dashboard);

  // Route to role-specific dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'support') {
    return <SupportDashboard />;
  }

  // Fetch dashboard data on mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentActivity(10));
  }, [dispatch]);

  // Format stats for display
  const displayStats = [
    {
      name: 'Total Bookings',
      value: stats?.totalBookings?.toString() || '0',
      icon: Calendar,
      change: stats?.completedBookings
        ? `${stats.completedBookings} completed`
        : 'No bookings yet',
      changeType: stats?.completedBookings ? 'positive' : 'neutral',
    },
    {
      name: 'Active Bookings',
      value: stats?.activeBookings?.toString() || '0',
      icon: User,
      change: stats?.pendingBookings
        ? `${stats.pendingBookings} pending`
        : 'No pending bookings',
      changeType: 'neutral',
    },
    {
      name: 'Messages',
      value: stats?.unreadMessages?.toString() || '0',
      icon: MessageSquare,
      change: stats?.unreadMessages
        ? `${stats.unreadMessages} unread`
        : 'All caught up',
      changeType: stats?.unreadMessages ? 'neutral' : 'positive',
    },
    {
      name: user?.role === 'customer' ? 'Total Spent' : 'Total Earnings',
      value: stats?.totalEarnings
        ? `KSh ${stats.totalEarnings.toLocaleString()}`
        : stats?.totalSpent
        ? `KSh ${stats.totalSpent.toLocaleString()}`
        : 'KSh 0',
      icon: Star,
      change: stats?.averageRating
        ? `${stats.averageRating.toFixed(1)} avg rating`
        : 'No ratings yet',
      changeType: stats?.averageRating && stats.averageRating >= 4 ? 'positive' : 'neutral',
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-950 dark:text-gray-100">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600 dark:text-gray-400">
          Connect with the community and {user?.role === 'customer' ? 'find services' : 'showcase your work'}.
        </p>
      </div>

      {/* Main Layout - Two Column */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
        {/* Left Column - Feed */}
        <div className="lg:col-span-8">
          <Feed />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1 lg:space-y-0">
            {isLoading && !stats ? (
              <div className="col-span-2 lg:col-span-1 flex justify-center py-8">
                <Loading size="md" text="Loading stats..." />
              </div>
            ) : (
              displayStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-gray-100">{stat.value}</div>
                      <p className={`text-xs ${
                        stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {user?.role === 'customer' ? (
                <>
                  <Card
                    className="hover:shadow-md dark:hover:shadow-gray-700 transition-shadow cursor-pointer"
                    onClick={() => navigate('/find-technicians')}
                  >
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Find Technicians</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Search for skilled technicians
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="hover:shadow-md dark:hover:shadow-gray-700 transition-shadow cursor-pointer"
                    onClick={() => navigate('/find-technicians')}
                  >
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">New Booking</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Create a service booking
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="hover:shadow-md dark:hover:shadow-gray-700 transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">View Requests</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Check booking requests
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md dark:hover:shadow-gray-700 transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Update Portfolio</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Showcase your work
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <button
                onClick={() => dispatch(fetchRecentActivity(10))}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                title="Refresh activity"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <Card>
              <CardContent className="pt-4">
                {isLoading && recentActivity.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loading size="sm" text="Loading activity..." />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity) => {
                      const iconConfig = getActivityIcon(activity.type, activity.status);
                      const Icon = iconConfig.icon;

                      return (
                        <div key={activity._id} className="flex items-start">
                          <div className={`h-8 w-8 rounded-full ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${iconConfig.color}`} />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon configuration based on activity type and status
const getActivityIcon = (type: string, status?: string) => {
  if (type === 'booking') {
    if (status === 'completed') {
      return { icon: Calendar, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' };
    }
    if (status === 'cancelled' || status === 'disputed') {
      return { icon: Calendar, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };
    }
    return { icon: Calendar, bg: 'bg-primary-100 dark:bg-primary-900/30', color: 'text-primary-600 dark:text-primary-400' };
  }

  if (type === 'message') {
    return { icon: MessageSquare, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
  }

  if (type === 'review') {
    return { icon: Star, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' };
  }

  if (type === 'payment') {
    return { icon: Star, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' };
  }

  return { icon: User, bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-600 dark:text-gray-400' };
};

export default Dashboard;

