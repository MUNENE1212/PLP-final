import { useState } from 'react';
import { MessageCircle, Send, Clock, CheckCircle, Wrench, Calendar, Phone, MessageSquare } from 'lucide-react';
import { Button, Card } from '@/components/ui';

const WHATSAPP_NUMBER = '254799954672';

interface BookingDetails {
  serviceType: string;
  urgency: string;
  location: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  contactName: string;
  contactPhone: string;
}

const WhatsAppSupport = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    serviceType: '',
    urgency: 'normal',
    location: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    contactName: '',
    contactPhone: '',
  });

  const serviceTypes = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'HVAC',
    'Roofing',
    'Masonry',
    'Welding',
    'Solar Installation',
    'Home Appliance Repair',
    'Other',
  ];

  const urgencyLevels = [
    { value: 'emergency', label: 'Emergency (Within 4 hours)', color: 'text-red-600' },
    { value: 'high', label: 'High (Within 24 hours)', color: 'text-orange-600' },
    { value: 'normal', label: 'Normal (Within 3 days)', color: 'text-blue-600' },
    { value: 'low', label: 'Low (Flexible)', color: 'text-green-600' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingDetails({
      ...bookingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const generateWhatsAppMessage = () => {
    const message = `
🔧 *NEW SERVICE REQUEST*

📋 *Service Details:*
- Service Type: ${bookingDetails.serviceType}
- Urgency: ${urgencyLevels.find(u => u.value === bookingDetails.urgency)?.label}
- Location: ${bookingDetails.location}

📝 *Description:*
${bookingDetails.description}

📅 *Preferred Schedule:*
- Date: ${bookingDetails.preferredDate || 'Not specified'}
- Time: ${bookingDetails.preferredTime || 'Not specified'}

👤 *Contact Information:*
- Name: ${bookingDetails.contactName}
- Phone: ${bookingDetails.contactPhone}

Please help me find a suitable technician for this job. Thank you!
    `.trim();

    return message;
  };

  const sendToWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const isFormValid = () => {
    return (
      bookingDetails.serviceType &&
      bookingDetails.location &&
      bookingDetails.description &&
      bookingDetails.contactName &&
      bookingDetails.contactPhone
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <MessageCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            WhatsApp Support Booking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Can't find a technician online? No problem! Fill out this form and our support team
            will help you book a technician via WhatsApp.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Fast Response</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get a reply within minutes
            </p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Verified Techs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We match you with trusted professionals
            </p>
          </Card>
          <Card className="p-4 text-center">
            <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">24/7 Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We're here anytime you need us
            </p>
          </Card>
        </div>

        {/* Booking Form */}
        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <Wrench className="h-6 w-6 mr-2 text-primary-600" />
            Service Request Details
          </h2>

          <div className="space-y-6">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Type *
              </label>
              <select
                name="serviceType"
                value={bookingDetails.serviceType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select a service...</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setBookingDetails({ ...bookingDetails, urgency: level.value })}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      bookingDetails.urgency === level.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <span className={`font-medium ${level.color}`}>{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location/Address *
              </label>
              <input
                type="text"
                name="location"
                value={bookingDetails.location}
                onChange={handleChange}
                placeholder="e.g., Juja, Kiambu County"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problem Description *
              </label>
              <textarea
                name="description"
                value={bookingDetails.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Preferred Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Date (Optional)
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={bookingDetails.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Time (Optional)
                </label>
                <input
                  type="time"
                  name="preferredTime"
                  value={bookingDetails.preferredTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Your Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={bookingDetails.contactName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={bookingDetails.contactPhone}
                    onChange={handleChange}
                    placeholder="+254 700 000 000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={sendToWhatsApp}
                disabled={!isFormValid()}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Send Request via WhatsApp</span>
                <Send className="h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                You'll be redirected to WhatsApp with your pre-filled request
              </p>
            </div>
          </div>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Need immediate help?{' '}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Chat with us directly on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSupport;
