'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPinned, SlidersHorizontal } from 'lucide-react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@mvp-realty/ui/components/ui/sheet';
import { Container } from '@/components/layout/container';
import { Kicker } from '@/components/layout/section-header';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/data/types';
import {
  activeChips,
  countActive,
  facetCounts,
  filterAndSort,
  paginateItems,
  removeChip,
  SORT_OPTIONS,
  STATIC_FACET_OPTIONS,
  toggleFacet,
  type ArrayFacet,
  type Chip,
  type FilterOption,
  type PageSize,
  type SortKey,
} from '@/lib/listings/filters';
import { useListingFilters } from '@/lib/listings/use-filters';
import { ActiveFilterChips } from './active-filter-chips';
import { FilterPanel, type FacetCounts } from './filter-panel';
import { ListingCard } from './listing-card';
import { ListingsPagination } from './listings-pagination';
import { QuickFilterBar } from './quick-filter-bar';

function ConciergeHelpCard() {
  return (
    <div className="bg-primary shadow-card mt-5 rounded-xl p-6 text-white">
      <Kicker tone="dark">Not sure where to look?</Kicker>
      <h4 className="mt-3.5 mb-2 font-serif text-[22px] leading-[1.15] font-semibold text-white">
        Let a concierge narrow it down.
      </h4>
      <p className="mb-[18px] font-sans text-[14.5px] leading-[1.6] text-white/75">
        Tell us the life you want and our concierge will hand-pick a shortlist with current pricing
        and incentives.
      </p>
      <Button asChild variant="cta" size="full">
        <Link href="#concierge">Request My Shortlist</Link>
      </Button>
    </div>
  );
}

export function ListingsBrowser({
  listings,
  communityOptions,
}: {
  listings: Listing[];
  /** From Payload `areas` — the only facet whose vocabulary editors control. */
  communityOptions: FilterOption[];
}) {
  const { filters, commit } = useListingFilters();

  const results = useMemo(() => filterAndSort(listings, filters), [listings, filters]);
  const pageSlice = useMemo(
    () => paginateItems(results, filters.page, filters.pageSize),
    [results, filters.page, filters.pageSize],
  );
  const counts = useMemo<FacetCounts>(
    () => ({
      type: facetCounts(listings, filters, 'type', STATIC_FACET_OPTIONS.type),
      community: facetCounts(listings, filters, 'community', communityOptions),
      status: facetCounts(listings, filters, 'status', STATIC_FACET_OPTIONS.status),
      features: facetCounts(listings, filters, 'features', STATIC_FACET_OPTIONS.features),
    }),
    [listings, filters, communityOptions],
  );
  const communityLabels = useMemo(
    () => Object.fromEntries(communityOptions.map((o) => [o.value, o.label])),
    [communityOptions],
  );
  const chips = useMemo<Chip[]>(
    () => activeChips(filters, communityLabels),
    [filters, communityLabels],
  );
  const active = countActive(filters);

  // Keep the URL page in range after filters shrink the result set.
  useEffect(() => {
    if (pageSlice.page !== filters.page) {
      commit({ ...filters, page: pageSlice.page });
    }
  }, [pageSlice.page, filters, commit]);

  const commitResetPage = (next: Partial<typeof filters>) =>
    commit({ ...filters, ...next, page: 1 });

  const onToggleFacet = (facet: ArrayFacet, value: string) =>
    commit(toggleFacet(filters, facet, value));
  const onClear = () =>
    commit({
      ...filters,
      q: '',
      min: 0,
      max: 0,
      beds: 0,
      baths: 0,
      type: [],
      community: [],
      status: [],
      features: [],
      page: 1,
    });
  const onRemoveChip = (chip: Chip) => commit(removeChip(filters, chip));
  const onPageChange = (page: number) => {
    commit({ ...filters, page });
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const onPageSizeChange = (pageSize: PageSize) => commitResetPage({ pageSize });

  const panelProps = {
    filters,
    counts,
    communityOptions,
    activeCount: active,
    onPriceMin: (v: number) => commitResetPage({ min: v }),
    onPriceMax: (v: number) => commitResetPage({ max: v }),
    onBeds: (v: number) => commitResetPage({ beds: v }),
    onBaths: (v: number) => commitResetPage({ baths: v }),
    onToggleFacet,
    onClear,
  };

  return (
    <>
      <QuickFilterBar
        filters={filters}
        onToggleFacet={onToggleFacet}
        onClear={onClear}
        hasAnyActive={active > 0}
      />

      <Container
        id="results"
        className="grid scroll-mt-[var(--chrome-h,154px)] items-start gap-[clamp(28px,3vw,48px)] py-[clamp(36px,4vw,56px)] lg:grid-cols-[312px_minmax(0,1fr)]"
      >
        {/* Desktop sidebar — sticky under nav + quick filters; inner scroll, Refine header pins */}
        <aside className="hidden [scrollbar-width:none] self-start [-ms-overflow-style:none] lg:sticky lg:top-[var(--chrome-h,154px)] lg:block lg:max-h-[calc(100dvh-var(--chrome-h,154px)-12px)] lg:overflow-y-auto lg:overscroll-contain [&::-webkit-scrollbar]:hidden">
          <FilterPanel {...panelProps} />
          <ConciergeHelpCard />
        </aside>

        {/* Results column */}
        <div>
          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="primary" size="full" className="mb-5 lg:hidden">
                <SlidersHorizontal />
                Filters{active > 0 ? ` · ${active}` : ''}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-surface w-[min(380px,90vw)] gap-0 overflow-hidden p-0"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Filter residences</SheetTitle>
              </SheetHeader>
              {/*
                Flush, not inset: with side/top padding the scrolling facets show
                through the gutters around the sticky "Refine" header. pb clears
                the sticky footer so the last facet row isn't half-hidden.
              */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
                <FilterPanel
                  {...panelProps}
                  className="rounded-none border-x-0 border-t-0 shadow-none"
                  headerClassName="rounded-t-none"
                />
              </div>
              <div className="border-line bg-surface shrink-0 border-t p-4">
                <SheetClose asChild>
                  <Button type="button" variant="cta" size="full">
                    Show {results.length} {results.length === 1 ? 'residence' : 'residences'}
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <div className="mb-[clamp(22px,2.4vw,30px)] flex flex-wrap items-center justify-between gap-[18px]">
            <div>
              <h2 className="text-primary font-serif text-[clamp(24px,2.6vw,34px)] leading-[1.1] font-semibold">
                <span className="text-accent-deep">{results.length}</span>{' '}
                {results.length === 1 ? 'Residence' : 'Residences'}
              </h2>
              <p className="text-muted mt-1.5 font-sans text-[14.5px]">
                {results.length > 0
                  ? `Showing ${pageSlice.from}–${pageSlice.to} of ${results.length}${
                      active ? ` (filtered from ${listings.length})` : ''
                    }`
                  : active
                    ? `Filtered from ${listings.length} residences across the Gulf Coast`
                    : 'Showing every available residence across the Gulf Coast'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label
                htmlFor="sortBy"
                className="text-muted font-sans text-[13px] font-bold tracking-[0.04em] whitespace-nowrap"
              >
                Sort
              </label>
              <div className="relative max-w-full min-w-[160px] sm:min-w-[200px]">
                <select
                  id="sortBy"
                  value={filters.sort}
                  onChange={(e) => commitResetPage({ sort: e.target.value as SortKey })}
                  className="border-line bg-surface-muted text-ink focus:border-accent-deep focus:bg-surface w-full cursor-pointer appearance-none rounded-md border py-3 pr-9 pl-[13px] font-sans text-[14.5px] font-semibold transition-[border-color,background-color] outline-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <ActiveFilterChips chips={chips} onRemove={onRemoveChip} />

          {pageSlice.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-[clamp(20px,2vw,28px)] sm:grid-cols-2">
                {pageSlice.items.map((l) => (
                  <ListingCard
                    key={l.slug}
                    listing={l}
                    sizes="(max-width: 680px) 100vw, (max-width: 1180px) 50vw, 33vw"
                  />
                ))}
              </div>
              <ListingsPagination
                slice={pageSlice}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </>
          ) : (
            <div className="border-line bg-surface-muted rounded-xl border border-dashed px-6 py-[clamp(50px,7vw,90px)] text-center">
              <MapPinned className="text-accent-deep mx-auto mb-[18px] size-12" strokeWidth={1.5} />
              <h3 className="text-primary font-serif text-[26px] font-semibold">
                No residences match these filters
              </h3>
              <p className="text-ink-soft mx-auto mt-2.5 max-w-[44ch] font-sans text-[16px]">
                Adjust your search or let a concierge hand-pick a shortlist for you.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button type="button" variant="outline" onClick={onClear}>
                  Clear all filters
                </Button>
                <Button asChild variant="cta">
                  <Link href="#concierge">Request My Shortlist</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
