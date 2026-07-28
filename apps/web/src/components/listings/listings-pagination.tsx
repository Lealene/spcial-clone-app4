'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import {
  PAGE_SIZE_OPTIONS,
  paginationWindow,
  type PageSize,
  type PageSlice,
} from '@/lib/listing-filters';

const selectClass =
  'border-line bg-surface-muted text-ink focus:border-accent-deep focus:bg-surface min-w-[4.5rem] cursor-pointer appearance-none rounded-md border py-2.5 pr-9 pl-[13px] font-sans text-[14px] font-semibold transition-[border-color,background-color] outline-none';

const navBtnClass =
  'border-line bg-surface text-ink-soft hover:border-accent-deep grid size-10 shrink-0 cursor-pointer place-items-center rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-35';

function PageSizeSelect({
  id,
  pageSize,
  onPageSizeChange,
}: {
  id: string;
  pageSize: number;
  onPageSizeChange: (pageSize: PageSize) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <label
        htmlFor={id}
        className="text-muted font-sans text-[13px] font-bold tracking-[0.04em] whitespace-nowrap"
      >
        Per page
      </label>
      <div className="relative">
        <select
          id={id}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          className={selectClass}
          aria-label="Results per page"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
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
  );
}

export function ListingsPagination({
  slice,
  onPageChange,
  onPageSizeChange,
}: {
  slice: PageSlice<unknown>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}) {
  if (slice.total === 0) return null;

  const pages = paginationWindow(slice.page, slice.pageCount);

  return (
    <div className="border-line-soft mt-[clamp(28px,3.2vw,40px)] border-t pt-6">
      {/* Mobile */}
      <div className="flex flex-col gap-4 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted min-w-0 font-sans text-[13px]">
            Showing{' '}
            <span className="text-ink font-bold">
              {slice.from}–{slice.to}
            </span>{' '}
            of <span className="text-ink font-bold">{slice.total}</span>
          </p>
          <PageSizeSelect
            id="pageSize-mobile"
            pageSize={slice.pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        </div>

        {slice.pageCount > 1 ? (
          <nav aria-label="Results pages" className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={slice.page <= 1}
              onClick={() => onPageChange(slice.page - 1)}
              aria-label="Previous page"
              className={navBtnClass}
            >
              <ChevronLeft className="size-4" strokeWidth={2.2} />
            </button>
            <p className="text-ink font-sans text-[14px] font-bold tabular-nums">
              Page {slice.page}{' '}
              <span className="text-muted font-semibold">of {slice.pageCount}</span>
            </p>
            <button
              type="button"
              disabled={slice.page >= slice.pageCount}
              onClick={() => onPageChange(slice.page + 1)}
              aria-label="Next page"
              className={navBtnClass}
            >
              <ChevronRight className="size-4" strokeWidth={2.2} />
            </button>
          </nav>
        ) : null}
      </div>

      {/* Desktop / tablet — single row */}
      <div className="hidden items-center justify-between gap-4 sm:flex">
        <p className="text-muted shrink-0 font-sans text-[14px]">
          Showing{' '}
          <span className="text-ink font-bold">
            {slice.from}–{slice.to}
          </span>{' '}
          of <span className="text-ink font-bold">{slice.total}</span>
        </p>

        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
          <PageSizeSelect
            id="pageSize-desktop"
            pageSize={slice.pageSize}
            onPageSizeChange={onPageSizeChange}
          />

          {slice.pageCount > 1 ? (
            <nav aria-label="Results pages">
              <ul className="flex flex-wrap items-center gap-1.5">
                <li>
                  <button
                    type="button"
                    disabled={slice.page <= 1}
                    onClick={() => onPageChange(slice.page - 1)}
                    aria-label="Previous page"
                    className={navBtnClass}
                  >
                    <ChevronLeft className="size-4" strokeWidth={2.2} />
                  </button>
                </li>
                {pages.map((entry, index) =>
                  entry === 'ellipsis' ? (
                    <li
                      key={`ellipsis-${index}`}
                      className="text-muted grid size-10 place-items-center font-sans text-[14px] font-bold"
                      aria-hidden
                    >
                      …
                    </li>
                  ) : (
                    <li key={entry}>
                      <button
                        type="button"
                        onClick={() => onPageChange(entry)}
                        aria-label={`Page ${entry}`}
                        aria-current={entry === slice.page ? 'page' : undefined}
                        className={cn(
                          'grid size-10 cursor-pointer place-items-center rounded-md border font-sans text-[14px] font-bold transition-colors',
                          entry === slice.page
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-line bg-surface text-ink-soft hover:border-accent-deep',
                        )}
                      >
                        {entry}
                      </button>
                    </li>
                  ),
                )}
                <li>
                  <button
                    type="button"
                    disabled={slice.page >= slice.pageCount}
                    onClick={() => onPageChange(slice.page + 1)}
                    aria-label="Next page"
                    className={navBtnClass}
                  >
                    <ChevronRight className="size-4" strokeWidth={2.2} />
                  </button>
                </li>
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
