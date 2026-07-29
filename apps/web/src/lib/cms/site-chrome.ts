import {
  CMS_CACHE_TAGS,
  footerGlobalSchema,
  headerGlobalSchema,
  type FooterGlobal,
  type HeaderGlobal,
} from '@mvp-realty/api-contracts';

import { fetchJson } from './client';
import { normalizeCta, normalizeLink } from './links';
import { array, isRecord, text } from './pages/primitives';

function requiredText(value: unknown, field: string): string {
  const normalized = text(value);
  if (!normalized) throw new Error(`CMS ${field} is required.`);
  return normalized;
}

export function normalizeHeader(raw: unknown): HeaderGlobal {
  if (!isRecord(raw)) throw new Error('CMS header must be an object.');

  return headerGlobalSchema.parse({
    brandHomeLink: normalizeLink(raw.brandHomeLink),
    brandLabel: requiredText(raw.brandLabel, 'header brand label'),
    brandMarkAlt: text(raw.brandMarkAlt) || undefined,
    navItems: array(raw.navItems).map((item) => {
      if (!isRecord(item)) throw new Error('CMS header navigation item must be an object.');
      const label = requiredText(item.label, 'header navigation label');
      return {
        label,
        link: normalizeLink(item.link, label),
        ariaLabel: text(item.ariaLabel) || undefined,
      };
    }),
    primaryCta: normalizeCta(raw.primaryCta),
    mobileMenuLabel: requiredText(raw.mobileMenuLabel, 'mobile menu label'),
    mobileMenuCloseLabel: requiredText(raw.mobileMenuCloseLabel, 'mobile menu close label'),
  });
}

export function normalizeFooter(raw: unknown): FooterGlobal {
  if (!isRecord(raw)) throw new Error('CMS footer must be an object.');

  return footerGlobalSchema.parse({
    brandName: requiredText(raw.brandName, 'footer brand name'),
    brandAccentText: text(raw.brandAccentText) || undefined,
    brandBlurb: requiredText(raw.brandBlurb, 'footer brand blurb'),
    columns: array(raw.columns).map((column) => {
      if (!isRecord(column)) throw new Error('CMS footer column must be an object.');
      return {
        title: requiredText(column.title, 'footer column title'),
        links: array(column.links).map((item) => {
          if (!isRecord(item)) throw new Error('CMS footer link must be an object.');
          const label = requiredText(item.label, 'footer link label');
          return {
            label,
            link: normalizeLink(item.link, label),
            ariaLabel: text(item.ariaLabel) || undefined,
          };
        }),
      };
    }),
    bottomLeftText: requiredText(raw.bottomLeftText, 'footer bottom text'),
    bottomRightLinks: array(raw.bottomRightLinks).map((item) => {
      const row = isRecord(item) ? item : {};
      return normalizeLink(row.link ?? item);
    }),
    bottomRightTextFallback: text(raw.bottomRightTextFallback) || undefined,
  });
}

export async function getHeaderContent(): Promise<HeaderGlobal> {
  return normalizeHeader(
    await fetchJson('/api/globals/header?depth=2', { tags: [CMS_CACHE_TAGS.header] }),
  );
}

export async function getFooterContent(): Promise<FooterGlobal> {
  return normalizeFooter(
    await fetchJson('/api/globals/footer?depth=2', { tags: [CMS_CACHE_TAGS.footer] }),
  );
}
