import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/app/_components/TopBar';
import { Footer } from '@/app/_components/Footer';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const session = await getSession();
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;

  return (
    <div className="shell">
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 680 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span className="kicker">About</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 500,
            fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.08,
            letterSpacing: '-0.02em', margin: '0 0 32px', textWrap: 'balance',
          }}>
            Proof that people still think interesting thoughts.
          </h1>

          <div style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(17px,1.8vw,20px)',
            lineHeight: 1.75, color: 'var(--ink)',
            display: 'grid', gap: '1.4em', marginBottom: 48,
          }}>
            <p style={{ margin: 0 }}>
              Someone spent three weeks reading about the geopolitics of shipping container ports.
              Someone else knows more about the 1987 Taiwanese election than most Taiwanese people.
              Neither of them had anywhere to put it.
            </p>
            <p style={{ margin: 0 }}>
              Nobody asked for the takeaways. Write it anyway.
            </p>
            <p style={{ margin: 0 }}>
              The most upvoted holes each quarter get printed into a physical book. Yes, physical.
            </p>
          </div>

          <div className="manifesto" style={{ marginBottom: 48 }}>
            <p className="lead">A few things rabbithole is not:</p>
            <p className="strike">Your morning routine.</p>
            <p className="strike">Anything with the word &ldquo;journey&rdquo; in it.</p>
            <p className="strike">5 lessons. 7 habits. 10 things.</p>
            <p>Estimated time: longer than you think.</p>
            <p>You will not use any of this at work.</p>
          </div>

          <Link href="/" className="back-link">← Read something</Link>

        </div>
      </div>

      <Footer />
    </div>
  );
}