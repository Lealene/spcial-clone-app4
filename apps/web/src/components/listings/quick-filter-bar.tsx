import { Sparkles, Sun, Trees, Waves, Wind } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import { Container } from '@/components/layout/container';
import type { ArrayFacet, FilterState } from '@/lib/listings/filters';

/** Each pill toggles a single feature/status param, mirroring the sidebar. */
const QUICK: {
  key: string;
  label: string;
  facet: ArrayFacet;
  value: string;
  icon: typeof Waves;
}[] = [
  { key: 'waterfront', label: 'Waterfront', facet: 'features', value: 'waterfront', icon: Waves },
  { key: '55plus', label: '55+ Living', facet: 'features', value: '55plus', icon: Sun },
  {
    key: 'coming-soon',
    label: 'Coming Soon',
    facet: 'status',
    value: 'coming-soon',
    icon: Sparkles,
  },
  { key: 'golf', label: 'Golf Community', facet: 'features', value: 'golf', icon: Trees },
  { key: 'pool', label: 'Private Pool', facet: 'features', value: 'pool', icon: Wind },
];

export function QuickFilterBar({
  filters,
  onToggleFacet,
  onClear,
  hasAnyActive,
}: {
  filters: FilterState;
  onToggleFacet: (facet: ArrayFacet, value: string) => void;
  onClear: () => void;
  hasAnyActive: boolean;
}) {
  return (
    <div className="border-line-soft bg-surface-muted sticky top-[var(--nav-h,77px)] z-40 border-b">
      {/* Right-edge fade so it reads as scrollable; the trailing spacer below
          restores the inline padding the scroll container loses at scroll end. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-[var(--surface-muted)] to-transparent sm:hidden" />
      <Container className="flex [scrollbar-width:none] items-center gap-2.5 overflow-x-auto py-4 [-ms-overflow-style:none] after:block after:w-[clamp(2px,1vw,8px)] after:shrink-0 after:content-[''] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={onClear}
          aria-pressed={!hasAnyActive}
          className={cn(
            'shrink-0 cursor-pointer rounded-full border px-4 py-[9px] font-sans text-[13.5px] font-bold whitespace-nowrap transition-[color,background-color,border-color,transform] hover:-translate-y-px',
            !hasAnyActive
              ? 'border-primary bg-primary text-on-primary'
              : 'border-line bg-surface text-ink-soft hover:border-accent-deep',
          )}
        >
          All Residences
        </button>
        {QUICK.map((q) => {
          const on = (filters[q.facet] as string[]).includes(q.value);
          const Icon = q.icon;
          return (
            <button
              key={q.key}
              type="button"
              onClick={() => onToggleFacet(q.facet, q.value)}
              aria-pressed={on}
              className={cn(
                'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-[9px] font-sans text-[13.5px] font-bold whitespace-nowrap transition-[color,background-color,border-color,transform] hover:-translate-y-px',
                on
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-line bg-surface text-ink-soft hover:border-accent-deep',
              )}
            >
              <Icon
                className={cn('size-[15px]', on ? 'text-accent' : 'text-accent-deep')}
                strokeWidth={1.8}
              />
              {q.label}
            </button>
          );
        })}
      </Container>
    </div>
  );
}
