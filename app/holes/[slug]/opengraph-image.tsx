import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getHoleBySlug } from '@/db/queries/holes';

export const alt = 'A rabbit hole on rabbithole';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand palette (light "paper" mode) — kept in sync with the site-level
// opengraph-image.tsx so article cards and the default card read as one set.
const PAPER = '#f4f0e7';
const INK = '#1b1a18';
const INK_2 = '#57534a';
const ACCENT = '#9a4a32';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [hole, serif] = await Promise.all([
    getHoleBySlug(slug),
    readFile(join(process.cwd(), 'app/_fonts/Newsreader-Medium.ttf')),
  ]);

  // Fall back to the generic mark if the hole vanished between request and render.
  const title = hole?.title ?? 'rabbithole';
  const author = hole?.authorUsername;
  const readTime = hole?.readTimeMins;

  // Scale the headline down for longer titles so it never overflows the card.
  const titleSize = title.length > 90 ? 54 : title.length > 50 ? 66 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '72px 80px',
        }}
      >
        {/* Kicker: rabbit badge + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={56} height={56}>
            <rect width="100" height="100" rx="22" fill={ACCENT} />
            <g transform="translate(0, 13) scale(2.1)">
              <path d="M21 23 C 16.5 15 16 7 19 5 C 22 6.5 22 15 22.5 23 Z" fill="white" />
              <path d="M27 23 C 31.5 15 32 7 29 5 C 26 6.5 26 15 25.5 23 Z" fill="white" />
              <g fill="none" stroke="white" strokeWidth="5" strokeLinecap="round">
                <path d="M13.5 30 A 10.5 10.5 0 0 1 34.5 30" />
                <path d="M24 27.5 v1.4" />
                <path d="M2 30 L 13 30" />
                <path d="M35 30 L 46 30" />
              </g>
            </g>
          </svg>
          <span
            style={{
              fontSize: 22,
              color: INK_2,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            Rabbit hole
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Newsreader',
            fontSize: titleSize,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: INK,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        {/* Byline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 26,
            color: INK_2,
          }}
        >
          {author && <span style={{ color: INK }}>@{author}</span>}
          {author && readTime != null && (
            <span style={{ color: ACCENT }}>·</span>
          )}
          {readTime != null && <span>{readTime} min hole</span>}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Newsreader', data: serif, style: 'normal', weight: 500 }],
    },
  );
}