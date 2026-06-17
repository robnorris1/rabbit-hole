import { ImageResponse } from 'next/og';

export const alt = 'rabbithole — Proof that people still think interesting thoughts.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f4f0e7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Rabbit SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={120} height={120}>
          <rect width="100" height="100" rx="22" fill="#9a4a32" />
          <g transform="translate(0, 13) scale(2.1)">
            <path d="M21 23 C 16.5 15 16 7 19 5 C 22 6.5 22 15 22.5 23 Z" fill="white" />
            <path d="M27 23 C 31.5 15 32 7 29 5 C 26 6.5 26 15 25.5 23 Z" fill="white" />
            <g fill="none" stroke="white" strokeWidth="5" strokeLinecap="round">
              <path d="M13.5 30 A 10.5 10.5 0 0 1 34.5 30" />
              <path d="M2 30 L 13 30" />
              <path d="M35 30 L 46 30" />
            </g>
          </g>
        </svg>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            style={{
              color: '#1b1a18',
              fontSize: 72,
              fontWeight: 600,
              fontFamily: 'Georgia, serif',
              letterSpacing: '-1px',
            }}
          >
            rabbithole
          </span>
          <span
            style={{
              color: '#57534a',
              fontSize: 28,
              fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
              fontWeight: 400,
            }}
          >
            Proof that people still think interesting thoughts.
          </span>
        </div>
      </div>
    ),
    size,
  );
}