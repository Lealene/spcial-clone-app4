import type { MetadataRoute } from 'next';

import {
  getSitemapCommunityEntries,
  getSitemapListingEntries,
  getSitemapPageEntries,
  type SitemapEntry,
} from '@/lib/cms/sitemap';
import { absoluteUrl } from '@/lib/seo/graph';

/**
 * One file for every URL on the site — pages, communities and listings.
 *
 * Backstop only; the real trigger is a tag purge (`pages`, `areas`, `listings`).
 * Pinned to the listings cadence because price changes and status flips are what
 * make a recrawl worth anything, and the whole file inherits the shortest window.
 *
 * The sitemap spec caps a file at 50,000 URLs. Splitting listings back out is the
 * answer if inventory ever approaches that — but note `fetchAllDocs` truncates at
 * 5,000 docs per collection first, so that guard is the real ceiling.
 */
export const revalidate = 900;

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
  const [pages, communities, listings] = await Promise.all([
    getSitemapPageEntries().catch((): SitemapEntry[] => []),
    getSitemapCommunityEntries().catch((): SitemapEntry[] => []),
    getSitemapListingEntries().catch((): SitemapEntry[] => []),
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
    ...listings.map((entry) => toUrl(entry, 'daily', 0.7)),
    ...otherPages.map((entry) => toUrl(entry, 'monthly', 0.5)),
  ];
}
