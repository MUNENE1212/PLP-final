import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Navbar from './Navbar';
import BottomNavigation from './BottomNavigation';
import Footer from './Footer';
import { QRQuickAccess } from '@/components/qrcode';

const Layout: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const params = useParams();

  // Get current booking ID if on booking detail page
  const bookingId = params.id?.startsWith('booking') ? params.id : undefined;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200 flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 md:py-8 md:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      {isAuthenticated && <BottomNavigation />}
      {isAuthenticated && (
        <QRQuickAccess
          technicianId={user?.role === 'technician' ? user._id : undefined}
          bookingId={bookingId}
        />
      )}
    </div>
  );
};

export default Layout;
