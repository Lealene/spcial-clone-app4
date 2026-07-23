import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

const payloadPage = {
  title: 'About MVP',
  slug: 'about',
  layout: [
    {
      blockType: 'hero',
      backgroundImage: {
        image: { url: '/media/hero.jpg', alt: 'Hero', width: 2000, height: 1200 },
      },
      eyebrow: 'By Appointment',
      heading: 'A prestigious address',
      lede: 'Private gated communities minutes from the Gulf beaches.',
      primaryCta: {
        label: 'View Residences',
        link: { type: 'anchor', anchor: '/#listings', label: 'View Residences' },
      },
      secondaryCta: { link: { type: 'anchor', anchor: '' } },
    },
  ],
};

describe('CMS page adapters', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('covers every known CMS page block type', async () => {
    const [{ CMS_PAGE_BLOCK_TYPES }, { cmsPageBlockAdapters }] = await Promise.all([
      import('@mvp-realty/api-contracts'),
      import('./pages'),
    ]);

    expect(Object.keys(cmsPageBlockAdapters)).toEqual([...CMS_PAGE_BLOCK_TYPES]);
  });

  it('drops unknown blocks safely', async () => {
    const { normalizeCmsPageBlock } = await import('./pages');

    expect(normalizeCmsPageBlock({ blockType: 'unknown' })).toBeNull();
    expect(normalizeCmsPageBlock(null)).toBeNull();
  });

  it('normalizes representative hero payload input', async () => {
    const { normalizeCmsPageBlock } = await import('./pages');

    const normalized = normalizeCmsPageBlock(payloadPage.layout[0]);

    expect(normalized).toMatchObject({
      blockType: 'hero',
      backgroundImage: {
        src: 'http://localhost:3002/media/hero.jpg',
        alt: 'Hero',
      },
      primaryCta: { href: '/#listings' },
      secondaryCta: undefined,
    });
  });

  it('keeps partial editor content renderable with safe fallbacks', async () => {
    const { normalizeCmsPageBlock } = await import('./pages');

    expect(
      normalizeCmsPageBlock({
        blockType: 'featuredResidences',
        header: { kicker: '', heading: '' },
        manualListings: [{ name: '', image: {} }],
      }),
    ).toMatchObject({
      blockType: 'featuredResidences',
      header: { kicker: 'Featured', heading: 'Featured' },
      manualListings: [
        {
          name: 'Residence',
          locality: 'Southwest Florida',
          priceLabel: 'Pricing available by request',
          badge: 'Featured',
          image: { src: '/images/hero-naples-waterfront.jpg', alt: 'Residence image' },
        },
      ],
    });
  });

  it('normalizes CMS pages and preserves empty layouts for caller policy', async () => {
    const { normalizePage } = await import('./pages');

    expect(normalizePage({ title: 'Home', slug: 'home', layout: [] }).layout).toEqual([]);
  });

  it('fetches CMS pages by encoded slug', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [payloadPage] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { getPageContent } = await import('./pages');
    const page = await getPageContent('about us');

    expect(page).toMatchObject({ title: 'About MVP', slug: 'about' });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      'http://localhost:3002/api/pages?where[slug][equals]=about%20us&depth=2&limit=1',
    );
  });

  it('returns null for missing CMS pages unless a fallback is provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ docs: [] }) }),
    );

    const { homepageFixture } = await import('@/data/homepage-fixture');
    const { getPageContent } = await import('./pages');

    await expect(getPageContent('missing')).resolves.toBeNull();
    await expect(getPageContent('home', { fallback: homepageFixture })).resolves.toBe(
      homepageFixture,
    );
  });
});
