import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import {
  Search, Users, Shield, Zap, Clock, DollarSign, ArrowRight,
  CheckCircle, Star, MapPin, Wrench, Bolt, Hammer, Plug,
  Paintbrush, Brush, Mic, ChevronRight, Sparkles, TrendingUp,
  Phone, MessageCircle,
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/find-technicians?search=${encodeURIComponent(searchQuery)}`);
    }
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
      description: 'See EXACT cost before booking. No hidden fees or surprises.',
    },
    {
      icon: Clock,
      title: 'Fast Service',
      description: 'Most bookings completed within 24 hours. Emergency services available 24/7.',
    },
    {
      icon: Search,
      title: 'Secure M-Pesa Payments',
      description: 'Pay securely via M-Pesa with escrow protection. Your money is safe.',
    },
  ];

  const services = [
    { name: 'Plumbing', icon: Wrench, gradient: 'from-circuit-400 to-circuit-600' },
    { name: 'Electrical', icon: Bolt, gradient: 'from-amber-400 to-amber-600' },
    { name: 'Carpentry', icon: Hammer, gradient: 'from-mahogany-300 to-mahogany-500' },
    { name: 'Appliance Repair', icon: Plug, gradient: 'from-wrench-400 to-wrench-600' },
    { name: 'Painting', icon: Paintbrush, gradient: 'from-circuit-500 to-wrench-500' },
    { name: 'Cleaning', icon: Brush, gradient: 'from-emerald-400 to-emerald-600' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Describe Your Problem',
      description: 'Tell us what you need fixed and where you are located.',
      icon: MessageCircle,
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'Our AI matches you with the best technician in under 60 seconds.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Book & Pay',
      description: 'Schedule your service and pay securely via M-Pesa.',
      icon: CheckCircle,
    },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div className="overflow-hidden -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8">
      {/* ======================================
          HERO SECTION - Cinematic Dark Entry
          ====================================== */}
      <section className="relative overflow-hidden hero-gradient circuit-pattern">
        {/* Animated background orbs */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(0,144,197,0.08) 0%, transparent 70%)' }}
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(125,78,159,0.08) 0%, transparent 70%)' }}
            />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-circuit/30 bg-circuit/10 px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-4 w-4 text-circuit" />
              <span className="text-sm font-medium text-circuit">AI-Powered Technician Matching</span>
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-bone sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="block">Professional</span>
              <span className="block text-gradient">Maintenance & Repair</span>
              <span className="block">Services</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-steel sm:text-xl"
            >
              Connect with verified, skilled technicians across Kenya.
              <br className="hidden md:block" />
              Get matched in under 60 seconds.
            </motion.p>

            {/* Search Bar - Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-8 max-w-2xl"
            >
              <div className="glass-card flex items-center gap-2 rounded-2xl p-2 sm:p-3">
                <Search className="ml-3 h-5 w-5 flex-shrink-0 text-steel" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for services, technicians..."
                  className="min-h-[44px] flex-1 bg-transparent text-base text-bone placeholder-steel outline-none"
                  aria-label="Search for services or technicians"
                />
                <button
                  onClick={handleSearch}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-circuit text-white transition-all hover:bg-circuit-600 hover:shadow-led sm:h-12 sm:w-auto sm:px-6"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 sm:hidden" />
                  <span className="hidden sm:inline font-medium">Search</span>
                </button>
              </div>
              <p className="mt-3 text-sm text-steel/70">
                Try: "I need a plumber in Nairobi" or "Find an electrician"
              </p>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">All Technicians Verified</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-circuit/30 bg-circuit/10 px-4 py-2">
                <Shield className="h-4 w-4 flex-shrink-0 text-circuit" />
                <span className="text-sm font-medium text-circuit-300">M-Pesa Integrated</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
                <Star className="h-4 w-4 flex-shrink-0 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">4.8 Average Rating</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link to="/register?role=customer">
                <Button variant="primary" size="lg" className="group w-full led-glow sm:w-auto">
                  Find a Technician Near You
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/register?role=technician">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join as Technician
                </Button>
              </Link>
            </motion.div>

            {/* Live Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { label: 'Technicians', value: '500+', icon: Users },
                { label: 'Bookings', value: '2,000+', icon: TrendingUp },
                { label: 'Cities', value: '10+', icon: MapPin },
                { label: 'Avg Rating', value: '4.8', icon: Star },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-3 text-center">
                  <stat.icon className="mx-auto mb-1 h-5 w-5 text-circuit" />
                  <p className="text-xl font-bold text-bone">{stat.value}</p>
                  <p className="text-xs text-steel">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================
          SERVICES SECTION - What Do You Need?
          ====================================== */}
      <section className="bg-charcoal py-16 px-4 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bone sm:text-4xl">What Do You Need Fixed?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-steel">
              From plumbing to electrical work, we've got you covered with skilled professionals ready to help.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {services.map((service, i) => (
              <motion.button
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/find-technicians?service=${encodeURIComponent(service.name)}`)}
                className="group cursor-pointer"
                aria-label={`Find ${service.name} services`}
              >
                <div className="glass-card rounded-2xl p-5 text-center transition-all duration-300 hover:border-strong hover:shadow-led h-full">
                  <div className={`mx-auto mb-3 inline-flex rounded-xl bg-gradient-to-br ${service.gradient} p-3`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-medium text-bone">{service.name}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-8 text-center">
            <p className="text-sm text-steel mb-3">Don't see what you need?</p>
            <Link
              to="/find-technicians"
              className="inline-flex items-center gap-2 text-circuit hover:text-circuit-300 font-medium transition-colors"
            >
              Browse all services
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======================================
          FEATURES SECTION - Bento Grid
          ====================================== */}
      <section className="py-16 px-4 sm:py-20" style={{ background: 'linear-gradient(180deg, #261212 0%, #1C1C1C 50%, #261212 100%)' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bone sm:text-4xl">Why Choose Dumu Waks?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-steel">
              Everything you need to find and book skilled technicians in Kenya
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Featured card - spans 2 cols */}
            {features.filter(f => f.highlighted).map((feature) => (
              <motion.div
                key={feature.title}
                {...fadeUp}
                className="md:col-span-2"
              >
                <div className="relative overflow-hidden rounded-2xl p-8 sm:p-10 circuit-gradient h-full">
                  <div className="absolute inset-0 opacity-10 circuit-pattern" />
                  <div className="relative">
                    <feature.icon className="mb-4 h-12 w-12 text-white" />
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-lg text-white/80 max-w-xl">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Standard feature cards */}
            {features.filter(f => !f.highlighted).map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={prefersReducedMotion ? {} : { y: -4 }}
              >
                <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 hover:border-strong hover:shadow-mahogany">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-hover">
                    <feature.icon className="h-6 w-6 text-circuit" />
                  </div>
                  <h3 className="text-lg font-semibold text-bone mb-2">{feature.title}</h3>
                  <p className="text-steel text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          HOW IT WORKS - Steps
          ====================================== */}
      <section className="bg-charcoal py-16 px-4 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bone sm:text-4xl">How It Works</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                {/* Step number with glow */}
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl circuit-gradient opacity-20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-circuit/30 bg-circuit/10">
                    <span className="text-2xl font-bold text-circuit">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-bone mb-2">{step.title}</h3>
                <p className="text-steel">{step.description}</p>

                {/* Connector arrow (visible on md+) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center mt-4">
                    <ArrowRight className="h-5 w-5 text-steel/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          SOCIAL PROOF - Testimonials
          ====================================== */}
      <section className="py-16 px-4 sm:py-20" style={{ background: 'linear-gradient(180deg, #1C1C1C 0%, #261212 100%)' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bone sm:text-4xl">What Our Users Say</h2>
            <p className="mt-4 text-steel">Real feedback from real customers</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {[
              {
                name: 'Sarah M.',
                role: 'Homeowner, Nairobi',
                text: 'Found an electrician in minutes! The AI matching is impressive - got exactly the right person for my wiring issue.',
                rating: 5,
              },
              {
                name: 'James K.',
                role: 'Technician, Mombasa',
                text: 'As a plumber, Dumu Waks has connected me with consistent work. The escrow system gives my clients confidence.',
                rating: 5,
              },
              {
                name: 'Grace W.',
                role: 'Business Owner, Kisumu',
                text: 'Transparent pricing and M-Pesa integration make everything seamless. I manage all our office maintenance through this platform.',
                rating: 4,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="glass-card rounded-2xl p-6 h-full">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-bone mb-4 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-circuit/20 text-circuit font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bone">{testimonial.name}</p>
                      <p className="text-xs text-steel">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          CTA SECTION - Final Push
          ====================================== */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 circuit-gradient opacity-90" />
        <div className="absolute inset-0 circuit-pattern opacity-20" />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and technicians across Kenya
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register?role=customer">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:border-white/60 group"
                >
                  Find a Technician Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/register?role=technician">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Become a Technician
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
