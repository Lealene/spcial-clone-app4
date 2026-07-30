import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Container } from '@/components/container';
import { Kicker } from '@/components/section-header';
import type { Listing } from '@/data/types';
import { ListingCard } from './listing-card';

/** "Similar Homes" — up to 3 cards reusing the shared ListingCard. */
export function PropertySimilar({
  listings,
  scopeLabel,
}: {
  listings: Listing[];
  /** Place every card shares, or `null` when the set spans locations. */
  scopeLabel: string | null;
}) {
  if (listings.length === 0) return null;
  return (
    <section className="bg-surface-muted py-[clamp(64px,8vw,120px)]">
      <Container>
        <div className="mb-[clamp(36px,4vw,52px)] flex flex-wrap items-end justify-between gap-7">
          <div className="max-w-[46ch]">
            <Kicker>Similar Homes</Kicker>
            <h2 className="text-ink mt-4 max-w-[20ch] font-serif text-[clamp(30px,3.8vw,48px)] leading-[1.06] font-semibold tracking-[-0.01em]">
              {scopeLabel ? `More residences in ${scopeLabel}.` : 'Residences you may also like.'}
            </h2>
          </div>
          <Link
            href="/listings"
            className="text-primary border-accent group inline-flex items-center gap-2.5 border-b-[1.5px] pb-[5px] font-sans text-[15px] font-bold whitespace-nowrap"
          >
            View all residences
            <ArrowRight className="size-[17px] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[clamp(20px,2.2vw,30px)] sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  );
}
