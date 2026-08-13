import { beforeEach, describe, expect, it, vi } from 'vitest';

const connectionMock = vi.fn(async () => undefined);
const getPageContentMock = vi.fn();

vi.mock('next/server', () => ({ connection: connectionMock }));
vi.mock('./index', () => ({ getPageContent: getPageContentMock }));

describe('getHomePageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the published CMS page when available', async () => {
    const { homepageFixture } = await import('@/data/homepage-fixture');
    const page = { ...homepageFixture, title: 'Published homepage' };
    getPageContentMock.mockResolvedValue({ status: 'ready', page, diagnostics: [] });

    const { getHomePageContent } = await import('./home');

    await expect(getHomePageContent()).resolves.toBe(page);
    expect(connectionMock).not.toHaveBeenCalled();
  });

  it('uses an uncached snapshot when the CMS request is unavailable', async () => {
    const { CmsDataError } = await import('../errors');
    getPageContentMock.mockRejectedValue(
      new CmsDataError('CMS request failed.', {
        kind: 'request-failed',
        resource: '/api/pages',
      }),
    );

    const { homepageFixture } = await import('@/data/homepage-fixture');
    const { getHomePageContent } = await import('./home');

    await expect(getHomePageContent()).resolves.toBe(homepageFixture);
    expect(connectionMock).toHaveBeenCalledOnce();
  });

  it('does not hide missing or malformed authored content', async () => {
    getPageContentMock.mockResolvedValue({ status: 'missing' });

    const { getHomePageContent } = await import('./home');

    await expect(getHomePageContent()).rejects.toMatchObject({
      kind: 'missing-required-content',
    });
    expect(connectionMock).not.toHaveBeenCalled();
  });
});
