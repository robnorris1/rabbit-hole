import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getUserByUsername } from '@/db/queries/users';
import { getPublishedHoleCountByAuthor } from '@/db/queries/holes';
import { getFollowCounts } from '@/db/queries/follows';

export const alt = 'A writer on rabbithole';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Kept in sync with the site + article cards so all three read as one set.
const PAPER = '#f4f0e7';
const INK = '#1b1a18';
const INK_2 = '#57534a';
const ACCENT = '#9a4a32';

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, serifMedium, serifSemiBold] = await Promise.all([
    getUserByUsername(username),
    readFile(join(process.cwd(), 'app/_fonts/Newsreader-Medium.ttf')),
    readFile(join(process.cwd(), 'app/_fonts/Newsreader-SemiBold.ttf')),
  ]);

  const [holeCount, followCounts] = user
    ? await Promise.all([
        getPublishedHoleCountByAuthor(user.id),
        getFollowCounts(user.id),
      ])
    : [0, { followers: 0, following: 0 }];

  const bioRaw = user?.bio?.trim();
  const bio = bioRaw && bioRaw.length > 140 ? `${bioRaw.slice(0, 140).trimEnd()}…` : bioRaw;

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
        {/* Brand lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={52} height={52}>
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
              fontFamily: 'Newsreader',
              fontWeight: 600,
              fontSize: 34,
              color: INK,
              letterSpacing: '-0.02em',
            }}
          >
            rabbithole
          </span>
        </div>

        {/* Handle + bio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Newsreader',
              fontWeight: 600,
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: INK,
            }}
          >
            @{username}
          </div>
          {bio && (
            <div
              style={{
                display: 'flex',
                fontFamily: 'Newsreader',
                fontSize: 34,
                lineHeight: 1.35,
                color: INK_2,
                maxWidth: 960,
              }}
            >
              {bio}
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 26,
            color: INK_2,
          }}
        >
          <span style={{ color: INK }}>{plural(holeCount, 'rabbit hole', 'rabbit holes')}</span>
          <span style={{ color: ACCENT }}>·</span>
          <span>{plural(followCounts.followers, 'follower', 'followers')}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Newsreader', data: serifMedium, style: 'normal', weight: 500 },
        { name: 'Newsreader', data: serifSemiBold, style: 'normal', weight: 600 },
      ],
    },
  );
}