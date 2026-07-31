import {
  COMMUNITY_AMENITY_ICONS,
  areaPdpMetaSchema,
  communityDetailSchema,
  type AreaPdpMeta,
  type CmsImage,
  type CommunityAmenityIcon,
  type CommunityDetail,
  type SimilarCommunity,
} from '@mvp-realty/api-contracts';

import { normalizeBroker } from '../brokers';
import { normalizeMediaField } from '../media';
import { toTelHref } from '../phone';
import { lexicalToParagraphs } from '../rich-text';
import { normalizeSeo } from '../seo';

function isoDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

const FALLBACK_IMAGE: CmsImage = {
  src: '/images/community-bonita-bay.jpg',
  alt: 'Southwest Florida gated community',
};

const AMENITY_ICON_SET = new Set<string>(COMMUNITY_AMENITY_ICONS);

const TAG_LIMIT = 6;

export type CommunityAreaCard = {
  slug: string;
  name: string;
  locality: string;
  rating: number | null;
  reviews: number;
  reviewsLabel: string;
  priceRange: string;
  tags: string[];
  residences: number | null;
  residencesLabel: string;
  nowSelling: number;
  nowSellingLabel: string;
  image: CmsImage;
  href: string;
};

export type CommunityAreaStripItem = {
  slug: string;
  name: string;
  blurb: string;
  href: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function formatCompactPrice(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const rounded = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1);
    return `$${rounded}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

/** MLS can store tiny outliers; ignore display floors below this. */
const PRICE_DISPLAY_FLOOR = 50_000;

export function formatAreaPriceRange(
  authored: string | undefined,
  priceMin: number | undefined,
  priceMax: number | undefined,
): string {
  if (authored) return authored;

  const min = priceMin != null && priceMin >= PRICE_DISPLAY_FLOOR ? priceMin : undefined;
  const max = priceMax != null && priceMax >= PRICE_DISPLAY_FLOOR ? priceMax : undefined;

  if (min != null && max != null) return `${formatCompactPrice(min)} – ${formatCompactPrice(max)}`;
  if (min != null) return `From ${formatCompactPrice(min)}`;
  if (max != null) return `Up to ${formatCompactPrice(max)}`;
  return 'Pricing on request';
}

function tagsFromArea(raw: Record<string, unknown>): string[] {
  const fromAmenities = Array.isArray(raw.amenities)
    ? raw.amenities
        .map((row) => (isRecord(row) ? text(row.title) : undefined))
        .filter((label): label is string => Boolean(label))
    : [];

  if (fromAmenities.length > 0) return fromAmenities.slice(0, TAG_LIMIT);

  const derived: string[] = [];
  if (raw.is55Plus === true) derived.push('55+');
  if (raw.isGated === true) derived.push('Gated');
  return derived.slice(0, TAG_LIMIT);
}

function resolveGalleryImage(raw: Record<string, unknown>, fallbackAlt: string): CmsImage {
  const gallery = Array.isArray(raw.gallery) ? raw.gallery : [];
  const first = gallery.find(isRecord);
  if (!first) {
    return { ...FALLBACK_IMAGE, alt: fallbackAlt };
  }

  try {
    return normalizeMediaField(
      {
        image: first.image,
        altOverride: text(first.alt),
      },
      fallbackAlt,
    );
  } catch {
    return { ...FALLBACK_IMAGE, alt: fallbackAlt };
  }
}

export function normalizeCommunityAreaCard(raw: unknown): CommunityAreaCard | null {
  if (!isRecord(raw)) return null;
  if (text(raw.kind) !== 'community') return null;

  const slug = text(raw.slug);
  const name = text(raw.name);
  const city = text(raw.city);
  if (!slug || !name || !city) return null;

  const locality = areaLocality(raw, city);
  const rating = finiteNumber(raw.rating) ?? null;
  const reviews = Math.max(0, Math.round(finiteNumber(raw.reviewCount) ?? 0));
  const residences = finiteNumber(raw.totalResidences);
  const nowSelling = Math.max(0, Math.round(finiteNumber(raw.activeCount) ?? 0));

  return {
    slug,
    name,
    locality,
    rating,
    reviews,
    reviewsLabel: 'reviews',
    priceRange: formatAreaPriceRange(
      text(raw.priceRange),
      finiteNumber(raw.priceMin),
      finiteNumber(raw.priceMax),
    ),
    tags: tagsFromArea(raw),
    residences: residences != null ? Math.max(0, Math.round(residences)) : null,
    residencesLabel: 'residences',
    nowSelling,
    nowSellingLabel: 'now selling',
    image: resolveGalleryImage(raw, name),
    href: `/communities/${slug}`,
  };
}

export function normalizeCommunityAreaStripItem(raw: unknown): CommunityAreaStripItem | null {
  if (!isRecord(raw)) return null;
  if (text(raw.kind) !== 'community') return null;

  const slug = text(raw.slug);
  const name = text(raw.name);
  const city = text(raw.city);
  if (!slug || !name || !city) return null;

  const blurb = text(raw.blurb) ?? city;

  return {
    slug,
    name,
    blurb,
    href: `/communities/${slug}`,
  };
}

export function areaLocality(raw: Record<string, unknown>, city: string): string {
  const blurb = text(raw.blurb);
  return text(raw.locality) ?? (blurb ? `${city} · ${blurb}` : city);
}

function amenityIcon(value: unknown): CommunityAmenityIcon {
  return typeof value === 'string' && AMENITY_ICON_SET.has(value)
    ? (value as CommunityAmenityIcon)
    : 'club';
}

export function normalizeSimilarCommunity(raw: unknown): SimilarCommunity | null {
  if (typeof raw === 'number' || typeof raw === 'string') return null;
  if (!isRecord(raw)) return null;
  if (text(raw.kind) !== 'community') return null;

  const slug = text(raw.slug);
  const name = text(raw.name);
  const city = text(raw.city);
  if (!slug || !name || !city) return null;

  const residences = finiteNumber(raw.totalResidences);

  return {
    slug,
    name,
    locality: areaLocality(raw, city),
    rating: finiteNumber(raw.rating) ?? null,
    reviews: Math.max(0, Math.round(finiteNumber(raw.reviewCount) ?? 0)),
    priceRange: formatAreaPriceRange(
      text(raw.priceRange),
      finiteNumber(raw.priceMin),
      finiteNumber(raw.priceMax),
    ),
    residences: residences != null ? Math.max(0, Math.round(residences)) : null,
    image: resolveGalleryImage(raw, name),
  };
}

export function normalizeAreaPdpMeta(raw: unknown): AreaPdpMeta | null {
  if (!isRecord(raw)) return null;
  if (text(raw.kind) !== 'community') return null;

  const slug = text(raw.slug);
  const name = text(raw.name);
  const city = text(raw.city);
  if (!slug || !name || !city) return null;

  const totalResidences = finiteNumber(raw.totalResidences);
  const soldCount = finiteNumber(raw.soldCount);

  const candidate = {
    slug,
    name,
    city,
    totalResidences: totalResidences != null ? Math.max(0, Math.round(totalResidences)) : null,
    isGated: typeof raw.isGated === 'boolean' ? raw.isGated : null,
    is55Plus: typeof raw.is55Plus === 'boolean' ? raw.is55Plus : null,
    ...(soldCount != null ? { soldCount: Math.max(0, Math.round(soldCount)) } : {}),
    detailBlurb: text(raw.detailBlurb),
    broker: normalizeBroker(raw.broker),
  };

  const parsed = areaPdpMetaSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function normalizeCommunityDetail(raw: unknown): CommunityDetail | null {
  if (!isRecord(raw)) return null;
  if (text(raw.kind) !== 'community') return null;

  const slug = text(raw.slug);
  const name = text(raw.name);
  const city = text(raw.city);
  if (!slug || !name || !city) return null;

  const galleryRows = Array.isArray(raw.gallery) ? raw.gallery : [];
  const gallery: CmsImage[] = [];
  for (const row of galleryRows) {
    if (!isRecord(row)) continue;
    try {
      gallery.push(normalizeMediaField({ image: row.image, altOverride: text(row.alt) }, name));
    } catch {
      // drop failed rows
    }
  }
  if (gallery.length === 0) {
    gallery.push({ ...FALLBACK_IMAGE, alt: name });
  }

  const authoredPhotoCount = finiteNumber(raw.photoCount);
  const photoCount =
    authoredPhotoCount != null
      ? Math.max(gallery.length, Math.round(authoredPhotoCount))
      : gallery.length;

  const phone = text(raw.phone);
  const facts = Array.isArray(raw.facts)
    ? raw.facts.flatMap((row) => {
        if (!isRecord(row)) return [];
        const label = text(row.label);
        const value = text(row.value);
        if (!label || !value) return [];
        return [{ label, value }];
      })
    : [];

  const amenities = Array.isArray(raw.amenities)
    ? raw.amenities.flatMap((row) => {
        if (!isRecord(row)) return [];
        const title = text(row.title);
        if (!title) return [];
        return [{ icon: amenityIcon(row.icon), title }];
      })
    : [];

  const clubs = Array.isArray(raw.clubs)
    ? raw.clubs.flatMap((row) => {
        if (!isRecord(row)) return [];
        const item = text(row.item);
        return item ? [item] : [];
      })
    : [];

  const reviewBars = Array.isArray(raw.reviewBars)
    ? raw.reviewBars.flatMap((row) => {
        if (!isRecord(row)) return [];
        const label = text(row.label);
        const score = text(row.score);
        const pct = finiteNumber(row.pct);
        if (!label || !score || pct === undefined) return [];
        return [{ label, pct, score }];
      })
    : [];

  const reviewCards = Array.isArray(raw.reviews)
    ? raw.reviews.flatMap((row) => {
        if (!isRecord(row)) return [];
        const quote = text(row.quote);
        const who = text(row.who);
        if (!quote || !who) return [];
        return [{ quote, who, meta: text(row.meta) }];
      })
    : [];

  const faqs = Array.isArray(raw.faqs)
    ? raw.faqs.flatMap((row) => {
        if (!isRecord(row)) return [];
        const q = text(row.question);
        const a = text(row.answer);
        if (!q || !a) return [];
        return [{ q, a }];
      })
    : [];

  const similar = Array.isArray(raw.similar)
    ? raw.similar
        .map(normalizeSimilarCommunity)
        .filter((row): row is SimilarCommunity => row !== null)
        .slice(0, 4)
    : [];

  const soldCount = finiteNumber(raw.soldCount);

  const candidate = {
    slug,
    name,
    city,
    blurb: text(raw.detailBlurb) ?? text(raw.blurb) ?? `${city}, Florida`,
    rating: finiteNumber(raw.rating) ?? null,
    reviews: Math.max(0, Math.round(finiteNumber(raw.reviewCount) ?? 0)),
    photoCount,
    gallery,
    facts,
    about: lexicalToParagraphs(raw.about),
    amenities,
    clubs,
    reviewBars,
    reviewCards,
    faqs,
    phone,
    phoneHref: toTelHref(phone),
    ...(soldCount != null ? { soldCount: Math.max(0, Math.round(soldCount)) } : {}),
    similar,
    broker: normalizeBroker(raw.broker),
    seo: normalizeSeo(raw.seo),
    updatedAt: isoDate(raw.updatedAt),
  };

  const parsed = communityDetailSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
