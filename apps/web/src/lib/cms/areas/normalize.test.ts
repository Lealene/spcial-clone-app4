import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

describe('formatAreaPriceRange', () => {
  it('prefers authored display copy', async () => {
    const { formatAreaPriceRange } = await import('./normalize');
    expect(formatAreaPriceRange('From the $400s – $5M+', 3000, 5_995_000)).toBe(
      'From the $400s – $5M+',
    );
  });

  it('formats usable MLS bounds and ignores tiny outliers', async () => {
    const { formatAreaPriceRange } = await import('./normalize');
    expect(formatAreaPriceRange(undefined, 3000, 5_995_000)).toBe('Up to $6.0M');
    expect(formatAreaPriceRange(undefined, 450_000, 1_300_000)).toBe('$450k – $1.3M');
  });
});

describe('normalizeCommunityDetail', () => {
  it('maps detail fields and derives tel href', async () => {
    const { normalizeCommunityDetail } = await import('./normalize');
    const detail = normalizeCommunityDetail({
      kind: 'community',
      slug: 'bonita-bay',
      name: 'Bonita Bay',
      city: 'Bonita Springs',
      detailBlurb: 'A gated enclave on the Gulf Coast.',
      photoCount: 58,
      phone: '(239) 555-0148',
      soldCount: 90,
      facts: [{ label: 'Price Range', value: 'From the $400s' }],
      about: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Welcome to ', format: 0 },
                { type: 'text', text: 'Bonita Bay', format: 1 },
              ],
            },
          ],
        },
      },
      amenities: [
        { icon: 'golf', title: 'Golf' },
        { icon: 'nope', title: 'Fallback icon' },
        { icon: 'pickleball', title: 'Pickleball' },
        { icon: 'business-center', title: 'Business Center' },
      ],
      clubs: [{ item: 'Yacht Club' }],
      faqs: [{ question: 'Gated?', answer: 'Yes.' }],
      gallery: [],
      similar: [],
      broker: {
        slug: 'eleanor-voss',
        name: 'Eleanor Voss',
        title: 'Broker & Owner',
        brokerage: 'MVP Realty',
      },
    });

    expect(detail?.blurb).toBe('A gated enclave on the Gulf Coast.');
    expect(detail?.phoneHref).toBe('tel:+12395550148');
    expect(detail?.about).toEqual(['Welcome to **Bonita Bay**']);
    expect(detail?.faqs[0]).toEqual({ q: 'Gated?', a: 'Yes.' });
    expect(detail?.amenities[1]?.icon).toBe('club');
    // Values added to COMMUNITY_AMENITY_ICONS survive rather than coercing to 'club'.
    expect(detail?.amenities[2]?.icon).toBe('pickleball');
    expect(detail?.amenities[3]?.icon).toBe('business-center');
    expect(detail?.gallery.length).toBeGreaterThanOrEqual(1);
    expect(detail?.photoCount).toBeGreaterThanOrEqual(detail!.gallery.length);
    expect(detail?.broker?.firstName).toBe('Eleanor');
    expect(detail?.soldCount).toBe(90);
  });
});

describe('normalizeCommunityAreaCard', () => {
  it('maps Area community docs into card view models', async () => {
    const { normalizeCommunityAreaCard } = await import('./normalize');
    const card = normalizeCommunityAreaCard({
      kind: 'community',
      slug: 'bonita-bay',
      name: 'Bonita Bay',
      city: 'Bonita Springs',
      blurb: 'Bonita Springs · golf, marina & a private Gulf beach park',
      locality: 'Bonita Springs · private Gulf beach park',
      priceRange: 'From the $400s – $5M+',
      totalResidences: 320,
      activeCount: 108,
      isGated: true,
      amenities: [
        { icon: 'golf', title: 'Golf & Marina' },
        { icon: 'gate', title: 'Gated' },
      ],
      gallery: [
        {
          image: {
            url: '/media/community-bonita-bay.jpg',
            alt: 'Bonita Bay entrance',
            width: 1600,
            height: 1100,
            mimeType: 'image/jpeg',
          },
        },
      ],
    });

    expect(card).toMatchObject({
      slug: 'bonita-bay',
      name: 'Bonita Bay',
      locality: 'Bonita Springs · private Gulf beach park',
      priceRange: 'From the $400s – $5M+',
      tags: ['Golf & Marina', 'Gated'],
      nowSelling: 108,
      href: '/communities/bonita-bay',
      image: {
        src: 'http://localhost:3002/media/community-bonita-bay.jpg',
        alt: 'Bonita Bay entrance',
      },
    });
  });

  it('skips cities and derives tags from flags when amenities are empty', async () => {
    const { normalizeCommunityAreaCard } = await import('./normalize');
    expect(
      normalizeCommunityAreaCard({
        kind: 'city',
        slug: 'bonita-springs',
        name: 'Bonita Springs',
        city: 'Bonita Springs',
      }),
    ).toBeNull();

    const card = normalizeCommunityAreaCard({
      kind: 'community',
      slug: 'valencia-trails',
      name: 'Valencia Trails',
      city: 'Naples',
      is55Plus: true,
      isGated: true,
      activeCount: 23,
    });

    expect(card).toMatchObject({
      locality: 'Naples',
      tags: ['55+', 'Gated'],
      nowSelling: 23,
    });
  });
});

describe('normalizeCommunityAreaStripItem', () => {
  it('uses blurb when present', async () => {
    const { normalizeCommunityAreaStripItem } = await import('./normalize');
    expect(
      normalizeCommunityAreaStripItem({
        kind: 'community',
        slug: 'valencia-bonita',
        name: 'Valencia Bonita',
        city: 'Bonita Springs',
        blurb: 'Bonita Springs · 55+ gated with a resort clubhouse',
      }),
    ).toEqual({
      slug: 'valencia-bonita',
      name: 'Valencia Bonita',
      blurb: 'Bonita Springs · 55+ gated with a resort clubhouse',
      href: '/communities/valencia-bonita',
    });
  });
});
