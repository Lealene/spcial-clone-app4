import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ListingsHero } from '@/components/listings/listings-hero';
import { ListingsBrowser } from '@/components/listings/listings-browser';
import { ConciergeCta } from '@/components/listings/concierge-cta';
import { getCommunityFilterOptions } from '@/lib/cms/areas';
import { getActiveListings } from '@/lib/cms/listings';
import { absoluteUrl } from '@/lib/seo/graph';
import { JsonLd } from '@/lib/seo/json-ld';
import { buildListingCollectionGraph } from '@/lib/seo/listing';

/**
 * Backstop only — the Bridge sync purges the `listings` tag when it finishes, so
 * edits land immediately. This bounds staleness if that request never arrives.
 */
export const revalidate = 900;

const LISTINGS_PATH = '/listings';
const LISTINGS_TITLE = 'Browse Residences';
const LISTINGS_DESCRIPTION =
  "Browse luxury residences across Southwest Florida's premier gated communities. Refine by community, price, beds, and features — or let a concierge build your shortlist.";

// Title omits the brand so the root layout's `%s | MVP Realty` template applies.
export const metadata: Metadata = {
  title: LISTINGS_TITLE,
  description: LISTINGS_DESCRIPTION,
  alternates: { canonical: absoluteUrl(LISTINGS_PATH) },
  openGraph: {
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
    url: absoluteUrl(LISTINGS_PATH),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: LISTINGS_TITLE,
    description: LISTINGS_DESCRIPTION,
  },
};

export default async function ListingsPage() {
  // The community facet is editor-driven, so its options come from `areas` rather
  // than from whatever inventory happens to exist. That fetch carries the `areas`
  // tag itself, so this route's tag coverage stays complete.
  const [listings, communityOptions] = await Promise.all([
    getActiveListings(),
    getCommunityFilterOptions(),
  ]);
  const communities = new Set(listings.map((l) => l.community)).size;

  return (
    <>
      <JsonLd
        nodes={buildListingCollectionGraph(listings, {
          path: LISTINGS_PATH,
          name: LISTINGS_TITLE,
          description: LISTINGS_DESCRIPTION,
        })}
      />
      <ListingsHero total={listings.length} communities={communities} />
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <ListingsBrowser listings={listings} communityOptions={communityOptions} />
      </Suspense>
      <ConciergeCta />
    </>
  );
}
