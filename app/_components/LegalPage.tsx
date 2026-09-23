import type { ReactNode } from 'react';
import Link from 'next/link';
import { TopBar } from './TopBar';
import { Footer } from './Footer';

type Props = {
  kicker: string;
  title: string;
  lede: ReactNode;
  updated: string;
  currentUser: { username: string } | null;
  children: ReactNode;
};

export function LegalPage({ kicker, title, lede, updated, currentUser, children }: Props) {
  return (
    <div className="shell">
      <TopBar currentUser={currentUser} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div className="legal">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span className="kicker">{kicker}</span>
          </div>

          <h1>{title}</h1>
          <p className="legal-lede">{lede}</p>
          <p className="legal-updated">Last updated {updated}</p>

          {children}

          <div style={{ marginTop: 48 }}>
            <Link href="/" className="back-link">← Read something</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
