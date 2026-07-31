import type { MetadataRoute } from 'next';

import { getSitemapListingEntries } from '@/lib/cms/sitemap';
import { absoluteUrl } from '@/lib/seo/graph';
import { LISTING_SITEMAP_SHARD_SIZE, listingSitemapShardCount } from '@/lib/seo/sitemap-shards';

/** Matches the listings index backstop; the `listings` tag purge is the real trigger. */
export const revalidate = 900;

export async function generateSitemaps(): Promise<{ id: number }[]> {
  const entries = await getSitemapListingEntries().catch((): [] => []);
  return Array.from({ length: listingSitemapShardCount(entries.length) }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  // Next 16 hands the shard id over as a promise. Typed for both so the slice
  // can never compute from NaN and quietly emit an empty sitemap.
  id: number | Promise<number>;
}): Promise<MetadataRoute.Sitemap> {
  const shard = Number(await id) || 0;
  const entries = await getSitemapListingEntries().catch((): [] => []);
  const start = shard * LISTING_SITEMAP_SHARD_SIZE;

  return entries.slice(start, start + LISTING_SITEMAP_SHARD_SIZE).map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    // Price changes and status flips are the whole point of recrawling a listing.
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));
}
