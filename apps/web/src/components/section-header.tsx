import type { ReactNode } from 'react';

import { cn } from '@mvp-realty/ui/lib/utils';

/** Eyebrow label with the signature gold lead-in rule. */
export function Kicker({
  children,
  className,
  tone = 'light',
}: {
  children: ReactNode;
  className?: string;
  /** `dark` recolors the rule + text for use over primary/dark surfaces. */
  tone?: 'light' | 'dark';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 font-sans text-[13px] font-bold tracking-[0.28em] uppercase',
        tone === 'dark' ? 'text-accent' : 'text-accent-deep',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-px w-[26px]',
          tone === 'dark' ? 'bg-accent' : 'bg-accent-deep',
        )}
      />
      {children}
    </span>
  );
}

/**
 * Section header: kicker + serif heading + optional lede. The default is
 * left-aligned (used by editorial sections); `align="center"` matches the
 * centered home headers (Communities, Featured Residences).
 */
export function SectionHeader({
  kicker,
  heading,
  lede,
  align = 'left',
  tone = 'light',
  className,
}: {
  kicker: ReactNode;
  heading: ReactNode;
  lede?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const centered = align === 'center';
  return (
    <div
      className={cn(
        centered
          ? 'mx-auto mb-[clamp(44px,5vw,64px)] flex flex-col items-center text-center'
          : 'mb-[clamp(40px,5vw,60px)] max-w-[62ch]',
        className,
      )}
    >
      <Kicker tone={tone} className={centered ? 'justify-center' : undefined}>
        {kicker}
      </Kicker>
      <h2
        className={cn(
          'mt-[18px] font-serif text-[clamp(34px,4.4vw,58px)] leading-[1.05] font-semibold tracking-[-0.01em]',
          tone === 'dark' ? 'text-white' : 'text-ink',
          centered ? 'mx-auto max-w-[20ch]' : 'max-w-[18ch]',
        )}
      >
        {heading}
      </h2>
      {lede && (
        <p
          className={cn(
            'mt-[20px] font-sans text-[clamp(18px,1.35vw,21px)] leading-[1.7]',
            tone === 'dark' ? 'text-white/85' : 'text-ink-soft',
            centered ? 'mx-auto max-w-[56ch]' : 'max-w-[54ch]',
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
