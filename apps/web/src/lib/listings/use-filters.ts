'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { parseFilters, serializeFilters, type FilterState } from './filters';

/**
 * Bridges the URL search params (the single source of truth for `/listings`
 * filters) to a typed `FilterState`. `commit` writes a new state back to the
 * URL via `router.replace(..., { scroll: false })` — shareable, back-button
 * friendly, refresh-safe. Consumers derive results with `useMemo` over the
 * pure helpers in `filters.ts`.
 *
 * Must be rendered under a <Suspense> boundary (useSearchParams requirement).
 */
export function useListingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseFilters(new URLSearchParams(searchParams.toString()));

  const commit = useCallback(
    (next: FilterState) => {
      const qs = serializeFilters(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  return { filters, commit };
}
