import {
  footerGlobalSchema,
  headerGlobalSchema,
  type FooterGlobal,
  type HeaderGlobal,
} from '@mvp-realty/api-contracts';

import { footerFixture, headerFixture } from '@/data/homepage-fixture';
import { fetchJson } from './client';
import { normalizeCta, normalizeLink } from './links';
import { array, isRecord, text } from './pages/primitives';

export function normalizeHeader(raw: unknown): HeaderGlobal {
  const data = isRecord(raw) ? raw : {};
  return headerGlobalSchema.parse({
    brandHomeLink: normalizeLink(data.brandHomeLink, 'MVP Realty home', '/'),
    brandLabel: text(data.brandLabel, 'MVP Realty'),
    brandMarkAlt: text(data.brandMarkAlt) || undefined,
    navItems: array(data.navItems).map((item) => {
      const row = isRecord(item) ? item : {};
      return {
        label: text(row.label, 'Link'),
        link: normalizeLink(row.link, text(row.label, 'Link'), '#'),
        ariaLabel: text(row.ariaLabel) || undefined,
      };
    }),
    primaryCta: normalizeCta(data.primaryCta, 'Request My Shortlist', '/#lead'),
    mobileMenuLabel: text(data.mobileMenuLabel, 'Menu'),
    mobileMenuCloseLabel: text(data.mobileMenuCloseLabel, 'Close menu'),
  });
}

export function normalizeFooter(raw: unknown): FooterGlobal {
  const data = isRecord(raw) ? raw : {};
  return footerGlobalSchema.parse({
    brandName: text(data.brandName, 'MVP'),
    brandAccentText: text(data.brandAccentText) || undefined,
    brandBlurb: text(data.brandBlurb, footerFixture.brandBlurb),
    columns: array(data.columns).map((column) => {
      const col = isRecord(column) ? column : {};
      return {
        title: text(col.title, 'Links'),
        links: array(col.links).map((item) => {
          const row = isRecord(item) ? item : {};
          return {
            label: text(row.label, 'Link'),
            link: normalizeLink(row.link, text(row.label, 'Link'), '#'),
            ariaLabel: text(row.ariaLabel) || undefined,
          };
        }),
      };
    }),
    bottomLeftText: text(data.bottomLeftText, footerFixture.bottomLeftText),
    bottomRightLinks: array(data.bottomRightLinks).map((item) => {
      const row = isRecord(item) ? item : {};
      return normalizeLink(row.link ?? item, 'Link', '#');
    }),
    bottomRightTextFallback: text(data.bottomRightTextFallback) || undefined,
  });
}

export async function getHeaderContent(): Promise<HeaderGlobal> {
  try {
    return normalizeHeader(await fetchJson('/api/globals/header?depth=2'));
  } catch {
    return headerFixture;
  }
}

export async function getFooterContent(): Promise<FooterGlobal> {
  try {
    return normalizeFooter(await fetchJson('/api/globals/footer?depth=2'));
  } catch {
    return footerFixture;
  }
}
