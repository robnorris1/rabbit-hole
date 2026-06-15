'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { flagHoleAction } from '@/app/_actions/flag';

const REASONS = [
  "Definitely AI. I can smell the tokens.",
  "I've seen this article 40 times. Different website, same article.",
  "Zero lived experience. All vibes, no rabbit hole.",
  "Technically a rabbit hole. Spiritually a Wikipedia summary.",
] as const;

interface Props {
  holeId: string;
  isSignedIn: boolean;
  initialFlagged: boolean;
}

export function FlagButton({ holeId, isSignedIn, initialFlagged }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [flagged, setFlagged] = useState(initialFlagged);
  const [pending, setPending] = useState(false);

  async function handleFlag(reason: string) {
    if (!isSignedIn) {
      router.push('/auth/sign-in');
      return;
    }
    setPending(true);
    await flagHoleAction(holeId, reason);
    setFlagged(true);
    setPending(false);
  }

  if (flagged) {
    return (
      <p className="flag-confirmed">Noted. The committee will review.</p>
    );
  }

  if (!open) {
    return (
      <button className="flag-trigger" onClick={() => setOpen(true)}>
        something feels off
      </button>
    );
  }

  return (
    <div className="flag-panel">
      <p className="flag-panel-label">What&apos;s wrong with it?</p>
      <div className="flag-reasons">
        {REASONS.map((r) => (
          <button
            key={r}
            className="flag-reason"
            onClick={() => handleFlag(r)}
            disabled={pending}
          >
            {r}
          </button>
        ))}
      </div>
      <button className="flag-cancel" onClick={() => setOpen(false)}>
        never mind
      </button>
    </div>
  );
}