import type { Footer, Header } from '@/payload-types';

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function linkHasContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const link = value as Record<string, unknown>;
  return ['label', 'customUrl', 'anchor', 'phone', 'email', 'reference'].some((key) => {
    const entry = link[key];
    return (
      hasText(entry) || typeof entry === 'number' || (entry !== null && typeof entry === 'object')
    );
  });
}

/** True when an optional brandLogo upload is populated (id or nested media). */
function hasBrandLogo(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const image = (value as { image?: unknown }).image;
  return typeof image === 'number' || (image !== null && typeof image === 'object');
}

export function headerIsUnseeded(header: Header): boolean {
  const primaryCta = header.primaryCta as Record<string, unknown> | null | undefined;

  return (
    !linkHasContent(header.brandHomeLink) &&
    (!hasText(header.brandLabel) || header.brandLabel === 'MVP Realty') &&
    !hasText(header.brandMarkAlt) &&
    !hasBrandLogo(header.brandLogo) &&
    (!header.navItems || header.navItems.length === 0) &&
    !hasText(primaryCta?.label) &&
    !linkHasContent(primaryCta?.link) &&
    !hasText(primaryCta?.ariaLabel) &&
    (!hasText(header.mobileMenuLabel) || header.mobileMenuLabel === 'Menu') &&
    (!hasText(header.mobileMenuCloseLabel) || header.mobileMenuCloseLabel === 'Close menu')
  );
}

export function footerIsUnseeded(footer: Footer): boolean {
  return (
    !hasText(footer.brandName) &&
    !hasText(footer.brandAccentText) &&
    !hasBrandLogo(footer.brandLogo) &&
    !hasText(footer.brandBlurb) &&
    (!footer.columns || footer.columns.length === 0) &&
    !hasText(footer.bottomLeftText) &&
    (!footer.bottomRightLinks || footer.bottomRightLinks.length === 0) &&
    !hasText(footer.bottomRightTextFallback)
  );
}
