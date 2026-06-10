import { Star } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';

/** A row of filled gold stars. Decorative — the numeric score carries meaning. */
export function Stars({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="fill-accent text-accent size-[17px]" strokeWidth={0} />
      ))}
    </span>
  );
}
