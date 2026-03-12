import Link from 'next/link';
import { SITE_NAME, APP_URL } from '@/lib/constants';

export default function Header() {
  return (
    <header
      style={{
        background: 'rgba(28, 28, 28, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(155, 164, 176, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <nav className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 20, color: '#E0E0E0' }}>
          <span style={{ color: '#0090C5' }}>Dumu</span>
          <span>Waks</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/services" style={{ color: '#9BA4B0', fontSize: 14 }}>Services</Link>
          <Link href="/about" style={{ color: '#9BA4B0', fontSize: 14 }}>About</Link>
          <Link href="/faq" style={{ color: '#9BA4B0', fontSize: 14 }}>FAQ</Link>
          <Link
            href={`${APP_URL}/register`}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
