import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Users,
  Wrench,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCompleteDashboard, AdminDashboardStats, AdminActivityItem, TopTechnician } from '@/services/admin.service';
import Loading from '@/components/ui/Loading';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AdminActivityItem[]>([]);
  const [topTechnicians, setTopTechnicians] = useState<TopTechnician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCompleteDashboard(timeRange);
        setStats(data.stats);
        setRecentActivity(data.activity);
        setTopTechnicians(data.topTechnicians);
      } catch (err: any) {
        console.error('Error loading admin dashboard:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // Show error state
  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-gray-700 dark:text-gray-300">
          {error || 'Failed to load dashboard data'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Platform overview and management
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{stats.users.total.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +{stats.users.newToday} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <Wrench className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{stats.users.technicians.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stats.users.activeTechnicians} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{stats.bookings.active.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stats.bookings.completed.toLocaleString()} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              KES {(stats.revenue.total / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              KES {(stats.revenue.pendingPayouts / 1000).toFixed(0)}K pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <p className="font-semibold text-green-600">Healthy</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                  <p className="font-semibold dark:text-gray-100 mt-1">{stats.platform.uptime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
                  <p className="font-semibold dark:text-gray-100 mt-1">{stats.platform.avgResponseTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
                  <p className="font-semibold dark:text-gray-100 mt-1">{stats.platform.errorRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                    No recent activity
                  </p>
                ) : (
                  recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center',
                        activity.type === 'user' && 'bg-blue-100 dark:bg-blue-900/30',
                        activity.type === 'booking' && 'bg-green-100 dark:bg-green-900/30',
                        activity.type === 'payment' && 'bg-purple-100 dark:bg-purple-900/30',
                        activity.type === 'support' && 'bg-orange-100 dark:bg-orange-900/30',
                        activity.type === 'post' && 'bg-cyan-100 dark:bg-cyan-900/30'
                      )}>
                        {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'booking' && <Calendar className="h-4 w-4 text-green-600" />}
                        {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'support' && <AlertCircle className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'post' && <Activity className="h-4 w-4 text-cyan-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Top Performers & Support */}
        <div className="space-y-6">
          {/* Platform Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Customers</span>
                  </div>
                  <span className="font-semibold text-blue-600">{stats.users.customers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Avg Rating</span>
                  </div>
                  <span className="font-semibold text-yellow-600">{stats.platform.averageRating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Completion Rate</span>
                  </div>
                  <span className="font-semibold text-green-600">{stats.bookings.completionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Technicians */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Technicians</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTechnicians.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    No technician data available
                  </p>
                ) : (
                  topTechnicians.map((tech, index) => (
                    <div key={tech._id} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {tech.name}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {tech.bookings} bookings
                          </span>
                          <span className="text-xs text-yellow-600">⭐ {tech.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                        KES {tech.earnings.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View All Users
                </button>
                <button
                  onClick={() => navigate('/admin/users?role=technician')}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Manage Technicians
                </button>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  View Reports
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  System Settings
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
