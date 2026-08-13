import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('normalizeBroker', () => {
  async function load() {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
    return import('./normalize');
  }

  it('returns null for a bare id', async () => {
    const { normalizeBroker } = await load();
    expect(normalizeBroker(12)).toBeNull();
    expect(normalizeBroker('12')).toBeNull();
  });

  it('preserves rating 0 and leaves absent reviewCount undefined', async () => {
    const { normalizeBroker } = await load();
    const broker = normalizeBroker({
      slug: 'eleanor-voss',
      name: 'Eleanor Voss',
      title: 'Broker & Owner',
      brokerage: '55 Living Team',
      rating: 0,
    });
    expect(broker?.rating).toBe(0);
    expect(broker?.reviewCount).toBeUndefined();
    expect(broker?.firstName).toBe('Eleanor');
  });

  it('returns undefined headshot (not throw) for non-image media', async () => {
    const { normalizeBroker } = await load();
    const broker = normalizeBroker({
      slug: 'eleanor-voss',
      name: 'Eleanor Voss',
      title: 'Broker & Owner',
      headshot: {
        url: '/media/doc.pdf',
        alt: 'PDF',
        mimeType: 'application/pdf',
      },
    });
    expect(broker).not.toBeNull();
    expect(broker?.headshot).toBeUndefined();
  });
});
