import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://mvprealty.test');

import { pageSeoSchema, type PageSeo } from '@mvp-realty/api-contracts';

function seo(overrides: Partial<PageSeo> = {}): PageSeo {
  return pageSeoSchema.parse(overrides);
}

describe('buildEntityMetadata', () => {
  it('falls back to the generated title, description and images', async () => {
    const { buildEntityMetadata } = await import('./metadata');

    const metadata = buildEntityMetadata({
      seo: seo(),
      path: '/listings/a',
      title: 'Generated title',
      description: 'Generated description',
      images: [{ src: 'https://cdn.test/a.jpg', alt: 'Hero' }],
    });

    expect(metadata.title).toStrictEqual({ absolute: 'Generated title' });
    expect(metadata.description).toBe('Generated description');
    expect(metadata.alternates?.canonical).toBe('https://mvprealty.test/listings/a');
    expect(metadata.openGraph?.images).toStrictEqual([
      { url: 'https://cdn.test/a.jpg', alt: 'Hero' },
    ]);
    // No twitterImage authored, so the OG images carry over.
    expect(metadata.twitter?.images).toStrictEqual([
      { url: 'https://cdn.test/a.jpg', alt: 'Hero' },
    ]);
  });

  it('lets authored overrides win over the generated values', async () => {
    const { buildEntityMetadata } = await import('./metadata');

    const metadata = buildEntityMetadata({
      seo: seo({ metaTitle: 'Authored', metaDescription: 'Authored description' }),
      path: '/listings/a',
      title: 'Generated title',
      description: 'Generated description',
    });

    expect(metadata.title).toStrictEqual({ absolute: 'Authored' });
    expect(metadata.description).toBe('Authored description');
  });

  it('honours a custom canonical and the robots switches', async () => {
    const { buildEntityMetadata } = await import('./metadata');

    const metadata = buildEntityMetadata({
      seo: seo({
        canonicalMode: 'custom',
        canonicalUrl: '/preferred',
        index: false,
        follow: false,
      }),
      path: '/listings/a',
      title: 'Generated title',
    });

    expect(metadata.alternates?.canonical).toBe('https://mvprealty.test/preferred');
    expect(metadata.robots).toStrictEqual({ index: false, follow: false });
  });

  it('omits image arrays entirely when there is nothing to show', async () => {
    const { buildEntityMetadata } = await import('./metadata');

    const metadata = buildEntityMetadata({ seo: seo(), path: '/about', title: 'About' });

    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });
});
