/**
 * PDP view-model built from Payload listing detail (+ similar cards / community blurb).
 */
import type { ListingDetail } from '@mvp-realty/api-contracts';

import type { Listing } from './types';
import { LABELS, fmtPrice } from '@/lib/listing-filters';

export type GalleryShot = {
  src: string;
  alt: string;
};

export type SpecItem = {
  label: string;
  value?: string;
};

export type SpecGroup = {
  heading: string;
  items: SpecItem[];
  layout: 'check' | 'kv';
};

export type FloorRoom = {
  area: string;
  name: string;
  note?: string;
  tone?: 'primary' | 'common';
};

export type KeyFact = {
  icon: 'home' | 'ruler' | 'price' | 'tax' | 'hoa' | 'year';
  value: string;
  label: string;
};

export type CommunityFact = {
  icon: 'age' | 'gate' | 'homes' | 'since';
  value: string;
  label: string;
};

export type PropertyView = {
  listing: Listing;
  priceLabel: string;
  pricePerSqft: number;
  pricePerSqftLabel: string;
  statusLabel: string;
  addressLine: string;
  cityLine: string;
  yearBuilt: number | null;
  lotSqft: number | null;
  lotAcres: string | null;
  taxesYearly: number | null;
  hoaMonthly: number | null;
  gallery: GalleryShot[];
  overviewLede: string;
  overview: string[];
  highlights: string[];
  keyFacts: KeyFact[];
  interior: SpecGroup[];
  floorPlan: FloorRoom[];
  exterior: SpecGroup[];
  locationBlurb: string;
  /** Null when the MLS feed has no usable coordinates, in which case no map renders. */
  coordinates: { lat: number; lon: number } | null;
  courtesyAgent: string;
  courtesyBrokerage: string;
  mlsId: string;
  community: {
    name: string;
    facts: CommunityFact[];
    blurb: string;
  };
  similar: Listing[];
};

export type CommunityPdpMeta = {
  name: string;
  blurb: string;
  facts: CommunityFact[];
};

function splitRemarks(remarks: string | undefined): { lede: string; rest: string[] } {
  if (!remarks) {
    return {
      lede: 'Ask your MVP Realty concierge for the full story on this residence.',
      rest: [],
    };
  }
  const paragraphs = remarks
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) {
    return { lede: remarks.trim(), rest: [] };
  }
  const [lede, ...rest] = paragraphs;
  return { lede: lede ?? remarks.trim(), rest };
}

function buildKeyFacts(detail: ListingDetail): KeyFact[] {
  const facts: KeyFact[] = [
    {
      icon: 'home',
      value: detail.beds ? String(detail.beds) : '—',
      label: 'Bedrooms',
    },
    {
      icon: 'home',
      value: detail.baths ? String(detail.baths) : '—',
      label: 'Bathrooms',
    },
    {
      icon: 'ruler',
      value: detail.sqft ? detail.sqft.toLocaleString('en-US') : '—',
      label: 'Sq Ft',
    },
  ];

  const ppsf =
    detail.pricePerSqft ?? (detail.sqft > 0 ? Math.round(detail.price / detail.sqft) : undefined);
  facts.push({
    icon: 'price',
    value: ppsf ? `$${ppsf.toLocaleString('en-US')}` : '—',
    label: 'Per Sq Ft',
  });

  facts.push({
    icon: 'tax',
    value: detail.taxesYearly != null ? fmtPrice(detail.taxesYearly) : '—',
    label: 'Est. Taxes / Yr',
  });
  facts.push({
    icon: 'hoa',
    value: detail.hoaMonthly != null ? `${fmtPrice(detail.hoaMonthly)}/mo` : '—',
    label: 'HOA',
  });

  // Keep ribbon at 6 cells — swap last tax/hoa if we have year
  if (detail.yearBuilt != null) {
    facts[5] = {
      icon: 'year',
      value: String(detail.yearBuilt),
      label: 'Year Built',
    };
  }

  return facts.slice(0, 6);
}

export function buildPropertyView(
  detail: ListingDetail,
  similar: Listing[],
  communityMeta: CommunityPdpMeta,
): PropertyView {
  const { lede, rest } = splitRemarks(detail.publicRemarks);
  const ppsf =
    detail.pricePerSqft ?? (detail.sqft > 0 ? Math.round(detail.price / detail.sqft) : 0);
  const lotAcres = detail.lotSqft != null ? (detail.lotSqft / 43560).toFixed(2) : null;

  const listing: Listing = {
    slug: detail.slug,
    name: detail.name,
    community: detail.community,
    communityName: detail.communityName,
    city: detail.city,
    price: detail.price,
    beds: detail.beds,
    baths: detail.baths,
    sqft: detail.sqft,
    propertyType: detail.propertyType,
    type: detail.type,
    status: detail.status,
    features: detail.features,
    isEstate: detail.isEstate,
    isActive: detail.isActive,
    image: detail.image,
  };

  return {
    listing,
    priceLabel: fmtPrice(detail.price),
    pricePerSqft: ppsf,
    pricePerSqftLabel: ppsf ? `$${ppsf.toLocaleString('en-US')} / sq ft` : '',
    statusLabel: LABELS[detail.status] ?? detail.status,
    addressLine: detail.streetAddress ?? detail.fullAddress,
    cityLine: `${detail.city}, ${detail.state}${detail.zip ? ` ${detail.zip}` : ''}`,
    yearBuilt: detail.yearBuilt ?? null,
    lotSqft: detail.lotSqft ?? null,
    lotAcres,
    taxesYearly: detail.taxesYearly ?? null,
    hoaMonthly: detail.hoaMonthly ?? null,
    gallery: detail.gallery,
    overviewLede: lede,
    overview: rest,
    highlights: detail.highlights,
    keyFacts: buildKeyFacts(detail),
    interior: detail.interior,
    floorPlan: detail.floorPlan,
    exterior: detail.exterior,
    locationBlurb:
      detail.neighborhoodBlurb ??
      communityMeta.blurb ??
      `${detail.communityName} in ${detail.city}, Florida.`,
    coordinates:
      detail.latitude !== undefined && detail.longitude !== undefined
        ? { lat: detail.latitude, lon: detail.longitude }
        : null,
    courtesyAgent: detail.listAgentName ?? 'Listing agent',
    courtesyBrokerage: detail.listOfficeName ?? 'See MLS for brokerage',
    mlsId: detail.mlsId,
    community: {
      name: communityMeta.name,
      facts: communityMeta.facts,
      blurb: communityMeta.blurb,
    },
    similar,
  };
}
