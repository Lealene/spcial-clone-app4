import { describe, expect, it } from 'vitest';

import type { Broker } from '@mvp-realty/api-contracts';

import { resolveBroker } from './resolve';

const listing: Broker = {
  slug: 'listing-broker',
  name: 'Listing Broker',
  firstName: 'Listing',
  title: 'Agent',
  conciergeLabel: 'Your concierge',
  credentials: [],
};

const area: Broker = {
  slug: 'area-broker',
  name: 'Area Broker',
  firstName: 'Area',
  title: 'Broker',
  conciergeLabel: 'Your concierge',
  credentials: [],
};

describe('resolveBroker', () => {
  it('prefers listing broker over area broker', () => {
    expect(resolveBroker(listing, area)).toBe(listing);
  });

  it('falls back to area broker', () => {
    expect(resolveBroker(null, area)).toBe(area);
  });

  it('returns null when both missing', () => {
    expect(resolveBroker(null, null)).toBeNull();
  });
});
