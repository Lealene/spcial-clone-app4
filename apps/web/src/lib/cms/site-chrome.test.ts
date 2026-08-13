import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');
vi.mock('next/server', () => ({ connection: vi.fn(async () => undefined) }));

describe('site chrome CMS normalization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes header links and preserves row-level aria labels', async () => {
    const { normalizeHeader } = await import('./site-chrome');

    const header = normalizeHeader({
      brandHomeLink: { type: 'internal', page: { slug: 'home' }, label: 'Home' },
      brandLabel: '55 Living Team',
      navItems: [
        {
          label: 'The Life',
          ariaLabel: 'Explore the lifestyle',
          link: { type: 'anchor', anchor: '/#lifestyle', label: 'Nested label' },
        },
      ],
      primaryCta: {
        label: 'Request My Shortlist',
        link: { type: 'anchor', anchor: '/#lead', label: 'Lead' },
      },
      mobileMenuLabel: 'Menu',
      mobileMenuCloseLabel: 'Close menu',
    });

    expect(header.brandHomeLink.href).toBe('/');
    expect(header.navItems[0]).toMatchObject({
      label: 'The Life',
      ariaLabel: 'Explore the lifestyle',
      link: { href: '/#lifestyle' },
    });
  });

  it('normalizes footer column links and direct bottom links', async () => {
    const { normalizeFooter } = await import('./site-chrome');

    const footer = normalizeFooter({
      brandName: 'MVP',
      brandBlurb: 'Concierge real estate.',
      columns: [
        {
          title: 'Explore',
          links: [
            {
              label: 'Call',
              link: { type: 'phone', phone: '(239) 555-0148', label: 'Call' },
              ariaLabel: 'Call 55 Living Team',
            },
          ],
        },
      ],
      bottomLeftText: '© 55 Living Team',
      bottomRightLinks: [{ type: 'email', email: 'hello@example.com', label: 'Email' }],
    });

    expect(footer.columns[0]?.links[0]).toMatchObject({
      ariaLabel: 'Call 55 Living Team',
      link: { href: 'tel:2395550148' },
    });
    expect(footer.bottomRightLinks[0]).toMatchObject({ href: 'mailto:hello@example.com' });
  });

  it('auto-fills a community-sourced footer column from Areas, honoring the limit', async () => {
    const { normalizeFooter } = await import('./site-chrome');

    const footer = normalizeFooter(
      {
        brandName: 'MVP',
        brandBlurb: 'Concierge real estate.',
        columns: [{ title: 'Communities', source: 'communities', communityLimit: 2 }],
        bottomLeftText: '© 55 Living Team',
        bottomRightLinks: [],
      },
      [
        { slug: 'bonita-bay', name: 'Bonita Bay' },
        { slug: 'pelican-bay', name: 'Pelican Bay' },
        { slug: 'talis-park', name: 'Talis Park' },
      ],
    );

    expect(footer.columns[0]?.links).toEqual([
      { label: 'Bonita Bay', link: { label: 'Bonita Bay', href: '/communities/bonita-bay' } },
      { label: 'Pelican Bay', link: { label: 'Pelican Bay', href: '/communities/pelican-bay' } },
    ]);
  });

  it('prefers pinned community overrides over the auto list and their order', async () => {
    const { normalizeFooter } = await import('./site-chrome');

    const footer = normalizeFooter(
      {
        brandName: 'MVP',
        brandBlurb: 'Concierge real estate.',
        columns: [
          {
            title: 'Communities',
            source: 'communities',
            communityLimit: 6,
            communityOverrides: [
              { slug: 'talis-park', name: 'Talis Park' },
              { slug: 'not a slug', name: 'Broken' },
              { slug: 'bonita-bay', name: 'Bonita Bay' },
            ],
          },
        ],
        bottomLeftText: '© 55 Living Team',
        bottomRightLinks: [],
      },
      [{ slug: 'pelican-bay', name: 'Pelican Bay' }],
    );

    expect(footer.columns[0]?.links.map((item) => item.link.href)).toEqual([
      '/communities/talis-park',
      '/communities/bonita-bay',
    ]);
  });

  it('maps a populated header brandLogo and soft-fails a broken one', async () => {
    const { normalizeHeader } = await import('./site-chrome');

    const base = {
      brandHomeLink: { type: 'custom', customUrl: '/', label: 'Home' },
      brandLabel: '55 Living Team',
      navItems: [],
      primaryCta: {
        label: 'Contact',
        link: { type: 'anchor', anchor: '/#lead', label: 'Contact' },
      },
      mobileMenuLabel: 'Menu',
      mobileMenuCloseLabel: 'Close menu',
    };

    const withLogo = normalizeHeader({
      ...base,
      brandDisplayMode: 'logo',
      brandLogo: {
        image: {
          url: '/api/media/file/logo.png',
          alt: 'MVP logo',
          width: 240,
          height: 80,
          mimeType: 'image/png',
        },
        altOverride: '55 Living Team logo',
      },
    });
    expect(withLogo.brandLogo).toEqual({
      src: 'http://localhost:3002/api/media/file/logo.png',
      alt: '55 Living Team logo',
      width: 240,
      height: 80,
    });
    expect(withLogo.brandDisplayMode).toBe('logo');

    const withoutLogo = normalizeHeader(base);
    expect(withoutLogo.brandLogo).toBeUndefined();
    expect(withoutLogo.brandDisplayMode).toBe('text');

    const brokenLogo = normalizeHeader({
      ...base,
      brandDisplayMode: 'logo',
      brandLogo: { image: 12 },
    });
    expect(brokenLogo.brandLogo).toBeUndefined();
    expect(brokenLogo.brandLabel).toBe('55 Living Team');
    expect(brokenLogo.brandDisplayMode).toBe('text');
  });

  it('maps a populated footer brandLogo and soft-fails a broken one', async () => {
    const { normalizeFooter } = await import('./site-chrome');

    const base = {
      brandName: 'MVP',
      brandAccentText: 'Realty',
      brandBlurb: 'Concierge real estate.',
      columns: [],
      bottomLeftText: '© 55 Living Team',
      bottomRightLinks: [],
    };

    const withLogo = normalizeFooter({
      ...base,
      brandDisplayMode: 'logo',
      brandLogo: {
        image: {
          url: 'http://localhost:3002/api/media/file/footer-logo.png',
          alt: 'Footer mark',
          mimeType: 'image/png',
        },
      },
    });
    expect(withLogo.brandLogo).toMatchObject({
      src: 'http://localhost:3002/api/media/file/footer-logo.png',
      alt: 'Footer mark',
    });
    expect(withLogo.brandDisplayMode).toBe('logo');

    const withoutLogo = normalizeFooter(base);
    expect(withoutLogo.brandLogo).toBeUndefined();
    expect(withoutLogo.brandDisplayMode).toBe('text');

    const brokenLogo = normalizeFooter({
      ...base,
      brandDisplayMode: 'logo',
      brandLogo: { image: null },
    });
    expect(brokenLogo.brandLogo).toBeUndefined();
    expect(brokenLogo.brandName).toBe('MVP');
    expect(brokenLogo.brandDisplayMode).toBe('text');
  });

  it('rejects missing CMS-owned header and footer copy', async () => {
    const { normalizeFooter, normalizeHeader } = await import('./site-chrome');

    expect(() =>
      normalizeHeader({
        brandHomeLink: { type: 'custom', customUrl: '/', label: 'Home' },
        brandLabel: '55 Living Team',
        navItems: [],
        primaryCta: {
          label: 'Contact',
          link: { type: 'anchor', anchor: '/#lead', label: 'Contact' },
        },
      }),
    ).toThrow('mobile menu label');
    expect(() => normalizeFooter({ columns: [], bottomRightLinks: [] })).toThrow(
      'footer brand name',
    );
  });

  it('returns the public snapshot when CMS chrome is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const { getHeaderContent } = await import('./site-chrome');

    await expect(getHeaderContent()).resolves.toMatchObject({
      brandLabel: '55 Living Team',
      brandDisplayMode: 'logo',
    });
  });
});
