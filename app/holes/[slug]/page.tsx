import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getHoleBySlug } from '@/db/queries/holes';
import { getTimeStat } from '@/app/_lib/time-stats';
import { EndOfHole } from '@/app/_components/EndOfHole';
import { FirstPublishOverlay } from '@/app/_components/FirstPublishOverlay';
import { TopBar } from '@/app/_components/TopBar';
import { ScrollProgress } from '@/app/_components/ScrollProgress';
import { Footer } from '@/app/_components/Footer';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';
import { isUpvoted } from '@/db/queries/upvotes';
import { hasFlagged } from '@/db/queries/flags';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hole = await getHoleBySlug(slug);
  if (!hole) return {};
  return {
    title: `${hole.title} — rabbithole`,
    description: hole.body.split('\n\n')[0].slice(0, 160) || undefined,
  };
}

export default async function HolePage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const isFirstPublish = sp.first === '1';
  const [hole, session] = await Promise.all([getHoleBySlug(slug), getSession()]);
  if (!hole) notFound();
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;
  const isAuthor = currentUser?.username === hole.authorUsername;
  const [initialVoted, initialFlagged] = await Promise.all([
    currentUser ? isUpvoted(currentUser.id, hole.id) : false,
    currentUser && !isAuthor ? hasFlagged(currentUser.id, hole.id) : false,
  ]);

  const publishedDate = hole.publishedAt
    ? new Date(hole.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const timeStat = getTimeStat(hole.readTimeMins, slug);

  return (
    <div className="shell">
      <ScrollProgress />
      {isFirstPublish && <FirstPublishOverlay />}
      <TopBar currentUser={currentUser ? { username: currentUser.username } : null} />

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
        <div style={{ maxWidth: 680 }}>
          <nav style={{ marginBottom: 40 }}>
            <Link href="/" className="back-link">← rabbithole</Link>
          </nav>

          <article>
            <header style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span className="kicker">Rabbit hole</span>
                <span className="dot" />
                <span className="mono">{hole.readTimeMins} min hole</span>
              </div>

              <h1 style={{
                fontFamily: 'var(--serif)', fontWeight: 500,
                fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.08,
                letterSpacing: '-0.02em', margin: '0 0 20px', textWrap: 'balance',
              }}>
                {hole.title}
              </h1>

              <div className="row-meta">
                <span className="meta-item"><span className="author">@{hole.authorUsername}</span></span>
                {publishedDate && (
                  <>
                    <span className="dot" />
                    <span className="mono" style={{ textTransform: 'none', letterSpacing: 0 }}>{publishedDate}</span>
                  </>
                )}
                {isAuthor && (
                  <>
                    <span className="dot" />
                    <Link href={`/write?id=${hole.id}`} className="mono" style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Edit</Link>
                  </>
                )}
              </div>
            </header>

            <div style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(17px,1.8vw,20px)',
              lineHeight: 1.75, color: 'var(--ink)',
              display: 'grid', gap: '1.4em',
            }}>
              {hole.body.split('\n\n').map((para, i) => (
                <p key={i} style={{ margin: 0 }}>{para}</p>
              ))}
            </div>

            {hole.tags.length > 0 && (
              <div className="tags" style={{ marginTop: 32 }}>
                {hole.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            )}

            <EndOfHole
              readTimeMins={hole.readTimeMins}
              upvoteCount={hole.upvoteCount}
              timeStat={timeStat}
              holeId={hole.id}
              initialVoted={initialVoted}
              isSignedIn={!!currentUser}
              showFlag={!isAuthor}
              initialFlagged={initialFlagged}
            />
          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}