/**
 * PDP (property-detail) derivation layer. Combines the catalog `Listing` (the
 * card + filter fields) with the richer, templated fields a property page
 * needs — gallery, prose, specs, agent, similar homes. Everything here is
 * DETERMINISTIC (pure functions of the listing's own numbers) so the same slug
 * always renders the same page; no Math.random, no per-request drift.
 *
 * This mirrors a future Payload `Listings` collection gaining these fields. For
 * now it's hand-derived. PDP-only types live here; the catalog `Listing` type
 * stays in `types.ts`.
 */
import type { Listing, ListingType } from './types';
import { getListing, listings } from './listings';
import { unsplash } from './images';
import { fmtPrice } from '@/lib/listing-filters';

export type GalleryShot = {
  src: string;
  alt: string;
};

export type SpecItem = {
  /** When `value` is set the row renders as a key/value pair; otherwise as a checklist line. */
  label: string;
  value?: string;
};

export type SpecGroup = {
  heading: string;
  items: SpecItem[];
  /** key/value layout (Exterior) vs. checklist layout (Interior). */
  layout: 'check' | 'kv';
};

export type FloorRoom = {
  area: string;
  name: string;
  note?: string;
  /** Visual emphasis: `primary` = gold suite, `common` = ivory living, default = plain. */
  tone?: 'primary' | 'common';
};

export type KeyFact = {
  /** Lucide icon name handled by the consuming component. */
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
  /** "$1,450,000" */
  priceLabel: string;
  /** Whole-dollar price per square foot. */
  pricePerSqft: number;
  /** "$494 / sq ft" */
  pricePerSqftLabel: string;
  statusLabel: string;
  /** Templated street address line, deterministic per slug. */
  addressLine: string;
  /** "Naples, FL 34108" */
  cityLine: string;
  yearBuilt: number;
  lotSqft: number;
  lotAcres: string;
  taxesYearly: number;
  hoaMonthly: number;
  gallery: GalleryShot[];
  /** Paragraphs of overview prose (first paragraph leads with a templated hook). */
  overviewLede: string;
  overview: string[];
  highlights: string[];
  keyFacts: KeyFact[];
  interior: SpecGroup[];
  floorPlan: FloorRoom[];
  exterior: SpecGroup[];
  /** Templated "neighborhood within the community" name for the location block. */
  neighborhood: string;
  locationBlurb: string;
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

const STATUS_LABEL: Record<Listing['status'], string> = {
  'now-selling': 'For Sale',
  'move-in': 'Move-In Ready',
  'new-model': 'New Model',
};

const TYPE_LABEL: Record<ListingType, string> = {
  estate: 'Estate Home',
  'single-family': 'Single Family',
  villa: 'Villa',
  condo: 'Condominium',
};

/**
 * Interior gallery photo ids by listing type — owned-asset placeholders, chosen
 * so each home shows a plausible great room / kitchen / primary / outdoor set.
 */
const GALLERY_IDS: Record<ListingType, string[]> = {
  estate: [
    '1600210492486-724fe5c67fb0',
    '1556912173-3bb412adc9f1',
    '1600607687939-ce8a6c25118c',
    '1613977257592-4871e5fcd7c4',
  ],
  'single-family': [
    '1600585154340-be6161a56a0c',
    '1556911220-bff31c812dba',
    '1616594039964-ae9021a400a0',
    '1605276374104-dee2a0ed3cd6',
  ],
  villa: [
    '1600566753086-00f18fb6b3ea',
    '1565182999561-18d7dc61c393',
    '1617104678098-de229db51175',
    '1583608205776-bfd35f0d9f83',
  ],
  condo: [
    '1600047509807-ba8f99d2cdde',
    '1556909114-f6e7ad7d3136',
    '1556909212-d5b604d0c90d',
    '1502672260266-1c1ef2d93688',
  ],
};

/** Deterministic positive integer hash of a string (FNV-1a-ish). Pure. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Round to a "tidy" figure so derived numbers read like real listing data. */
function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

/** Deterministically pick an element by hash; non-empty arrays only. */
function pick<T>(arr: readonly [T, ...T[]], h: number): T {
  return arr[h % arr.length] as T;
}

/**
 * Build a 5-letter ZIP-ish line and a plausible street address from the slug —
 * stable per listing, never random. Gulf-Coast street grammar.
 */
function deriveAddress(listing: Listing): { addressLine: string; cityLine: string; zip: string } {
  const h = hash(listing.slug);
  const num = 100 + (h % 9800);
  const street = pick(
    [
      'Harborview Way',
      'Coastal Oak Lane',
      'Bayshore Circle',
      'Mariner Cove',
      'Sea Grape Drive',
      'Egret Pointe',
    ],
    h,
  );
  const zip = pick(['34108', '34134', '34135', '34145', '34119', '33928'], h);
  return {
    addressLine: `${num} ${street}`,
    cityLine: `${listing.city}, FL ${zip}`,
    zip,
  };
}

/** Deterministic, plausible financial + structural figures from a listing's numbers. */
function deriveFacts(listing: Listing) {
  const h = hash(listing.slug);
  // Newer build for "new-model", older for resale — bounded, deterministic.
  const baseYear = listing.status === 'new-model' ? 2024 : 2002 + (h % 21);
  const yearBuilt = Math.min(baseYear, 2025);
  // Lot scales with home size + a stable jitter; estates sit on more land.
  const lotMultiplier = listing.type === 'estate' ? 4.4 : listing.type === 'condo' ? 1.15 : 3.0;
  const lotSqft = roundTo(listing.sqft * lotMultiplier + (h % 1800), 10);
  const lotAcres = (lotSqft / 43560).toFixed(2);
  // Florida effective rate ~1.0–1.15% of price.
  const taxesYearly = roundTo(listing.price * 0.0108, 50);
  // HOA scales with type; condos/villas carry more (shared structure & amenities).
  const hoaBase =
    listing.type === 'condo'
      ? 720
      : listing.type === 'villa'
        ? 540
        : listing.type === 'estate'
          ? 480
          : 380;
  const hoaMonthly = roundTo(hoaBase + (h % 140), 5);
  return { yearBuilt, lotSqft, lotAcres, taxesYearly, hoaMonthly };
}

/** A neighborhood name within the community — stable per listing. */
function deriveNeighborhood(listing: Listing): string {
  const h = hash(listing.slug + ':nb');
  return pick(
    ['The Reserve', 'Harbour Isle', 'Palm Court', 'The Sanctuary', 'Coastal Oaks', 'The Preserve'],
    h,
  );
}

function deriveMlsId(listing: Listing): string {
  return `GC${(100000 + (hash(listing.slug) % 899999)).toString()}`;
}

function buildGallery(listing: Listing): GalleryShot[] {
  const ids = GALLERY_IDS[listing.type];
  const captions = [
    'Light-filled great room with volume ceilings',
    'Chef’s kitchen with island seating and custom cabinetry',
    'Owner’s suite with a spa-inspired bath',
    'Covered lanai and screened outdoor living',
  ];
  const interiors = ids.map((id, i) => ({
    src: unsplash(id, 900),
    alt: `${captions[i]} at ${listing.name}`,
  }));
  return [{ src: listing.image.src, alt: listing.image.alt }, ...interiors];
}

function buildHighlights(listing: Listing): string[] {
  const featureLabels: Record<string, string> = {
    waterfront: 'Waterfront Views',
    pool: 'Private Pool',
    golf: 'Golf Access',
    gated: 'Gated Community',
    '55plus': '55+ Lifestyle',
  };
  const out = [
    `${listing.beds} Bed · ${listing.baths} Bath`,
    `${listing.sqft.toLocaleString()} Sq Ft`,
    ...listing.features.map((f) => featureLabels[f] ?? f),
  ];
  // Round out to six for the chip row.
  out.push('Single-Owner Residence');
  return out.slice(0, 6);
}

function buildOverview(listing: Listing, neighborhood: string): { lede: string; body: string[] } {
  const typeWord = TYPE_LABEL[listing.type].toLowerCase();
  const hook =
    listing.status === 'now-selling'
      ? 'Newly available.'
      : listing.status === 'new-model'
        ? 'Now touring.'
        : 'Move-in ready.';
  const water = listing.features.includes('waterfront')
    ? ' Framed by open water, the home draws the Gulf-Coast light deep into every principal room.'
    : ' Set among mature landscaping, the home opens to a private, light-filled outlook.';
  const lede = `${hook} ${listing.name} is a thoughtfully appointed ${typeWord} in the ${neighborhood} neighborhood of ${listing.communityName} — ${listing.beds} bedrooms, ${listing.baths} baths, and ${listing.sqft.toLocaleString()} square feet of single-level Gulf-Coast living.${water}`;
  const body = [
    `The great room flows to a chef’s kitchen finished with custom cabinetry, stone counters, and an island built for gathering. A formal dining room and a flexible den give the floor plan room to breathe, while the owner’s suite is set apart as a private retreat with a spa-inspired bath and generous closets.`,
    `Outdoor living is the quiet luxury here: a covered, screened lanai extends the living space into Florida’s seasons, ${
      listing.features.includes('pool')
        ? 'with a private pool and spa just beyond the sliders.'
        : 'ideal for morning coffee and evening gatherings alike.'
    } Every detail has been curated to a concierge standard — turnkey, and ready for its next chapter.`,
  ];
  return { lede, body };
}

function buildInterior(listing: Listing): SpecGroup[] {
  const fullBaths = Math.floor(listing.baths);
  const half = listing.baths % 1 >= 0.5 ? 1 : 0;
  return [
    {
      heading: 'Bedrooms & Baths',
      layout: 'check',
      items: [
        {
          label: `${listing.beds} bedrooms · ${fullBaths} full${half ? ` · ${half} half` : ''} bath${fullBaths + half > 1 ? 's' : ''}`,
        },
        { label: 'Volume & tray ceilings throughout' },
        { label: 'Owner’s suite with dual vanities & walk-in shower' },
      ],
    },
    {
      heading: 'Kitchen & Appliances',
      layout: 'check',
      items: [
        { label: 'Stone counters & custom cabinetry' },
        { label: 'Stainless appliance package' },
        { label: 'Walk-in pantry & island seating' },
      ],
    },
    {
      heading: 'Heating & Cooling',
      layout: 'check',
      items: [
        { label: 'Central air conditioning' },
        { label: 'Programmable smart thermostat' },
        { label: 'Impact-rated windows & doors' },
      ],
    },
    {
      heading: 'Laundry & Layout',
      layout: 'check',
      items: [
        { label: 'Dedicated interior laundry' },
        { label: 'Single-level living' },
        { label: `${listing.sqft.toLocaleString()} sq ft under air` },
      ],
    },
  ];
}

function buildExterior(view: {
  listing: Listing;
  yearBuilt: number;
  lotSqft: number;
  lotAcres: string;
}): SpecGroup[] {
  const { listing, yearBuilt, lotSqft, lotAcres } = view;
  const garage =
    listing.type === 'condo'
      ? 'Assigned · covered'
      : listing.type === 'estate'
        ? '3-car attached'
        : '2-car attached';
  return [
    {
      heading: 'Structure',
      layout: 'kv',
      items: [
        { label: 'Year built', value: String(yearBuilt) },
        { label: 'Roof', value: listing.type === 'estate' ? 'Tile' : 'Concrete tile' },
        { label: 'Private pool', value: listing.features.includes('pool') ? 'Yes' : 'Community' },
        { label: 'Garage', value: garage },
        { label: 'Construction', value: 'Block & stucco' },
      ],
    },
    {
      heading: 'Lot & Utilities',
      layout: 'kv',
      items: [
        { label: 'Lot size', value: `${lotAcres} ac · ${lotSqft.toLocaleString()} sf` },
        { label: 'Waterfront', value: listing.features.includes('waterfront') ? 'Yes' : 'No' },
        { label: 'Water source', value: 'Public' },
        { label: 'Sewer', value: 'Public sewer' },
        { label: 'County', value: listing.city === 'Naples' ? 'Collier' : 'Lee' },
      ],
    },
  ];
}

function buildFloorPlan(listing: Listing): FloorRoom[] {
  const rooms: FloorRoom[] = [
    { area: 'great', name: 'Great Room', note: 'volume ceiling', tone: 'common' },
    { area: 'kit', name: 'Kitchen', note: 'island' },
    { area: 'nook', name: 'Café Nook' },
    { area: 'primary', name: 'Owner’s Suite', note: 'en-suite bath', tone: 'primary' },
    { area: 'office', name: 'Den / Flex' },
    { area: 'bed2', name: 'Bedroom 2' },
    {
      area: 'lanai',
      name: listing.features.includes('pool') ? 'Pool Lanai' : 'Lanai',
      note: listing.features.includes('waterfront') ? 'water view' : 'screened',
      tone: 'common',
    },
    { area: 'bed3', name: listing.beds >= 3 ? 'Bedroom 3' : 'Bonus' },
  ];
  return rooms;
}

function buildCommunityFacts(listing: Listing): CommunityFact[] {
  const is55 = listing.features.includes('55plus');
  return [
    {
      icon: 'age',
      value: is55 ? '55+' : 'All Ages',
      label: is55 ? 'Age-restricted community' : 'Family-friendly enclave',
    },
    { icon: 'gate', value: 'Gated', label: 'Manned & secured access' },
    {
      icon: 'homes',
      value: listing.features.includes('golf') ? 'Golf & Resort' : 'Resort Amenities',
      label: 'Clubhouse, pools & courts',
    },
    { icon: 'since', value: 'Concierge', label: 'On-site lifestyle team' },
  ];
}

/** Other listings in the same community; falls back to same type. Max 3, excludes self. */
function buildSimilar(listing: Listing): Listing[] {
  const others = listings.filter((l) => l.slug !== listing.slug);
  const sameCommunity = others.filter((l) => l.community === listing.community);
  const sameType = others.filter(
    (l) => l.type === listing.type && l.community !== listing.community,
  );
  const ordered = [...sameCommunity, ...sameType, ...others];
  // De-dupe while preserving priority order.
  const seen = new Set<string>();
  const picked: Listing[] = [];
  for (const l of ordered) {
    if (seen.has(l.slug)) continue;
    seen.add(l.slug);
    picked.push(l);
    if (picked.length === 3) break;
  }
  return picked;
}

/** Combine a catalog listing with derived/templated PDP fields. */
export function getPropertyView(slug: string): PropertyView | undefined {
  const listing = getListing(slug);
  if (!listing) return undefined;

  const pricePerSqft = Math.round(listing.price / listing.sqft);
  const { addressLine, cityLine } = deriveAddress(listing);
  const facts = deriveFacts(listing);
  const neighborhood = deriveNeighborhood(listing);
  const overview = buildOverview(listing, neighborhood);

  const keyFacts: KeyFact[] = [
    { icon: 'home', value: TYPE_LABEL[listing.type], label: 'Home Type' },
    { icon: 'ruler', value: `${facts.lotSqft.toLocaleString()} sf`, label: 'Lot Size' },
    { icon: 'price', value: `$${pricePerSqft.toLocaleString()}`, label: 'Price / Sq Ft' },
    { icon: 'tax', value: fmtPrice(facts.taxesYearly), label: 'Taxes / Yr' },
    { icon: 'hoa', value: `$${facts.hoaMonthly.toLocaleString()}`, label: 'HOA / Mo' },
    { icon: 'year', value: String(facts.yearBuilt), label: 'Year Built' },
  ];

  return {
    listing,
    priceLabel: fmtPrice(listing.price),
    pricePerSqft,
    pricePerSqftLabel: `$${pricePerSqft.toLocaleString()} / sq ft`,
    statusLabel: STATUS_LABEL[listing.status],
    addressLine,
    cityLine,
    yearBuilt: facts.yearBuilt,
    lotSqft: facts.lotSqft,
    lotAcres: facts.lotAcres,
    taxesYearly: facts.taxesYearly,
    hoaMonthly: facts.hoaMonthly,
    gallery: buildGallery(listing),
    overviewLede: overview.lede,
    overview: overview.body,
    highlights: buildHighlights(listing),
    keyFacts,
    interior: buildInterior(listing),
    floorPlan: buildFloorPlan(listing),
    exterior: buildExterior({
      listing,
      yearBuilt: facts.yearBuilt,
      lotSqft: facts.lotSqft,
      lotAcres: facts.lotAcres,
    }),
    neighborhood,
    locationBlurb: `Set in the ${neighborhood} neighborhood of ${listing.communityName}, minutes from the clubhouse, golf, and dining — with the ${listing.city} beaches and downtown both within an easy drive.`,
    courtesyAgent: 'Eleanor Voss',
    courtesyBrokerage: 'MVP Realty',
    mlsId: deriveMlsId(listing),
    community: {
      name: listing.communityName,
      facts: buildCommunityFacts(listing),
      blurb: `Life inside ${listing.communityName} is gated, amenity-rich, and built for an active Gulf-Coast lifestyle — clubhouses, resort pools, courts, and a social calendar that's always full.`,
    },
    similar: buildSimilar(listing),
  };
}
