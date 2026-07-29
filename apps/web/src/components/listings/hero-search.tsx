'use client';

import { useState } from 'react';
import { ArrowRight, BedDouble, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useListingFilters } from '@/lib/use-listing-filters';

/**
 * Above-the-fold search inside the hero — keyword + minimum beds. Submit-based
 * (not live), writes both to the same URL params the sidebar uses, then scrolls
 * to the results. Local form state until submit, seeded from the current URL.
 */
export function HeroSearch() {
  const { filters, commit } = useListingFilters();
  const [q, setQ] = useState(filters.q);
  const [beds, setBeds] = useState(filters.beds);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    commit({ ...filters, q: q.trim(), beds, page: 1 });
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search residences"
      className="bg-surface-soft/95 shadow-lift mt-[clamp(28px,3.4vw,40px)] flex max-w-[780px] flex-wrap items-stretch gap-2.5 rounded-xl p-2.5"
    >
      <div className="flex flex-1 basis-[220px] items-center gap-3 rounded-md px-4">
        <Search className="text-accent-deep size-5 shrink-0" strokeWidth={1.8} />
        <div className="min-w-0 flex-1">
          <label
            htmlFor="hero-kw"
            className="text-muted block font-sans text-[11px] font-bold tracking-[0.12em] uppercase"
          >
            Search
          </label>
          <input
            id="hero-kw"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Community, city, or residence name"
            autoComplete="off"
            className="text-ink placeholder:text-muted w-full bg-transparent py-2 font-sans text-[15.5px] font-semibold outline-none placeholder:font-medium"
          />
        </div>
      </div>

      <div className="flex flex-1 basis-[180px] items-center gap-3 rounded-md px-4 sm:shadow-[inset_1px_0_0_var(--line)]">
        <BedDouble className="text-accent-deep size-5 shrink-0" strokeWidth={1.8} />
        <div className="min-w-0 flex-1">
          <label
            htmlFor="hero-beds"
            className="text-muted block font-sans text-[11px] font-bold tracking-[0.12em] uppercase"
          >
            Bedrooms
          </label>
          <select
            id="hero-beds"
            value={beds}
            onChange={(e) => setBeds(Number(e.target.value))}
            className="text-ink w-full cursor-pointer bg-transparent py-2 font-sans text-[15.5px] font-semibold outline-none"
          >
            <option value={0}>Any beds</option>
            <option value={2}>2+ beds</option>
            <option value={3}>3+ beds</option>
            <option value={4}>4+ beds</option>
          </select>
        </div>
      </div>

      <Button type="submit" variant="cta" className="self-stretch">
        Search
        <ArrowRight />
      </Button>
    </form>
  );
}
