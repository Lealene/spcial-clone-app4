import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ListingsHero } from '@/components/listings/listings-hero';
import { ListingsBrowser } from '@/components/listings/listings-browser';
import { ConciergeCta } from '@/components/listings/concierge-cta';
import { getActiveListings } from '@/lib/cms/listings';

/**
 * Backstop only — the Bridge sync purges the `listings` tag when it finishes, so
 * edits land immediately. This bounds staleness if that request never arrives.
 */
export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Browse Residences — MVP Realty',
  description:
    "Browse luxury residences across Southwest Florida's premier gated communities. Refine by community, price, beds, and features — or let a concierge build your shortlist.",
};

export default async function ListingsPage() {
  const listings = await getActiveListings();
  const communities = new Set(listings.map((l) => l.community)).size;

  return (
    <>
      <ListingsHero total={listings.length} communities={communities} />
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <ListingsBrowser listings={listings} />
      </Suspense>
      <ConciergeCta />
    </>
  );
}
