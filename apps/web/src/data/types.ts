/**
 * Hand-authored content types, shaped to mirror a future Payload schema so the
 * page components can later swap to backend fetches behind the same shapes.
 * No backend wiring yet — see docs/design-port/README.md.
 */

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
  /** Community + city, e.g. "Seaside Cove · Naples". */
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
export type ListingType = 'estate' | 'single-family' | 'villa' | 'condo';
export type ListingStatus = 'now-selling' | 'move-in' | 'new-model';
export type ListingFeature = 'waterfront' | 'pool' | 'golf' | 'gated' | '55plus';

/**
 * A single residence in the PLP catalog. Carries the card + filter fields the
 * `/listings` page needs today; PDP-specific fields (gallery, body copy, agent)
 * get added when that page is built. Shaped to mirror a future Payload
 * `Listings` collection — `[slug]` pages look these up by slug.
 */
export type Listing = {
  slug: string;
  name: string;
  /** Community slug — matches a `Community.slug`; drives the community facet. */
  community: string;
  /** Display community name, e.g. "Bonita Bay". */
  communityName: string;
  /** City, e.g. "Naples". */
  city: string;
  /** Numeric starting price — the value filtered/sorted on. */
  price: number;
  beds: number;
  /** May be a half-bath, e.g. 3.5. */
  baths: number;
  sqft: number;
  type: ListingType;
  status: ListingStatus;
  features: ListingFeature[];
  image: Image;
};
