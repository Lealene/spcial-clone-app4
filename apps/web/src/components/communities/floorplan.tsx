import { cn } from '@mvp-realty/ui/lib/utils';

/** Two stylized floorplan diagrams (`a` = compact, `b` = larger), drawn in the
 * current ink color. Purely decorative — mirrors the source `c-floorplan` SVG. */
export function Floorplan({ plan, className }: { plan: 'a' | 'b'; className?: string }) {
  return (
    <div
      className={cn(
        'border-line bg-surface-soft grid aspect-square place-items-center rounded-lg border p-[18px]',
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        className="text-ink-soft size-full"
        aria-hidden="true"
      >
        {plan === 'a' ? (
          <>
            <rect x="6" y="8" width="88" height="84" rx="2" />
            <path d="M6 52h44M50 8v84M50 36h44M50 64h44M72 64v28" />
            <rect x="14" y="16" width="12" height="9" rx="1" strokeWidth={1} />
            <path d="M6 30a8 8 0 0 0 8-8M50 44a8 8 0 0 1-8 8" strokeWidth={1} />
          </>
        ) : (
          <>
            <rect x="6" y="8" width="88" height="84" rx="2" />
            <path d="M6 40h54M60 8v84M60 50h34M6 66h54M34 66v26" />
            <rect x="14" y="16" width="14" height="10" rx="1" strokeWidth={1} />
            <rect x="40" y="16" width="12" height="10" rx="1" strokeWidth={1} />
            <path d="M6 56a7 7 0 0 0 7-7M60 30a7 7 0 0 1-7 7" strokeWidth={1} />
          </>
        )}
      </svg>
    </div>
  );
}
