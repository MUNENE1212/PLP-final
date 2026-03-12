import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL, APP_URL } from '@/lib/constants';
import { getPublicStats } from '@/lib/api';

export const metadata: Metadata = {
  title: 'About Dumu Waks - Kenya\'s Trusted Maintenance & Repair Platform',
  description:
    'Learn about Dumu Waks - connecting Kenyans with verified, skilled technicians for quality home and business maintenance services across all 47 counties.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: 'Your trusted platform for professional maintenance and repair services in Kenya.',
    url: `${SITE_URL}/about`,
  },
};

const values = [
  {
    icon: '🛡️',
    title: 'Quality',
    description: 'We maintain the highest standards by thoroughly vetting every technician on Dumu Waks.',
  },
  {
    icon: '⚡',
    title: 'Transparency',
    description: 'See exact pricing before booking. No hidden fees with Dumu Waks.',
  },
  {
    icon: '❤️',
    title: 'Reliability',
    description: 'We show up when you need us. Fast response times, 24/7 emergency support.',
  },
  {
    icon: '🏆',
    title: 'Community',
    description: 'Building trust between Kenyan technicians and customers, one job at a time.',
  },
];

export default async function AboutPage() {
  const statsRes = await getPublicStats();
  const stats = statsRes?.data;

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    description: 'Your trusted platform for professional maintenance and repair services in Kenya.',
    url: `${SITE_URL}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      foundingLocation: { '@type': 'Country', name: 'Kenya' },
      description: 'Connecting Kenyans with verified, skilled technicians for quality maintenance services.',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* Hero */}
      <section className="hero-gradient" style={{ padding: '64px 0' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>About</span>
          </nav>
          <h1 style={{ marginBottom: 16 }}>About Dumu Waks</h1>
          <p style={{ color: '#9BA4B0', maxWidth: 700, fontSize: 18, lineHeight: 1.7 }}>
            Your trusted platform for professional maintenance and repair services in Kenya.
            Connecting skilled technicians with quality-conscious customers across all 47 counties.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: 'start' }}>
            <div>
              <h2 style={{ marginBottom: 16 }}>🎯 Our Mission</h2>
              <p style={{ color: '#9BA4B0', lineHeight: 1.8, marginBottom: 16 }}>
                To connect Kenyans with reliable, skilled technicians for quality home and business
                maintenance services. We&apos;re making professional repairs accessible, affordable,
                and stress-free for everyone.
              </p>
              <p style={{ color: '#9BA4B0', lineHeight: 1.8 }}>
                Whether you need emergency plumbing at midnight or routine appliance maintenance,
                Dumu Waks ensures you get the right technician, at the right price, exactly when you need them.
              </p>
            </div>
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ marginBottom: 16 }}>🔭 Our Vision</h2>
              <p style={{ color: '#9BA4B0', lineHeight: 1.8 }}>
                To be Kenya&apos;s most trusted platform for maintenance and repair services, where every technician
                is verified, every price is transparent, and every customer is satisfied. We&apos;re building a future
                where finding quality help is never a hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'white' }}>
                {stats?.totalCustomers?.toLocaleString() || '10,000+'}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Happy Customers</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'white' }}>
                {stats?.totalTechnicians?.toLocaleString() || '500+'}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Verified Technicians</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'white' }}>47</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Counties Covered</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'white' }}>24/7</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Emergency Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Our Core Values</h2>
            <p style={{ color: '#9BA4B0' }}>These principles guide everything we do.</p>
          </div>
          <div className="grid-4">
            {values.map((v) => (
              <div key={v.title} className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{v.icon}</div>
                <h3 style={{ fontSize: 18, marginBottom: 8, color: '#E0E0E0' }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: '#9BA4B0' }}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>The Dumu Waks Story</h2>
          <div style={{ color: '#9BA4B0', lineHeight: 1.8, fontSize: 16 }}>
            <p style={{ marginBottom: 16 }}>
              Dumu Waks was born from a simple frustration: finding a reliable technician in Kenya
              shouldn&apos;t be this hard. Whether it&apos;s a burst pipe at 2 AM or a faulty appliance
              before a big family gathering, we&apos;ve all experienced the stress of emergency repairs.
            </p>
            <p style={{ marginBottom: 16 }}>
              We asked ourselves: why can&apos;t finding a trustworthy technician be as simple as
              ordering a ride? Why do Kenyans have to rely on word-of-mouth or gamble with
              unverified contacts?
            </p>
            <p style={{ marginBottom: 16 }}>
              So we built Dumu Waks — a platform that connects you with verified, skilled technicians
              in under 60 seconds. With AI-powered matching, transparent M-Pesa payments, and a
              quality guarantee, we&apos;re making home maintenance stress-free.
            </p>
            <p style={{ marginBottom: 16 }}>
              Today, Dumu Waks serves customers across all 47 Kenyan counties, offering everything
              from plumbing and electrical work to carpentry and appliance repair. Every technician
              on our platform is background-checked, every price is upfront, and every job is
              backed by our satisfaction guarantee.
            </p>
            <p style={{ fontWeight: 600, color: '#E0E0E0' }}>
              We&apos;re not just fixing things — we&apos;re building trust, one repair at a time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: 12 }}>Ready to Experience the Dumu Waks Difference?</h2>
          <p style={{ color: '#9BA4B0', marginBottom: 32, fontSize: 18, maxWidth: 600, margin: '0 auto 32px' }}>
            Join thousands of satisfied customers across Kenya.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`${APP_URL}/register?role=customer`} className="btn btn-primary btn-lg">
              Find a Technician
            </Link>
            <Link href={`${APP_URL}/register?role=technician`} className="btn btn-secondary btn-lg">
              Join as Technician
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
