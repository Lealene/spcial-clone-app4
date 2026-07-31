import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

const heroBlock = {
  id: 'hero-1',
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
};

const payloadPage = {
  title: 'About MVP',
  slug: 'about',
  layout: [heroBlock],
};

describe('CMS page adapters', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('covers every known CMS page block type', async () => {
    const [{ CMS_PAGE_BLOCK_TYPES }, { cmsPageBlockAdapters }] = await Promise.all([
      import('@mvp-realty/api-contracts'),
      import('.'),
    ]);

    expect(Object.keys(cmsPageBlockAdapters)).toEqual([...CMS_PAGE_BLOCK_TYPES]);
  });

  it('drops unknown blocks safely', async () => {
    const { normalizeCmsPageBlock } = await import('.');

    expect(normalizeCmsPageBlock({ blockType: 'unknown' })).toBeNull();
    expect(normalizeCmsPageBlock(null)).toBeNull();
  });

  it('normalizes representative hero payload input and preserves its ID', async () => {
    const { normalizeCmsPageBlock } = await import('.');

    const normalized = normalizeCmsPageBlock(heroBlock);

    expect(normalized).toMatchObject({
      id: 'hero-1',
      blockType: 'hero',
      backgroundImage: {
        src: 'http://localhost:3002/media/hero.jpg',
        alt: 'Hero',
      },
      primaryCta: { href: '/#listings' },
      secondaryCta: undefined,
    });
  });

  it('skips one malformed known block while preserving valid siblings in order', async () => {
    const { normalizePage } = await import('.');
    const result = normalizePage({
      title: 'Home',
      slug: 'home',
      layout: [
        heroBlock,
        {
          blockType: 'testimonials',
          carouselIntervalMs: 0,
        },
        { ...heroBlock, id: 'hero-2', heading: 'Another valid hero' },
      ],
    });

    expect(result.page.layout.map((block) => block.id)).toEqual(['hero-1', 'hero-2']);
    expect(result.diagnostics).toMatchObject([
      {
        code: 'invalid-block',
        pageSlug: 'home',
        layoutIndex: 1,
        blockType: 'testimonials',
      },
    ]);
  });

  it('drops malformed collection rows while preserving valid row order', async () => {
    const { normalizeCmsPageBlock } = await import('.');
    const block = normalizeCmsPageBlock({
      blockType: 'featuredResidences',
      header: { kicker: 'Residences', heading: 'Selected homes' },
      manualListings: [
        {
          slug: 'first-home',
          name: 'First Home',
          locality: 'Naples',
          priceLabel: 'From $2M',
          beds: 3,
          baths: 2.5,
          sqft: 2400,
          badge: 'Featured',
          image: { image: { url: '/media/first.jpg', alt: 'First home' } },
          link: { type: 'custom', customUrl: '/listings/first-home', label: 'First Home' },
        },
        { name: 'Malformed row without required fields' },
        {
          slug: 'second-home',
          name: 'Second Home',
          locality: 'Bonita Springs',
          priceLabel: 'From $3M',
          beds: 4,
          baths: 4,
          sqft: 3200,
          badge: 'New',
          image: { image: { url: '/media/second.jpg', alt: 'Second home' } },
          link: { type: 'custom', customUrl: '/listings/second-home', label: 'Second Home' },
        },
      ],
      cardCtaLabel: 'View residence',
    });

    expect(block?.blockType).toBe('featuredResidences');
    if (block?.blockType === 'featuredResidences') {
      expect(block.manualListings.map((listing) => listing.slug)).toEqual([
        'first-home',
        'second-home',
      ]);
    }
  });

  it('skips disabled blocks silently and accepts legacy enabled values', async () => {
    const { normalizeCmsPageBlocks } = await import('.');
    const result = normalizeCmsPageBlocks(
      [
        { ...heroBlock, enabled: false },
        { ...heroBlock, id: 'legacy-null', enabled: null },
        { ...heroBlock, id: 'legacy-undefined', enabled: undefined },
        { ...heroBlock, id: 'enabled', enabled: true },
      ],
      'home',
    );

    expect(result.blocks.map((block) => block.id)).toEqual([
      'legacy-null',
      'legacy-undefined',
      'enabled',
    ]);
    expect(result.diagnostics).toEqual([]);
  });

  it('caps diagnostics without exposing raw editorial values', async () => {
    const { normalizeCmsPageBlocks } = await import('.');
    const result = normalizeCmsPageBlocks(
      Array.from({ length: 12 }, (_, index) => ({
        blockType: `future-${index}`,
        secretCopy: 'do not leak this editorial value',
      })),
      'home',
    );

    expect(result.diagnostics).toHaveLength(10);
    expect(JSON.stringify(result.diagnostics)).not.toContain('do not leak this editorial value');
  });

  it('normalizes CMS pages and preserves explicit empty results for route policy', async () => {
    const { normalizePage } = await import('.');

    expect(normalizePage({ title: 'Home', slug: 'home', layout: [] }).page.layout).toEqual([]);
  });

  it('fetches CMS pages by encoded slug', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [payloadPage] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { getPageContent } = await import('.');
    const result = await getPageContent('about us');

    expect(result).toMatchObject({
      status: 'ready',
      page: { title: 'About MVP', slug: 'about' },
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      'http://localhost:3002/api/pages?where[slug][equals]=about%20us&depth=2&limit=1',
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      next: { revalidate: false, tags: ['cms', 'cms-page:about us'] },
    });
  });

  it('returns missing pages but rejects empty or unavailable CMS content', async () => {
    const { getPageContent } = await import('.');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ docs: [] }) }),
    );
    await expect(getPageContent('missing')).resolves.toEqual({ status: 'missing' });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ docs: [{ title: 'Empty', slug: 'empty', layout: [] }] }),
      }),
    );
    await expect(getPageContent('empty')).rejects.toMatchObject({
      name: 'CmsDataError',
      kind: 'no-renderable-blocks',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );
    await expect(getPageContent('unavailable')).rejects.toMatchObject({
      name: 'CmsDataError',
      kind: 'request-failed',
      status: 503,
    });
  });
});
