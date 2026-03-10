import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import WhatsAppButton from '../common/WhatsAppButton';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Home page handles its own full-width layout
  const isHomePage = location.pathname === '/' && !isAuthenticated;

  return (
    <div className="min-h-screen bg-mahogany flex flex-col">
      <Navbar />
      <main className={`flex-1 ${isHomePage ? '' : 'mx-auto max-w-7xl w-full px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8'} pb-20 md:pb-0`}>
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      {isAuthenticated && <BottomNavigation />}
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
