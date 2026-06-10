import { Check, ChevronDown, Trash2 } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import {
  COMMUNITY_OPTIONS,
  FEATURE_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  type ArrayFacet,
  type FilterState,
} from '@/lib/listing-filters';

const PRICE_MIN = [
  { value: 0, label: 'No min' },
  { value: 500000, label: '$500k' },
  { value: 750000, label: '$750k' },
  { value: 1000000, label: '$1M' },
  { value: 1500000, label: '$1.5M' },
  { value: 2000000, label: '$2M' },
];
const PRICE_MAX = [
  { value: 0, label: 'No max' },
  { value: 750000, label: '$750k' },
  { value: 1000000, label: '$1M' },
  { value: 1500000, label: '$1.5M' },
  { value: 2000000, label: '$2M' },
  { value: 5000000, label: '$5M+' },
];
const SEG = [
  { value: 0, label: 'Any' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
];

export type FacetCounts = Record<ArrayFacet, Record<string, number>>;

type Handlers = {
  onPriceMin: (v: number) => void;
  onPriceMax: (v: number) => void;
  onBeds: (v: number) => void;
  onBaths: (v: number) => void;
  onToggleFacet: (facet: ArrayFacet, value: string) => void;
  onClear: () => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="relative flex-1">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border-line bg-surface-muted text-ink focus:border-accent-deep focus:bg-surface w-full cursor-pointer appearance-none rounded-md border py-3 pr-9 pl-[13px] font-sans text-[14.5px] font-semibold transition-[border-color,background-color] outline-none"
      >
        {options.map((o) => (
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
  );
}

function Segmented({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="border-line bg-surface-muted flex overflow-hidden rounded-md border"
    >
      {SEG.map((s, i) => (
        <button
          key={s.value}
          type="button"
          aria-pressed={value === s.value}
          onClick={() => onChange(s.value)}
          className={cn(
            'flex-1 py-[11px] font-sans text-[13.5px] font-bold transition-colors',
            i > 0 && 'border-line border-l',
            value === s.value ? 'bg-primary text-on-primary' : 'text-ink-soft hover:bg-surface',
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-line-soft border-t px-6 py-[22px] first:border-t-0">{children}</div>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-primary mb-[15px] font-sans text-[12px] font-extrabold tracking-[0.14em] uppercase">
      {children}
    </h4>
  );
}

function CheckList({
  facet,
  options,
  selected,
  counts,
  onToggle,
}: {
  facet: ArrayFacet;
  options: { value: string; label: string }[];
  selected: string[];
  counts: Record<string, number>;
  onToggle: (facet: ArrayFacet, value: string) => void;
}) {
  return (
    <div className="grid gap-[11px]">
      {options.map((o) => {
        const checked = selected.includes(o.value);
        const count = counts[o.value] ?? 0;
        const disabled = !checked && count === 0;
        return (
          <label
            key={o.value}
            className={cn(
              'text-ink-soft flex cursor-pointer items-center gap-[11px] font-sans text-[14.5px] font-semibold select-none',
              disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              disabled={disabled}
              onChange={() => onToggle(facet, o.value)}
            />
            <span
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-[5px] border transition-colors',
                checked
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line bg-surface-muted text-transparent',
              )}
            >
              <Check className="size-[13px]" strokeWidth={3} />
            </span>
            {o.label}
            <span className="text-muted ml-auto font-sans text-[12.5px] font-bold">{count}</span>
          </label>
        );
      })}
    </div>
  );
}

/**
 * The filter form body. Presentational — every change calls a handler that the
 * parent commits to the URL. Rendered both in the desktop aside and the mobile
 * Sheet, so it carries no sticky/positioning concerns of its own.
 */
export function FilterPanel({
  filters,
  counts,
  activeCount,
  onPriceMin,
  onPriceMax,
  onBeds,
  onBaths,
  onToggleFacet,
  onClear,
}: { filters: FilterState; counts: FacetCounts; activeCount: number } & Handlers) {
  return (
    <div className="border-line bg-surface shadow-card overflow-hidden rounded-xl border">
      <div className="bg-primary flex items-center justify-between gap-3 px-6 py-5">
        <b className="text-on-primary font-serif text-[21px] font-semibold">Refine</b>
        <span className="text-accent font-sans text-[12px] font-bold tracking-[0.1em] uppercase">
          {activeCount} active
        </span>
      </div>

      <Group>
        <GroupHeading>Price Range</GroupHeading>
        <div className="flex gap-2.5">
          <FilterSelect
            label="Minimum price"
            value={filters.min}
            options={PRICE_MIN}
            onChange={onPriceMin}
          />
          <FilterSelect
            label="Maximum price"
            value={filters.max}
            options={PRICE_MAX}
            onChange={onPriceMax}
          />
        </div>
      </Group>

      <Group>
        <GroupHeading>Bedrooms</GroupHeading>
        <Segmented label="Minimum bedrooms" value={filters.beds} onChange={onBeds} />
      </Group>

      <Group>
        <GroupHeading>Bathrooms</GroupHeading>
        <Segmented label="Minimum bathrooms" value={filters.baths} onChange={onBaths} />
      </Group>

      <Group>
        <GroupHeading>Property Type</GroupHeading>
        <CheckList
          facet="type"
          options={TYPE_OPTIONS}
          selected={filters.type}
          counts={counts.type}
          onToggle={onToggleFacet}
        />
      </Group>

      <Group>
        <GroupHeading>Community</GroupHeading>
        <CheckList
          facet="community"
          options={COMMUNITY_OPTIONS}
          selected={filters.community}
          counts={counts.community}
          onToggle={onToggleFacet}
        />
      </Group>

      <Group>
        <GroupHeading>Availability</GroupHeading>
        <CheckList
          facet="status"
          options={STATUS_OPTIONS}
          selected={filters.status}
          counts={counts.status}
          onToggle={onToggleFacet}
        />
      </Group>

      <Group>
        <GroupHeading>Features</GroupHeading>
        <CheckList
          facet="features"
          options={FEATURE_OPTIONS}
          selected={filters.features}
          counts={counts.features}
          onToggle={onToggleFacet}
        />
      </Group>

      <button
        type="button"
        onClick={onClear}
        className="border-line-soft bg-surface-muted text-primary hover:bg-surface hover:text-accent-deep flex w-full items-center justify-center gap-[9px] border-t py-4 font-sans text-[14px] font-bold transition-colors"
      >
        <Trash2 className="size-[15px]" strokeWidth={2} />
        Clear all filters
      </button>
    </div>
  );
}
