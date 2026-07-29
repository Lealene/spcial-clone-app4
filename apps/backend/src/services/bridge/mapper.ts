import type {
  BridgeMedia,
  BridgeProperty,
  ListingFeature,
  ListingMlsStatus,
  ListingPropertyType,
  MappedListingData,
  StringListItem,
} from './types';

function present<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function setIfPresent<T extends object, K extends string>(
  target: T,
  key: K,
  value: unknown,
): asserts target is T & Record<K, Exclude<typeof value, null | undefined>> {
  if (present(value)) {
    Object.assign(target, { [key]: value });
  }
}

function slugifyPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildStreetAddress(property: BridgeProperty): string | undefined {
  const parts = [
    property.StreetNumber,
    property.StreetName,
    property.StreetSuffix,
    property.UnitNumber,
  ]
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim());

  if (parts.length === 0) return undefined;
  return parts.join(' ');
}

function buildSlug(
  property: BridgeProperty,
  streetAddress: string | undefined,
  mlsId: string,
): string {
  const street = streetAddress ?? property.UnparsedAddress ?? 'listing';
  const city = property.City ?? 'fl';
  return `${slugifyPart(street)}-${slugifyPart(city)}-fl-${slugifyPart(mlsId)}`;
}

function mapMlsStatus(value: string | null | undefined): ListingMlsStatus {
  const normalized = (value ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'active':
      return 'active';
    case 'pending':
      return 'pending';
    case 'under contract':
    case 'under-contract':
    case 'active under contract':
      return 'under-contract';
    case 'closed':
    case 'sold':
      return 'sold';
    case 'coming soon':
    case 'coming-soon':
      return 'coming-soon';
    default:
      return 'active';
  }
}

function mapPropertyType(subtype: string | null | undefined): ListingPropertyType | undefined {
  if (!present(subtype) || subtype.trim() === '') return undefined;
  const value = subtype.toLowerCase();

  if (value.includes('single family') || value.includes('single-family')) return 'single-family';
  if (value.includes('townhouse') || value.includes('townhome')) return 'townhouse';
  if (value.includes('multi') || value.includes('duplex') || value.includes('triplex')) {
    return 'multi-family';
  }
  if (value.includes('villa')) return 'villa';
  if (value.includes('land') || value.includes('lot')) return 'land';
  if (
    value.includes('condo') ||
    value.includes('low rise') ||
    value.includes('high rise') ||
    value.includes('mid rise') ||
    value.includes('apartment')
  ) {
    return 'condo';
  }
  return 'other';
}

function mapFeatures(property: BridgeProperty): ListingFeature[] | undefined {
  const features = new Set<ListingFeature>();
  if (property.WaterfrontYN === true) features.add('waterfront');
  if (property.PoolPrivateYN === true) features.add('private-pool');
  if (property.SeniorCommunityYN === true) features.add('55-plus');

  const amenityBlob = [
    ...(property.AssociationAmenities ?? []),
    ...(property.CommunityFeatures ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (/\bgolf\b/.test(amenityBlob)) features.add('golf');
  if (/\bgated\b/.test(amenityBlob)) features.add('gated');

  if (features.size === 0) return undefined;
  return [...features];
}

function toStringList(value: string[] | string | null | undefined): StringListItem[] | undefined {
  if (!present(value)) return undefined;
  const items = (Array.isArray(value) ? value : [value])
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => ({ item }));
  return items.length > 0 ? items : undefined;
}

function toCoordinate(value: number | string | null | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * RESO Latitude/Longitude → map coordinates.
 * Both axes must be valid; a lone axis is unusable. `0,0` is a feed sentinel, not Florida.
 */
function mapCoordinates(
  property: BridgeProperty,
): { latitude: number; longitude: number } | undefined {
  const latitude = toCoordinate(property.Latitude);
  const longitude = toCoordinate(property.Longitude);
  if (latitude === undefined || longitude === undefined) return undefined;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return undefined;
  if (latitude === 0 && longitude === 0) return undefined;
  return { latitude, longitude };
}

function mapGallery(media: BridgeMedia[] | null | undefined): MappedListingData['gallery'] {
  if (!present(media) || media.length === 0) return undefined;

  const mapped = media
    .filter(
      (item): item is BridgeMedia & { MediaKey: string; MediaURL: string } =>
        typeof item.MediaKey === 'string' &&
        item.MediaKey.length > 0 &&
        typeof item.MediaURL === 'string' &&
        item.MediaURL.length > 0,
    )
    .map((item) => ({
      url: item.MediaURL,
      mediaKey: item.MediaKey,
      order: typeof item.Order === 'number' ? item.Order : 0,
    }))
    .sort((a, b) => a.order - b.order);

  return mapped.length > 0 ? mapped : undefined;
}

/**
 * Pure RESO → listing mapper.
 * Omits keys for null/undefined sources so upserts do not overwrite author fills (D4).
 */
export function mapBridgePropertyToListing(property: BridgeProperty): MappedListingData {
  const listingKey = property.ListingKey?.trim();
  const mlsId = property.ListingId?.trim();
  if (!listingKey || !mlsId) {
    throw new Error('Bridge property requires ListingKey and ListingId');
  }

  const streetAddress = buildStreetAddress(property);
  const fullAddress = property.UnparsedAddress?.trim() || streetAddress;
  if (!fullAddress) {
    throw new Error(`Bridge property ${listingKey} is missing an address`);
  }

  const city = property.City?.trim();
  if (!city) {
    throw new Error(`Bridge property ${listingKey} is missing City`);
  }

  const price = property.ListPrice;
  if (!present(price)) {
    throw new Error(`Bridge property ${listingKey} is missing ListPrice`);
  }

  const mapped: MappedListingData = {
    listingKey,
    mlsId,
    slug: buildSlug(property, streetAddress, mlsId),
    fullAddress,
    city,
    price,
    mlsStatus: mapMlsStatus(property.MlsStatus ?? property.StandardStatus),
    isActive: true,
    rawData: property,
  };

  setIfPresent(mapped, 'streetAddress', streetAddress);
  setIfPresent(mapped, 'state', property.StateOrProvince?.trim());
  setIfPresent(mapped, 'zip', property.PostalCode?.trim());

  const coordinates = mapCoordinates(property);
  setIfPresent(mapped, 'latitude', coordinates?.latitude);
  setIfPresent(mapped, 'longitude', coordinates?.longitude);

  setIfPresent(mapped, 'beds', property.BedroomsTotal);
  setIfPresent(mapped, 'baths', property.BathroomsTotalDecimal);
  setIfPresent(mapped, 'sqft', property.LivingArea);

  if (present(property.LivingArea) && property.LivingArea > 0) {
    mapped.pricePerSqft = Math.round(price / property.LivingArea);
  }

  setIfPresent(mapped, 'propertyType', mapPropertyType(property.PropertySubType));
  setIfPresent(mapped, 'features', mapFeatures(property));
  setIfPresent(mapped, 'yearBuilt', property.YearBuilt);
  setIfPresent(mapped, 'lotSqft', property.LotSizeSquareFeet);
  setIfPresent(mapped, 'taxesYearly', property.TaxAnnualAmount);
  setIfPresent(mapped, 'hoaMonthly', property.AssociationFee);
  setIfPresent(mapped, 'publicRemarks', property.PublicRemarks?.trim());
  setIfPresent(mapped, 'listAgentName', property.ListAgentFullName?.trim());
  setIfPresent(mapped, 'listOfficeName', property.ListOfficeName?.trim());
  setIfPresent(mapped, 'modificationTimestamp', property.ModificationTimestamp);
  setIfPresent(mapped, 'gallery', mapGallery(property.Media));

  const interiorSpecs = {
    interiorFeatures: toStringList(property.InteriorFeatures),
    appliances: toStringList(property.Appliances),
    flooring: toStringList(property.Flooring),
    heating: toStringList(property.Heating),
    cooling: toStringList(property.Cooling),
    laundryFeatures: toStringList(property.LaundryFeatures),
  };
  const interiorPresent = Object.fromEntries(
    Object.entries(interiorSpecs).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(interiorPresent).length > 0) {
    mapped.interiorSpecs = interiorPresent;
  }

  const exteriorSpecs = {
    roof: toStringList(property.Roof),
    constructionMaterials: toStringList(property.ConstructionMaterials),
    parkingFeatures: toStringList(property.ParkingFeatures),
    poolFeatures: toStringList(property.PoolFeatures),
    lotFeatures: toStringList(property.LotFeatures),
    sewer: toStringList(property.Sewer),
    waterSource: toStringList(property.WaterSource),
  };
  const exteriorPresent = Object.fromEntries(
    Object.entries(exteriorSpecs).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(exteriorPresent).length > 0) {
    mapped.exteriorSpecs = exteriorPresent;
  }

  return mapped;
}
