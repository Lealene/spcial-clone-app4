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
  it('maps detail fields, renames reviews→reviewCards, and derives tel href', async () => {
    const { normalizeCommunityDetail } = await import('./normalize');
    const detail = normalizeCommunityDetail({
      kind: 'community',
      slug: 'bonita-bay',
      name: 'Bonita Bay',
      city: 'Bonita Springs',
      detailBlurb: 'A gated enclave on the Gulf Coast.',
      reviewCount: 57,
      rating: 4.8,
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
      ],
      clubs: [{ item: 'Yacht Club' }],
      faqs: [{ question: 'Gated?', answer: 'Yes.' }],
      reviews: [{ quote: 'Great.', who: 'Pat', meta: '2022' }],
      reviewBars: [{ label: 'Amenities', pct: 97, score: '4.9' }],
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
    expect(detail?.reviewCards[0]?.who).toBe('Pat');
    expect(detail?.faqs[0]).toEqual({ q: 'Gated?', a: 'Yes.' });
    expect(detail?.amenities[1]?.icon).toBe('club');
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
      rating: 4.8,
      reviewCount: 57,
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
      rating: 4.8,
      reviews: 57,
      priceRange: 'From the $400s – $5M+',
      tags: ['Golf & Marina', 'Gated'],
      residences: 320,
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
      residences: null,
      rating: null,
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
