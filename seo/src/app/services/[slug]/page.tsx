import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_NAME, SITE_URL, SERVICES, APP_URL, COUNTIES } from '@/lib/constants';

interface Props {
  params: { slug: string };
}

function getService(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const service = getService(params.slug);
  if (!service) return {};

  const title = `${service.name} Services in Kenya - Find Verified ${service.name} Technicians`;
  const description = `${service.description} Book trusted ${service.name.toLowerCase()} technicians across all 47 Kenyan counties. Transparent pricing, M-Pesa payments, satisfaction guaranteed.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/services/${service.slug}` },
    openGraph: {
      title: `${service.name} Services | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/services/${service.slug}`,
    },
    keywords: [
      ...service.keywords,
      `${service.name.toLowerCase()} Kenya`,
      `${service.name.toLowerCase()} Nairobi`,
      `${service.name.toLowerCase()} near me`,
      `best ${service.name.toLowerCase()} Kenya`,
      `affordable ${service.name.toLowerCase()}`,
    ],
  };
}

export default function ServicePage({ params }: Props) {
  const service = getService(params.slug);
  if (!service) return notFound();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
      { '@type': 'ListItem', position: 3, name: service.name, item: `${SITE_URL}/services/${service.slug}` },
    ],
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} Services`,
    description: service.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: COUNTIES.map((c) => ({
      '@type': 'City',
      name: c,
      containedInPlace: { '@type': 'Country', name: 'Kenya' },
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} Services`,
      itemListElement: service.keywords.map((kw) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: kw.charAt(0).toUpperCase() + kw.slice(1),
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <div className="container section">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/services">Services</Link>
          <span>/</span>
          <span>{service.name}</span>
        </nav>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{service.icon}</div>
          <h1 style={{ marginBottom: 12 }}>
            {service.name} Services in Kenya
          </h1>
          <p style={{ color: '#9BA4B0', maxWidth: 700, fontSize: 18, lineHeight: 1.7 }}>
            {service.description} Book verified {service.name.toLowerCase()} technicians on Dumu Waks
            with transparent pricing and M-Pesa payments.
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <Link href={`${APP_URL}/register?role=customer`} className="btn btn-primary btn-lg">
              Find {service.name} Technicians
            </Link>
          </div>
        </div>

        {/* What We Cover */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 24 }}>What Our {service.name} Technicians Cover</h2>
          <div className="grid-3">
            {service.keywords.map((keyword) => (
              <div key={keyword} className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, color: '#E0E0E0', marginBottom: 4 }}>
                  {keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                </h3>
                <p style={{ fontSize: 13, color: '#9BA4B0' }}>
                  Professional {keyword.toLowerCase()} services by verified technicians
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Service Areas */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ marginBottom: 16 }}>{service.name} Services Available In</h2>
          <p style={{ color: '#9BA4B0', marginBottom: 24 }}>
            We have verified {service.name.toLowerCase()} technicians across Kenya, including:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {COUNTIES.map((county) => (
              <span
                key={county}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(0, 144, 197, 0.1)',
                  border: '1px solid rgba(0, 144, 197, 0.2)',
                  fontSize: 13,
                  color: '#0090C5',
                }}
              >
                {county}
              </span>
            ))}
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(125, 78, 159, 0.1)',
                border: '1px solid rgba(125, 78, 159, 0.2)',
                fontSize: 13,
                color: '#7D4E9F',
              }}
            >
              + 37 more counties
            </span>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="glass-card" style={{ padding: 32, marginBottom: 48 }}>
          <h2 style={{ marginBottom: 24 }}>Why Choose Dumu Waks for {service.name}?</h2>
          <div className="grid-2" style={{ gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, color: '#0090C5', marginBottom: 8 }}>Verified Professionals</h3>
              <p style={{ fontSize: 14, color: '#9BA4B0' }}>
                Every {service.name.toLowerCase()} technician is background-checked, ID-verified, and skills-assessed.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 16, color: '#0090C5', marginBottom: 8 }}>Transparent Pricing</h3>
              <p style={{ fontSize: 14, color: '#9BA4B0' }}>
                See exact costs in KES before booking. No hidden fees or surprise charges.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 16, color: '#0090C5', marginBottom: 8 }}>Secure M-Pesa Payments</h3>
              <p style={{ fontSize: 14, color: '#9BA4B0' }}>
                Pay 20% upfront via M-Pesa, rest after the job is done to your satisfaction.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 16, color: '#0090C5', marginBottom: 8 }}>Satisfaction Guaranteed</h3>
              <p style={{ fontSize: 14, color: '#9BA4B0' }}>
                Not happy? Get a full refund. We hold payments in escrow for your protection.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Need {service.name} Help?</h2>
          <p style={{ color: '#9BA4B0', marginBottom: 24, fontSize: 18 }}>
            Get matched with a verified {service.name.toLowerCase()} technician in under 60 seconds.
          </p>
          <Link href={`${APP_URL}/register?role=customer`} className="btn btn-primary btn-lg">
            Book a {service.name} Technician Now
          </Link>
        </div>
      </div>
    </>
  );
}
