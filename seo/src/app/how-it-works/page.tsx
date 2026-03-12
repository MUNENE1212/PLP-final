import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL, APP_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How Dumu Waks Works - Book a Technician in 3 Simple Steps',
  description:
    'Learn how to book a verified technician on Dumu Waks in 3 easy steps: describe your problem, get matched instantly, book and pay via M-Pesa. Available across all 47 Kenyan counties.',
  alternates: { canonical: `${SITE_URL}/how-it-works` },
  openGraph: {
    title: `How It Works | ${SITE_NAME}`,
    description: 'Book a verified technician in 3 simple steps on Dumu Waks.',
    url: `${SITE_URL}/how-it-works`,
  },
};

const steps = [
  {
    number: '1',
    title: 'Describe Your Problem',
    description:
      'Tell us what needs fixing. Select your service type (plumbing, electrical, carpentry, etc.), describe the issue, and choose your preferred date and time.',
    details: [
      'Choose from 99+ service categories',
      'Add photos of the problem',
      'Set your preferred schedule',
      'Get instant price estimates in KES',
    ],
  },
  {
    number: '2',
    title: 'Get Matched with Verified Technicians',
    description:
      'Our AI-powered system matches you with the best available technicians in under 60 seconds. Compare ratings, reviews, pricing, and availability.',
    details: [
      'AI-powered matching in < 60 seconds',
      'View technician profiles and ratings',
      'Compare prices from multiple technicians',
      'All technicians are ID-verified and background-checked',
    ],
  },
  {
    number: '3',
    title: 'Book & Pay Securely via M-Pesa',
    description:
      'Confirm your booking and pay the 20% booking fee via M-Pesa. The remaining 80% is paid after the job is completed to your satisfaction.',
    details: [
      'Secure M-Pesa STK push payment',
      'Only 20% upfront, 80% after completion',
      'Funds held in escrow for protection',
      'Full refund if not satisfied',
    ],
  },
];

const forTechnicians = [
  {
    number: '1',
    title: 'Create Your Profile',
    description: 'Sign up free, verify your ID, list your skills, service areas, and set your rates.',
  },
  {
    number: '2',
    title: 'Receive Job Requests',
    description: 'Get matched with customers who need your exact skills in your area.',
  },
  {
    number: '3',
    title: 'Complete & Get Paid',
    description: 'Do great work, receive payment directly via M-Pesa. Build your reputation with reviews.',
  },
];

export default function HowItWorksPage() {
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Book a Technician on Dumu Waks',
    description: 'Book a verified maintenance technician in Kenya in 3 simple steps.',
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      name: s.title,
      text: s.description,
      position: parseInt(s.number),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <div className="container section">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>How It Works</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ marginBottom: 12 }}>How Dumu Waks Works</h1>
          <p style={{ color: '#9BA4B0', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Get your repair done in three simple steps. No hassle, no hidden fees.
          </p>
        </div>

        {/* For Customers */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 48, color: '#0090C5' }}>
            For Customers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {steps.map((step) => (
              <div key={step.number} className="glass-card" style={{ padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div className="step-number" style={{ width: 56, height: 56, fontSize: 22 }}>
                  {step.number}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 8, color: '#E0E0E0' }}>{step.title}</h3>
                  <p style={{ color: '#9BA4B0', marginBottom: 16, lineHeight: 1.7 }}>
                    {step.description}
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {step.details.map((detail) => (
                      <li key={detail} style={{ fontSize: 14, color: '#9BA4B0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#0090C5' }}>✓</span> {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href={`${APP_URL}/register?role=customer`} className="btn btn-primary btn-lg">
              Find a Technician Now
            </Link>
          </div>
        </section>

        {/* For Technicians */}
        <section>
          <h2 style={{ textAlign: 'center', marginBottom: 48, color: '#7D4E9F' }}>
            For Technicians
          </h2>
          <div className="grid-3">
            {forTechnicians.map((step) => (
              <div key={step.number} className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
                <div className="step-number" style={{ margin: '0 auto 16px', background: '#7D4E9F' }}>
                  {step.number}
                </div>
                <h3 style={{ marginBottom: 8, color: '#E0E0E0', fontSize: 18 }}>{step.title}</h3>
                <p style={{ color: '#9BA4B0', fontSize: 14, lineHeight: 1.7 }}>{step.description}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link
              href={`${APP_URL}/register?role=technician`}
              className="btn btn-lg"
              style={{ background: '#7D4E9F', color: 'white' }}
            >
              Join as Technician — Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
