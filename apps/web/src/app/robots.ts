import type { MetadataRoute } from 'next';

import { absoluteUrl, siteOrigin } from '@/lib/seo/graph';

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // `/api` is the lead proxy and revalidate webhook; `/ui` is the internal
        // component gallery. Neither has anything to index.
        disallow: ['/api/', '/ui'],
      },
    ],
    // Single sitemap: pages, communities and listings all live in `/sitemap.xml`,
    // so there is no index or shard list to keep in step here.
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteOrigin(),
  };
}
