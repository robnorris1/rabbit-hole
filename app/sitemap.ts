import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/_lib/site';
import { SHOW_MEMBERSHIP } from '@/app/_lib/flags';
import { getPublishedHolesForSitemap } from '@/db/queries/holes';
import { getPublishedAuthorsForSitemap } from '@/db/queries/users';

// The sitemap is cached and only rebuilt when a crawler requests it *after* this
// window elapses — it is not a background job. Daily is plenty fresh for search
// engines, and means at most one DB read per day (and only if crawled at all).
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [holes, authors] = await Promise.all([
    getPublishedHolesForSitemap(),
    getPublishedAuthorsForSitemap(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    ...(SHOW_MEMBERSHIP
      ? [
          { url: `${SITE_URL}/membership`, changeFrequency: 'monthly', priority: 0.3 },
          { url: `${SITE_URL}/book`, changeFrequency: 'monthly', priority: 0.3 },
        ] satisfies MetadataRoute.Sitemap
      : []),
  ];

  const holePages: MetadataRoute.Sitemap = holes
    .filter((h) => h.slug)
    .map((h) => ({
      url: `${SITE_URL}/holes/${h.slug}`,
      lastModified: h.updatedAt ?? h.publishedAt ?? undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const profilePages: MetadataRoute.Sitemap = authors.map((a) => ({
    url: `${SITE_URL}/u/${a.username}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...holePages, ...profilePages];
}