import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import ProBadge from '@/components/common/ProBadge';
import {
  Crown,
  Zap,
  CheckCircle,
  X,
  TrendingUp,
  Star,
  Shield,
  BarChart3,
  Headphones,
  Award,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Subscription: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Check if user is a technician
  if (user?.role !== 'technician') {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <Shield className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Technicians Only
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Pro features are only available for technicians.
        </p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const currentPlan = user.subscription?.plan || 'free';
  const isActive = user.subscription?.status === 'active';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Get started with basic features',
      icon: Star,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      features: [
        { included: true, text: 'Basic profile listing' },
        { included: true, text: 'Receive job requests' },
        { included: true, text: 'Standard customer matching' },
        { included: true, text: '5 portfolio items' },
        { included: true, text: 'Basic analytics' },
        { included: false, text: 'Boosted visibility' },
        { included: false, text: 'Boosted posts' },
        { included: false, text: 'Priority support' },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 2999,
      period: 'month',
      description: 'Stand out and get more customers',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      popular: true,
      features: [
        { included: true, text: 'Everything in Free' },
        { included: true, text: '25% boost in search results' },
        { included: true, text: '50% boost for posts' },
        { included: true, text: 'Pro badge on profile' },
        { included: true, text: 'Unlimited portfolio items' },
        { included: true, text: 'Advanced analytics' },
        { included: true, text: 'Priority customer support' },
        { included: true, text: 'Featured in categories' },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 4999,
      period: 'month',
      description: 'Maximum visibility and features',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-500',
      features: [
        { included: true, text: 'Everything in Pro' },
        { included: true, text: '50% boost in search results' },
        { included: true, text: '100% boost for posts' },
        { included: true, text: 'Premium badge with animation' },
        { included: true, text: 'Top of search results' },
        { included: true, text: 'Priority job notifications' },
        { included: true, text: 'Dedicated account manager' },
        { included: true, text: 'Custom profile URL' },
      ],
    },
  ];

  const handleUpgrade = (planId: string) => {
    // TODO: Implement payment integration
    alert(`Upgrade to ${planId} plan coming soon! Payment integration in progress.`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Upgrade Your Visibility
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Get more customers with Pro features and boosted visibility
        </p>

        {/* Current Plan Display */}
        {currentPlan !== 'free' && isActive && (
          <div className="mt-6 inline-flex items-center space-x-2 rounded-lg bg-green-50 px-4 py-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              You're currently on the {currentPlan.toUpperCase()} plan
            </span>
            <ProBadge subscription={user.subscription} size="sm" />
          </div>
        )}
      </div>

      {/* Benefits Overview */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
            Boosted Visibility
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Appear higher in search results and get more job requests
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Star className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">Enhanced Posts</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your posts get priority placement in the community feed
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
            Advanced Analytics
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Detailed insights into your profile views and customer behavior
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Headphones className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
            Priority Support
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Get faster responses from our support team when you need help
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border-2 bg-white p-8 shadow-lg transition-all hover:shadow-xl',
                plan.borderColor,
                plan.popular && 'lg:scale-105'
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6 text-center">
                <div
                  className={cn(
                    'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
                    plan.bgColor
                  )}
                >
                  <Icon className={cn('h-8 w-8', plan.color)} />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6 text-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">KES</span>
                  <span className="ml-1 text-5xl font-bold text-gray-900 dark:text-gray-100">
                    {plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      /{plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    ) : (
                      <X className="mr-3 h-5 w-5 flex-shrink-0 text-gray-300" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full"
                disabled={isCurrentPlan}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isCurrentPlan ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Current Plan
                  </>
                ) : currentPlan === 'free' || plan.id === 'free' ? (
                  <>
                    Upgrade to {plan.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Switch to {plan.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              How does boosted visibility work?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Pro and Premium members appear higher in customer searches. Your
              overall match score is multiplied by 1.25x (Pro) or 1.5x (Premium),
              significantly increasing your chances of being found by customers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              What about boosted posts?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your posts in the community feed get higher engagement scores,
              appearing more prominently. Pro posts get a 50% boost, Premium posts
              get a 100% boost in the feed algorithm.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Can I cancel anytime?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Yes, you can cancel your subscription at any time. You'll continue
              to have access to Pro features until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Do you offer refunds?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We offer a 7-day money-back guarantee if you're not satisfied with
              your Pro or Premium subscription. Contact support for a full refund.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          What Pro Technicians Say
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="mb-4 flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              "Since upgrading to Pro, I've seen a 3x increase in job requests. The
              boosted visibility really works!"
            </p>
            <div className="mt-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="ml-3">
                <p className="font-semibold text-gray-900 dark:text-gray-100">John Kamau</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Electrician, Nairobi</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="mb-4 flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              "The Premium badge gives customers confidence. I'm closing more deals
              than ever before!"
            </p>
            <div className="mt-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="ml-3">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Mary Wanjiku</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plumber, Mombasa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
