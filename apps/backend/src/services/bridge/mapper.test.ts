import { describe, expect, it } from 'vitest';

import { mapBridgePropertyToListing } from './mapper';
import type { BridgeProperty } from './types';

function baseProperty(overrides: Partial<BridgeProperty> = {}): BridgeProperty {
  return {
    ListingKey: 'abc123',
    ListingId: '225075944',
    UnparsedAddress: '4111 Lake Forest DR 523',
    StreetNumber: '4111',
    StreetName: 'Lake Forest',
    StreetSuffix: 'DR',
    UnitNumber: '523',
    City: 'BONITA SPRINGS',
    StateOrProvince: 'FL',
    PostalCode: '34134',
    ListPrice: 5000,
    BedroomsTotal: 2,
    BathroomsTotalDecimal: 2,
    LivingArea: 1393,
    PropertySubType: 'Low Rise (1-3)',
    MlsStatus: 'Active',
    MLSAreaMajor: 'BONITA BAY',
    Media: [
      {
        MediaKey: 'abc123-m1',
        MediaURL: 'https://cdn.example.com/1.jpeg',
        Order: 1,
      },
    ],
    ...overrides,
  };
}

describe('mapBridgePropertyToListing', () => {
  it('omits keys when RESO source values are null or undefined (skip-empty / D4)', () => {
    const mapped = mapBridgePropertyToListing(
      baseProperty({
        TaxAnnualAmount: null,
        AssociationFee: undefined,
        YearBuilt: null,
        LotSizeSquareFeet: undefined,
        PublicRemarks: null,
        ListAgentFullName: undefined,
      }),
    );

    expect(mapped).not.toHaveProperty('taxesYearly');
    expect(mapped).not.toHaveProperty('hoaMonthly');
    expect(mapped).not.toHaveProperty('yearBuilt');
    expect(mapped).not.toHaveProperty('lotSqft');
    expect(mapped).not.toHaveProperty('publicRemarks');
    expect(mapped).not.toHaveProperty('listAgentName');
    expect(Object.values(mapped).every((value) => value !== null)).toBe(true);
  });

  it('never includes broker — editorial override must survive sync', () => {
    const mapped = mapBridgePropertyToListing(baseProperty());
    expect('broker' in mapped).toBe(false);
  });

  it('maps core identity, address, price, and slug', () => {
    const mapped = mapBridgePropertyToListing(baseProperty());

    expect(mapped.listingKey).toBe('abc123');
    expect(mapped.mlsId).toBe('225075944');
    expect(mapped.slug).toBe('4111-lake-forest-dr-523-bonita-springs-fl-225075944');
    expect(mapped.fullAddress).toBe('4111 Lake Forest DR 523');
    expect(mapped.streetAddress).toBe('4111 Lake Forest DR 523');
    expect(mapped.city).toBe('BONITA SPRINGS');
    expect(mapped.state).toBe('FL');
    expect(mapped.zip).toBe('34134');
    expect(mapped.price).toBe(5000);
    expect(mapped.beds).toBe(2);
    expect(mapped.baths).toBe(2);
    expect(mapped.sqft).toBe(1393);
    expect(mapped.pricePerSqft).toBe(4); // Math.round(5000/1393)
    expect(mapped.mlsStatus).toBe('active');
    expect(mapped.isActive).toBe(true);
  });

  it('maps features from RESO flags and amenity lists', () => {
    const mapped = mapBridgePropertyToListing(
      baseProperty({
        WaterfrontYN: true,
        PoolPrivateYN: true,
        SeniorCommunityYN: true,
        AssociationAmenities: ['Golf', 'Pool'],
        CommunityFeatures: ['Gated', 'Tennis Court(s)'],
      }),
    );

    expect(mapped.features).toEqual(
      expect.arrayContaining(['waterfront', 'private-pool', 'golf', 'gated', '55-plus']),
    );
    expect(mapped.features).toHaveLength(5);
  });

  it('maps gallery from embedded Media and skips entries without url/key', () => {
    const mapped = mapBridgePropertyToListing(
      baseProperty({
        Media: [
          { MediaKey: 'k1', MediaURL: 'https://cdn.example.com/a.jpg', Order: 2 },
          { MediaKey: null, MediaURL: 'https://cdn.example.com/b.jpg', Order: 1 },
          { MediaKey: 'k3', MediaURL: null, Order: 3 },
          { MediaKey: 'k4', MediaURL: 'https://cdn.example.com/c.jpg', Order: 1 },
        ],
      }),
    );

    expect(mapped.gallery).toEqual([
      { url: 'https://cdn.example.com/c.jpg', mediaKey: 'k4', order: 1 },
      { url: 'https://cdn.example.com/a.jpg', mediaKey: 'k1', order: 2 },
    ]);
  });

  it('maps property subtype into the Payload enum, unknown → other', () => {
    expect(
      mapBridgePropertyToListing(baseProperty({ PropertySubType: 'Single Family Residence' }))
        .propertyType,
    ).toBe('single-family');
    expect(
      mapBridgePropertyToListing(baseProperty({ PropertySubType: 'Townhouse' })).propertyType,
    ).toBe('townhouse');
    expect(
      mapBridgePropertyToListing(baseProperty({ PropertySubType: 'Low Rise (1-3)' })).propertyType,
    ).toBe('condo');
    expect(
      mapBridgePropertyToListing(baseProperty({ PropertySubType: 'Something Exotic' }))
        .propertyType,
    ).toBe('other');
  });

  it('maps RESO Latitude/Longitude, coercing numeric strings', () => {
    const numeric = mapBridgePropertyToListing(
      baseProperty({ Latitude: 26.3398, Longitude: -81.7787 }),
    );
    expect(numeric.latitude).toBe(26.3398);
    expect(numeric.longitude).toBe(-81.7787);

    const strings = mapBridgePropertyToListing(
      baseProperty({ Latitude: '26.3398', Longitude: '-81.7787' }),
    );
    expect(strings.latitude).toBe(26.3398);
    expect(strings.longitude).toBe(-81.7787);
  });

  it('omits both coordinates when either axis is missing, out of range, or the 0,0 sentinel', () => {
    const cases: Array<Partial<BridgeProperty>> = [
      {},
      { Latitude: null, Longitude: null },
      { Latitude: 26.3398, Longitude: undefined },
      { Latitude: undefined, Longitude: -81.7787 },
      { Latitude: 26.3398, Longitude: 'not-a-number' },
      { Latitude: 126.5, Longitude: -81.7787 },
      { Latitude: 26.3398, Longitude: -181 },
      { Latitude: 0, Longitude: 0 },
    ];

    for (const overrides of cases) {
      const mapped = mapBridgePropertyToListing(baseProperty(overrides));
      expect(mapped, JSON.stringify(overrides)).not.toHaveProperty('latitude');
      expect(mapped, JSON.stringify(overrides)).not.toHaveProperty('longitude');
    }
  });

  it('maps string-list specs and omits empty spec groups', () => {
    const mapped = mapBridgePropertyToListing(
      baseProperty({
        Appliances: ['Dishwasher', 'Dryer'],
        Roof: null,
        ParkingFeatures: ['Detached Carport'],
        LaundryFeatures: [],
      }),
    );

    expect(mapped.interiorSpecs?.appliances).toEqual([{ item: 'Dishwasher' }, { item: 'Dryer' }]);
    expect(mapped.interiorSpecs).not.toHaveProperty('laundryFeatures');
    expect(mapped.exteriorSpecs?.parkingFeatures).toEqual([{ item: 'Detached Carport' }]);
    expect(mapped.exteriorSpecs).not.toHaveProperty('roof');
  });
});
