'use client';

import { useState, useEffect } from 'react';
import { Rabbit } from './Rabbit';

export function FirstPublishOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="first-publish-overlay"
      onClick={() => setVisible(false)}
      role="dialog"
      aria-modal="true"
      aria-label="First publish"
    >
      <div className="first-publish-card" onClick={(e) => e.stopPropagation()}>
        <Rabbit size={56} stroke={1.5} style={{ color: 'var(--accent)', margin: '0 auto 24px', display: 'block' }} />
        <h2 className="first-publish-heading">It begins.</h2>
        <p className="first-publish-body">
          Someone will read this. Probably not today.
        </p>
        <button className="first-publish-dismiss" onClick={() => setVisible(false)}>
          good.
        </button>
      </div>
    </div>
  );
}