import { describe, expect, it } from 'vitest';

import {
  getLinkRenderProps,
  hasCtaTarget,
  hasLinkTarget,
  normalizeCta,
  normalizeLink,
} from './links';

describe('CMS link helpers', () => {
  it('normalizes populated internal page links with home mapped to root', () => {
    expect(normalizeLink({ type: 'internal', page: { slug: 'home' }, label: 'Home' }).href).toBe(
      '/',
    );
    expect(
      normalizeLink({ type: 'internal', page: { slug: 'listings' }, label: 'Listings' }).href,
    ).toBe('/listings');
  });

  it('rejects unresolved internal relationships instead of linking to root', () => {
    expect(hasLinkTarget({ type: 'internal', page: 42 })).toBe(false);
    expect(() => normalizeLink({ type: 'internal', page: 42, label: 'Listings' })).toThrow();
  });

  it('normalizes custom, anchor, phone, and email links', () => {
    expect(
      normalizeLink({ type: 'custom', customUrl: 'https://example.com', label: 'External' }).href,
    ).toBe('https://example.com');
    expect(normalizeLink({ type: 'anchor', anchor: '/#lead', label: 'Lead' }).href).toBe('/#lead');
    expect(normalizeLink({ type: 'phone', phone: '(239) 555-0148', label: 'Call' }).href).toBe(
      'tel:2395550148',
    );
    expect(normalizeLink({ type: 'email', email: 'hello@example.com', label: 'Email' }).href).toBe(
      'mailto:hello@example.com',
    );
  });

  it('rejects missing and unsafe targets', () => {
    expect(() => normalizeLink(undefined, 'Fallback', '/fallback')).toThrow();
    expect(() =>
      normalizeLink({ type: 'custom', customUrl: 'javascript:alert(1)', label: 'Unsafe' }),
    ).toThrow();
    expect(() =>
      normalizeLink({ type: 'custom', customUrl: '//example.com', label: 'Unsafe' }),
    ).toThrow();
    expect(() => normalizeLink({ type: 'anchor', anchor: '#bad anchor', label: 'Bad' })).toThrow();
  });

  it('detects usable direct link and nested CTA targets', () => {
    expect(hasLinkTarget({ type: 'custom', customUrl: '/listings' })).toBe(true);
    expect(hasLinkTarget({ type: 'custom', customUrl: '' })).toBe(false);
    expect(hasLinkTarget({ type: 'internal' })).toBe(false);
    expect(hasCtaTarget({ link: { type: 'anchor', anchor: '/#lead' } })).toBe(true);
    expect(hasCtaTarget({ link: { type: 'anchor' } })).toBe(false);
  });

  it('lets CTA copy override the nested link copy', () => {
    expect(
      normalizeCta({
        label: 'Outer label',
        ariaLabel: 'Outer aria',
        link: {
          type: 'custom',
          customUrl: '/inner',
          label: 'Inner label',
          ariaLabel: 'Inner aria',
        },
      }),
    ).toMatchObject({ label: 'Outer label', ariaLabel: 'Outer aria', href: '/inner' });
  });

  it('returns plain render props with safe new-tab attributes', () => {
    expect(
      getLinkRenderProps(
        { label: 'External', href: 'https://example.com', newTab: true },
        'Fallback aria',
      ),
    ).toEqual({
      href: 'https://example.com',
      'aria-label': 'Fallback aria',
      target: '_blank',
      rel: 'noopener noreferrer',
    });

    expect(
      getLinkRenderProps({ label: 'Internal', href: '/listings', ariaLabel: 'Listings' }),
    ).toEqual({
      href: '/listings',
      'aria-label': 'Listings',
      target: undefined,
      rel: undefined,
    });
  });
});
