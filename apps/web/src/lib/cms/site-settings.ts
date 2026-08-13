import {
  CMS_CACHE_TAGS,
  SITE_OPENING_DAYS,
  siteSettingsSchema,
  type SiteOpeningDay,
  type SiteOpeningHours,
  type SitePostalAddress,
  type SiteSettings,
} from '@mvp-realty/api-contracts';
import { connection } from 'next/server';

import { fetchJson } from './client';
import { isCmsAvailabilityError } from './errors';
import { normalizeOptionalMediaField } from './media';
import { array, isRecord, optionalNum, text } from './pages/primitives';
import { toTelHref } from './phone';

/**
 * Last-resort identity. The global is required to have a name, but the web app
 * must still render if the CMS is unreachable — this keeps the organization
 * node valid rather than dropping it.
 */
const FALLBACK_SETTINGS: SiteSettings = siteSettingsSchema.parse({ name: '55 Living Team' });

const OPENING_DAY_SET = new Set<string>(SITE_OPENING_DAYS);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalizeAddress(raw: unknown): SitePostalAddress | undefined {
  if (!isRecord(raw)) return undefined;
  const address: SitePostalAddress = {
    streetAddress: text(raw.streetAddress) || undefined,
    addressLocality: text(raw.addressLocality) || undefined,
    addressRegion: text(raw.addressRegion) || undefined,
    postalCode: text(raw.postalCode) || undefined,
    addressCountry: text(raw.addressCountry) || undefined,
  };
  // A region/country default alone is not an address; require a real line.
  return address.streetAddress || address.addressLocality ? address : undefined;
}

function normalizeOpeningHours(raw: unknown): SiteOpeningHours[] {
  return array(raw).flatMap((row) => {
    if (!isRecord(row)) return [];
    const days = array(row.days).filter((day): day is SiteOpeningDay =>
      typeof day === 'string' ? OPENING_DAY_SET.has(day) : false,
    );
    const opens = text(row.opens);
    const closes = text(row.closes);
    if (days.length === 0 || !TIME_PATTERN.test(opens) || !TIME_PATTERN.test(closes)) return [];
    return [{ days, opens, closes }];
  });
}

/** Array-of-object rows in Payload; flattened to plain strings for the graph. */
function normalizeRowValues(raw: unknown, key: string): string[] {
  return array(raw).flatMap((row) => {
    const value = isRecord(row) ? text(row[key]) : text(row);
    return value ? [value] : [];
  });
}

function normalizeSameAs(raw: unknown): string[] {
  return normalizeRowValues(raw, 'url').filter((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  });
}

export function normalizeSiteSettings(raw: unknown): SiteSettings {
  const doc = isRecord(raw) ? raw : {};
  const name = text(doc.name) || FALLBACK_SETTINGS.name;
  const phone = text(doc.phone) || undefined;
  const latitude = isRecord(doc.geo) ? optionalNum(doc.geo.latitude) : undefined;
  const longitude = isRecord(doc.geo) ? optionalNum(doc.geo.longitude) : undefined;

  const parsed = siteSettingsSchema.safeParse({
    name,
    legalName: text(doc.legalName) || undefined,
    description: text(doc.description) || undefined,
    logo: normalizeOptionalMediaField(doc.logo, `${name} logo`),
    defaultOgImage: normalizeOptionalMediaField(doc.defaultOgImage, name),
    email: text(doc.email) || undefined,
    phone,
    phoneHref: phone ? toTelHref(phone) : undefined,
    address: normalizeAddress(doc.address),
    geo: latitude != null && longitude != null ? { latitude, longitude } : undefined,
    priceRange: text(doc.priceRange) || undefined,
    areaServed: normalizeRowValues(doc.areaServed, 'value'),
    openingHours: normalizeOpeningHours(doc.openingHours),
    sameAs: normalizeSameAs(doc.sameAs),
    licenseNumber: text(doc.licenseNumber) || undefined,
  });

  return parsed.success ? parsed.data : FALLBACK_SETTINGS;
}

/**
 * Read on every request through the root layout, so a CMS outage must not blank
 * the site: the fallback keeps metadata and JSON-LD rendering.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await fetchJson('/api/globals/site-settings?depth=1', {
      tags: [CMS_CACHE_TAGS.siteSettings],
    });
    return normalizeSiteSettings(raw);
  } catch (error) {
    if (!isCmsAvailabilityError(error)) throw error;
    await connection();
    return FALLBACK_SETTINGS;
  }
}
