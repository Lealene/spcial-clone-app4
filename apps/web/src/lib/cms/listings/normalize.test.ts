import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');
vi.stubEnv('NEXT_PUBLIC_MEDIA_URL', 'https://pub-example.r2.dev');

describe('normalizeListingCard / Detail', () => {
  it('maps Payload listing fields and feature aliases', async () => {
    const { normalizeListingCard, normalizeListingDetail } = await import('./normalize');

    const raw = {
      slug: '123-harbor-bonita-springs-fl-225077871',
      mlsId: '225077871',
      fullAddress: '123 Harbor Way, Bonita Springs, FL 34134',
      streetAddress: '123 Harbor Way',
      city: 'Bonita Springs',
      state: 'FL',
      zip: '34134',
      price: 1250000,
      beds: 3,
      baths: 2.5,
      sqft: 2400,
      pricePerSqft: 521,
      propertyType: 'single-family',
      mlsStatus: 'active',
      features: ['waterfront', 'private-pool', '55-plus'],
      isEstate: false,
      isActive: true,
      area: { slug: 'bonita-bay', name: 'Bonita Bay' },
      heroImage: {
        url: 'https://pub-example.r2.dev/listing-225077871-hero.jpg',
        alt: 'Primary photo',
        width: 1600,
        height: 1200,
      },
      gallery: [
        {
          url: 'https://dvvjkgh94f2v6.cloudfront.net/photos/1.jpg',
          mediaKey: 'm1',
          order: 1,
        },
      ],
      publicRemarks: 'First paragraph.\n\nSecond paragraph.',
      interiorSpecs: {
        appliances: [{ item: 'Dishwasher' }],
      },
      exteriorSpecs: {},
      highlights: [{ item: 'Gulf access' }],
      floorPlan: [],
    };

    const card = normalizeListingCard(raw);
    expect(card).toMatchObject({
      slug: '123-harbor-bonita-springs-fl-225077871',
      community: 'bonita-bay',
      type: 'single-family',
      status: 'active',
      features: ['waterfront', 'pool', '55plus'],
    });
    expect(card?.image.src).toContain('pub-example.r2.dev');

    const detail = normalizeListingDetail(raw);
    expect(detail?.gallery.length).toBeGreaterThanOrEqual(1);
    expect(detail?.publicRemarks).toContain('First paragraph');
    expect(detail?.interior[0]?.items[0]?.label).toBe('Dishwasher');
    expect(detail?.highlights).toEqual(['Gulf access']);
    expect(detail?.broker).toBeNull();
  });

  it('resolves listing broker over area broker', async () => {
    vi.resetModules();
    const { normalizeListingDetail } = await import('./normalize');

    const detail = normalizeListingDetail({
      slug: '123-harbor-bonita-springs-fl-225077871',
      mlsId: '225077871',
      fullAddress: '123 Harbor Way, Bonita Springs, FL 34134',
      streetAddress: '123 Harbor Way',
      city: 'Bonita Springs',
      price: 1250000,
      beds: 3,
      baths: 2,
      sqft: 2400,
      mlsStatus: 'active',
      isActive: true,
      area: {
        slug: 'bonita-bay',
        name: 'Bonita Bay',
        broker: {
          slug: 'area-broker',
          name: 'Area Broker',
          title: 'Agent',
          brokerage: '55 Living Team',
        },
      },
      broker: {
        slug: 'listing-broker',
        name: 'Listing Broker',
        title: 'Broker',
        brokerage: '55 Living Team',
      },
      heroImage: {
        url: 'https://pub-example.r2.dev/listing-225077871-hero.jpg',
        alt: 'Primary photo',
      },
      gallery: [],
      interiorSpecs: {},
      exteriorSpecs: {},
      highlights: [],
      floorPlan: [],
    });

    expect(detail?.broker?.slug).toBe('listing-broker');
  });

  it('keeps valid coordinates and drops unusable pairs without failing the detail', async () => {
    vi.resetModules();
    const { normalizeListingDetail } = await import('./normalize');

    const base = {
      slug: '123-harbor-bonita-springs-fl-225077871',
      mlsId: '225077871',
      fullAddress: '123 Harbor Way, Bonita Springs, FL 34134',
      streetAddress: '123 Harbor Way',
      city: 'Bonita Springs',
      price: 1250000,
      beds: 3,
      baths: 2,
      sqft: 2400,
      mlsStatus: 'active',
      isActive: true,
      area: { slug: 'bonita-bay', name: 'Bonita Bay' },
      heroImage: { url: 'https://pub-example.r2.dev/hero.jpg', alt: 'Primary photo' },
      gallery: [],
      interiorSpecs: {},
      exteriorSpecs: {},
      highlights: [],
      floorPlan: [],
    };

    const withCoords = normalizeListingDetail({
      ...base,
      latitude: 26.3398,
      longitude: -81.7787,
    });
    expect(withCoords?.latitude).toBe(26.3398);
    expect(withCoords?.longitude).toBe(-81.7787);

    for (const bad of [
      { latitude: 26.3398 },
      { longitude: -81.7787 },
      { latitude: 26.3398, longitude: null },
      { latitude: 999, longitude: -81.7787 },
      { latitude: 0, longitude: 0 },
    ]) {
      const detail = normalizeListingDetail({ ...base, ...bad });
      // A bad coordinate must never null out the whole PDP.
      expect(detail, JSON.stringify(bad)).not.toBeNull();
      expect(detail?.latitude, JSON.stringify(bad)).toBeUndefined();
      expect(detail?.longitude, JSON.stringify(bad)).toBeUndefined();
    }
  });

  it('drops non-positive lot size and price per sq ft without failing the detail', async () => {
    vi.resetModules();
    const { normalizeListingDetail } = await import('./normalize');

    const base = {
      slug: '4931-bonita-bay-blvd-2301-bonita-springs-fl-226004428',
      mlsId: '226004428',
      fullAddress: '4931 Bonita Bay BLVD 2301',
      streetAddress: '4931 Bonita Bay BLVD 2301',
      city: 'BONITA SPRINGS',
      price: 2950000,
      beds: 3,
      baths: 3.5,
      sqft: 4240,
      mlsStatus: 'active',
      isActive: true,
      area: { slug: 'bonita-bay', name: 'Bonita Bay' },
      heroImage: { url: 'https://pub-example.r2.dev/hero.jpg', alt: 'Primary photo' },
      gallery: [],
      interiorSpecs: {},
      exteriorSpecs: {},
      highlights: [],
      floorPlan: [],
    };

    const kept = normalizeListingDetail({ ...base, lotSqft: 16792, pricePerSqft: 696 });
    expect(kept?.lotSqft).toBe(16792);
    expect(kept?.pricePerSqft).toBe(696);

    // Condos report a zero lot size; that must not null out the whole PDP.
    const condo = normalizeListingDetail({ ...base, lotSqft: 0, pricePerSqft: 0 });
    expect(condo).not.toBeNull();
    expect(condo?.lotSqft).toBeUndefined();
    expect(condo?.pricePerSqft).toBeUndefined();
  });

  it('uses estate type facet when isEstate is true', async () => {
    vi.resetModules();
    const { normalizeListingCard } = await import('./normalize');
    const card = normalizeListingCard({
      slug: 'estate-1',
      streetAddress: '1 Estate Ln',
      city: 'Naples',
      price: 3000000,
      mlsStatus: 'active',
      propertyType: 'single-family',
      isEstate: true,
      isActive: true,
      area: { slug: 'valencia-trails', name: 'Valencia Trails' },
      gallery: [
        {
          url: 'https://dvvjkgh94f2v6.cloudfront.net/x.jpg',
          mediaKey: 'm',
          order: 0,
        },
      ],
    });
    expect(card?.type).toBe('estate');
  });

  it('returns null when area is missing', async () => {
    vi.resetModules();
    const { normalizeListingCard } = await import('./normalize');
    expect(
      normalizeListingCard({
        slug: 'x',
        city: 'Naples',
        price: 1,
        mlsStatus: 'active',
      }),
    ).toBeNull();
  });
});
