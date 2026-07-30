import {
  listingCardSchema,
  listingDetailSchema,
  listingMlsStatusSchema,
  listingPropertyTypeSchema,
  listingTypeFacetSchema,
  type ListingCard,
  type ListingDetail,
  type ListingMlsStatus,
  type ListingPropertyType,
  type ListingTypeFacet,
  type ListingUiFeature,
} from '@mvp-realty/api-contracts';

import { env } from '@/env';

import { normalizeBroker, resolveBroker } from '../brokers';

const BRIDGE_CDN_HOST = 'dvvjkgh94f2v6.cloudfront.net';
const FALLBACK_IMAGE = {
  src: '/images/community-bonita-bay.jpg',
  alt: 'Southwest Florida residence',
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

/**
 * Measurements the schema requires to be positive. The MLS reports `0` for
 * things a property simply doesn't have — condos always carry
 * `LotSizeSquareFeet: 0` — so treat non-positive as absent instead of letting
 * `listingDetailSchema` reject the doc and 404 the PDP.
 */
function positiveNumber(value: unknown): number | undefined {
  const parsed = finiteNumber(value);
  return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

/**
 * Map coordinates, both axes or neither. Bad values are dropped here rather than
 * failing `listingDetailSchema` — a nonsense latitude must not 404 the whole PDP.
 */
function coordinates(
  rawLatitude: unknown,
  rawLongitude: unknown,
): { latitude: number; longitude: number } | Record<string, never> {
  const latitude = finiteNumber(rawLatitude);
  const longitude = finiteNumber(rawLongitude);
  if (latitude === undefined || longitude === undefined) return {};
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return {};
  if (latitude === 0 && longitude === 0) return {};
  return { latitude, longitude };
}

function allowedImageOrigins(): string[] {
  const origins = [new URL(env.NEXT_PUBLIC_BACKEND_URL).origin];
  if (env.NEXT_PUBLIC_MEDIA_URL) {
    origins.push(new URL(env.NEXT_PUBLIC_MEDIA_URL).origin);
  }
  origins.push(`https://${BRIDGE_CDN_HOST}`);
  return origins;
}

function toListingImageUrl(url: string): string | null {
  if (url.startsWith('//')) return null;
  if (url.startsWith('/images/')) return url;
  if (url.startsWith('/')) return new URL(url, env.NEXT_PUBLIC_BACKEND_URL).toString();

  try {
    const parsed = new URL(url);
    if (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      allowedImageOrigins().includes(parsed.origin)
    ) {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

function mapFeature(raw: unknown): ListingUiFeature | null {
  switch (raw) {
    case 'waterfront':
      return 'waterfront';
    case 'private-pool':
      return 'pool';
    case 'golf':
      return 'golf';
    case 'gated':
      return 'gated';
    case '55-plus':
      return '55plus';
    default:
      return null;
  }
}

function mapFeatures(raw: unknown): ListingUiFeature[] {
  if (!Array.isArray(raw)) return [];
  const out: ListingUiFeature[] = [];
  for (const item of raw) {
    const mapped = mapFeature(item);
    if (mapped && !out.includes(mapped)) out.push(mapped);
  }
  return out;
}

function resolveArea(raw: unknown): { slug: string; name: string } | null {
  if (!isRecord(raw)) return null;
  const slug = text(raw.slug);
  const name = text(raw.name);
  if (!slug || !name) return null;
  return { slug, name };
}

function resolveHeroImage(
  hero: unknown,
  gallery: unknown,
  alt: string,
): { src: string; alt: string; width?: number; height?: number } {
  if (isRecord(hero)) {
    const url = text(hero.url);
    const src = url ? toListingImageUrl(url) : null;
    if (src) {
      return {
        src,
        alt: text(hero.alt) ?? alt,
        width: finiteNumber(hero.width),
        height: finiteNumber(hero.height),
      };
    }
  }

  if (Array.isArray(gallery)) {
    const sorted = gallery
      .filter(isRecord)
      .slice()
      .sort((a, b) => (finiteNumber(a.order) ?? 0) - (finiteNumber(b.order) ?? 0));
    for (const shot of sorted) {
      const url = text(shot.url);
      const src = url ? toListingImageUrl(url) : null;
      if (src) return { src, alt };
    }
  }

  return { ...FALLBACK_IMAGE, alt };
}

function typeFacet(
  isEstate: boolean,
  propertyType: ListingPropertyType | undefined,
): ListingTypeFacet {
  if (isEstate) return 'estate';
  const parsed = listingTypeFacetSchema.safeParse(propertyType);
  return parsed.success ? parsed.data : 'other';
}

function stringListItems(group: unknown, key: string): string[] {
  if (!isRecord(group)) return [];
  const rows = group[key];
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => (isRecord(row) ? text(row.item) : undefined))
    .filter((item): item is string => Boolean(item));
}

function checklistGroup(heading: string, items: string[]) {
  if (items.length === 0) return null;
  return {
    heading,
    layout: 'check' as const,
    items: items.map((label) => ({ label })),
  };
}

function buildInterior(specs: unknown) {
  const groups = [
    checklistGroup('Interior features', stringListItems(specs, 'interiorFeatures')),
    checklistGroup('Appliances', stringListItems(specs, 'appliances')),
    checklistGroup('Flooring', stringListItems(specs, 'flooring')),
    checklistGroup('Heating', stringListItems(specs, 'heating')),
    checklistGroup('Cooling', stringListItems(specs, 'cooling')),
    checklistGroup('Laundry', stringListItems(specs, 'laundryFeatures')),
  ];
  return groups.filter((g): g is NonNullable<typeof g> => g !== null);
}

function buildExterior(specs: unknown) {
  const groups = [
    checklistGroup('Roof', stringListItems(specs, 'roof')),
    checklistGroup('Construction', stringListItems(specs, 'constructionMaterials')),
    checklistGroup('Parking', stringListItems(specs, 'parkingFeatures')),
    checklistGroup('Pool', stringListItems(specs, 'poolFeatures')),
    checklistGroup('Lot', stringListItems(specs, 'lotFeatures')),
    checklistGroup('Sewer', stringListItems(specs, 'sewer')),
    checklistGroup('Water', stringListItems(specs, 'waterSource')),
  ];
  return groups.filter((g): g is NonNullable<typeof g> => g !== null);
}

function buildGallery(
  hero: { src: string; alt: string },
  gallery: unknown,
  name: string,
): Array<{ src: string; alt: string }> {
  const shots: Array<{ src: string; alt: string }> = [{ src: hero.src, alt: hero.alt }];
  const seen = new Set([hero.src]);

  if (Array.isArray(gallery)) {
    const sorted = gallery
      .filter(isRecord)
      .slice()
      .sort((a, b) => (finiteNumber(a.order) ?? 0) - (finiteNumber(b.order) ?? 0));
    for (const [index, shot] of sorted.entries()) {
      const url = text(shot.url);
      const src = url ? toListingImageUrl(url) : null;
      if (!src || seen.has(src)) continue;
      seen.add(src);
      shots.push({ src, alt: `${name} — photo ${index + 1}` });
    }
  }

  return shots;
}

function buildFloorPlan(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((row) => {
    if (!isRecord(row)) return [];
    const area = text(row.area);
    const name = text(row.name);
    if (!area || !name) return [];
    const tone = row.tone === 'primary' || row.tone === 'common' ? row.tone : undefined;
    return [{ area, name, note: text(row.note), tone }];
  });
}

export function normalizeListingCard(raw: unknown): ListingCard | null {
  if (!isRecord(raw)) return null;

  const area = resolveArea(raw.area);
  if (!area) return null;

  const slug = text(raw.slug);
  const name = text(raw.streetAddress) ?? text(raw.fullAddress);
  const city = text(raw.city);
  const price = finiteNumber(raw.price);
  if (!slug || !name || !city || price === undefined) return null;

  const propertyTypeParsed = listingPropertyTypeSchema.safeParse(raw.propertyType);
  const propertyType = propertyTypeParsed.success ? propertyTypeParsed.data : undefined;
  const statusParsed = listingMlsStatusSchema.safeParse(raw.mlsStatus);
  const status: ListingMlsStatus = statusParsed.success ? statusParsed.data : 'active';
  const isEstate = raw.isEstate === true;
  const image = resolveHeroImage(raw.heroImage, raw.gallery, name);

  const candidate = {
    slug,
    name,
    community: area.slug,
    communityName: area.name,
    city,
    price,
    beds: finiteNumber(raw.beds) ?? 0,
    baths: finiteNumber(raw.baths) ?? 0,
    sqft: finiteNumber(raw.sqft) ?? 0,
    propertyType,
    type: typeFacet(isEstate, propertyType),
    status,
    features: mapFeatures(raw.features),
    isEstate,
    isActive: raw.isActive !== false,
    image,
  };

  const parsed = listingCardSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function normalizeListingDetail(raw: unknown): ListingDetail | null {
  const card = normalizeListingCard(raw);
  if (!card || !isRecord(raw)) return null;

  const mlsId = text(raw.mlsId);
  const fullAddress = text(raw.fullAddress);
  if (!mlsId || !fullAddress) return null;

  const gallery = buildGallery(card.image, raw.gallery, card.name);
  const highlights = stringListItems({ highlights: raw.highlights }, 'highlights');

  const areaBroker = isRecord(raw.area) ? normalizeBroker(raw.area.broker) : null;

  const candidate = {
    ...card,
    mlsId,
    fullAddress,
    streetAddress: text(raw.streetAddress),
    state: text(raw.state) ?? 'FL',
    zip: text(raw.zip),
    ...coordinates(raw.latitude, raw.longitude),
    pricePerSqft: positiveNumber(raw.pricePerSqft),
    yearBuilt: finiteNumber(raw.yearBuilt),
    lotSqft: positiveNumber(raw.lotSqft),
    taxesYearly: finiteNumber(raw.taxesYearly),
    hoaMonthly: finiteNumber(raw.hoaMonthly),
    publicRemarks: text(raw.publicRemarks),
    listAgentName: text(raw.listAgentName),
    listOfficeName: text(raw.listOfficeName),
    badge: text(raw.badge),
    neighborhoodBlurb: text(raw.neighborhoodBlurb),
    highlights,
    gallery,
    interior: buildInterior(raw.interiorSpecs),
    exterior: buildExterior(raw.exteriorSpecs),
    floorPlan: buildFloorPlan(raw.floorPlan),
    broker: resolveBroker(normalizeBroker(raw.broker), areaBroker),
  };

  const parsed = listingDetailSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
