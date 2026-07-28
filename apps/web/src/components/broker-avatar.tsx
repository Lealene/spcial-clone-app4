import Image from 'next/image';

import type { CmsImage } from '@mvp-realty/api-contracts';
import { cn } from '@mvp-realty/ui/lib/utils';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Circular broker portrait — falls back to gold-on-navy initials when no
 * headshot is on file. Sizing/ring styles are owned by the caller via
 * `className` (e.g. `size-[66px] shadow-[inset_0_0_0_2px_var(--accent)]`).
 */
export function BrokerAvatar({
  name,
  headshot,
  className,
}: {
  name: string;
  headshot?: CmsImage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        className,
      )}
    >
      {headshot ? (
        <Image src={headshot.src} alt={headshot.alt} fill className="object-cover" />
      ) : (
        <span
          className="text-accent absolute inset-0 flex items-center justify-center bg-white/10 font-serif text-[22px] font-semibold"
          aria-hidden
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
