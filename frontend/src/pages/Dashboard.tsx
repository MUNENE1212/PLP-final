import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Calendar, MessageSquare, Star } from 'lucide-react';
import Feed from '@/components/social/Feed';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      name: 'Total Bookings',
      value: '12',
      icon: Calendar,
      change: '+4 from last month',
      changeType: 'positive',
    },
    {
      name: 'Active Bookings',
      value: '3',
      icon: User,
      change: '2 pending acceptance',
      changeType: 'neutral',
    },
    {
      name: 'Messages',
      value: '8',
      icon: MessageSquare,
      change: '5 unread',
      changeType: 'neutral',
    },
    {
      name: 'Average Rating',
      value: '4.8',
      icon: Star,
      change: '+0.2 from last month',
      changeType: 'positive',
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Connect with the community and {user?.role === 'customer' ? 'find services' : 'showcase your work'}.
        </p>
      </div>

      {/* Main Layout - Two Column */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Feed */}
        <div className="lg:col-span-8">
          <Feed />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          {/* Stats Grid */}
          <div className="space-y-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                    <Icon className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-3">
              {user?.role === 'customer' ? (
                <>
                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/find-technicians')}
                  >
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900">Find Technicians</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Search for skilled technicians
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/find-technicians')}
                  >
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900">New Booking</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Create a service booking
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900">View Requests</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Check booking requests
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-gray-900">Update Portfolio</h3>
                      <p className="text-sm text-gray-600 mt-1">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        New booking request
                      </p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        5-star review received
                      </p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        New message
                      </p>
                      <p className="text-xs text-gray-600">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

