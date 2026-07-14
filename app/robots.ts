import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/app/_lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep auth flows, the editor, drafts and admin out of the index — they
      // are either private or useless as search results.
      disallow: ['/auth/', '/write', '/drafts', '/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}