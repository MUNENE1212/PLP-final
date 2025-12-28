import { Search, UserCheck, Calendar, CreditCard, Wrench, Star, MessageCircle, Shield, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';

const HowItWorks = () => {
  const customerSteps = [
    {
      icon: Search,
      title: 'Describe Your Problem',
      description: 'Tell Dumu Waks what you need - plumbing, electrical, carpentry, appliance repair, or any maintenance service.',
    },
    {
      icon: UserCheck,
      title: 'Get Matched Instantly',
      description: 'Our AI matches you with the RIGHT technician in under 60 seconds based on skills, location, and availability.',
    },
    {
      icon: DollarSign,
      title: 'See Exact Pricing',
      description: 'View the exact cost in KES before booking. No hidden fees or surprises with Dumu Waks transparent pricing.',
    },
    {
      icon: Calendar,
      title: 'Book Your Service',
      description: 'Choose your preferred date and time. Pay 20% booking fee via M-Pesa. Emergency services available 24/7.',
    },
    {
      icon: Wrench,
      title: 'Technician Arrives',
      description: 'Your verified technician arrives on time and completes the work professionally.',
    },
    {
      icon: Star,
      title: 'Rate & Pay Balance',
      description: 'Review the work, rate your technician, and pay the remaining 80% via M-Pesa only if satisfied.',
    },
  ];

  const technicianSteps = [
    {
      icon: UserCheck,
      title: 'Create Profile',
      description: 'Sign up and verify your skills, certifications, and experience.',
    },
    {
      icon: MessageCircle,
      title: 'Receive Requests',
      description: 'Get matched with customers who need your expertise.',
    },
    {
      icon: Calendar,
      title: 'Accept Jobs',
      description: 'Review details and accept jobs that fit your schedule.',
    },
    {
      icon: Wrench,
      title: 'Complete Work',
      description: 'Deliver quality service and mark the job as complete.',
    },
    {
      icon: CreditCard,
      title: 'Get Paid',
      description: 'Receive payment directly to your M-Pesa after job completion.',
    },
    {
      icon: Star,
      title: 'Build Reputation',
      description: 'Earn ratings and reviews to attract more customers.',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'M-Pesa integration with escrow protection. Customers pay 20% upfront, 80% after completion.',
    },
    {
      icon: UserCheck,
      title: 'Verified Professionals',
      description: 'All technicians are vetted, rated, and reviewed by the community.',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Communicate directly with technicians through our in-app messaging.',
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Two-way ratings ensure quality service and respectful customers.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How Dumu Waks Works</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Get professional maintenance and repair services in 6 simple steps. Quality guaranteed or your money back.
          </p>
        </div>
      </div>

      {/* For Customers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            For Customers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From booking to payment, we've made it incredibly simple
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {customerSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary-600 mb-1">
                      Step {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* For Technicians */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              For Technicians
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Turn your skills into income. Join our network of professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {technicianSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-600 mb-1">
                        Step {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Why Choose Dumu Waks?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Features that make Dumu Waks the best platform for maintenance and repair services in Kenya
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-primary-100 max-w-2xl mx-auto">
              Know exactly what you're paying for. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">20%</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Booking Fee
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paid upfront and held in escrow until job completion
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">80%</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                After Service
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pay the balance after you're satisfied with the work
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10%</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Platform Fee
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Small commission to maintain and improve the platform
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 md:p-12 bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers and technicians on Dumu Waks
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register?role=customer"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              I Need a Technician
            </a>
            <a
              href="/register?role=technician"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors border-2 border-white"
            >
              I'm a Technician
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HowItWorks;
