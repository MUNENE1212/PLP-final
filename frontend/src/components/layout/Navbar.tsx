import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { fetchUnreadCount } from '@/store/slices/notificationSlice';
import { Button } from '@/components/ui';
import { User, LogOut, Bell, Settings, HelpCircle, Sliders, Menu, X, Bookmark } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Dashboard' },
        ...(user?.role === 'customer'
          ? [
              { path: '/find-technicians', label: 'Find Technicians' },
              { path: '/preferences', label: 'Match Preferences', icon: Sliders },
            ]
          : []),
        { path: '/bookings', label: 'Bookings' },
        { path: '/messages', label: 'Messages' },
        { path: '/saved-posts', label: 'Saved', icon: Bookmark },
        { path: '/support', label: 'Support', icon: HelpCircle },
      ]
    : [];

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
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/images/logo-medium.png"
              alt="Dumu Waks"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/images/logo.jpg';
                e.currentTarget.style.height = '40px';
                e.currentTarget.style.width = 'auto';
                e.currentTarget.style.objectFit = 'contain';
              }}
            />
          </Link>

          {/* Center Navigation - Desktop */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                const Icon = link.icon;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <ThemeToggle />

                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                    className={cn(
                      'relative rounded-full p-2.5 transition-colors',
                      notificationDropdownOpen
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </motion.button>
                  <NotificationDropdown
                    isOpen={notificationDropdownOpen}
                    onClose={() => setNotificationDropdownOpen(false)}
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 pl-3 pr-2 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                  onClick={() => window.location.href = '/settings'}
                >
                  <img
                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-neutral-700"
                  />
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{user?.role}</p>
                  </div>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </motion.div>
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
                  <Button size="sm" className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="space-y-1 px-4 pb-4 pt-2">
              {isAuthenticated ? (
                <>
                  {/* User Profile Section */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-3 px-4 py-4 mb-2 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950"
                  >
                    <img
                      src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-neutral-700"
                    />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-neutral-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">{user?.role}</p>
                    </div>
                  </motion.div>

                  {/* Navigation Links */}
                  {navLinks.map((link, index) => {
                    const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                    const Icon = link.icon;

                    return (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (index * 0.05) }}
                      >
                        <Link
                          to={link.path}
                          onClick={closeMobileMenu}
                          className={cn(
                            'flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-200',
                            isActive
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          )}
                        >
                          {Icon && <Icon className="h-5 w-5 mr-3" />}
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-3 space-y-1"
                  >
                    <Link
                      to="/notifications"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-3" />
                        Notifications
                      </div>
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center h-6 w-6 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/settings"
                      onClick={closeMobileMenu}
                      className="flex items-center rounded-xl px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center rounded-xl px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block rounded-xl px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block rounded-xl px-4 py-3 text-base font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 transition-colors"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
