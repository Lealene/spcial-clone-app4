import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://mvprealty.test');

import { siteSettingsSchema, type SiteSettings } from '@mvp-realty/api-contracts';

function makeSettings(overrides: Record<string, unknown> = {}): SiteSettings {
  return siteSettingsSchema.parse({ name: 'MVP Realty', ...overrides });
}

describe('buildOrganizationNode', () => {
  it('is a RealEstateAgent with a stable @id the other graphs can reference', async () => {
    const { buildOrganizationNode } = await import('./organization');
    const node = buildOrganizationNode(makeSettings());

    expect(node['@type']).toBe('RealEstateAgent');
    expect(node['@id']).toBe('https://mvprealty.test/#organization');
    expect(node.url).toBe('https://mvprealty.test');
  });

  it('carries NAP, hours and profiles when the global is filled in', async () => {
    const { buildOrganizationNode } = await import('./organization');
    const node = buildOrganizationNode(
      makeSettings({
        phone: '(239) 555-0142',
        address: { streetAddress: '1 Bay Rd', addressLocality: 'Naples', addressRegion: 'FL' },
        geo: { latitude: 26.1, longitude: -81.8 },
        openingHours: [{ days: ['Monday'], opens: '09:00', closes: '17:00' }],
        sameAs: ['https://www.facebook.com/example'],
      }),
    );

    expect(node.telephone).toBe('(239) 555-0142');
    expect(node.address).toMatchObject({ '@type': 'PostalAddress', addressLocality: 'Naples' });
    expect(node.geo).toMatchObject({ '@type': 'GeoCoordinates', latitude: 26.1 });
    expect(node.openingHoursSpecification).toStrictEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday'],
        opens: '09:00',
        closes: '17:00',
      },
    ]);
    expect(node.sameAs).toStrictEqual(['https://www.facebook.com/example']);
  });

  it('survives an empty global — pruning removes the blanks', async () => {
    const { buildOrganizationNode } = await import('./organization');
    const { prune } = await import('./graph');
    const node = prune(buildOrganizationNode(makeSettings())) as Record<string, unknown>;

    expect(Object.keys(node).sort()).toStrictEqual(['@id', '@type', 'name', 'url']);
  });
});

describe('buildAgentNode', () => {
  it('types a broker as a Person, not the RealEstateAgent business type', async () => {
    const { buildAgentNode } = await import('./organization');
    const { brokerSchema } = await import('@mvp-realty/api-contracts');
    const node = buildAgentNode(
      brokerSchema.parse({
        slug: 'jane-doe',
        name: 'Jane Doe',
        title: 'Broker Associate',
        firstName: 'Jane',
        conciergeLabel: 'Your concierge',
        credentials: [],
      }),
    );

    // `RealEstateAgent` is a LocalBusiness; `jobTitle` and `worksFor` are
    // Person properties and would be invalid on it.
    expect(node['@type']).toBe('Person');
    expect(node.jobTitle).toBe('Broker Associate');
    expect(node.worksFor).toStrictEqual({ '@id': 'https://mvprealty.test/#organization' });
    expect(node.parentOrganization).toBeUndefined();
  });
});

describe('buildWebSiteNode', () => {
  it('names the organization as publisher by reference', async () => {
    const { buildWebSiteNode } = await import('./organization');
    const node = buildWebSiteNode(makeSettings());

    expect(node['@type']).toBe('WebSite');
    expect(node.publisher).toStrictEqual({ '@id': 'https://mvprealty.test/#organization' });
  });
});
