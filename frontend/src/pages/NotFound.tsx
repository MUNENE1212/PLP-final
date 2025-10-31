import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <div className="mt-4">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Page Not Found
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link to="/">
            <Button variant="primary" size="lg" className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help?{' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-700">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
