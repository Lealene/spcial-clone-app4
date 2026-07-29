import type { Payload } from 'payload';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalFetch = globalThis.fetch;

function fakePayload() {
  return {
    logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
  } as unknown as Payload;
}

/**
 * `env.ts` reads process.env once at module load, so each case sets the vars it
 * needs and re-imports rather than sharing one instance.
 */
async function loadModule(vars: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) vi.stubEnv(key, '');
    else vi.stubEnv(key, value);
  }
  vi.resetModules();
  return import('./revalidate');
}

const CONFIGURED = {
  WEB_APP_URL: 'http://web.test',
  CMS_REVALIDATE_SECRET: 'secret-value-at-least-16',
};

beforeEach(() => {
  vi.stubEnv('DATABASE_URL', 'postgres://u:p@localhost:5435/db');
  vi.stubEnv('PAYLOAD_SECRET', 'payload-secret-at-least-16');
  vi.stubEnv('PAYLOAD_PUBLIC_SERVER_URL', 'http://localhost:3002');
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('revalidateWebTags', () => {
  it('posts deduplicated tags with the bearer secret', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const { revalidateWebTags } = await loadModule(CONFIGURED);
    await revalidateWebTags(fakePayload(), ['listings', 'listings', 'areas']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://web.test/api/revalidate');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${CONFIGURED.CMS_REVALIDATE_SECRET}`,
    );
    expect(JSON.parse(String(init.body))).toEqual({ tags: ['listings', 'areas'] });
  });

  it('does nothing when the web app URL or secret is unset', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { revalidateWebTags } = await loadModule({
      WEB_APP_URL: undefined,
      CMS_REVALIDATE_SECRET: undefined,
    });
    await revalidateWebTags(fakePayload(), ['listings']);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips the request when there are no tags', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { revalidateWebTags } = await loadModule(CONFIGURED);
    await revalidateWebTags(fakePayload(), []);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('warns instead of throwing when the web app is unreachable', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED')) as typeof fetch;

    const { revalidateWebTags } = await loadModule(CONFIGURED);
    const payload = fakePayload();

    await expect(revalidateWebTags(payload, ['listings'])).resolves.toBeUndefined();
    expect(payload.logger.warn).toHaveBeenCalled();
  });

  it('warns instead of throwing when the web app rejects the request', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 401 })) as typeof fetch;

    const { revalidateWebTags } = await loadModule(CONFIGURED);
    const payload = fakePayload();

    await expect(revalidateWebTags(payload, ['listings'])).resolves.toBeUndefined();
    expect(payload.logger.warn).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
  });
});

describe('revalidate hooks', () => {
  it('skips invalidation for writes that opt out', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const { revalidateAfterChange, DISABLE_REVALIDATE } = await loadModule(CONFIGURED);
    const hook = revalidateAfterChange(['listings']);

    await hook({
      context: { [DISABLE_REVALIDATE]: true },
      doc: { id: 1 },
      previousDoc: { id: 1 },
      req: { payload: fakePayload() },
      // Remaining hook args are unused by this hook.
    } as unknown as Parameters<typeof hook>[0]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('derives tags from the changed document', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const { revalidateAfterChange } = await loadModule(CONFIGURED);
    const hook = revalidateAfterChange((doc, previousDoc) => [
      `cms-page:${(doc as { slug: string }).slug}`,
      `cms-page:${(previousDoc as { slug: string }).slug}`,
    ]);

    await hook({
      context: {},
      doc: { slug: 'new-slug' },
      previousDoc: { slug: 'old-slug' },
      req: { payload: fakePayload() },
    } as unknown as Parameters<typeof hook>[0]);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      tags: ['cms-page:new-slug', 'cms-page:old-slug'],
    });
  });
});
