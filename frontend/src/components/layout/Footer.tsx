import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
  Users,
  Wrench,
  MessageCircle
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
    ],
    services: [
      { name: 'Find Technicians', path: '/find-technicians' },
      { name: 'Become a Technician', path: '/register?role=technician' },
      { name: 'Service Categories', path: '/services' },
      { name: 'Pricing', path: '/pricing' },
    ],
    support: [
      { name: 'Help Center', path: '/support' },
      { name: 'FAQs', path: '/faq' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'WhatsApp Support', path: '/whatsapp-support' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Refund Policy', path: '/refund-policy' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/ementech', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/ementech', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/ementech', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/ementech', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Wrench className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">EmEnTech</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Kenya's leading platform connecting customers with skilled technicians for emergency repairs,
              maintenance, and engineering services. Available 24/7 across all counties.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500" />
                <a href="tel:+254700000000" className="hover:text-white transition-colors">
                  +254 700 000 000
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500" />
                <a href="mailto:support@ementech.co.ke" className="hover:text-white transition-colors">
                  support@ementech.co.ke
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-500" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Legal Links (mobile inline) */}
            <div className="mt-6 lg:hidden">
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Links (desktop) */}
        <div className="hidden lg:flex items-center justify-between mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-primary-500 mb-2" />
              <h4 className="text-white font-semibold mb-1">Secure Payments</h4>
              <p className="text-gray-400 text-sm">M-Pesa integration with escrow protection</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-primary-500 mb-2" />
              <h4 className="text-white font-semibold mb-1">Verified Technicians</h4>
              <p className="text-gray-400 text-sm">All professionals vetted and rated</p>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="h-8 w-8 text-primary-500 mb-2" />
              <h4 className="text-white font-semibold mb-1">24/7 Support</h4>
              <p className="text-gray-400 text-sm">We're here to help anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} EmEnTech. All rights reserved. Built with ❤️ in Kenya.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Made in Kenya 🇰🇪</span>
              <span>•</span>
              <span>Powered by M-Pesa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
