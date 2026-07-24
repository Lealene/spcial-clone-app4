import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@mvp-realty/ui/lib/utils';

/** Underlined "more" link with the gold rule and nudging arrow. */
export function MoreLink({
  href,
  children,
  className,
  target,
  rel,
  'aria-label': ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  target?: '_blank';
  rel?: string;
  'aria-label'?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      className={cn(
        'border-cta text-primary group inline-flex items-center gap-2.5 whitespace-nowrap border-b-[1.5px] pb-[5px] font-sans text-[15px] font-bold tracking-[0.02em] transition-[gap] duration-300 hover:gap-[14px]',
        className,
      )}
    >
      {children}
      <ArrowRight className="size-[17px] transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
