/**
 * Pure filter / sort / facet logic for the PLP (`/listings`). No React, no DOM —
 * everything derives from the typed `Listing[]` and a plain `FilterState`, which
 * is itself a projection of the URL search params (the single source of truth).
 * Unit-tested in `listing-filters.test.ts`.
 */
import type { Listing, ListingFeature } from '@/data/types';

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'beds-desc' | 'sqft-desc';

/** Facets whose value is a list of selected options (OR within, except features = AND). */
export type ArrayFacet = 'type' | 'community' | 'status' | 'features';

export type FilterState = {
  q: string;
  /** Minimum price; 0 = no min. */
  min: number;
  /** Maximum price; 0 = no max. */
  max: number;
  /** Minimum bedrooms; 0 = any. */
  beds: number;
  /** Minimum bathrooms; 0 = any. */
  baths: number;
  type: string[];
  community: string[];
  status: string[];
  features: string[];
  sort: SortKey;
};

export const EMPTY_FILTERS: FilterState = {
  q: '',
  min: 0,
  max: 0,
  beds: 0,
  baths: 0,
  type: [],
  community: [],
  status: [],
  features: [],
  sort: 'featured',
};

type Option = { value: string; label: string };

export const TYPE_OPTIONS: Option[] = [
  { value: 'estate', label: 'Estate Home' },
  { value: 'single-family', label: 'Single-Family' },
  { value: 'villa', label: 'Villa' },
  { value: 'condo', label: 'Condominium' },
];

export const COMMUNITY_OPTIONS: Option[] = [
  { value: 'bonita-bay', label: 'Bonita Bay' },
  { value: 'valencia-bonita', label: 'Valencia Bonita' },
  { value: 'valencia-trails', label: 'Valencia Trails' },
  { value: 'seaside-cove', label: 'Seaside Cove' },
  { value: 'coral-lagoon', label: 'Coral Lagoon' },
  { value: 'mangrove-bay', label: 'Mangrove Bay' },
];

export const STATUS_OPTIONS: Option[] = [
  { value: 'now-selling', label: 'Now Selling' },
  { value: 'move-in', label: 'Move-In Ready' },
  { value: 'new-model', label: 'New Model Open' },
];

export const FEATURE_OPTIONS: Option[] = [
  { value: 'waterfront', label: 'Waterfront' },
  { value: 'pool', label: 'Private Pool' },
  { value: 'golf', label: 'Golf Access' },
  { value: 'gated', label: 'Gated' },
  { value: '55plus', label: '55+ Community' },
];

export const FACET_OPTIONS: Record<ArrayFacet, Option[]> = {
  type: TYPE_OPTIONS,
  community: COMMUNITY_OPTIONS,
  status: STATUS_OPTIONS,
  features: FEATURE_OPTIONS,
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price · Low to High' },
  { value: 'price-desc', label: 'Price · High to Low' },
  { value: 'beds-desc', label: 'Most Bedrooms' },
  { value: 'sqft-desc', label: 'Largest Sq Ft' },
];

/** Flat value→label map for chips and badges. */
export const LABELS: Record<string, string> = Object.fromEntries(
  [...TYPE_OPTIONS, ...COMMUNITY_OPTIONS, ...STATUS_OPTIONS, ...FEATURE_OPTIONS].map((o) => [
    o.value,
    o.label,
  ]),
);

const SORT_KEYS = new Set<string>(SORT_OPTIONS.map((s) => s.value));
const VALID: Record<ArrayFacet, Set<string>> = {
  type: new Set(TYPE_OPTIONS.map((o) => o.value)),
  community: new Set(COMMUNITY_OPTIONS.map((o) => o.value)),
  status: new Set(STATUS_OPTIONS.map((o) => o.value)),
  features: new Set(FEATURE_OPTIONS.map((o) => o.value)),
};

const ARRAY_FACETS: ArrayFacet[] = ['type', 'community', 'status', 'features'];

// --------------------------------------------------------------------------
// URL ↔ state
// --------------------------------------------------------------------------

function readList(sp: URLSearchParams, key: ArrayFacet): string[] {
  const raw = sp.get(key);
  if (!raw) return [];
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter((v) => VALID[key].has(v));
}

function readNum(sp: URLSearchParams, key: string): number {
  const n = Number.parseInt(sp.get(key) ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Parse a `FilterState` out of URL search params, ignoring junk values. */
export function parseFilters(sp: URLSearchParams): FilterState {
  const sortRaw = sp.get('sort') ?? '';
  return {
    q: (sp.get('q') ?? '').trim(),
    min: readNum(sp, 'min'),
    max: readNum(sp, 'max'),
    beds: readNum(sp, 'beds'),
    baths: readNum(sp, 'baths'),
    type: readList(sp, 'type'),
    community: readList(sp, 'community'),
    status: readList(sp, 'status'),
    features: readList(sp, 'features'),
    sort: SORT_KEYS.has(sortRaw) ? (sortRaw as SortKey) : 'featured',
  };
}

/** Serialize state to a stable query string (no leading `?`), omitting defaults. */
export function serializeFilters(f: FilterState): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set('q', f.q);
  if (f.min) sp.set('min', String(f.min));
  if (f.max) sp.set('max', String(f.max));
  if (f.beds) sp.set('beds', String(f.beds));
  if (f.baths) sp.set('baths', String(f.baths));
  for (const k of ARRAY_FACETS) if (f[k].length) sp.set(k, f[k].join(','));
  if (f.sort !== 'featured') sp.set('sort', f.sort);
  return sp.toString();
}

// --------------------------------------------------------------------------
// filter / sort
// --------------------------------------------------------------------------

/** Filter only (no sort). */
export function applyFilters(items: Listing[], f: FilterState): Listing[] {
  const q = f.q.trim().toLowerCase();
  return items.filter((l) => {
    if (q && !`${l.name} ${l.communityName} ${l.city}`.toLowerCase().includes(q)) return false;
    if (f.min && l.price < f.min) return false;
    if (f.max && l.price > f.max) return false;
    if (f.beds && l.beds < f.beds) return false;
    if (f.baths && l.baths < f.baths) return false;
    if (f.type.length && !f.type.includes(l.type)) return false;
    if (f.community.length && !f.community.includes(l.community)) return false;
    if (f.status.length && !f.status.includes(l.status)) return false;
    // features = AND: every selected feature must be present.
    if (f.features.length && !f.features.every((x) => l.features.includes(x as ListingFeature)))
      return false;
    return true;
  });
}

/** Sort a list by sort key. `featured` preserves source (curated) order. */
export function sortListings(items: Listing[], sort: SortKey): Listing[] {
  const copy = items.slice();
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'beds-desc':
      return copy.sort((a, b) => b.beds - a.beds || b.sqft - a.sqft);
    case 'sqft-desc':
      return copy.sort((a, b) => b.sqft - a.sqft);
    default:
      return copy;
  }
}

/** Filter then sort — the value the results grid renders. */
export function filterAndSort(items: Listing[], f: FilterState): Listing[] {
  return sortListings(applyFilters(items, f), f.sort);
}

// --------------------------------------------------------------------------
// contextual facet tallies
// --------------------------------------------------------------------------

/**
 * Count, for each option of `facet`, how many listings would match if that
 * option were selected on top of the *other* active filters (this facet's own
 * current selection is ignored). Standard faceted-search behavior; a 0 means
 * the option is a dead end and the UI should disable it.
 */
export function facetCounts(
  items: Listing[],
  f: FilterState,
  facet: ArrayFacet,
): Record<string, number> {
  const base = applyFilters(items, { ...f, [facet]: [] });
  const out: Record<string, number> = {};
  for (const o of FACET_OPTIONS[facet]) {
    out[o.value] =
      facet === 'features'
        ? base.filter((l) => l.features.includes(o.value as ListingFeature)).length
        : base.filter((l) => (l[facet] as string) === o.value).length;
  }
  return out;
}

// --------------------------------------------------------------------------
// active chips + counts + mutations (all pure)
// --------------------------------------------------------------------------

export type Chip = {
  kind: 'q' | 'min' | 'max' | 'beds' | 'baths' | ArrayFacet;
  value: string;
  label: string;
};

/** Compact price label for chips, e.g. 1500000 → "$1.5M", 750000 → "$750k". */
export function fmtPriceShort(n: number): string {
  return n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1000}k`;
}

/** Full price label for cards, e.g. 1450000 → "$1,450,000". */
export function fmtPrice(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

export function activeChips(f: FilterState): Chip[] {
  const chips: Chip[] = [];
  if (f.q) chips.push({ kind: 'q', value: '', label: `“${f.q}”` });
  if (f.min) chips.push({ kind: 'min', value: '', label: `Min ${fmtPriceShort(f.min)}` });
  if (f.max) chips.push({ kind: 'max', value: '', label: `Max ${fmtPriceShort(f.max)}` });
  if (f.beds) chips.push({ kind: 'beds', value: '', label: `${f.beds}+ beds` });
  if (f.baths) chips.push({ kind: 'baths', value: '', label: `${f.baths}+ baths` });
  for (const k of ARRAY_FACETS)
    for (const v of f[k]) chips.push({ kind: k, value: v, label: LABELS[v] ?? v });
  return chips;
}

/** Number of active constraints (drives the "N active" badge). */
export function countActive(f: FilterState): number {
  return (
    (f.q ? 1 : 0) +
    (f.min ? 1 : 0) +
    (f.max ? 1 : 0) +
    (f.beds ? 1 : 0) +
    (f.baths ? 1 : 0) +
    f.type.length +
    f.community.length +
    f.status.length +
    f.features.length
  );
}

/** Toggle a single value within an array facet. */
export function toggleFacet(f: FilterState, facet: ArrayFacet, value: string): FilterState {
  const has = f[facet].includes(value);
  return { ...f, [facet]: has ? f[facet].filter((v) => v !== value) : [...f[facet], value] };
}

/** Remove the constraint a chip represents. */
export function removeChip(f: FilterState, chip: Chip): FilterState {
  switch (chip.kind) {
    case 'q':
      return { ...f, q: '' };
    case 'min':
      return { ...f, min: 0 };
    case 'max':
      return { ...f, max: 0 };
    case 'beds':
      return { ...f, beds: 0 };
    case 'baths':
      return { ...f, baths: 0 };
    default:
      return { ...f, [chip.kind]: f[chip.kind].filter((v) => v !== chip.value) };
  }
}

/** Reset every filter and sort (the "Clear all" action). */
export function clearFilters(): FilterState {
  return { ...EMPTY_FILTERS };
}
