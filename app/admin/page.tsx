import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { getFlaggedHoles } from '@/db/queries/flags';
import { TopBar } from '@/app/_components/TopBar';
import { Footer } from '@/app/_components/Footer';
import { unpublishHoleAction, dismissFlagsAction } from './actions';

export const metadata: Metadata = { title: 'Admin — rabbithole' };

export default async function AdminPage() {
  const session = await getSession();
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;

  if (!currentUser || currentUser.username !== process.env.ADMIN_USERNAME) {
    notFound();
  }

  const flagged = await getFlaggedHoles();

  return (
    <div className="shell">
      <TopBar currentUser={{ username: currentUser.username }} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 780 }}>

          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 'clamp(24px,3vw,36px)', margin: '0 0 8px' }}>
              The Committee
            </h1>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: 0 }}>
              {flagged.length} {flagged.length === 1 ? 'complaint' : 'complaints'} received
            </p>
          </div>

          {flagged.length === 0 ? (
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-2)' }}>
              Nothing flagged. Either everyone&apos;s behaving or nobody&apos;s reading.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {flagged.map((hole) => (
                <li key={hole.id} style={{ borderBottom: '1px solid var(--line)', padding: '28px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: hole.status === 'published' ? 'var(--accent)' : 'var(--ink-3)' }}>
                          {hole.flagCount} {hole.flagCount === 1 ? 'flag' : 'flags'}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                          {hole.status}
                        </span>
                      </div>

                      {hole.slug ? (
                        <Link href={`/holes/${hole.slug}`} target="_blank" style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 20, color: 'var(--ink)' }}>
                          {hole.title}
                        </Link>
                      ) : (
                        <span style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 20 }}>{hole.title}</span>
                      )}

                      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.04em', color: 'var(--ink-3)', margin: '6px 0 12px', textTransform: 'uppercase' }}>
                        @{hole.authorUsername}
                      </p>

                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 5 }}>
                        {hole.reasons.map((r, i) => (
                          <li key={i} style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-2)' }}>
                            &ldquo;{r}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <form action={dismissFlagsAction.bind(null, hole.id)}>
                        <button type="submit" className="admin-dismiss">
                          Dismiss
                        </button>
                      </form>
                      {hole.status === 'published' && (
                        <form action={unpublishHoleAction.bind(null, hole.id)}>
                          <button type="submit" className="admin-unpublish">
                            Unpublish
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
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