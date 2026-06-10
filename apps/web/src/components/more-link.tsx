import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@mvp-realty/ui/lib/utils';

/** Underlined "more" link with the gold rule and nudging arrow. */
export function MoreLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group border-cta text-primary inline-flex items-center gap-2.5 border-b-[1.5px] pb-[5px] font-sans text-[15px] font-bold tracking-[0.02em] whitespace-nowrap transition-[gap] duration-300 hover:gap-[14px]',
        className,
      )}
    >
      {children}
      <ArrowRight className="size-[17px] transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
