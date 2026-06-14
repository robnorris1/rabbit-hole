'use client';

import { useEffect, useRef, useState } from 'react';
import { Rabbit } from './Rabbit';

interface Props {
  readTimeMins: number;
  upvoteCount: number;
  timeStat: string;
  slug: string;
}

function UpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M12 19V6M6 12l6-6 6 6" />
    </svg>
  );
}

export function EndOfHole({ readTimeMins, upvoteCount, timeStat }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [voted, setVoted] = useState(false);

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

  const count = upvoteCount + (voted ? 1 : 0);

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
          onClick={() => setVoted((v) => !v)}
          title="went down this too"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', minWidth: 0 }}
        >
          <UpIcon />
          <span className="count">{count.toLocaleString()}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            went down this too
          </span>
        </button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          {readTimeMins} min read
        </span>
      </div>
    </div>
  );
}