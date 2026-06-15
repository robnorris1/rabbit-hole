'use client';

import { useState, useMemo, useCallback, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FeedHole, DeepItem } from '@/db/queries/holes';
import { toggleUpvoteAction } from '@/app/_actions/upvote';
import { TopBar, type CurrentUser } from './TopBar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

const TABS = ['Latest', 'Most lost to', 'Going deep now', 'Shortest detours'] as const;

function UpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <p className="spark"><b>What sparked it</b>{post.spark}</p>
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
          {post.spark && <p className="row-spark"><b>Sparked by</b>{post.spark}</p>}
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
        {post.spark && <p className="row-spark"><b>Sparked by</b>{post.spark}</p>}
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
  deep: DeepItem[];
  currentUser?: CurrentUser | null;
  votedIds?: string[];
}

export function FeedPage({ holes, deep, currentUser, votedIds }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<string>(TABS[0]);
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
    if (tab === 'Most lost to' || tab === 'Going deep now') {
      list.sort((a, b) => voteCount(b) - voteCount(a));
    } else if (tab === 'Shortest detours') {
      list.sort((a, b) => a.readTimeMins - b.readTimeMins);
    }
    return list;
  }, [holes, query, tab, voteCount]);

  const featuredPost = !query.trim() && tab === TABS[0] ? holes.find((h) => h.featured) : null;
  const listPosts = featuredPost ? filtered.filter((h) => !h.featured) : filtered;

  return (
    <div className="shell">
      <TopBar query={query} onQuery={setQuery} currentUser={currentUser} />

      <section className="masthead">
        <div className="wrap">
          <div className="masthead-meta">
            <span className="kicker">Founding</span>
            <span className="dot" />
            <span className="mono">Invite-only</span>
            <span className="dot" />
            <span className="mono">Sat, 14 Jun 2026</span>
          </div>
          <h1>Not every rabbit hole is worth it. These <em>are</em>.</h1>
          <p className="lede">
            Written by people who know too much about one specific thing.
            You&apos;re about to as well.
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
          <span className="filters-spacer" />
          <span className="sort-note">{filtered.length} rabbit holes</span>
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
                Nobody&apos;s watching. Perfect time to write something weird.
              </div>
            ) : (
              <div className={`feed layout-${layout}`}>
                {listPosts.map((p, i) => (
                  <FeedRow key={p.id} post={p} count={voteCount(p)} index={i} layout={layout} voted={!!votes[p.id]} onVote={() => toggleVote(p.id)} />
                ))}
              </div>
            )}
          </main>

          <Sidebar deep={deep} />
        </div>
      </div>

      <Footer />
    </div>
  );
}