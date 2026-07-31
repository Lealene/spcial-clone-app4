import type { ElementType, ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  /** Accepted for call-site compatibility; no longer used. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Plain layout wrapper. The scroll-reveal animation was removed — content now
 * renders as-is. Kept as a thin wrapper so call sites that pass `as`/`className`
 * (e.g. grid containers) don't need to change; safe to inline away later.
 */
export function Reveal({ children, as, className }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  return <Tag className={className}>{children}</Tag>;
}
