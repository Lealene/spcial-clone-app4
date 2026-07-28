import { cmsHrefSchema } from '@mvp-realty/api-contracts';
import { describe, expect, it } from 'vitest';

import { toTelHref } from './phone';

describe('toTelHref', () => {
  it('returns undefined for empty or short input', () => {
    expect(toTelHref()).toBeUndefined();
    expect(toTelHref('')).toBeUndefined();
    expect(toTelHref('123')).toBeUndefined();
  });

  it('adds +1 for bare 10-digit US numbers', () => {
    expect(toTelHref('(239) 555-0148')).toBe('tel:+12395550148');
  });

  it('keeps 11-digit numbers starting with 1', () => {
    expect(toTelHref('1-239-555-0148')).toBe('tel:+12395550148');
  });

  it('passes through an existing +', () => {
    expect(toTelHref('+44 20 7946 0958')).toBe('tel:+442079460958');
  });

  it('produces hrefs that satisfy cmsHrefSchema', () => {
    const hrefs = [
      toTelHref('(239) 555-0148'),
      toTelHref('12395550148'),
      toTelHref('+12395550148'),
      toTelHref('555-0148'),
    ];
    for (const href of hrefs) {
      expect(href).toBeDefined();
      expect(cmsHrefSchema.safeParse(href).success).toBe(true);
    }
  });
});
