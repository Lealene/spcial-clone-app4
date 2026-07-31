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
  paginateItems,
  paginationWindow,
  parseFilters,
  removeChip,
  serializeFilters,
  sortListings,
  toggleFacet,
  type FilterState,
} from './filters';

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
    status: 'active',
    features: ['pool', 'gated'],
    isEstate: false,
    isActive: true,
    image: { src: '/images/community-bonita-bay.jpg', alt: 'Home' },
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
    status: 'pending',
    features: ['gated'],
  }),
  listing({
    slug: 'b',
    price: 1000000,
    beds: 3,
    baths: 3,
    sqft: 2500,
    type: 'villa',
    status: 'active',
    features: ['pool', 'gated'],
  }),
  listing({
    slug: 'c',
    price: 2000000,
    beds: 4,
    baths: 4.5,
    sqft: 4000,
    type: 'estate',
    status: 'active',
    features: ['waterfront', 'pool', 'gated', 'golf'],
    isEstate: true,
    communityName: 'Valencia Trails',
    community: 'valencia-trails',
    city: 'Naples',
  }),
];

const state = (over: Partial<FilterState>): FilterState => ({ ...EMPTY_FILTERS, ...over });

describe('applyFilters', () => {
  it('returns all listings with empty filters', () => {
    expect(applyFilters(SAMPLE, EMPTY_FILTERS)).toHaveLength(3);
  });

  it('filters by mls status', () => {
    expect(applyFilters(SAMPLE, state({ status: ['pending'] })).map((l) => l.slug)).toEqual(['a']);
  });

  it('filters by type facet including estate', () => {
    expect(applyFilters(SAMPLE, state({ type: ['estate'] })).map((l) => l.slug)).toEqual(['c']);
  });

  it('filters by community area slug', () => {
    expect(
      applyFilters(SAMPLE, state({ community: ['valencia-trails'] })).map((l) => l.slug),
    ).toEqual(['c']);
  });

  it('ANDs features', () => {
    expect(
      applyFilters(SAMPLE, state({ features: ['waterfront', 'golf'] })).map((l) => l.slug),
    ).toEqual(['c']);
  });
});

describe('sort + serialize', () => {
  it('sorts by price ascending', () => {
    expect(sortListings(SAMPLE, 'price-asc').map((l) => l.slug)).toEqual(['a', 'b', 'c']);
  });

  it('round-trips filters through the URL', () => {
    const f = state({
      q: 'bay',
      min: 500000,
      type: ['condo'],
      status: ['active'],
      features: ['pool'],
      sort: 'price-desc',
      page: 3,
      pageSize: 50,
    });
    expect(parseFilters(new URLSearchParams(serializeFilters(f)))).toEqual(f);
  });

  it('omits default page and pageSize from the URL', () => {
    expect(serializeFilters(EMPTY_FILTERS)).toBe('');
    expect(parseFilters(new URLSearchParams('pageSize=15')).pageSize).toBe(15);
    expect(parseFilters(new URLSearchParams('pageSize=99')).pageSize).toBe(20);
  });

  it('filterAndSort combines both', () => {
    expect(
      filterAndSort(SAMPLE, state({ status: ['active'], sort: 'price-desc' })).map((l) => l.slug),
    ).toEqual(['c', 'b']);
  });
});

describe('pagination', () => {
  it('slices results and clamps page', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    expect(paginateItems(items, 2, 2)).toMatchObject({
      items: ['c', 'd'],
      page: 2,
      pageCount: 3,
      from: 3,
      to: 4,
    });
    expect(paginateItems(items, 99, 2).page).toBe(3);
    expect(paginationWindow(1, 3)).toEqual([1, 2, 3]);
    expect(paginationWindow(5, 10)).toContain('ellipsis');
  });
});

describe('facets and chips', () => {
  it('counts contextual facet options', () => {
    const counts = facetCounts(SAMPLE, EMPTY_FILTERS, 'status');
    expect(counts.active).toBe(2);
    expect(counts.pending).toBe(1);
  });

  it('tracks active chips and clear', () => {
    const f = state({ beds: 3, status: ['active'] });
    expect(countActive(f)).toBe(2);
    expect(activeChips(f).some((c) => c.label === 'Active')).toBe(true);
    expect(clearFilters()).toEqual(EMPTY_FILTERS);
    expect(fmtPriceShort(1_500_000)).toBe('$1.5M');
  });

  it('toggles and removes facet chips', () => {
    const on = toggleFacet(EMPTY_FILTERS, 'features', 'pool');
    expect(on.features).toEqual(['pool']);
    expect(
      removeChip(on, { kind: 'features', value: 'pool', label: 'Private Pool' }).features,
    ).toEqual([]);
  });
});
