import { fetchJson } from '../client';
import { normalizeListingCard, normalizeListingDetail } from './normalize';
import type { ListingCard, ListingDetail } from '@mvp-realty/api-contracts';

const LISTINGS_TAG = 'listings';
const PAGE_LIMIT = 100;

type PayloadListResponse = {
  docs?: unknown[];
  hasNextPage?: boolean;
  nextPage?: number | null;
  totalDocs?: number;
};

function listingsPath(query: string): string {
  return `/api/listings?${query}`;
}

async function fetchListingPages(baseParams: URLSearchParams): Promise<unknown[]> {
  const docs: unknown[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const params = new URLSearchParams(baseParams);
    params.set('limit', String(PAGE_LIMIT));
    params.set('page', String(page));
    params.set('depth', '1');

    const raw = (await fetchJson(listingsPath(params.toString()), {
      tags: [LISTINGS_TAG],
    })) as PayloadListResponse;

    docs.push(...(raw.docs ?? []));
    hasNextPage = Boolean(raw.hasNextPage);
    page = typeof raw.nextPage === 'number' ? raw.nextPage : page + 1;
    if (page > 50) break;
  }

  return docs;
}

export async function getActiveListings(): Promise<ListingCard[]> {
  const params = new URLSearchParams({
    'where[isActive][equals]': 'true',
    sort: '-price',
  });
  const docs = await fetchListingPages(params);
  return docs
    .map(normalizeListingCard)
    .filter((listing): listing is ListingCard => listing !== null);
}

/** Homepage curated rail — active listings flagged `isFeatured` in admin. */
export async function getFeaturedListings(limit = 12): Promise<ListingCard[]> {
  const params = new URLSearchParams({
    'where[and][0][isActive][equals]': 'true',
    'where[and][1][isFeatured][equals]': 'true',
    sort: '-price',
    limit: String(limit),
    depth: '1',
  });
  const raw = (await fetchJson(listingsPath(params.toString()), {
    tags: [LISTINGS_TAG, 'listings-featured'],
  })) as PayloadListResponse;

  return (raw.docs ?? [])
    .map(normalizeListingCard)
    .filter((listing): listing is ListingCard => listing !== null)
    .slice(0, limit);
}

export async function getListingsForArea(areaSlug: string): Promise<ListingCard[]> {
  const listings = await getActiveListings();
  return listings.filter((listing) => listing.community === areaSlug);
}

/** Active listing counts keyed by area slug — powers "now selling" on community cards. */
export async function getActiveListingCountsByCommunity(): Promise<Map<string, number>> {
  const listings = await getActiveListings();
  const counts = new Map<string, number>();
  for (const listing of listings) {
    counts.set(listing.community, (counts.get(listing.community) ?? 0) + 1);
  }
  return counts;
}

export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  const params = new URLSearchParams({
    'where[slug][equals]': slug,
    limit: '1',
    depth: '3',
  });
  const raw = (await fetchJson(listingsPath(params.toString()), {
    tags: [LISTINGS_TAG],
  })) as PayloadListResponse;
  const first = raw.docs?.[0];
  if (!first) return null;
  return normalizeListingDetail(first);
}

export async function getActiveListingSlugs(): Promise<string[]> {
  const listings = await getActiveListings();
  return listings.map((listing) => listing.slug);
}
