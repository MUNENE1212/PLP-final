import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import Button from '../ui/Button';
import { User, LogOut, Bell, Settings, HelpCircle, Sliders, Menu, X } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 dark:bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">EmEnTech</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Dashboard
              </Link>
              {user?.role === 'customer' && (
                <>
                  <Link
                    to="/find-technicians"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Find Technicians
                  </Link>
                  <Link
                    to="/preferences"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center"
                  >
                    <Sliders className="h-4 w-4 mr-1" />
                    Match Preferences
                  </Link>
                </>
              )}
              <Link
                to="/bookings"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Bookings
              </Link>
              <Link
                to="/messages"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Messages
              </Link>
              <Link
                to="/support"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Support
              </Link>
            </div>
          )}

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <ThemeToggle />

                <button className="relative rounded-full p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
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
                <ThemeToggle />

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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {isAuthenticated ? (
              <>
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                  <img
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Dashboard
                </Link>

                {user?.role === 'customer' && (
                  <>
                    <Link
                      to="/find-technicians"
                      onClick={closeMobileMenu}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Find Technicians
                    </Link>
                    <Link
                      to="/preferences"
                      onClick={closeMobileMenu}
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      Match Preferences
                    </Link>
                  </>
                )}

                <Link
                  to="/bookings"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Bookings
                </Link>

                <Link
                  to="/messages"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Messages
                </Link>

                <Link
                  to="/support"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support
                </Link>

                {/* Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <button className="w-full flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
                  </button>

                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center rounded-md px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
