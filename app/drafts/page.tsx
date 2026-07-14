import type { Metadata } from 'next';
import Link from 'next/link';
import { TopBar } from '@/app/_components/TopBar';
import { Footer } from '@/app/_components/Footer';
import { getDraftsByAuthor } from '@/db/queries/holes';
import { requireSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'Drafts' };

export default async function DraftsPage() {
  const session = await requireSession();
  const currentUser = await getUserByCognitoSub(session.sub);
  const drafts = currentUser ? await getDraftsByAuthor(currentUser.id) : [];

  return (
    <div className="shell">
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 680 }}>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 48 }}>
            <h1 style={{
              fontFamily: 'var(--serif)', fontWeight: 500,
              fontSize: 'clamp(24px,3vw,36px)', margin: 0,
            }}>
              Drafts
            </h1>
            <Link
              href="/write"
              style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--accent)' }}
            >
              + New hole
            </Link>
          </div>

          {drafts.length === 0 ? (
            <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink-2)', fontStyle: 'italic' }}>
              Nobody&apos;s watching. Perfect time to write something weird.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {drafts.map((d) => (
                <li key={d.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <Link
                    href={`/write?id=${d.id}`}
                    style={{ display: 'block', padding: '20px 0' }}
                  >
                    <p style={{
                      fontFamily: 'var(--serif)', fontWeight: 500,
                      fontSize: 20, margin: '0 0 6px', color: 'var(--ink)',
                      transition: 'color .2s',
                    }}>
                      {d.title || <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>Untitled</span>}
                    </p>
                    <p style={{
                      fontFamily: 'var(--mono)', fontSize: 11,
                      letterSpacing: '.08em', textTransform: 'uppercase',
                      color: 'var(--ink-3)', margin: 0,
                    }}>
                      Last edited {new Date(d.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}