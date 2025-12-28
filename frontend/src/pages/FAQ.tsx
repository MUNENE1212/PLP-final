import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I book a technician on Dumu Waks?',
      answer: 'Simply describe your problem, get matched with verified technicians in under 60 seconds, see the exact pricing in KES, choose your preferred date/time, and pay the 20% booking fee via M-Pesa. Your technician will arrive at the scheduled time.',
    },
    {
      question: 'Is the booking fee refundable?',
      answer: 'Yes! The 20% booking fee is fully refundable if the technician doesn\'t show up or if you\'re not satisfied with the service. Dumu Waks holds funds in escrow for your protection.',
    },
    {
      question: 'How are technicians verified on Dumu Waks?',
      answer: 'All technicians undergo background checks, ID verification, and skills assessment. They\'re also continuously rated by customers after each job, ensuring only the best serve you.',
    },
    {
      question: 'What payment methods does Dumu Waks accept?',
      answer: 'We accept M-Pesa for all payments. It\'s fast, secure, and the most trusted payment method in Kenya. You pay 20% upfront and 80% after satisfactory service completion.',
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'Contact Dumu Waks support immediately. We\'ll mediate the dispute and can refund your payment if the issue isn\'t resolved. Your satisfaction is guaranteed - if you\'re not happy, you don\' pay.',
    },
    {
      question: 'How much does Dumu Waks charge?',
      answer: 'Dumu Waks charges a small 10% platform fee on completed jobs. You\'ll see the exact cost breakdown before booking - no hidden fees or surprises.',
    },
    {
      question: 'Can I cancel a booking on Dumu Waks?',
      answer: 'Yes, you can cancel up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may incur a small cancellation fee to compensate the technician\'s time.',
    },
    {
      question: 'Does Dumu Waks offer emergency services?',
      answer: 'Yes! We have technicians available 24/7 for emergency plumbing, electrical issues, and other urgent repairs across Kenya. Emergency services may have higher fees due to urgency.',
    },
    {
      question: 'How do I become a technician on Dumu Waks?',
      answer: 'Register as a technician, verify your skills and national ID, complete your profile with your service areas and rates, and start receiving job requests. It\'s free to join Dumu Waks!',
    },
    {
      question: 'What areas does Dumu Waks serve in Kenya?',
      answer: 'Dumu Waks serves all 47 counties in Kenya, including Nairobi, Mombasa, Kisumu, Nakuru, and all major towns. If we don\'t have technicians in your area yet, contact us via WhatsApp and we\'ll work to expand coverage.',
    },
    {
      question: 'How quickly can I get a technician?',
      answer: 'Our AI-powered matching system connects you with the right technician in under 60 seconds. Many same-day and emergency bookings are completed within 24 hours, depending on your location and service type.',
    },
    {
      question: 'What types of services does Dumu Waks offer?',
      answer: 'Dumu Waks offers plumbing, electrical work, carpentry, appliance repair, home maintenance, business maintenance, general repairs, and more. We cover 99+ service categories for home and business needs.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full">
              <HelpCircle className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions about Dumu Waks
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-primary-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Still Have Questions */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            We're here to help! Contact our support team anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/support"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/whatsapp-support"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
