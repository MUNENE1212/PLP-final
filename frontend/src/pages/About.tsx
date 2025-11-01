import { Users, Target, Award, Heart, Zap, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'All technicians are verified and rated by our community. Your safety is our priority.',
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: '24/7 emergency support with response times as quick as 30 minutes.',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put customers at the center of everything we do, ensuring satisfaction.',
    },
    {
      icon: Award,
      title: 'Quality Service',
      description: 'Only the best technicians with proven track records join our platform.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Verified Technicians' },
    { number: '47', label: 'Counties Served' },
    { number: '99+', label: 'Service Types' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About EmEnTech</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Connecting Kenyans with skilled technicians for emergency repairs, maintenance,
            and engineering services across all 47 counties.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Target className="h-8 w-8 text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              To revolutionize how Kenyans access skilled technical services by creating a trusted,
              efficient, and transparent platform that connects customers with verified professionals.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              We believe everyone deserves quick access to quality technical services,
              whether it's an emergency plumbing issue at midnight or a planned solar installation.
            </p>
          </div>
          <Card className="p-8 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <Users className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Vision
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              To become East Africa's leading platform for technical services, empowering
              technicians and providing unmatched convenience to customers across the region.
            </p>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            These principles guide everything we do and shape how we serve our community.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                EmEnTech was born from a simple frustration: finding a reliable technician
                in an emergency shouldn't be this hard. Whether it's a burst pipe at 2 AM
                or a power outage during an important event, we've all been there.
              </p>
              <p>
                We built EmEnTech to solve this problem for all Kenyans. By combining
                smart matching algorithms, secure M-Pesa payments, and a verified technician
                network, we're making quality technical services accessible to everyone.
              </p>
              <p>
                Today, we're proud to serve thousands of customers across Kenya, connecting
                them with skilled professionals in plumbing, electrical work, carpentry,
                solar installation, and 95+ other service categories.
              </p>
              <p className="font-semibold">
                But we're just getting started. Join us as we transform how Kenya accesses
                technical services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 md:p-12 bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to be part of our journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            We're always looking for talented technicians, contributors, and supporters
            to help us grow and serve more Kenyans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/careers"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Our Team
            </a>
            <a
              href="/donate"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors border-2 border-white"
            >
              Support Our Mission
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
