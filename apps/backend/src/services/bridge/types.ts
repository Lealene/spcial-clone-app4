/** RESO Property + embedded Media as returned by Bridge OData (NABOR). */

export type BridgeMedia = {
  MediaKey?: string | null;
  MediaURL?: string | null;
  Order?: number | null;
  MimeType?: string | null;
  MediaCategory?: string | null;
  MediaObjectID?: string | null;
  ShortDescription?: string | null;
  PreferredPhotoYN?: boolean | null;
};

export type BridgeProperty = {
  ListingKey?: string | null;
  ListingId?: string | null;
  UnparsedAddress?: string | null;
  StreetNumber?: string | null;
  StreetName?: string | null;
  StreetSuffix?: string | null;
  UnitNumber?: string | null;
  City?: string | null;
  StateOrProvince?: string | null;
  PostalCode?: string | null;
  ListPrice?: number | null;
  BedroomsTotal?: number | null;
  BathroomsTotalDecimal?: number | null;
  LivingArea?: number | null;
  PropertySubType?: string | null;
  PropertyType?: string | null;
  MlsStatus?: string | null;
  StandardStatus?: string | null;
  MLSAreaMajor?: string | null;
  WaterfrontYN?: boolean | null;
  PoolPrivateYN?: boolean | null;
  AssociationAmenities?: string[] | null;
  CommunityFeatures?: string[] | null;
  SeniorCommunityYN?: boolean | null;
  YearBuilt?: number | null;
  LotSizeSquareFeet?: number | null;
  TaxAnnualAmount?: number | null;
  AssociationFee?: number | null;
  PublicRemarks?: string | null;
  InteriorFeatures?: string[] | null;
  Appliances?: string[] | null;
  Flooring?: string[] | null;
  Heating?: string[] | null;
  Cooling?: string[] | null;
  LaundryFeatures?: string[] | null;
  Roof?: string[] | string | null;
  ConstructionMaterials?: string[] | string | null;
  ParkingFeatures?: string[] | null;
  PoolFeatures?: string[] | null;
  LotFeatures?: string[] | null;
  Sewer?: string[] | string | null;
  WaterSource?: string[] | string | null;
  ListAgentFullName?: string | null;
  ListOfficeName?: string | null;
  ModificationTimestamp?: string | null;
  PhotosCount?: number | null;
  Media?: BridgeMedia[] | null;
  [key: string]: unknown;
};

export type BridgeODataCollection<T> = {
  value?: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
};

export type ListingFeature = 'waterfront' | 'private-pool' | 'golf' | 'gated' | '55-plus';

export type ListingMlsStatus = 'active' | 'pending' | 'under-contract' | 'sold' | 'coming-soon';

export type ListingPropertyType =
  | 'single-family'
  | 'condo'
  | 'townhouse'
  | 'multi-family'
  | 'villa'
  | 'land'
  | 'other';

export type StringListItem = { item: string };

/**
 * Payload listing fields the sync may write.
 * Keys with null/undefined RESO sources are omitted entirely (D4).
 */
export type MappedListingData = {
  listingKey: string;
  mlsId: string;
  slug: string;
  fullAddress: string;
  city: string;
  price: number;
  mlsStatus: ListingMlsStatus;
  isActive: boolean;
  rawData: BridgeProperty;
  streetAddress?: string;
  state?: string;
  zip?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  pricePerSqft?: number;
  propertyType?: ListingPropertyType;
  features?: ListingFeature[];
  yearBuilt?: number;
  lotSqft?: number;
  taxesYearly?: number;
  hoaMonthly?: number;
  publicRemarks?: string;
  listAgentName?: string;
  listOfficeName?: string;
  modificationTimestamp?: string;
  syncedAt?: string;
  gallery?: Array<{
    url: string;
    mediaKey: string;
    order: number;
  }>;
  interiorSpecs?: {
    interiorFeatures?: StringListItem[];
    appliances?: StringListItem[];
    flooring?: StringListItem[];
    heating?: StringListItem[];
    cooling?: StringListItem[];
    laundryFeatures?: StringListItem[];
  };
  exteriorSpecs?: {
    roof?: StringListItem[];
    constructionMaterials?: StringListItem[];
    parkingFeatures?: StringListItem[];
    poolFeatures?: StringListItem[];
    lotFeatures?: StringListItem[];
    sewer?: StringListItem[];
    waterSource?: StringListItem[];
  };
};
