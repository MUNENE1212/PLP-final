import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FindTechnicians from './pages/FindTechnicians';
import TechnicianProfile from './pages/TechnicianProfile';
import UserProfile from './pages/UserProfile';
import MyBookings from './pages/MyBookings';
import CreateBooking from './pages/CreateBooking';
import BookingDetail from './pages/BookingDetail';
import MatchingPreferences from './pages/MatchingPreferences';
import ProfileSettings from './pages/ProfileSettings';
import Messages from './pages/Messages';
import Support from './pages/Support';
import WhatsAppSupport from './pages/WhatsAppSupport';
import About from './pages/About';
import Careers from './pages/Careers';
import Donate from './pages/Donate';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import ReportsPage from './pages/ReportsPage';
import SupportDashboard from './pages/SupportDashboard';
import { useAppSelector } from './store/hooks';
import { useSocket } from './hooks/useSocket';
import { ThemeProvider } from './contexts/ThemeContext';
import ScrollToTop from './components/common/ScrollToTop';

const App: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Initialize socket connection
  useSocket();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-gray-100',
              style: {
                background: '#fff',
                color: '#363636',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
            <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

            {/* Public Pages (no login required) */}
            <Route path="about" element={<About />} />
            <Route path="careers" element={<Careers />} />
            <Route path="donate" element={<Donate />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="whatsapp-support" element={<WhatsAppSupport />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="find-technicians" element={<FindTechnicians />} />
              <Route path="technicians/:id" element={<TechnicianProfile />} />
              <Route path="profile/:id" element={<UserProfile />} />
              <Route path="booking/create" element={<CreateBooking />} />
              <Route path="bookings/:id" element={<BookingDetail />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="messages" element={<Messages />} />
              <Route path="support" element={<Support />} />
              <Route path="preferences" element={<MatchingPreferences />} />
              <Route path="settings" element={<ProfileSettings />} />

              {/* Admin Routes */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/settings" element={<SystemSettings />} />
              <Route path="admin/reports" element={<ReportsPage />} />

              {/* Support Routes */}
              <Route path="support-dashboard" element={<SupportDashboard />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
