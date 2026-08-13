import type { CmsBrandDisplayMode, CmsImage } from '@mvp-realty/api-contracts';
import Image from 'next/image';

import { cn } from '@mvp-realty/ui/lib/utils';

/** The 55 Living Team house mark — gold roofline over a navy tile. */
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
  label = '55 Living Team',
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

type BrandLockupProps = {
  mode: CmsBrandDisplayMode;
  logo?: CmsImage;
  /** Wordmark / footer brand name; also used as image alt fallback upstream. */
  label: string;
  /** Footer-only accent suffix when rendering the string brand. */
  accentText?: string;
  variant: 'header' | 'footer';
  className?: string;
};

/**
 * Header/footer brand lockup. When `mode` is 'logo', the image replaces the
 * full string/SVG treatment; otherwise the existing mark + wordmark (header)
 * or split text (footer) path is used.
 */
export function BrandLockup({
  mode,
  logo,
  label,
  accentText,
  variant,
  className,
}: BrandLockupProps) {
  if (mode === 'logo' && logo) {
    const maxHeight = variant === 'header' ? 88 : 84;
    const width =
      logo.width && logo.height
        ? Math.round((logo.width / logo.height) * maxHeight)
        : maxHeight * 3;
    // Header brand sits in a link that already has an accessible name — empty alt
    // avoids double announcement. Footer has no link, so the media alt is required.
    const alt = variant === 'header' ? '' : logo.alt;

    return (
      <Image
        src={logo.src}
        alt={alt}
        width={logo.width && logo.width > 0 ? logo.width : width}
        height={logo.height && logo.height > 0 ? logo.height : maxHeight}
        className={cn(
          'w-auto object-contain',
          variant === 'header' ? 'lg:max-h-22 max-h-16' : 'max-h-20',
          className,
        )}
        priority={variant === 'header'}
      />
    );
  }

  if (variant === 'footer') {
    return (
      <b className={cn('font-serif text-2xl font-bold text-white', className)}>
        {label} {accentText ? <i className="text-accent not-italic">{accentText}</i> : null}
      </b>
    );
  }

  return (
    <span className={cn('flex items-center gap-[13px]', className)}>
      <BrandMark />
      <BrandWordmark label={label} />
    </span>
  );
}
