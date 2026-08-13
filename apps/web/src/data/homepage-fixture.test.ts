import { describe, expect, it } from 'vitest';

import { homepageFixture } from './homepage-fixture';

describe('homepage fallback snapshot', () => {
  it('matches the current public owner presentation without placeholder credentials', () => {
    const ownerIntro = homepageFixture.layout.find((block) => block.blockType === 'ownerIntro');

    expect(ownerIntro).toMatchObject({
      blockType: 'ownerIntro',
      portraitBadgeLabel: 'Real Estate Advisor',
      kicker: 'Meet the Real Estate Advisor',
      titleLine: 'Kim Noble Senior Real Estate Specialist',
      signature: 'Kim Noble',
      credentials: [],
    });
    expect(JSON.stringify(homepageFixture)).not.toMatch(/Eleanor Voss|MVP\s+Real(?:t|i)y|\*{3}/i);
  });

  it('uses the published media snapshot instead of design-stage image fallbacks', () => {
    const serialized = JSON.stringify(homepageFixture);

    expect(serialized).toContain('pub-de584fcb52e3431f837b039818423714.r2.dev');
    expect(serialized).not.toContain('images.unsplash.com');
    expect(serialized).not.toContain('owner-eleanor-voss.jpg');
  });
});
