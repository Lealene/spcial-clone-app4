import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://mvprealty.test');

import { listingDetailSchema, type ListingDetail } from '@mvp-realty/api-contracts';

function makeListing(overrides: Record<string, unknown> = {}): ListingDetail {
  return listingDetailSchema.parse({
    slug: '123-harbor-bonita-springs-fl-1',
    name: '123 Harbor Way',
    community: 'bonita-bay',
    communityName: 'Bonita Bay',
    city: 'Bonita Springs',
    price: 1250000,
    beds: 3,
    baths: 2.5,
    sqft: 2400,
    propertyType: 'single-family',
    type: 'single-family',
    status: 'active',
    features: ['waterfront'],
    isEstate: false,
    isActive: true,
    image: { src: '/images/a.jpg', alt: 'Hero' },
    mlsId: '1',
    fullAddress: '123 Harbor Way, Bonita Springs, FL 34134',
    streetAddress: '123 Harbor Way',
    state: 'FL',
    zip: '34134',
    latitude: 26.35,
    longitude: -81.8,
    highlights: [],
    gallery: [{ src: 'https://cdn.test/a.jpg', alt: 'Hero' }],
    interior: [],
    exterior: [],
    floorPlan: [],
    broker: null,
    ...overrides,
  });
}

async function graphFor(listing: ListingDetail) {
  const { buildListingGraph } = await import('./listing');
  return buildListingGraph(listing, { communityHref: '/communities/bonita-bay' });
}

function nodeOfType(nodes: Record<string, unknown>[], type: string) {
  return nodes.find((node) => node['@type'] === type);
}

describe('buildListingGraph', () => {
  it('describes the listing, its offer and the residence beneath it', async () => {
    const nodes = await graphFor(makeListing());
    const listing = nodeOfType(nodes, 'RealEstateListing') as Record<string, unknown>;

    expect(listing['@id']).toBe(
      'https://mvprealty.test/listings/123-harbor-bonita-springs-fl-1#listing',
    );
    expect(listing.offers).toMatchObject({
      '@type': 'Offer',
      price: 1250000,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    });

    const residence = listing.about as Record<string, unknown>;
    expect(residence['@type']).toBe('SingleFamilyResidence');
    expect(residence.numberOfBedrooms).toBe(3);
    expect(residence.numberOfBathroomsTotal).toBe(2.5);
    expect(residence.address).toMatchObject({
      streetAddress: '123 Harbor Way',
      addressLocality: 'Bonita Springs',
      addressRegion: 'FL',
      postalCode: '34134',
    });
    expect(residence.geo).toMatchObject({ latitude: 26.35, longitude: -81.8 });
  });

  it('maps MLS status onto the matching availability, not always InStock', async () => {
    const nodes = await graphFor(makeListing({ status: 'sold' }));
    const listing = nodeOfType(nodes, 'RealEstateListing') as Record<string, unknown>;
    expect((listing.offers as Record<string, unknown>).availability).toBe(
      'https://schema.org/SoldOut',
    );
  });

  it('maps a condo to Apartment rather than the single-family default', async () => {
    const nodes = await graphFor(makeListing({ propertyType: 'condo', type: 'condo' }));
    const listing = nodeOfType(nodes, 'RealEstateListing') as Record<string, unknown>;
    expect((listing.about as Record<string, unknown>)['@type']).toBe('Apartment');
  });

  it('points the community crumb at the href the page actually renders', async () => {
    const nodes = await graphFor(makeListing());
    const crumb = nodeOfType(nodes, 'BreadcrumbList') as Record<string, unknown>;
    const items = crumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(4);
    expect(items[2]).toMatchObject({
      position: 3,
      item: 'https://mvprealty.test/communities/bonita-bay',
    });
  });

  it('carries lot size as additionalProperty — schema.org has no lotSize', async () => {
    const nodes = await graphFor(makeListing({ lotSqft: 12000 }));
    const listing = nodeOfType(nodes, 'RealEstateListing') as Record<string, unknown>;
    const residence = listing.about as Record<string, unknown>;

    expect(residence).not.toHaveProperty('lotSize');
    expect(residence.additionalProperty).toMatchObject({
      '@type': 'PropertyValue',
      name: 'Lot size',
      value: 12000,
      unitCode: 'FTK',
    });
  });

  it('keeps dwelling properties off vacant land, which is a Place not an Accommodation', async () => {
    const { prune } = await import('./graph');
    const nodes = await graphFor(makeListing({ propertyType: 'land', type: 'land' }));
    const listing = prune(nodeOfType(nodes, 'RealEstateListing')) as Record<string, unknown>;
    const residence = listing.about as Record<string, unknown>;

    expect(residence['@type']).toBe('Place');
    expect(residence).not.toHaveProperty('numberOfBedrooms');
    expect(residence).not.toHaveProperty('floorSize');
  });

  it('links the page to its breadcrumb and emits no dangling WebPage reference', async () => {
    const { prune } = await import('./graph');
    const nodes = await graphFor(makeListing());
    const listing = prune(nodeOfType(nodes, 'RealEstateListing')) as Record<string, unknown>;
    const path = 'https://mvprealty.test/listings/123-harbor-bonita-springs-fl-1';

    // RealEstateListing is itself a WebPage subtype, so no `#webpage` node
    // exists on this route and nothing may point at one.
    expect(listing).not.toHaveProperty('mainEntityOfPage');
    expect(listing.breadcrumb).toStrictEqual({ '@id': `${path}#breadcrumb` });
    expect(nodeOfType(nodes, 'BreadcrumbList')?.['@id']).toBe(`${path}#breadcrumb`);
  });

  it('reports the feed timestamp as dateModified, never as a fresh datePosted', async () => {
    const nodes = await graphFor(makeListing());
    const listing = nodeOfType(nodes, 'RealEstateListing') as Record<string, unknown>;
    expect(listing).not.toHaveProperty('datePosted');
  });

  it('omits geo entirely when the MLS sent no coordinates', async () => {
    const { prune } = await import('./graph');
    const nodes = await graphFor(makeListing({ latitude: undefined, longitude: undefined }));
    const listing = prune(nodeOfType(nodes, 'RealEstateListing')) as Record<string, unknown>;
    expect(listing.about).not.toHaveProperty('geo');
  });
});

describe('listingDescription', () => {
  it('leads with the specs and the price', async () => {
    const { listingDescription } = await import('./listing');
    expect(listingDescription(makeListing())).toBe(
      '123 Harbor Way in Bonita Bay, Bonita Springs — 3 bed, 2.5 bath, 2,400 sq ft. Offered at $1,250,000.',
    );
  });

  it('title-cases the shouted MLS city', async () => {
    const { listingDescription } = await import('./listing');
    const description = listingDescription(makeListing({ city: 'FORT MYERS BEACH' }));
    expect(description).toContain('Fort Myers Beach');
    expect(description).not.toContain('FORT MYERS BEACH');
  });

  it('names the place once when the community is the city', async () => {
    const { listingDescription } = await import('./listing');
    expect(
      listingDescription(
        makeListing({ city: 'FORT MYERS BEACH', communityName: 'Fort Myers Beach' }),
      ),
    ).toContain('in Fort Myers Beach — 3 bed');
  });
});
