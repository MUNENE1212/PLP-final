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
import MyBookings from './pages/MyBookings';
import ProfileSettings from './pages/ProfileSettings';
import NotFound from './pages/NotFound';
import { useAppSelector } from './store/hooks';

const App: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
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

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="find-technicians" element={<FindTechnicians />} />
              <Route path="technicians/:id" element={<TechnicianProfile />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
