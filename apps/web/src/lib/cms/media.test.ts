import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

describe('CMS media helpers', () => {
  it('normalizes populated Payload image relationships', async () => {
    const { normalizeMediaField } = await import('./media');
    expect(
      normalizeMediaField({
        image: {
          url: '/media/hero.jpg',
          alt: 'Hero image',
          width: 2000,
          height: 1200,
          mimeType: 'image/jpeg',
        },
      }),
    ).toEqual({
      src: 'http://localhost:3002/media/hero.jpg',
      alt: 'Hero image',
      width: 2000,
      height: 1200,
      caption: undefined,
    });
  });

  it('rejects relationship IDs and missing required media', async () => {
    const { normalizeMediaField, normalizeOptionalMediaField } = await import('./media');
    expect(() => normalizeMediaField({ image: 42 }, 'Fallback alt')).toThrow();
    expect(() => normalizeMediaField(undefined, 'Fallback alt')).toThrow();
    expect(normalizeOptionalMediaField({ image: 42 }, 'Fallback alt')).toBeUndefined();
  });

  it('rejects unsafe, external, and non-image media', async () => {
    const { normalizeMediaField } = await import('./media');
    expect(() =>
      normalizeMediaField({ image: { url: '//evil.example/image.jpg', alt: 'Unsafe' } }),
    ).toThrow();
    expect(() =>
      normalizeMediaField({ image: { url: 'https://evil.example/image.jpg', alt: 'External' } }),
    ).toThrow();
    expect(() =>
      normalizeMediaField({
        image: { url: '/media/video.mp4', alt: 'Video', mimeType: 'video/mp4' },
      }),
    ).toThrow();
  });

  it('allows absolute media URLs on the configured media origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_URL', 'https://pub-example.r2.dev');
    vi.resetModules();
    const { normalizeMediaField } = await import('./media');
    expect(
      normalizeMediaField({
        image: {
          url: 'https://pub-example.r2.dev/seed-homepage--hero.jpg',
          alt: 'Hero image',
          width: 2000,
          height: 1200,
          mimeType: 'image/jpeg',
        },
      }),
    ).toEqual({
      src: 'https://pub-example.r2.dev/seed-homepage--hero.jpg',
      alt: 'Hero image',
      width: 2000,
      height: 1200,
      caption: undefined,
    });
  });
});
