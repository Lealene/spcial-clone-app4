import type { CmsCta, CmsLink } from '@mvp-realty/api-contracts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pageHref(page: unknown): string {
  if (!isRecord(page)) return '/';
  const slug = typeof page.slug === 'string' ? page.slug : '';
  if (slug === 'home') return '/';
  return slug ? `/${slug}` : '/';
}

export function hasLinkTarget(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const type = typeof value.type === 'string' ? value.type : 'custom';
  if (type === 'internal') return Boolean(value.page);
  if (type === 'custom') return typeof value.customUrl === 'string' && value.customUrl.length > 0;
  if (type === 'anchor') return typeof value.anchor === 'string' && value.anchor.length > 0;
  if (type === 'phone') return typeof value.phone === 'string' && value.phone.length > 0;
  if (type === 'email') return typeof value.email === 'string' && value.email.length > 0;
  return false;
}

export function hasCtaTarget(value: unknown): boolean {
  return isRecord(value) && hasLinkTarget(value.link);
}

export function normalizeLink(value: unknown, fallbackLabel = 'Link', fallbackHref = '#'): CmsLink {
  const link = isRecord(value) ? value : {};
  const type = typeof link.type === 'string' ? link.type : 'custom';
  let href = fallbackHref;

  if (type === 'internal') href = pageHref(link.page);
  if (type === 'custom' && typeof link.customUrl === 'string') href = link.customUrl;
  if (type === 'anchor' && typeof link.anchor === 'string') href = link.anchor;
  if (type === 'phone' && typeof link.phone === 'string')
    href = `tel:${link.phone.replace(/[^+\d]/g, '')}`;
  if (type === 'email' && typeof link.email === 'string') href = `mailto:${link.email}`;

  return {
    label: typeof link.label === 'string' && link.label ? link.label : fallbackLabel,
    href,
    newTab: typeof link.newTab === 'boolean' ? link.newTab : undefined,
    ariaLabel: typeof link.ariaLabel === 'string' ? link.ariaLabel : undefined,
  };
}

export function normalizeCta(
  value: unknown,
  fallbackLabel = 'Learn more',
  fallbackHref = '#',
): CmsCta {
  const cta = isRecord(value) ? value : {};
  const nested = normalizeLink(cta.link, fallbackLabel, fallbackHref);
  return {
    ...nested,
    label: typeof cta.label === 'string' && cta.label ? cta.label : nested.label,
    ariaLabel: typeof cta.ariaLabel === 'string' ? cta.ariaLabel : nested.ariaLabel,
  };
}

export function getLinkRenderProps(link: CmsLink | CmsCta, fallbackAriaLabel?: string) {
  const ariaLabel = link.ariaLabel ?? fallbackAriaLabel;
  return {
    href: link.href,
    'aria-label': ariaLabel,
    target: link.newTab ? '_blank' : undefined,
    rel: link.newTab ? 'noopener noreferrer' : undefined,
  };
}
