import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@mvp-realty/ui/lib/utils';

/** Centered 1240px content rail with the design's fluid side padding. */
export function Container({
  children,
  className,
  as,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag className={cn('mx-auto max-w-[1240px] px-[clamp(22px,5vw,76px)]', className)} {...rest}>
      {children}
    </Tag>
  );
}
