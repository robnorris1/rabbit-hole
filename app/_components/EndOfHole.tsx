'use client';

import { useEffect, useRef, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Rabbit } from './Rabbit';
import { toggleUpvoteAction } from '@/app/_actions/upvote';

interface Props {
  readTimeMins: number;
  upvoteCount: number;
  timeStat: string;
  holeId: string;
  initialVoted: boolean;
  isSignedIn: boolean;
}

function UpIcon() {
  return (
    <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V6M6 12l6-6 6 6" />
    </svg>
  );
}

export function EndOfHole({ readTimeMins, upvoteCount, timeStat, holeId, initialVoted, isSignedIn }: Props) {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [voted, setVoted] = useState(initialVoted);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // DB count includes the initial vote if initialVoted — apply delta from current state
  const count = upvoteCount + (voted ? 1 : 0) - (initialVoted ? 1 : 0);

  const handleVote = () => {
    if (!isSignedIn) {
      router.push('/auth/sign-in');
      return;
    }
    setVoted((v) => !v);
    startTransition(async () => {
      const result = await toggleUpvoteAction(holeId);
      if (result.error) {
        setVoted((v) => !v);
        if (result.error === 'sign-in') router.push('/auth/sign-in');
      }
    });
  };

  return (
    <div
      ref={sentinelRef}
      className="end-of-hole"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Rabbit size={48} stroke={1.6} style={{ color: 'var(--ink-3)' }} />
      </div>

      <p className="end-stat">{timeStat}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className={'vote' + (voted ? ' voted' : '')}
          onClick={handleVote}
          title="went down this too"
        >
          <UpIcon />
          <span className="count">{count.toLocaleString()}</span>
          <span className="label">went down this too</span>
        </button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          {readTimeMins} min read
        </span>
      </div>
    </div>
  );
}