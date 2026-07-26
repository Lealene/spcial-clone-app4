import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

describe('site chrome CMS normalization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes header links and preserves row-level aria labels', async () => {
    const { normalizeHeader } = await import('./site-chrome');

    const header = normalizeHeader({
      brandHomeLink: { type: 'internal', page: { slug: 'home' }, label: 'Home' },
      brandLabel: 'MVP Realty',
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
              ariaLabel: 'Call MVP Realty',
            },
          ],
        },
      ],
      bottomLeftText: '© MVP Realty',
      bottomRightLinks: [{ type: 'email', email: 'hello@example.com', label: 'Email' }],
    });

    expect(footer.columns[0]?.links[0]).toMatchObject({
      ariaLabel: 'Call MVP Realty',
      link: { href: 'tel:2395550148' },
    });
    expect(footer.bottomRightLinks[0]).toMatchObject({ href: 'mailto:hello@example.com' });
  });

  it('rejects missing CMS-owned header and footer copy', async () => {
    const { normalizeFooter, normalizeHeader } = await import('./site-chrome');

    expect(() =>
      normalizeHeader({
        brandHomeLink: { type: 'custom', customUrl: '/', label: 'Home' },
        brandLabel: 'MVP Realty',
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

  it('propagates CMS request failures instead of returning fixture chrome', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const { getHeaderContent } = await import('./site-chrome');

    await expect(getHeaderContent()).rejects.toMatchObject({
      name: 'CmsDataError',
      kind: 'request-failed',
      status: 503,
    });
  });
});
