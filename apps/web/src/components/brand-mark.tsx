import { cn } from '@mvp-realty/ui/lib/utils';

/** The MVP Realty house mark — gold roofline over a navy tile. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'bg-primary grid size-[42px] place-items-center rounded-md shadow-[inset_0_0_0_1px_rgba(255,183,3,0.4)]',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[23px]" aria-hidden="true">
        <path d="M3 13.5 12 5l9 8.5" stroke="var(--accent)" strokeWidth="1.9" />
        <path d="M5.5 11.5V19h13v-7.5" stroke="#fff" strokeWidth="1.9" />
      </svg>
    </span>
  );
}

/** Brand wordmark with the final word highlighted in gold. */
export function BrandWordmark({
  className,
  label = 'MVP Realty',
}: {
  className?: string;
  label?: string;
}) {
  const words = label.trim().split(/\s+/);
  const accent = words.pop() ?? label;
  const prefix = words.join(' ');

  return (
    <b
      className={cn(
        'text-primary font-serif text-[23px] font-bold leading-none tracking-[0.005em]',
        className,
      )}
    >
      {prefix ? `${prefix} ` : null}
      <i className="text-accent-deep not-italic">{accent}</i>
    </b>
  );
}
