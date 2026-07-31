'use client';

import { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useListingFilters } from '@/lib/listings/use-filters';

/**
 * Above-the-fold search inside the hero — keyword only. Submit-based (not live),
 * writes to the same `q` param the sidebar uses, then scrolls to the results.
 * Local form state until submit, seeded from the current URL. Every other facet
 * (beds included) lives in the sidebar panel; spreading `filters` here keeps any
 * of them that are already in the URL intact.
 */
export function HeroSearch() {
  const { filters, commit } = useListingFilters();
  const [q, setQ] = useState(filters.q);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    commit({ ...filters, q: q.trim(), page: 1 });
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search residences"
      className="bg-surface-soft/95 shadow-lift mt-[clamp(28px,3.4vw,40px)] flex max-w-[780px] flex-wrap items-stretch gap-2.5 rounded-xl p-2.5"
    >
      <div className="flex flex-1 basis-[260px] items-center gap-3 rounded-md px-4">
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

      {/* Full width once the field has wrapped onto its own row. */}
      <Button type="submit" variant="cta" className="w-full self-stretch sm:w-auto">
        Search
        <ArrowRight />
      </Button>
    </form>
  );
}
