import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Search, Users, Shield, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'AI-Powered Matching',
      description: 'Find the perfect technician for your needs with our intelligent matching algorithm',
    },
    {
      icon: Users,
      title: 'Verified Professionals',
      description: 'All technicians are verified and rated by the community',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with escrow protection',
    },
    {
      icon: Zap,
      title: 'Real-time Chat',
      description: 'Communicate directly with technicians through our platform',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
              <span className="block">Connect with Skilled</span>
              <span className="block text-primary-600 dark:text-primary-400">Technicians Instantly</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              BaiTech uses AI to match you with the best technicians in your area.
              Get quality service from verified professionals.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Why Choose BaiTech?</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Everything you need to find and book skilled technicians
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-lg bg-white dark:bg-gray-700 p-6 shadow-sm hover:shadow-md dark:hover:shadow-gray-900 transition-shadow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 dark:bg-primary-700 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-primary-100 dark:text-primary-200">
            Join thousands of customers and technicians on BaiTech
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
