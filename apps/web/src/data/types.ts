/**
 * Shared front-end content types. Listing card shape comes from
 * `@mvp-realty/api-contracts` (Payload MLS adapter).
 */
import type {
  ListingCard,
  ListingMlsStatus,
  ListingTypeFacet,
  ListingUiFeature,
} from '@mvp-realty/api-contracts';

export type Image = {
  src: string;
  alt: string;
};

export type Community = {
  slug: string;
  name: string;
  /** City + a short proximity descriptor, e.g. "Bonita Springs · 55+ gated". */
  locality: string;
  rating: number;
  reviews: number;
  priceRange: string;
  tags: string[];
  residences: number;
  nowSelling: number;
  image: Image;
};

export type Residence = {
  slug: string;
  name: string;
  /** Community + city, e.g. "Bonita Bay · Bonita Springs". */
  locality: string;
  /** Numeric starting price for future sorting/filtering. */
  price: number;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: number;
  badge: string;
  image: Image;
};

export type Testimonial = {
  slug: string;
  name: string;
  location: string;
  quote: string;
  portrait: Image;
};

export type AmenityIcon = 'pool' | 'racquet' | 'fitness' | 'dining' | 'trails' | 'calendar';

export type Amenity = {
  icon: AmenityIcon;
  title: string;
  blurb: string;
};

export type LifestyleTile = {
  caption: string;
  image: Image;
};

export type HeroCommunity = {
  slug: string;
  name: string;
  blurb: string;
};

/** Facet vocabularies — kept as literal unions so filter logic stays exhaustive. */
export type ListingType = ListingTypeFacet;
export type ListingStatus = ListingMlsStatus;
export type ListingFeature = ListingUiFeature;

/** PLP / card listing — shared with `@mvp-realty/api-contracts` listingCardSchema. */
export type Listing = ListingCard;
