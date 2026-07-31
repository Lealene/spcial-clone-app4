import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';

import { fetchJson } from './client';
import { listingLastModified } from './listings/normalize';
import { isRecord, text } from './pages/primitives';
import { normalizeSeo } from './seo';

/** A URL plus the timestamp that decides how eagerly it gets recrawled. */
export type SitemapEntry = {
  path: string;
  lastModified?: string;
};

type PayloadListResponse = { docs?: unknown[]; hasNextPage?: boolean; nextPage?: number | null };

const PAGE_LIMIT = 100;
/**
 * Runaway-pagination guard, so `PAGE_LIMIT * MAX_PAGES` is the real per-collection
 * ceiling — well below the sitemap spec's 50,000 URLs per file. Hitting it drops
 * URLs, so it warns rather than truncating silently.
 */
const MAX_PAGES = 200;

function isoDate(value: unknown): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

async function fetchAllDocs(path: string, params: URLSearchParams, tags: string[]) {
  const docs: unknown[] = [];
  let page = 1;

  for (let guard = 0; guard < MAX_PAGES; guard += 1) {
    const query = new URLSearchParams(params);
    query.set('limit', String(PAGE_LIMIT));
    query.set('page', String(page));

    const raw = (await fetchJson(`${path}?${query.toString()}`, { tags })) as PayloadListResponse;
    docs.push(...(raw.docs ?? []));
    if (!raw.hasNextPage) break;
    page = typeof raw.nextPage === 'number' ? raw.nextPage : page + 1;

    if (guard === MAX_PAGES - 1) {
      // Silent truncation reads as "everything is indexed" when it is not.
      console.warn(
        `[sitemap] ${path} hit the ${MAX_PAGES}-page guard at ${docs.length} docs; later URLs are missing from the sitemap.`,
      );
    }
  }

  return docs;
}

/**
 * CMS pages eligible for the sitemap. `includeInSitemap` is the editor's switch;
 * `index: false` is excluded too, because listing a URL you also tell Google not
 * to index is a contradictory signal.
 *
 * `home` maps to `/` — the same special case the Pages collection enforces.
 *
 * Tagged `pages`, not `all`: a page save purges its own `cms-page:<slug>` tag plus
 * the collection tag, so a new or renamed page reaches the sitemap immediately
 * instead of waiting out the route's time backstop.
 */
export async function getSitemapPageEntries(): Promise<SitemapEntry[]> {
  const params = new URLSearchParams({
    depth: '0',
    sort: 'slug',
    'select[slug]': 'true',
    'select[seo]': 'true',
    'select[updatedAt]': 'true',
  });

  const docs = await fetchAllDocs('/api/pages', params, [CMS_CACHE_TAGS.pages]);

  return docs.flatMap((doc) => {
    if (!isRecord(doc)) return [];
    const slug = text(doc.slug);
    if (!slug) return [];

    const seo = normalizeSeo(doc.seo);
    if (!seo.includeInSitemap || !seo.index) return [];

    return [{ path: slug === 'home' ? '/' : `/${slug}`, lastModified: isoDate(doc.updatedAt) }];
  });
}

export async function getSitemapCommunityEntries(): Promise<SitemapEntry[]> {
  const params = new URLSearchParams({
    'where[kind][equals]': 'community',
    depth: '0',
    sort: 'slug',
    'select[slug]': 'true',
    'select[seo]': 'true',
    'select[updatedAt]': 'true',
  });

  const docs = await fetchAllDocs('/api/areas', params, [CMS_CACHE_TAGS.areas]);

  return docs.flatMap((doc) => {
    if (!isRecord(doc)) return [];
    const slug = text(doc.slug);
    if (!slug) return [];

    const seo = normalizeSeo(doc.seo);
    if (!seo.includeInSitemap || !seo.index) return [];

    return [{ path: `/communities/${slug}`, lastModified: isoDate(doc.updatedAt) }];
  });
}

/**
 * Active listings only. A sold home's page still resolves, but pointing crawl
 * budget at inventory that can no longer transact is wasted.
 *
 * Selected down to four fields: the full documents are ~38KB each and would
 * blow past the 2MB Data Cache entry ceiling well before the last page.
 */
export async function getSitemapListingEntries(): Promise<SitemapEntry[]> {
  const params = new URLSearchParams({
    'where[isActive][equals]': 'true',
    depth: '0',
    sort: 'slug',
    'select[slug]': 'true',
    'select[seo]': 'true',
    'select[updatedAt]': 'true',
    'select[modificationTimestamp]': 'true',
  });

  const docs = await fetchAllDocs('/api/listings', params, [CMS_CACHE_TAGS.listings]);

  return docs.flatMap((doc) => {
    if (!isRecord(doc)) return [];
    const slug = text(doc.slug);
    if (!slug) return [];

    const seo = normalizeSeo(doc.seo);
    if (!seo.includeInSitemap || !seo.index) return [];

    return [{ path: `/listings/${slug}`, lastModified: listingLastModified(doc) }];
  });
}
