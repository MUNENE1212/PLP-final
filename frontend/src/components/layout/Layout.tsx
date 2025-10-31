import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-indigo-100 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
