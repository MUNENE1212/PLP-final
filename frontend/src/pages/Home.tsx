import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Search, Users, Shield, Zap, Clock, DollarSign, ArrowRight, CheckCircle, Star, MapPin } from 'lucide-react';
import { Card } from '@/components/ui';
import { VoiceSearchButton } from '@/components/voice';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/find-technicians?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setSearchQuery(transcript);
    // Auto-navigate after voice input
    setTimeout(() => {
      navigate(`/find-technicians?search=${encodeURIComponent(transcript)}`);
    }, 500);
  };

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      description: 'Get matched with the RIGHT technician in under 60 seconds. Our smart algorithm analyzes skills, location, and availability.',
      highlighted: true,
    },
    {
      icon: Users,
      title: 'Verified Technicians',
      description: 'All technicians are background checked and vetted for your safety and peace of mind.',
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'Not satisfied? Get your money back. We stand behind every job on Dumu Waks.',
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'See EXACT cost before booking. No hidden fees or surprises with Dumu Waks.',
    },
    {
      icon: Clock,
      title: 'Fast Service',
      description: 'Most bookings completed within 24 hours. Emergency services available 24/7.',
    },
    {
      icon: Search,
      title: 'Secure M-Pesa Payments',
      description: 'Pay securely via M-Pesa with escrow protection. Your money is safe with Dumu Waks.',
    },
  ];

  const services = [
    { name: 'Plumbing', icon: '🔧' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Carpentry', icon: '🪵' },
    { name: 'Appliance Repair', icon: '🔌' },
    { name: 'Painting', icon: '🎨' },
    { name: 'Cleaning', icon: '🧹' },
  ];

  const stats = [
    { value: '10,000+', label: 'Verified Technicians' },
    { value: '50,000+', label: 'Happy Customers' },
    { value: '100,000+', label: 'Jobs Completed' },
    { value: '4.8★', label: 'Average Rating' },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-secondary-500/10 dark:bg-secondary-500/5 rounded-full blur-3xl"
          />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Professional Maintenance
                </span>
                <br />
                <span className="text-neutral-900 dark:text-white">& Repair Services</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto"
            >
              Connect with verified, skilled technicians across Kenya.
              <br className="hidden md:block" />
              Get matched in under 60 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register?role=customer">
                <Button size="lg" className="group w-full sm:w-auto bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                  Find a Technician
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/register?role=technician">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join as Technician
                </Button>
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {stat.value}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Search Section with Voice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700">
                <Search className="h-5 w-5 text-neutral-400 ml-3 flex-shrink-0" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for services, technicians..."
                  className="flex-1 border-0 focus:ring-0 bg-transparent"
                />
                <VoiceSearchButton
                  onResult={handleVoiceResult}
                  placeholder="What service do you need?"
                />
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3 text-center">
                Try: "I need a plumber in Nairobi" or "Find an electrician"
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white dark:bg-neutral-900">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-center mb-4 text-neutral-900 dark:text-white"
          >
            What Do You Need Fixed?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-600 dark:text-neutral-400 text-center mb-12 max-w-2xl mx-auto"
          >
            From plumbing to electrical work, we've got you covered with skilled professionals ready to help.
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="cursor-pointer"
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl mb-2">{service.icon}</div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{service.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section className="py-16 px-4 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-center mb-4 text-neutral-900 dark:text-white"
          >
            Why Choose Dumu Waks?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-600 dark:text-neutral-400 text-center mb-12 max-w-2xl mx-auto"
          >
            Everything you need to find and book skilled technicians in Kenya
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large featured card */}
            {features.filter(f => f.highlighted).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="md:col-span-2 lg:col-span-2"
              >
                <Card className="h-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-8 hover:shadow-2xl transition-all duration-300">
                  <feature.icon className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/90 text-lg">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}

            {/* Standard cards */}
            {features.filter(f => !f.highlighted).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 1) * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full p-6 hover:shadow-xl transition-all duration-300">
                  <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white dark:bg-neutral-900">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-center mb-12 text-neutral-900 dark:text-white"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Describe Your Problem',
                description: 'Tell us what you need fixed and where you are located.',
              },
              {
                step: '02',
                title: 'Get Matched',
                description: 'Our AI matches you with the best technician in under 60 seconds.',
              },
              {
                step: '03',
                title: 'Book & Pay',
                description: 'Schedule your service and pay securely via M-Pesa.',
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{step.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-center mb-12 text-neutral-900 dark:text-white"
          >
            Trusted by Thousands
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah W.',
                location: 'Nairobi',
                rating: 5,
                text: 'Found a plumber within 2 minutes. He arrived in 30 minutes and fixed the issue perfectly. Amazing service!',
              },
              {
                name: 'James K.',
                location: 'Mombasa',
                rating: 5,
                text: 'The AI matching is incredible. The electrician knew exactly what to do. Fair price and professional work.',
              },
              {
                name: 'Mary A.',
                location: 'Kisumu',
                rating: 5,
                text: 'I\'ve used Dumu Waks 5 times now. Every technician has been skilled and reliable. Highly recommend!',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-500 to-secondary-500">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers across Kenya on Dumu Waks
            </p>
            <Link to="/register?role=customer">
              <Button size="lg" variant="secondary" className="group">
                Find a Technician Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
