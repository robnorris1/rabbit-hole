'use client';

import { useState, useRef } from 'react';
import { saveDraft, publishHole } from '@/app/write/actions';
import type { DraftDetail } from '@/db/queries/holes';

const STATUS_LABEL: Record<string, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
};

function parseTags(raw: string): string[] {
  return raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
}

export function WriteEditor({ draft }: { draft: DraftDetail | null }) {
  const [title, setTitle] = useState(draft?.title ?? '');
  const [body, setBody] = useState(draft?.body ?? '');
  const [tagsRaw, setTagsRaw] = useState((draft?.tags ?? []).join(', '));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [publishing, setPublishing] = useState(false);

  const titleRef = useRef(title);
  const bodyRef = useRef(body);
  const tagsRawRef = useRef(tagsRaw);
  const holeIdRef = useRef<string | null>(draft?.id ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!titleRef.current.trim() && !bodyRef.current.trim()) return;
      setSaveStatus('saving');
      try {
        const result = await saveDraft(holeIdRef.current, {
          title: titleRef.current,
          body: bodyRef.current,
          tags: parseTags(tagsRawRef.current),
        });
        holeIdRef.current = result.id;
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 2000);
  }

  async function handlePublish() {
    if (!titleRef.current.trim()) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setPublishing(true);
    try {
      const result = await saveDraft(holeIdRef.current, {
        title: titleRef.current,
        body: bodyRef.current,
        tags: parseTags(tagsRawRef.current),
      });
      holeIdRef.current = result.id;
      await publishHole(result.id);
    } catch {
      setPublishing(false);
    }
  }

  const canPublish = title.trim().length > 0 && !publishing;

  return (
    <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)', paddingBottom: 96 }}>
      <div style={{ maxWidth: 680 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: saveStatus === 'error' ? '#c0392b' : 'var(--ink-3)',
          }}>
            {STATUS_LABEL[saveStatus]}
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a
              href="/drafts"
              style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}
            >
              All drafts
            </a>
            <button
              onClick={handlePublish}
              disabled={!canPublish}
              className="btn-write"
              style={{ opacity: canPublish ? 1 : 0.4, cursor: canPublish ? 'pointer' : 'not-allowed' }}
            >
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="The hole"
          value={title}
          onChange={(e) => { titleRef.current = e.target.value; setTitle(e.target.value); scheduleSave(); }}
          style={{
            display: 'block', width: '100%',
            fontFamily: 'var(--serif)', fontWeight: 500,
            fontSize: 'clamp(28px,4vw,46px)', lineHeight: 1.08,
            letterSpacing: '-0.02em', border: 'none',
            background: 'transparent', color: 'var(--ink)',
            outline: 'none', padding: 0, marginBottom: 16,
          }}
        />

        {/* Tags */}
        <input
          type="text"
          placeholder="Tags — history, engineering, cold-war"
          value={tagsRaw}
          onChange={(e) => { tagsRawRef.current = e.target.value; setTagsRaw(e.target.value); scheduleSave(); }}
          style={{
            display: 'block', width: '100%',
            fontFamily: 'var(--mono)', fontSize: 12,
            border: 'none', borderBottom: '1px solid var(--line)',
            background: 'transparent', color: 'var(--ink-3)',
            outline: 'none', padding: '0 0 24px', marginBottom: 32,
          }}
        />

        {/* Body */}
        <textarea
          placeholder="Go."
          value={body}
          onChange={(e) => { bodyRef.current = e.target.value; setBody(e.target.value); scheduleSave(); }}
          rows={28}
          style={{
            display: 'block', width: '100%',
            fontFamily: 'var(--serif)', fontSize: 'clamp(17px,1.8vw,20px)',
            lineHeight: 1.75, border: 'none',
            background: 'transparent', color: 'var(--ink)',
            outline: 'none', resize: 'none', padding: 0,
          }}
        />

      </div>
    </div>
  );
}