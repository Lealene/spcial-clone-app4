import { cmsHrefSchema, type CmsCta, type CmsLink } from '@mvp-realty/api-contracts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function pageHref(page: unknown): string | null {
  if (!isRecord(page)) return null;
  const slug = text(page.slug);
  if (!slug) return null;
  if (slug === 'home') return '/';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return `/${slug}`;
}

function phoneHref(value: unknown): string | null {
  const phone = text(value)?.replace(/[^+\d]/g, '');
  if (!phone || phone.replace(/\D/g, '').length < 7) return null;
  return `tel:${phone}`;
}

function emailHref(value: unknown): string | null {
  const email = text(value);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  return `mailto:${email}`;
}

function linkHref(link: Record<string, unknown>): string | null {
  const type = text(link.type) ?? 'custom';
  let href: string | null = null;

  if (type === 'internal') href = pageHref(link.page);
  if (type === 'custom') href = text(link.customUrl) ?? null;
  if (type === 'anchor') href = text(link.anchor) ?? null;
  if (type === 'phone') href = phoneHref(link.phone);
  if (type === 'email') href = emailHref(link.email);

  if (!href) return null;
  const parsed = cmsHrefSchema.safeParse(href);
  return parsed.success ? parsed.data : null;
}

export function hasLinkTarget(value: unknown): boolean {
  return isRecord(value) && linkHref(value) !== null;
}

export function hasCtaTarget(value: unknown): boolean {
  return isRecord(value) && hasLinkTarget(value.link);
}

export function normalizeLink(
  value: unknown,
  fallbackLabel?: string,
  _legacyFallbackHref?: string,
): CmsLink {
  if (!isRecord(value)) throw new Error('CMS link must be an object.');

  const href = linkHref(value);
  const label = text(value.label) ?? text(fallbackLabel);
  if (!href || !label) throw new Error('CMS link is missing a valid label or target.');

  return {
    label,
    href,
    newTab: typeof value.newTab === 'boolean' ? value.newTab : undefined,
    ariaLabel: text(value.ariaLabel),
  };
}

export function normalizeCta(
  value: unknown,
  fallbackLabel?: string,
  _legacyFallbackHref?: string,
): CmsCta {
  if (!isRecord(value)) throw new Error('CMS CTA must be an object.');

  const nested = normalizeLink(value.link, fallbackLabel);
  const label = text(value.label) ?? nested.label;
  if (!label) throw new Error('CMS CTA is missing a label.');

  return {
    ...nested,
    label,
    ariaLabel: text(value.ariaLabel) ?? nested.ariaLabel,
  };
}

export function getLinkRenderProps(link: CmsLink | CmsCta, fallbackAriaLabel?: string) {
  const ariaLabel = link.ariaLabel ?? fallbackAriaLabel;
  return {
    href: link.href,
    'aria-label': ariaLabel,
    target: link.newTab ? ('_blank' as const) : undefined,
    rel: link.newTab ? 'noopener noreferrer' : undefined,
  };
}
