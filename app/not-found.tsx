import Link from 'next/link';
import { TopBar } from './_components/TopBar';
import { Footer } from './_components/Footer';

export default function NotFound() {
  return (
    <div className="shell">
      <TopBar currentUser={null} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span className="kicker">404</span>
            <span className="dot" />
            <span className="mono">Hole not found</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 500,
            fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.08,
            letterSpacing: '-0.02em', margin: '0 0 24px', textWrap: 'balance',
          }}>
            You went too deep.
          </h1>

          <p style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(16px,1.8vw,20px)',
            color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 40px', maxWidth: '48ch',
          }}>
            This hole doesn&apos;t exist. Or it did, and someone filled it in.
            Either way, you&apos;re somewhere the map doesn&apos;t reach.
          </p>

          <Link href="/" className="back-link">← Back to the surface</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}