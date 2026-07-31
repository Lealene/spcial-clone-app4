'use client';

import type { ListingCard as ListingCardData } from '@mvp-realty/api-contracts';

import { ListingSlider } from '@/components/listings/listing-slider';

/** Homepage featured residences rail — thin wrapper around the shared listing swiper. */
export function FeaturedResidencesSlider({ listings }: { listings: ListingCardData[] }) {
  return <ListingSlider listings={listings} className="mt-[clamp(36px,4vw,52px)]" />;
}
