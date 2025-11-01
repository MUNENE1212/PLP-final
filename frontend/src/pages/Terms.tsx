import { FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-8 w-8 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Terms of Service
          </h1>
        </div>

        <Card className="p-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last Updated: November 1, 2025
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using EmEnTech's platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">2. Service Description</h2>
              <p>
                EmEnTech provides a platform connecting customers with skilled technicians for various technical services across Kenya. We facilitate bookings, payments, and communications but do not directly provide the technical services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must provide accurate and complete information</li>
                <li>One person or business may not maintain more than one account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">4. Payments and Fees</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customers pay a 20% booking fee upfront, held in escrow</li>
                <li>Remaining 80% paid after service completion</li>
                <li>Platform charges a 10% commission on completed jobs</li>
                <li>All payments processed via M-Pesa</li>
                <li>Refunds processed within 7-14 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">5. Cancellations and Refunds</h2>
              <p>
                Customers may cancel bookings up to 24 hours before scheduled service for a full refund. Cancellations within 24 hours may incur a cancellation fee.  EmEnTech reserves the right to cancel any booking and issue a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">6. User Conduct</h2>
              <p>Users agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Circumvent the platform for direct payments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">7. Limitation of Liability</h2>
              <p>
                EmEnTech acts as an intermediary platform. We are not liable for the quality of services provided by technicians or disputes between users. Our maximum liability is limited to the amount paid for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">8. Contact</h2>
              <p>
                For questions about these Terms, contact us at:
                <br />
                Email: support@ementech.co.ke
                <br />
                Phone: +254 799 954 672
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
