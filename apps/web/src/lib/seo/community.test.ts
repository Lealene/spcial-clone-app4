import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3002');
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://mvprealty.test');

import { communityDetailSchema, type CommunityDetail } from '@mvp-realty/api-contracts';

function makeCommunity(overrides: Record<string, unknown> = {}): CommunityDetail {
  return communityDetailSchema.parse({
    slug: 'bonita-bay',
    name: 'Bonita Bay',
    city: 'Bonita Springs',
    blurb: 'A gated Gulf-Coast community.',
    photoCount: 12,
    gallery: [{ src: 'https://cdn.test/a.jpg', alt: 'Aerial' }],
    facts: [],
    about: [],
    amenities: [{ icon: 'golf', title: 'Golf' }],
    clubs: [],
    faqs: [{ q: 'Is it gated?', a: 'Yes.' }],
    similar: [],
    broker: null,
    ...overrides,
  });
}

function types(nodes: Record<string, unknown>[]): string[] {
  return nodes.map((node) => String(node['@type']));
}

describe('buildCommunityGraph', () => {
  it('emits the page, the place and an FAQPage as separate nodes', async () => {
    const { buildCommunityGraph } = await import('./community');
    const nodes = buildCommunityGraph(makeCommunity(), []);

    expect(types(nodes)).toContain('WebPage');
    expect(types(nodes)).toContain('GatedResidenceCommunity');
    expect(types(nodes)).toContain('FAQPage');

    const faq = nodes.find((node) => node['@type'] === 'FAQPage') as Record<string, unknown>;
    expect(faq.mainEntity).toStrictEqual([
      {
        '@type': 'Question',
        name: 'Is it gated?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes.' },
      },
    ]);
  });

  it('never emits review or rating markup', async () => {
    const { buildCommunityGraph } = await import('./community');
    const serialized = JSON.stringify(buildCommunityGraph(makeCommunity(), []));

    expect(serialized).not.toContain('aggregateRating');
    expect(serialized).not.toContain('"Review"');
    expect(serialized).not.toContain('reviewCount');
  });

  it('omits the FAQ node when the community has no FAQs', async () => {
    const { buildCommunityGraph } = await import('./community');
    const nodes = buildCommunityGraph(makeCommunity({ faqs: [] }), []);
    expect(types(nodes)).not.toContain('FAQPage');
  });
});
