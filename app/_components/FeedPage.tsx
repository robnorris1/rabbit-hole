'use client';

import { useState, useMemo, useCallback, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FeedHole } from '@/db/queries/holes';
import { toggleUpvoteAction } from '@/app/_actions/upvote';
import { TopBar, type CurrentUser } from './TopBar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

const TABS = ['Latest', 'Most lost to', 'This week'] as const;

function UpIcon() {
  return (
    <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V6M6 12l6-6 6 6" />
    </svg>
  );
}

function Vote({ count, voted, onClick }: { count: number; voted: boolean; onClick: () => void }) {
  return (
    <button
      className={'vote' + (voted ? ' voted' : '')}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      title="went down this too"
    >
      <UpIcon aria-hidden />
      <span className="count">{count.toLocaleString()}</span>
      <span className="label">went down this too</span>
    </button>
  );
}

function Featured({ post, count, voted, onVote }: { post: FeedHole; count: number; voted: boolean; onVote: () => void }) {
  return (
    <Link href={`/holes/${post.slug}`} className="featured">
      <div className="featured-tag">
        <span className="kicker">Editor&apos;s rabbit hole</span>
        <span className="dot" />
        <span className="mono">{post.readTimeMins} min</span>
      </div>
      <h2>{post.title}</h2>
      {post.spark && (
        <p className="spark"><b>What started it</b>{post.spark}</p>
      )}
      <div className="row-meta">
        <span className="meta-item"><span className="author">@{post.authorUsername}</span></span>
        <span className="dot" />
        <span className="filters-spacer" />
        <Vote count={count} voted={voted} onClick={onVote} />
      </div>
    </Link>
  );
}

function FeedRow({ post, count, index, layout, voted, onVote }: {
  post: FeedHole;
  count: number;
  index: number;
  layout: 'list' | 'cards';
  voted: boolean;
  onVote: () => void;
}) {
  const voteEl = <Vote count={count} voted={voted} onClick={onVote} />;

  if (layout === 'cards') {
    return (
      <Link href={`/holes/${post.slug}`} className="row">
        <div className="row-top">
          <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
          {voteEl}
        </div>
        <div className="row-body">
          <h3 className="row-title">{post.title}</h3>
          {post.spark && <p className="row-spark"><b>What started it</b>{post.spark}</p>}
          <div className="row-meta">
            <span className="meta-item"><span className="author">@{post.authorUsername}</span></span>
            <span className="meta-item">{post.readTimeMins} min</span>
          </div>
          {post.tags.length > 0 && (
            <div className="tags">{post.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/holes/${post.slug}`} className="row">
      <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
      <div className="row-body">
        <h3 className="row-title">{post.title}</h3>
        {post.spark && <p className="row-spark"><b>What started it</b>{post.spark}</p>}
        <div className="row-meta">
          <span className="meta-item"><span className="author">@{post.authorUsername}</span></span>
          <span className="meta-item">{post.readTimeMins} min</span>
          {post.tags.length > 0 && (
            <div className="tags">{post.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          )}
        </div>
      </div>
      <div className="row-aside">{voteEl}</div>
    </Link>
  );
}

interface Props {
  holes: FeedHole[];
  currentUser?: CurrentUser | null;
  votedIds?: string[];
  weeklyHoleIds?: string[];
  showWelcome?: boolean;
  holeCount?: number;
}

export function FeedPage({ holes, currentUser, votedIds, weeklyHoleIds, showWelcome, holeCount }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<string>(TABS[0]);
  const [welcomeVisible, setWelcomeVisible] = useState(showWelcome ?? false);
  const [votes, setVotes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries((votedIds ?? []).map((id) => [id, true])),
  );
  const [initialVotedSet] = useState<Set<string>>(() => new Set(votedIds ?? []));
  const [layout] = useState<'list' | 'cards'>('list');

  const voteCount = useCallback(
    (post: FeedHole) =>
      post.upvoteCount + (votes[post.id] ? 1 : 0) - (initialVotedSet.has(post.id) ? 1 : 0),
    [votes, initialVotedSet],
  );

  const toggleVote = (id: string) => {
    if (!currentUser) {
      router.push('/auth/sign-in');
      return;
    }
    setVotes((v) => ({ ...v, [id]: !v[id] }));
    startTransition(async () => {
      const result = await toggleUpvoteAction(id);
      if (result.error) {
        setVotes((v) => ({ ...v, [id]: !v[id] }));
        if (result.error === 'sign-in') router.push('/auth/sign-in');
      }
    });
  };

  const filtered = useMemo(() => {
    let list = [...holes];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.spark ?? '', p.authorUsername, ...p.tags].join(' ').toLowerCase().includes(q)
      );
    }
    if (tab === 'Most lost to') {
      list.sort((a, b) => voteCount(b) - voteCount(a));
    } else if (tab === 'This week') {
      const order = new Map((weeklyHoleIds ?? []).map((id, i) => [id, i]));
      list = list.filter((h) => order.has(h.id));
      list.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }
    return list;
  }, [holes, query, tab, voteCount, weeklyHoleIds]);

  const featuredPost = !query.trim() && tab === TABS[0] ? holes.find((h) => h.featured) : null;
  const listPosts = featuredPost ? filtered.filter((h) => !h.featured) : filtered;

  function emptyState() {
    if (query.trim()) {
      return 'Nothing in the rabbit hole that matches that. Maybe you should write it.';
    }
    if (tab === 'This week') {
      return 'Nothing went viral this week. Too early, or everyone\'s still reading.';
    }
    return 'Nobody\'s watching. Perfect time to write something weird.';
  }

  return (
    <div className="shell">
      <TopBar query={query} onQuery={setQuery} currentUser={currentUser} />

      {welcomeVisible && (
        <div className="welcome-banner">
          <div className="welcome-banner-in">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
              <p className="welcome-heading">It begins.</p>
              <Link href="/write" className="welcome-cta">Write your first rabbit hole →</Link>
            </div>
            <button className="welcome-dismiss" onClick={() => setWelcomeVisible(false)} aria-label="Dismiss">×</button>
          </div>
        </div>
      )}

      <section className="masthead">
        <div className="wrap">
          <div className="masthead-meta">
            <span className="kicker">Founding</span>
            {holeCount != null && (
              <>
                <span className="dot" />
                <span className="mono">{holeCount} rabbit {holeCount === 1 ? 'hole' : 'holes'}</span>
              </>
            )}
          </div>
          <h1>The internet&apos;s most specific knowledge. <em>None of it useful.</em></h1>
          <p className="lede">
            Long reads about things nobody asked about. You&apos;re welcome.
          </p>
        </div>
      </section>

      <div className="filters">
        <div className="filters-in">
          {TABS.map((t) => (
            <button key={t} className={'tab' + (t === tab ? ' active' : '')} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

<div className="wrap">
        <div className="main">
          <main>
            {featuredPost && (
              <Featured post={featuredPost} count={voteCount(featuredPost)} voted={!!votes[featuredPost.id]} onVote={() => toggleVote(featuredPost.id)} />
            )}

            {listPosts.length === 0 ? (
              <div style={{ padding: '60px 0', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--ink-2)' }}>
                {emptyState()}
              </div>
            ) : (
              <div className={`feed layout-${layout}`}>
                {listPosts.map((p, i) => (
                  <FeedRow key={p.id} post={p} count={voteCount(p)} index={i} layout={layout} voted={!!votes[p.id]} onVote={() => toggleVote(p.id)} />
                ))}
              </div>
            )}
          </main>

          <Sidebar />
        </div>
      </div>

      <Footer />
    </div>
  );
}
