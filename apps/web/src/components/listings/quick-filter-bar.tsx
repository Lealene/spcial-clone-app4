import { Sparkles, Sun, Trees, Waves, Wind } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import { Container } from '@/components/container';
import type { ArrayFacet, FilterState } from '@/lib/listing-filters';

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
  { key: 'new', label: 'New Construction', facet: 'status', value: 'new-model', icon: Sparkles },
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
    <div className="border-line-soft bg-surface-muted sticky top-[73px] z-40 border-b">
      <Container className="flex items-center gap-2.5 overflow-x-auto py-4">
        <button
          type="button"
          onClick={onClear}
          aria-pressed={!hasAnyActive}
          className={cn(
            'shrink-0 rounded-full border px-4 py-[9px] font-sans text-[13.5px] font-bold whitespace-nowrap transition-[color,background-color,border-color,transform] hover:-translate-y-px',
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
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-[9px] font-sans text-[13.5px] font-bold whitespace-nowrap transition-[color,background-color,border-color,transform] hover:-translate-y-px',
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
