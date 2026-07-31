import type { MetadataRoute } from 'next';

import { getSitemapListingEntries } from '@/lib/cms/sitemap';
import { absoluteUrl, siteOrigin } from '@/lib/seo/graph';
import { listingSitemapShardUrls } from '@/lib/seo/sitemap-shards';

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Next generates the listing shards under their own route segment and does not
  // write a cross-segment sitemap index, so robots.txt is where the shards get
  // announced — otherwise nothing links to them.
  const listings = await getSitemapListingEntries().catch(() => []);

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
    sitemap: [absoluteUrl('/sitemap.xml'), ...listingSitemapShardUrls(listings.length)],
    host: siteOrigin(),
  };
}
