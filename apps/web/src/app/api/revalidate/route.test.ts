import { afterEach, describe, expect, it, vi } from 'vitest';

const revalidateTag = vi.fn();
vi.mock('next/cache', () => ({ revalidateTag: (...args: unknown[]) => revalidateTag(...args) }));

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

const SECRET = 'revalidate-secret-at-least-16';

/** Pass `null` for `token` to omit the Authorization header entirely. */
function request(body: unknown, token: string | null = SECRET): Request {
  return new Request('http://localhost:3003/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function loadRoute(secret: string | undefined) {
  vi.stubEnv('CMS_REVALIDATE_SECRET', secret ?? '');
  vi.resetModules();
  return import('./route');
}

afterEach(() => {
  revalidateTag.mockClear();
  vi.restoreAllMocks();
});

describe('POST /api/revalidate', () => {
  it('expires each tag immediately so the next load is fresh', async () => {
    const { POST } = await loadRoute(SECRET);

    const response = await POST(request({ tags: ['listings', 'cms-global:header'] }));

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith('listings', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith('cms-global:header', { expire: 0 });
  });

  it('rejects a wrong secret without revalidating', async () => {
    const { POST } = await loadRoute(SECRET);

    const response = await POST(request({ tags: ['listings'] }, 'wrong-secret-value-16'));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects a missing Authorization header', async () => {
    const { POST } = await loadRoute(SECRET);

    const response = await POST(request({ tags: ['listings'] }, null));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuses to run when no secret is configured', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } = await loadRoute(undefined);

    const response = await POST(request({ tags: ['listings'] }));

    expect(response.status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects a body with no tags', async () => {
    const { POST } = await loadRoute(SECRET);

    const response = await POST(request({ tags: [] }));

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects a malformed body', async () => {
    const { POST } = await loadRoute(SECRET);

    const response = await POST(request('not json'));

    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
