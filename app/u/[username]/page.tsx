import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TopBar } from '@/app/_components/TopBar';
import { Footer } from '@/app/_components/Footer';
import { getUserByUsername } from '@/db/queries/users';
import { getHolesByAuthorId } from '@/db/queries/holes';
import { getFollowCounts, isFollowing } from '@/db/queries/follows';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { toggleFollowAction } from './actions';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} — rabbithole` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const [profileUser, session] = await Promise.all([getUserByUsername(username), getSession()]);
  if (!profileUser) notFound();

  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;

  const [holes, counts, following] = await Promise.all([
    getHolesByAuthorId(profileUser.id),
    getFollowCounts(profileUser.id),
    currentUser && currentUser.id !== profileUser.id
      ? isFollowing(currentUser.id, profileUser.id)
      : Promise.resolve(false),
  ]);

  const isOwnProfile = currentUser?.id === profileUser.id;
  const toggleWithUsername = toggleFollowAction.bind(null, username);

  return (
    <div className="shell">
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 680 }}>

          <header style={{ marginBottom: 48, paddingBottom: 40, borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--serif)', fontWeight: 500,
                  fontSize: 'clamp(24px,3vw,36px)', margin: '0 0 6px', letterSpacing: '-0.02em',
                }}>
                  @{profileUser.username}
                </h1>
                {profileUser.bio && (
                  <p style={{
                    fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-2)',
                    lineHeight: 1.55, margin: '12px 0 0', maxWidth: '48ch',
                  }}>
                    {profileUser.bio}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                    <strong style={{ color: 'var(--ink)' }}>{counts.followers}</strong> followers
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                    <strong style={{ color: 'var(--ink)' }}>{counts.following}</strong> following
                  </span>
                </div>
              </div>

              {!isOwnProfile && currentUser && (
                <form action={toggleWithUsername}>
                  <button
                    type="submit"
                    className={following ? 'btn-follow-active' : 'btn-follow'}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                </form>
              )}

              {isOwnProfile && (
                <Link href="/drafts" className="btn-follow">
                  Drafts
                </Link>
              )}
            </div>
          </header>

          <section>
            <h2 style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em',
              textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 28px',
            }}>
              {holes.length} rabbit {holes.length === 1 ? 'hole' : 'holes'}
            </h2>

            {holes.length === 0 ? (
              <p style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink-2)', fontStyle: 'italic' }}>
                Nothing published yet. The silence is deafening.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {holes.map((h) => (
                  <li key={h.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <Link href={`/holes/${h.slug}`} style={{ display: 'block', padding: '22px 0' }}>
                      <p style={{
                        fontFamily: 'var(--serif)', fontWeight: 500,
                        fontSize: 20, margin: '0 0 6px', color: 'var(--ink)',
                        transition: 'color .2s',
                      }}>
                        {h.title}
                      </p>
                      {h.spark && (
                        <p style={{
                          fontFamily: 'var(--serif)', fontStyle: 'italic',
                          fontSize: 15, color: 'var(--ink-2)', margin: '0 0 8px',
                        }}>
                          {h.spark}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                          {h.readTimeMins} min
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                          {h.upvoteCount.toLocaleString()} went down this too
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}