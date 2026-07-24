import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

describe('CMS page metadata', () => {
  it('ignores stale custom canonical URLs while canonical mode is automatic', async () => {
    const { homepageFixture } = await import('@/data/homepage-fixture');
    const { getCmsPageMetadata } = await import('./metadata');
    const metadata = getCmsPageMetadata(
      {
        ...homepageFixture,
        seo: {
          ...homepageFixture.seo,
          canonicalMode: 'auto',
          canonicalUrl: 'https://stale.example/old',
        },
      },
      '/about',
    );

    expect(metadata.alternates?.canonical).toBe('http://localhost:3003/about');
  });

  it('honors custom canonical mode and Twitter image alt text', async () => {
    const { homepageFixture } = await import('@/data/homepage-fixture');
    const { getCmsPageMetadata } = await import('./metadata');
    const metadata = getCmsPageMetadata(
      {
        ...homepageFixture,
        seo: {
          ...homepageFixture.seo,
          canonicalMode: 'custom',
          canonicalUrl: '/preferred',
          twitterImage: { src: '/images/twitter.jpg', alt: 'Fallback image alt' },
          twitterImageAlt: 'Twitter-specific alt',
        },
      },
      '/about',
    );

    expect(metadata.alternates?.canonical).toBe('http://localhost:3003/preferred');
    expect(metadata.twitter?.images).toEqual([
      { url: '/images/twitter.jpg', alt: 'Twitter-specific alt' },
    ]);
  });
});
