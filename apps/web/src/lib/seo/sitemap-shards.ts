import { absoluteUrl } from './graph';

/**
 * The sitemap spec caps a file at 50,000 URLs. 1,000 is far below that on
 * purpose: a smaller shard is cheaper to regenerate on every listings purge and
 * lets a crawler notice a changed shard without refetching the whole inventory.
 */
export const LISTING_SITEMAP_SHARD_SIZE = 1000;

/** Always at least one shard, so `/listings/sitemap/0.xml` is never a 404. */
export function listingSitemapShardCount(total: number): number {
  return Math.max(1, Math.ceil(total / LISTING_SITEMAP_SHARD_SIZE));
}

export function listingSitemapShardUrls(total: number): string[] {
  return Array.from({ length: listingSitemapShardCount(total) }, (_, id) =>
    absoluteUrl(`/listings/sitemap/${id}.xml`),
  );
}
