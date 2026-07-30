import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

describe('CMS client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('caches until a tag purge and always carries the global tag', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchJson } = await import('./client');

    await fetchJson('/api/example', { tags: ['cms-example'] });

    // `false`, not a number: a time window here would cap every route in the app,
    // since the root layout fetches the header and footer on all of them. Routes
    // set their own backstop with `export const revalidate`.
    expect(fetchMock).toHaveBeenCalledWith(new URL('http://localhost:3002/api/example'), {
      next: { revalidate: false, tags: ['cms', 'cms-example'] },
    });
  });

  it('allows a per-call revalidate override', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchJson } = await import('./client');

    await fetchJson('/api/example', { tags: ['cms-example'], revalidate: 60 });

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      next: { revalidate: 60, tags: ['cms', 'cms-example'] },
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
