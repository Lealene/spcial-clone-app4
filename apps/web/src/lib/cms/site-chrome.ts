import {
  CMS_CACHE_TAGS,
  footerGlobalSchema,
  headerGlobalSchema,
  type FooterGlobal,
  type HeaderGlobal,
} from '@mvp-realty/api-contracts';
import { connection } from 'next/server';

import { footerFallback, headerFallback } from '@/data/site-chrome';

import { getCommunityNavItems, type CommunityNavItem } from './areas';
import { fetchJson } from './client';
import { isCmsAvailabilityError } from './errors';
import { normalizeCta, normalizeLink } from './links';
import { normalizeOptionalMediaField } from './media';
import { array, isRecord, optionalNum, text } from './pages/primitives';

const DEFAULT_COMMUNITY_COLUMN_LIMIT = 6;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requiredText(value: unknown, field: string): string {
  const normalized = text(value);
  if (!normalized) throw new Error(`CMS ${field} is required.`);
  return normalized;
}

function resolveBrandDisplayMode(raw: unknown, logo: unknown): 'text' | 'logo' {
  return text(raw) === 'logo' && logo ? 'logo' : 'text';
}

function toCommunityNavItem(value: unknown): CommunityNavItem | null {
  if (!isRecord(value)) return null;
  const slug = text(value.slug);
  const name = text(value.name);
  if (!slug || !name || !SLUG_PATTERN.test(slug)) return null;
  return { slug, name };
}

/**
 * Community-sourced footer columns resolve to plain links here, so `FooterGlobal`
 * and `SiteFooter` stay a flat `columns[].links[]` shape.
 */
function communityColumnLinks(
  column: Record<string, unknown>,
  communities: CommunityNavItem[],
): FooterGlobal['columns'][number]['links'] {
  const overrides = array(column.communityOverrides)
    .map(toCommunityNavItem)
    .filter((item): item is CommunityNavItem => item !== null);

  const limit = optionalNum(column.communityLimit) ?? DEFAULT_COMMUNITY_COLUMN_LIMIT;
  const source = overrides.length > 0 ? overrides : communities.slice(0, Math.max(1, limit));

  return source.map((community) => ({
    label: community.name,
    link: { label: community.name, href: `/communities/${community.slug}` },
  }));
}

export function normalizeHeader(raw: unknown): HeaderGlobal {
  if (!isRecord(raw)) throw new Error('CMS header must be an object.');

  const brandLabel = requiredText(raw.brandLabel, 'header brand label');
  const brandLogo = normalizeOptionalMediaField(raw.brandLogo, brandLabel);

  return headerGlobalSchema.parse({
    brandHomeLink: normalizeLink(raw.brandHomeLink),
    brandDisplayMode: resolveBrandDisplayMode(raw.brandDisplayMode, brandLogo),
    brandLabel,
    brandMarkAlt: text(raw.brandMarkAlt) || undefined,
    brandLogo,
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

export function normalizeFooter(raw: unknown, communities: CommunityNavItem[] = []): FooterGlobal {
  if (!isRecord(raw)) throw new Error('CMS footer must be an object.');

  const brandName = requiredText(raw.brandName, 'footer brand name');
  const brandLogo = normalizeOptionalMediaField(raw.brandLogo, brandName);

  return footerGlobalSchema.parse({
    brandName,
    brandDisplayMode: resolveBrandDisplayMode(raw.brandDisplayMode, brandLogo),
    brandAccentText: text(raw.brandAccentText) || undefined,
    brandLogo,
    brandBlurb: requiredText(raw.brandBlurb, 'footer brand blurb'),
    columns: array(raw.columns).map((column) => {
      if (!isRecord(column)) throw new Error('CMS footer column must be an object.');
      const title = requiredText(column.title, 'footer column title');

      if (text(column.source) === 'communities') {
        return { title, links: communityColumnLinks(column, communities) };
      }

      return {
        title,
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
  try {
    return normalizeHeader(
      await fetchJson('/api/globals/header?depth=2', { tags: [CMS_CACHE_TAGS.header] }),
    );
  } catch (error) {
    if (!isCmsAvailabilityError(error)) throw error;
    await connection();
    return headerFallback;
  }
}

/** True only when a column needs the Areas query — pinned overrides arrive populated at depth 2. */
function needsCommunityQuery(raw: unknown): boolean {
  if (!isRecord(raw)) return false;
  return array(raw.columns).some(
    (column) =>
      isRecord(column) &&
      text(column.source) === 'communities' &&
      array(column.communityOverrides).length === 0,
  );
}

export async function getFooterContent(): Promise<FooterGlobal> {
  try {
    // Tagged with `areas` too: publishing a community must refresh auto footer columns.
    const raw = await fetchJson('/api/globals/footer?depth=2', {
      tags: [CMS_CACHE_TAGS.footer, CMS_CACHE_TAGS.areas],
    });

    const communities = needsCommunityQuery(raw) ? await getCommunityNavItems() : [];
    return normalizeFooter(raw, communities);
  } catch (error) {
    if (!isCmsAvailabilityError(error)) throw error;
    await connection();
    return footerFallback;
  }
}
