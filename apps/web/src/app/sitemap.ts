import type { MetadataRoute } from 'next';

import {
  getSitemapCommunityEntries,
  getSitemapPageEntries,
  type SitemapEntry,
} from '@/lib/cms/sitemap';
import { absoluteUrl } from '@/lib/seo/graph';

/**
 * Backstop only — page and area saves purge their own tags, which is what makes
 * a new URL appear here. Listings live in their own sharded sitemap.
 */
export const revalidate = 3600;

function toUrl(
  entry: SitemapEntry,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A CMS outage must not fail the route: a partial sitemap beats a 500, which
  // Search Console treats as a fetch error against the whole file.
  const [pages, communities] = await Promise.all([
    getSitemapPageEntries().catch((): SitemapEntry[] => []),
    getSitemapCommunityEntries().catch((): SitemapEntry[] => []),
  ]);

  const home = pages.find((entry) => entry.path === '/');
  const otherPages = pages.filter((entry) => entry.path !== '/');

  return [
    {
      url: absoluteUrl('/'),
      lastModified: home?.lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/listings'),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...communities.map((entry) => toUrl(entry, 'weekly', 0.8)),
    ...otherPages.map((entry) => toUrl(entry, 'monthly', 0.5)),
  ];
}
