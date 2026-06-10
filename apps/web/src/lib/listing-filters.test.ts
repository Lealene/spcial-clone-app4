import { describe, expect, it } from 'vitest';

import type { Listing } from '@/data/types';
import {
  activeChips,
  applyFilters,
  clearFilters,
  countActive,
  EMPTY_FILTERS,
  facetCounts,
  filterAndSort,
  fmtPriceShort,
  parseFilters,
  removeChip,
  serializeFilters,
  sortListings,
  toggleFacet,
  type FilterState,
} from './listing-filters';

function listing(over: Partial<Listing>): Listing {
  return {
    slug: 'x',
    name: 'Test Home',
    community: 'bonita-bay',
    communityName: 'Bonita Bay',
    city: 'Bonita Springs',
    price: 1000000,
    beds: 3,
    baths: 3,
    sqft: 2500,
    type: 'single-family',
    status: 'now-selling',
    features: ['pool', 'gated'],
    image: { src: '', alt: '' },
    ...over,
  };
}

const SAMPLE: Listing[] = [
  listing({
    slug: 'a',
    price: 500000,
    beds: 2,
    baths: 2,
    sqft: 1500,
    type: 'condo',
    status: 'move-in',
    features: ['gated'],
  }),
  listing({
    slug: 'b',
    price: 1000000,
    beds: 3,
    baths: 3,
    sqft: 2500,
    type: 'villa',
    status: 'now-selling',
    features: ['pool', 'gated'],
  }),
  listing({
    slug: 'c',
    price: 2000000,
    beds: 4,
    baths: 4.5,
    sqft: 4000,
    type: 'estate',
    status: 'now-selling',
    features: ['waterfront', 'pool', 'gated', 'golf'],
    communityName: 'Seaside Cove',
    community: 'seaside-cove',
  }),
];

const state = (over: Partial<FilterState>): FilterState => ({ ...EMPTY_FILTERS, ...over });

describe('applyFilters', () => {
  it('returns all listings with empty filters', () => {
    expect(applyFilters(SAMPLE, EMPTY_FILTERS)).toHaveLength(3);
  });

  it('filters by price range inclusively', () => {
    expect(applyFilters(SAMPLE, state({ min: 1000000 })).map((l) => l.slug)).toEqual(['b', 'c']);
    expect(applyFilters(SAMPLE, state({ max: 1000000 })).map((l) => l.slug)).toEqual(['a', 'b']);
    expect(applyFilters(SAMPLE, state({ min: 1000000, max: 1000000 })).map((l) => l.slug)).toEqual([
      'b',
    ]);
  });

  it('treats beds/baths as minimums', () => {
    expect(applyFilters(SAMPLE, state({ beds: 3 })).map((l) => l.slug)).toEqual(['b', 'c']);
    expect(applyFilters(SAMPLE, state({ baths: 4 })).map((l) => l.slug)).toEqual(['c']);
  });

  it('ORs within type/community/status facets', () => {
    expect(applyFilters(SAMPLE, state({ type: ['condo', 'estate'] })).map((l) => l.slug)).toEqual([
      'a',
      'c',
    ]);
    expect(applyFilters(SAMPLE, state({ status: ['now-selling'] })).map((l) => l.slug)).toEqual([
      'b',
      'c',
    ]);
  });

  it('ANDs within the features facet', () => {
    expect(
      applyFilters(SAMPLE, state({ features: ['pool', 'waterfront'] })).map((l) => l.slug),
    ).toEqual(['c']);
    expect(applyFilters(SAMPLE, state({ features: ['gated'] })).map((l) => l.slug)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('matches keyword against name, community, and city', () => {
    expect(applyFilters(SAMPLE, state({ q: 'seaside' })).map((l) => l.slug)).toEqual(['c']);
    expect(applyFilters(SAMPLE, state({ q: 'nothing-here' }))).toHaveLength(0);
  });
});

describe('sortListings', () => {
  it('preserves source order for featured', () => {
    expect(sortListings(SAMPLE, 'featured').map((l) => l.slug)).toEqual(['a', 'b', 'c']);
  });
  it('sorts by price both directions', () => {
    expect(sortListings(SAMPLE, 'price-asc').map((l) => l.slug)).toEqual(['a', 'b', 'c']);
    expect(sortListings(SAMPLE, 'price-desc').map((l) => l.slug)).toEqual(['c', 'b', 'a']);
  });
  it('sorts by beds then sqft, and by sqft', () => {
    expect(sortListings(SAMPLE, 'beds-desc').map((l) => l.slug)).toEqual(['c', 'b', 'a']);
    expect(sortListings(SAMPLE, 'sqft-desc').map((l) => l.slug)).toEqual(['c', 'b', 'a']);
  });
  it('does not mutate the input array', () => {
    const before = SAMPLE.map((l) => l.slug);
    sortListings(SAMPLE, 'price-desc');
    expect(SAMPLE.map((l) => l.slug)).toEqual(before);
  });
});

describe('filterAndSort', () => {
  it('filters then sorts', () => {
    const out = filterAndSort(SAMPLE, state({ status: ['now-selling'], sort: 'price-desc' }));
    expect(out.map((l) => l.slug)).toEqual(['c', 'b']);
  });
});

describe('facetCounts (contextual)', () => {
  it('counts each option ignoring its own facet selection', () => {
    // status filtered to now-selling → type tallies computed over {b, c}.
    const counts = facetCounts(SAMPLE, state({ status: ['now-selling'] }), 'type');
    expect(counts).toMatchObject({ villa: 1, estate: 1, condo: 0, 'single-family': 0 });
  });
  it('ignores the current selection within the same facet', () => {
    // selecting condo should not zero out the other type counts.
    const counts = facetCounts(SAMPLE, state({ type: ['condo'] }), 'type');
    expect(counts).toMatchObject({ condo: 1, villa: 1, estate: 1 });
  });
  it('uses AND semantics for feature tallies', () => {
    const counts = facetCounts(SAMPLE, state({ features: ['pool'] }), 'community');
    // pool is on b (bonita-bay) and c (seaside-cove)
    expect(counts).toMatchObject({ 'bonita-bay': 1, 'seaside-cove': 1 });
  });
});

describe('URL round-trip', () => {
  it('serializes and re-parses to the same state', () => {
    const s = state({
      q: 'bay',
      min: 500000,
      beds: 3,
      type: ['villa', 'estate'],
      features: ['pool'],
      sort: 'price-asc',
    });
    const round = parseFilters(new URLSearchParams(serializeFilters(s)));
    expect(round).toEqual(s);
  });
  it('omits defaults from the query string', () => {
    expect(serializeFilters(EMPTY_FILTERS)).toBe('');
    expect(serializeFilters(state({ sort: 'featured' }))).toBe('');
  });
  it('drops junk option values and bad sort on parse', () => {
    const parsed = parseFilters(new URLSearchParams('type=villa,bogus&sort=nope&beds=-2'));
    expect(parsed.type).toEqual(['villa']);
    expect(parsed.sort).toBe('featured');
    expect(parsed.beds).toBe(0);
  });
});

describe('chips + mutations', () => {
  it('lists one chip per active constraint in order', () => {
    const chips = activeChips(
      state({ q: 'bay', min: 500000, beds: 3, type: ['villa'], features: ['pool'] }),
    );
    expect(chips.map((c) => c.kind)).toEqual(['q', 'min', 'beds', 'type', 'features']);
  });
  it('removeChip clears only its own constraint', () => {
    const s = state({ beds: 3, type: ['villa', 'estate'] });
    expect(removeChip(s, { kind: 'beds', value: '', label: '' }).beds).toBe(0);
    expect(removeChip(s, { kind: 'type', value: 'villa', label: '' }).type).toEqual(['estate']);
  });
  it('toggleFacet adds then removes', () => {
    const added = toggleFacet(EMPTY_FILTERS, 'type', 'villa');
    expect(added.type).toEqual(['villa']);
    expect(toggleFacet(added, 'type', 'villa').type).toEqual([]);
  });
  it('countActive and clearFilters', () => {
    const s = state({ q: 'x', beds: 3, type: ['villa'], features: ['pool', 'gated'] });
    expect(countActive(s)).toBe(5);
    expect(clearFilters()).toEqual(EMPTY_FILTERS);
  });
  it('fmtPriceShort formats millions and thousands', () => {
    expect(fmtPriceShort(1_500_000)).toBe('$1.5M');
    expect(fmtPriceShort(750_000)).toBe('$750k');
  });
});
