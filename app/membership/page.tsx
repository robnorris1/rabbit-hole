import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/app/_components/TopBar';
import { Footer } from '@/app/_components/Footer';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'Membership' };

export default async function MembershipPage() {
  const session = await getSession();
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;

  return (
    <div className="shell">
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 680 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span className="kicker">Pro</span>
            <span className="dot" />
            <span className="mono">Coming soon</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 500,
            fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.08,
            letterSpacing: '-0.02em', margin: '0 0 32px', textWrap: 'balance',
          }}>
            The best rabbit holes, on paper.
          </h1>

          <div style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(17px,1.8vw,20px)',
            lineHeight: 1.75, color: 'var(--ink)',
            display: 'grid', gap: '1.4em', marginBottom: 40,
          }}>
            <p style={{ margin: 0 }}>
              Four times a year, the top-voted holes get printed into a book. £9/mo, billed quarterly.
            </p>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontStyle: 'italic' }}>
              We&apos;re writing the thing first. Membership opens once there&apos;s enough worth paying for.
            </p>
          </div>

          <Link href="/" className="back-link">← Back to the holes</Link>

        </div>
      </div>

      <Footer />
    </div>
  );
}