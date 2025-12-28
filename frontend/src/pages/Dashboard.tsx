import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchDashboardStats, fetchRecentActivity } from '@/store/slices/dashboardSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Calendar, MessageSquare, Star, RefreshCw, Wrench, Bell, Settings, HelpCircle, Bot, Clock, TrendingUp, FileText, MapPin } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 md:pb-8">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white p-6 md:p-8 mb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-white/90">
              {user?.role === 'customer'
                ? 'What would you like to get fixed today?'
                : 'You have new opportunities to showcase your work'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-6 w-6" />
            {(stats?.unreadMessages && stats.unreadMessages > 0) && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {stats.unreadMessages}
              </span>
            )}
          </motion.button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar },
            { label: 'Upcoming', value: stats?.activeBookings || 0, icon: Clock },
            { label: 'Completed', value: stats?.completedBookings || 0, icon: TrendingUp },
            {
              label: user?.role === 'customer' ? 'Total Spent' : 'Total Earnings',
              value: stats?.totalEarnings
                ? `KES ${(stats.totalEarnings / 1000).toFixed(1)}k`
                : stats?.totalSpent
                ? `KES ${(stats.totalSpent / 1000).toFixed(1)}k`
                : 'KES 0',
              icon: Star
            }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl"
              >
                <Icon className="h-5 w-5 mb-2 text-white/80" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/80">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Bento Grid Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* Quick Actions - Featured */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0 shadow-lg">
              <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(user?.role === 'customer' ? [
                  { icon: Wrench, label: 'Find Technician', route: '/find-technicians', color: 'from-blue-500 to-blue-600' },
                  { icon: Calendar, label: 'New Booking', route: '/booking/create', color: 'from-purple-500 to-purple-600' },
                  { icon: MessageSquare, label: 'Messages', route: '/messages', color: 'from-green-500 to-green-600' },
                  { icon: HelpCircle, label: 'Get Help', route: '/support', color: 'from-orange-500 to-orange-600' }
                ] : [
                  { icon: Calendar, label: 'View Requests', route: '/bookings', color: 'from-blue-500 to-blue-600' },
                  { icon: User, label: 'My Profile', route: '/settings', color: 'from-purple-500 to-purple-600' },
                  { icon: MessageSquare, label: 'Messages', route: '/messages', color: 'from-green-500 to-green-600' },
                  { icon: Settings, label: 'Settings', route: '/preferences', color: 'from-orange-500 to-orange-600' }
                ] as const).map((action, idx) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.route)}
                    className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-xl flex flex-col items-center gap-2 shadow-md hover:shadow-xl transition-all`}
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <button
                  onClick={() => dispatch(fetchRecentActivity(10))}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                  title="Refresh activity"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="space-y-4">
                {isLoading && recentActivity.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <Loading size="sm" text="Loading activity..." />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  recentActivity.slice(0, 4).map((activity) => {
                    const iconConfig = getActivityIcon(activity.type, activity.status);
                    const Icon = iconConfig.icon;

                    return (
                      <div key={activity._id} className="flex items-start gap-3">
                        <div className={`${iconConfig.bg} p-2 rounded-full flex-shrink-0`}>
                          <Icon className={`h-4 w-4 ${iconConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>

          {/* AI Assistant Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-2xl">
                  <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Diagnose problems instantly
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Not sure what's wrong? Let our AI help you identify the problem and find the right solution.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.querySelector('[aria-label="Open AI Assistant"]')?.querySelector('button')?.click()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-xl transition-all"
              >
                Start Diagnosis
              </motion.button>
            </Card>
          </motion.div>

        </div>

        {/* Social Feed Section */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
          {/* Feed */}
          <div className="lg:col-span-12">
            <Feed />
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

