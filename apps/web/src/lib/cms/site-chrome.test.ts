import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3003');

describe('site chrome CMS normalization', () => {
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
});
