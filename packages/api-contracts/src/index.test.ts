import { describe, expect, it } from 'vitest';

import {
  CMS_PAGE_BLOCK_LIMITS,
  CMS_PAGE_BLOCK_TYPES,
  cmsAnchorIdSchema,
  cmsCanonicalUrlSchema,
  cmsCtaSchema,
  cmsHrefSchema,
  cmsPageBlockSchemasByType,
  cmsPageBlockTypeSchema,
  cmsPageSchema,
  headerGlobalSchema,
  leadCaptureBlockSchema,
} from './index.js';

const image = {
  src: '/images/example.jpg',
  alt: 'Example image',
};

const link = (label: string, href: string) => ({ label, href });

describe('CMS page contracts', () => {
  it('parses a minimal CMS page with block defaults', () => {
    const parsed = cmsPageSchema.parse({
      title: 'About MVP',
      slug: 'about',
      layout: [
        {
          blockType: 'hero',
          backgroundImage: image,
          eyebrow: 'By Appointment',
          heading: 'A prestigious address',
          lede: 'Private gated communities minutes from the Gulf beaches.',
          primaryCta: link('View Residences', '/#listings'),
        },
        {
          blockType: 'testimonials',
          kicker: 'In Their Words',
          heading: 'The address impressed them.',
          stories: [
            {
              slug: 'resident',
              name: 'Resident',
              location: 'Naples',
              quote: 'We love it here.',
              portrait: image,
            },
          ],
        },
      ],
    });

    expect(parsed.seo.index).toBe(true);
    const hero = parsed.layout[0];
    const testimonials = parsed.layout[1];

    expect(hero?.blockType).toBe('hero');
    if (hero?.blockType === 'hero') {
      expect(hero.backgroundImagePriority).toBe(true);
    }
    expect(testimonials?.blockType).toBe('testimonials');
    if (testimonials?.blockType === 'testimonials') {
      expect(testimonials.carouselIntervalMs).toBe(6500);
    }
  });

  it('rejects unknown CMS page blocks', () => {
    expect(() =>
      cmsPageSchema.parse({
        title: 'About MVP',
        slug: 'about',
        layout: [{ blockType: 'unknown' }],
      }),
    ).toThrow();
  });

  it('rejects invalid testimonial carousel intervals', () => {
    expect(() =>
      cmsPageSchema.parse({
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'testimonials',
            kicker: 'In Their Words',
            heading: 'The address impressed them.',
            carouselIntervalMs: 0,
            stories: [
              {
                slug: 'resident',
                name: 'Resident',
                location: 'Naples',
                quote: 'We love it here.',
                portrait: image,
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('keeps lead form fields code-shaped while making copy editable', () => {
    const parsed = leadCaptureBlockSchema.parse({
      blockType: 'leadCapture',
      kicker: 'Your Private Introduction',
      heading: 'Let a concierge prepare your shortlist.',
      body: 'Tell us a little about the life you are looking for.',
      helperNote: {
        link: link('by request', '#lead'),
      },
      fields: {
        name: { label: 'Your name', placeholder: 'Jane & Robert Ellison' },
        email: { label: 'Email address', placeholder: 'you@example.com' },
        phone: { label: 'Phone (optional)', placeholder: '(239) 555-0148', required: false },
      },
      submitLabel: 'Request My Shortlist',
      privacyText: 'We never share your details.',
      successHeading: 'Your request is in.',
      successBody: 'Thank you.',
      errorRequiredMessage: 'Please share your name and email.',
      errorInvalidEmailMessage: 'That email address looks incomplete.',
    });

    expect(parsed.helperNote.icon).toBe('waves');
    expect(parsed.fields.name.required).toBe(true);
    expect(parsed.fields.phone.required).toBe(false);
  });

  it('keeps the CMS page block catalog exhaustive with schemas', () => {
    expect(CMS_PAGE_BLOCK_TYPES).toEqual([
      'hero',
      'communitiesStrip',
      'featuredCommunities',
      'featuredResidences',
      'lifestyle',
      'testimonials',
      'amenities',
      'ownerIntro',
      'leadCapture',
    ]);
    expect(Object.keys(cmsPageBlockSchemasByType)).toEqual([...CMS_PAGE_BLOCK_TYPES]);
    expect(cmsPageBlockTypeSchema.parse('hero')).toBe('hero');
  });

  it('keeps link and CTA browser attributes in the shared contract', () => {
    expect(
      cmsCtaSchema.parse({
        label: 'External',
        href: 'https://example.com',
        newTab: true,
        ariaLabel: 'Open external site',
      }),
    ).toEqual({
      label: 'External',
      href: 'https://example.com',
      newTab: true,
      ariaLabel: 'Open external site',
    });
  });

  it('rejects unsafe CMS links and invalid section anchors', () => {
    expect(cmsHrefSchema.safeParse('/listings').success).toBe(true);
    expect(cmsHrefSchema.safeParse('https://example.com').success).toBe(true);
    expect(cmsHrefSchema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(cmsHrefSchema.safeParse('//example.com').success).toBe(false);
    expect(cmsAnchorIdSchema.safeParse('featured-listings').success).toBe(true);
    expect(cmsAnchorIdSchema.safeParse('#featured listings').success).toBe(false);
    expect(cmsCanonicalUrlSchema.safeParse('/preferred').success).toBe(true);
    expect(cmsCanonicalUrlSchema.safeParse('https://example.com/preferred').success).toBe(true);
    expect(cmsCanonicalUrlSchema.safeParse('mailto:editor@example.com').success).toBe(false);
    expect(cmsCanonicalUrlSchema.safeParse('tel:+1234567890').success).toBe(false);
    expect(cmsCanonicalUrlSchema.safeParse('#section').success).toBe(false);
  });

  it('shares bounded authoring limits across schemas and consumers', () => {
    expect(CMS_PAGE_BLOCK_LIMITS.testimonialIntervalMs).toEqual({ min: 1000, max: 60000 });
    expect(CMS_PAGE_BLOCK_LIMITS.layout.max).toBe(24);
  });

  it('parses header globals with menu labels', () => {
    const parsed = headerGlobalSchema.parse({
      brandHomeLink: link('Home', '/'),
      brandLabel: 'MVP Realty',
      navItems: [{ label: 'The Life', link: link('The Life', '/#lifestyle') }],
      primaryCta: link('Request My Shortlist', '/#lead'),
    });

    expect(parsed.mobileMenuLabel).toBe('Menu');
    expect(parsed.mobileMenuCloseLabel).toBe('Close menu');
  });
});
