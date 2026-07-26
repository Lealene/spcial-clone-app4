import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

describe('CMS client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses bounded revalidation and resource tags', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchJson } = await import('./client');

    await fetchJson('/api/example', { tags: ['cms-example'] });

    expect(fetchMock).toHaveBeenCalledWith(new URL('http://localhost:3002/api/example'), {
      next: { revalidate: 300, tags: ['cms', 'cms-example'] },
    });
  });

  it('reports invalid JSON without exposing a response body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('secret response body');
        },
      }),
    );
    const { fetchJson } = await import('./client');

    await expect(fetchJson('/api/example')).rejects.toMatchObject({
      name: 'CmsDataError',
      kind: 'invalid-response',
      message: 'CMS returned an invalid JSON response.',
    });
  });
});
