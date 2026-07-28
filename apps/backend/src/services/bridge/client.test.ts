import { afterEach, describe, expect, it, vi } from 'vitest';

import { BridgeClient, BridgeClientError } from './client';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('BridgeClient', () => {
  it('paginates following @odata.nextLink until exhausted', async () => {
    const urls: string[] = [];
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      urls.push(url);
      if (urls.length === 1) {
        return jsonResponse({
          value: [{ ListingKey: 'a' }],
          '@odata.nextLink':
            'https://api.bridgedataoutput.com/api/v2/OData/nabor/Property?$skiptoken=page2',
        });
      }
      return jsonResponse({ value: [{ ListingKey: 'b' }] });
    }) as typeof fetch;

    const client = new BridgeClient({
      token: 'test-token',
      datasetId: 'nabor',
      fetchImpl: globalThis.fetch,
    });

    const rows = await client.fetchActiveListingsForArea('BONITA BAY');
    expect(rows.map((row) => row.ListingKey)).toEqual(['a', 'b']);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain("MLSAreaMajor%20eq%20'BONITA%20BAY'");
    expect(urls[0]).toContain("MlsStatus%20eq%20'Active'");
    expect(urls[1]).toContain('$skiptoken=page2');
  });

  it('retries on 429 using Retry-After, then succeeds', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('slow down', {
          status: 429,
          headers: { 'Retry-After': '1' },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          value: [{ ListingKey: 'ok' }],
        }),
      );

    const client = new BridgeClient({
      token: 'test-token',
      datasetId: 'nabor',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      maxRetries: 3,
    });

    const promise = client.fetchActiveListingsForArea('BONITA BAY');
    await vi.advanceTimersByTimeAsync(1000);
    const rows = await promise;

    expect(rows).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('throws BridgeClientError after exhausting retries', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('nope', {
        status: 503,
        headers: { 'Retry-After': '0' },
      }),
    );

    const client = new BridgeClient({
      token: 'test-token',
      datasetId: 'nabor',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      maxRetries: 2,
    });

    const promise = client.fetchActiveListingsForArea('BONITA BAY');
    const expectation = expect(promise).rejects.toBeInstanceOf(BridgeClientError);
    await vi.advanceTimersByTimeAsync(5000);
    await expectation;
    expect(fetchImpl).toHaveBeenCalledTimes(3); // initial + 2 retries
    vi.useRealTimers();
  });

  it('adds ModificationTimestamp filter for incremental sync', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain('ModificationTimestamp%20gt%20');
      return jsonResponse({ value: [] });
    });

    const client = new BridgeClient({
      token: 'test-token',
      datasetId: 'nabor',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await client.fetchActiveListingsForArea('BONITA BAY', {
      modifiedSince: '2026-01-01T00:00:00.000Z',
    });
  });

  it('counts active listings without the incremental filter', async () => {
    const urls: string[] = [];
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      urls.push(String(input));
      return jsonResponse({ value: [], '@odata.count': 108 });
    });

    const client = new BridgeClient({
      token: 'test-token',
      datasetId: 'nabor',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.countActiveListingsForArea('BONITA BAY')).resolves.toBe(108);
    expect(urls[0]).toContain("MLSAreaMajor%20eq%20'BONITA%20BAY'");
    expect(urls[0]).toContain("MlsStatus%20eq%20'Active'");
    expect(urls[0]).toContain('$top=0');
    expect(urls[0]).toContain('$count=true');
    expect(urls[0]).not.toContain('ModificationTimestamp');
  });

  it('returns 0 when the count response omits @odata.count', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ value: [] }));

    const client = new BridgeClient({
      token: 'test-token',
      datasetId: 'nabor',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(client.countActiveListingsForArea('NOPE AREA')).resolves.toBe(0);
  });
});
