import { Users, Target, Award, Heart, Zap, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Quality',
      description: 'We maintain the highest standards by thoroughly vetting every technician on Dumu Waks.',
    },
    {
      icon: Zap,
      title: 'Transparency',
      description: 'See exact pricing before booking. No hidden fees with Dumu Waks.',
    },
    {
      icon: Heart,
      title: 'Reliability',
      description: 'We show up when you need us. Fast response times, 24/7 emergency support.',
    },
    {
      icon: Award,
      title: 'Community',
      description: 'Building trust between Kenyan technicians and customers, one job at a time.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers in Kenya' },
    { number: '500+', label: 'Verified Technicians' },
    { number: '47', label: 'Counties Covered' },
    { number: '24/7', label: 'Emergency Support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Dumu Waks</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Your trusted platform for professional maintenance and repair services in Kenya.
            Connecting skilled technicians with quality-conscious customers across all 47 counties.
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
              To connect Kenyans with reliable, skilled technicians for quality home and business maintenance services.
              We're making professional repairs accessible, affordable, and stress-free for everyone.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Whether you need emergency plumbing at midnight or routine appliance maintenance, Dumu Waks ensures
              you get the right technician, at the right price, exactly when you need them.
            </p>
          </div>
          <Card className="p-8 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <Users className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Vision
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              To be Kenya's most trusted platform for maintenance and repair services, where every technician
              is verified, every price is transparent, and every customer is satisfied. We're building a future
              where finding quality help is never a hassle.
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
              The Dumu Waks Story
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Dumu Waks was born from a simple frustration: finding a reliable technician in Kenya
                shouldn't be this hard. Whether it's a burst pipe at 2 AM or a faulty appliance
                before a big family gathering, we've all experienced the stress of emergency repairs.
              </p>
              <p>
                We asked ourselves: why can't finding a trustworthy technician be as simple as
                ordering a ride? Why do Kenyans have to rely on word-of-mouth or gamble with
                unverified contacts?
              </p>
              <p>
                So we built Dumu Waks - a platform that connects you with verified, skilled technicians
                in under 60 seconds. With AI-powered matching, transparent M-Pesa payments, and a
                quality guarantee, we're making home maintenance stress-free.
              </p>
              <p>
                Today, Dumu Waks serves customers across all 47 Kenyan counties, offering everything
                from plumbing and electrical work to carpentry and appliance repair. Every technician
                on our platform is background-checked, every price is upfront, and every job is
                backed by our satisfaction guarantee.
              </p>
              <p className="font-semibold">
                We're not just fixing things - we're building trust, one repair at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 md:p-12 bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to experience the Dumu Waks difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Kenya who trust Dumu Waks for their maintenance and repair needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register?role=customer"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Find a Technician
            </a>
            <a
              href="/register?role=technician"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors border-2 border-white"
            >
              Join as Technician
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
