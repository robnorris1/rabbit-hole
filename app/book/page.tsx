import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/app/_components/TopBar';
import { Footer } from '@/app/_components/Footer';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'The book — rabbithole' };

export default async function BookPage() {
  const session = await getSession();
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;

  return (
    <div className="shell">
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 680 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span className="kicker">The book</span>
            <span className="dot" />
            <span className="mono">Vol. 01 · Founding</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 500,
            fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.08,
            letterSpacing: '-0.02em', margin: '0 0 32px', textWrap: 'balance',
          }}>
            A quarterly book, full of holes.
          </h1>

          <div style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(17px,1.8vw,20px)',
            lineHeight: 1.75, color: 'var(--ink)',
            display: 'grid', gap: '1.4em', marginBottom: 40,
          }}>
            <p style={{ margin: 0 }}>
              Vol. 01 is the founding issue. Top-voted holes go in. Voting is optional, obviously.
            </p>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontStyle: 'italic' }}>
              The book ships with Pro membership — coming once there&apos;s enough to fill one.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/write" style={{
              fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600,
            }}>
              Write something →
            </Link>
            <Link href="/membership" className="back-link">How membership works</Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}