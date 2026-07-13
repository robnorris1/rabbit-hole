// Canonical site origin. Used for metadataBase so relative OG/Twitter image
// URLs resolve to absolute ones (crawlers require absolute URLs).
// Override locally with NEXT_PUBLIC_SITE_URL if you want previews to point at a
// tunnel/staging origin; otherwise defaults to production.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-rabbit-hole.app';

export const SITE_NAME = 'rabbithole';
export const SITE_DESCRIPTION =
  'Proof that people still think interesting thoughts.';

// Derive a share-friendly description from a hole's body: first paragraph,
// truncated on a word boundary. `spark` is no longer used — the body is the
// source of truth.
export function holeDescription(body: string, max = 160): string | undefined {
  const first = body.split('\n\n')[0]?.trim();
  if (!first) return undefined;
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}