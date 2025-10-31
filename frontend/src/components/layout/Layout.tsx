import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-indigo-100 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
