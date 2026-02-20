import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { fetchUnreadCount } from '@/store/slices/notificationSlice';
import { useBookingNotifications } from '@/hooks/useBookingNotifications';
import Button from '../ui/Button';
import { User, LogOut, Bell, Settings, HelpCircle, Sliders, Menu, X } from 'lucide-react';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  // Subscribe to real-time booking notifications
  const { unreadCount: bookingUnreadCount, isConnected: isSocketConnected } = useBookingNotifications({
    showToasts: true,
    playSound: false,
  });

  // Combined unread count (regular notifications + booking notifications)
  const totalUnreadCount = unreadCount + bookingUnreadCount;

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Fetch unread count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
      // Poll for new notifications every 2 minutes (120 seconds)
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 120000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  return (
    <nav className="glass-nav border-b border-subtle shadow-mahogany transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo-medium.png"
              alt="Dumu Waks"
              className="h-12 w-auto drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
              onError={(e) => {
                // Fallback to JPG if PNG doesn't exist
                e.currentTarget.src = '/images/logo.jpg';
                e.currentTarget.style.height = '48px';
                e.currentTarget.style.width = 'auto';
                e.currentTarget.style.objectFit = 'contain';
              }}
            />
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-bone hover:text-circuit transition-colors duration-200"
              >
                Dashboard
              </Link>
              {user?.role === 'customer' && (
                <>
                  <Link
                    to="/find-technicians"
                    className="text-bone hover:text-circuit transition-colors duration-200"
                  >
                    Find Technicians
                  </Link>
                  <Link
                    to="/preferences"
                    className="text-bone hover:text-circuit transition-colors duration-200 flex items-center"
                  >
                    <Sliders className="h-4 w-4 mr-1" />
                    Match Preferences
                  </Link>
                </>
              )}
              <Link
                to="/bookings"
                className="text-bone hover:text-circuit transition-colors duration-200"
              >
                Bookings
              </Link>
              <Link
                to="/messages"
                className="text-bone hover:text-circuit transition-colors duration-200"
              >
                Messages
              </Link>
              <Link
                to="/support"
                className="text-bone hover:text-circuit transition-colors duration-200 flex items-center"
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
                <div className="relative">
                  <button
                    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                    className="relative rounded-full p-2 text-steel hover:bg-hover transition-colors duration-200"
                  >
                    <Bell className="h-5 w-5" />
                    {totalUnreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-circuit rounded-full animate-pulse-glow">
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    isOpen={notificationDropdownOpen}
                    onClose={() => setNotificationDropdownOpen(false)}
                  />
                </div>

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
                      className="h-8 w-8 rounded-full object-cover border border-steel"
                    />
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-bone">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-steel capitalize">{user?.role}</p>
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
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="led-glow">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-bone hover:bg-hover transition-colors duration-200"
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
        <div className="md:hidden border-t border-subtle bg-charcoal">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {isAuthenticated ? (
              <>
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 px-3 py-3 border-b border-subtle">
                  <img
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-bone">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-steel capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                >
                  Dashboard
                </Link>

                {user?.role === 'customer' && (
                  <>
                    <Link
                      to="/find-technicians"
                      onClick={closeMobileMenu}
                      className="block rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                    >
                      Find Technicians
                    </Link>
                    <Link
                      to="/preferences"
                      onClick={closeMobileMenu}
                      className="flex items-center rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      Match Preferences
                    </Link>
                  </>
                )}

                <Link
                  to="/bookings"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                >
                  Bookings
                </Link>

                <Link
                  to="/messages"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                >
                  Messages
                </Link>

                <Link
                  to="/support"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support
                </Link>

                {/* Actions */}
                {/* Actions */}
                <div className="border-t border-subtle pt-2 mt-2">
                  <Link
                    to="/notifications"
                    onClick={closeMobileMenu}
                    className="w-full flex items-center rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                    {totalUnreadCount > 0 && (
                      <span className="ml-auto flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-circuit rounded-full">
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center rounded-md px-3 py-2 text-base font-medium text-error hover:bg-error-bg transition-colors duration-200"
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
                  className="block rounded-md px-3 py-2 text-base font-medium text-bone hover:bg-hover transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-circuit hover:bg-hover transition-colors duration-200"
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
