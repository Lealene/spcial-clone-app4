import { X } from 'lucide-react';

import type { Chip } from '@/lib/listing-filters';

/** Removable pills mirroring every active filter; each removes only its own param. */
export function ActiveFilterChips({
  chips,
  onRemove,
}: {
  chips: Chip[];
  onRemove: (chip: Chip) => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-[9px]" aria-live="polite">
      {chips.map((chip) => (
        <span
          key={`${chip.kind}:${chip.value}`}
          className="border-line bg-surface-muted text-ink inline-flex items-center gap-2 rounded-full border py-[7px] pr-2 pl-3.5 font-sans text-[13px] font-bold"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip)}
            aria-label={`Remove ${chip.label}`}
            className="bg-line-soft text-ink-soft hover:bg-primary hover:text-on-primary grid size-5 place-items-center rounded-full transition-colors"
          >
            <X className="size-[11px]" strokeWidth={2.4} />
          </button>
        </span>
      ))}
    </div>
  );
}
