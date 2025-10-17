import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import Button from '../ui/Button';
import { User, LogOut, Bell, Settings, HelpCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="border-b bg-blue shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex bg-yellow h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BaiTech</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Dashboard
              </Link>
              {user?.role === 'customer' && (
                <Link
                  to="/find-technicians"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Find Technicians
                </Link>
              )}
              <Link
                to="/bookings"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Bookings
              </Link>
              <Link
                to="/messages"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Messages
              </Link>
              <Link
                to="/support"
                className="text-gray-700 hover:text-primary-600 transition-colors flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Support
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <div className="flex items-center space-x-3">
                  <Link to="/settings">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>

                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
