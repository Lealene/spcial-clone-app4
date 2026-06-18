import { describe, expect, it } from 'vitest';

import { headerGlobalSchema, homepagePageSchema, leadCaptureBlockSchema } from './index.js';

const image = {
  src: '/images/example.jpg',
  alt: 'Example image',
};

const link = (label: string, href: string) => ({ label, href });

describe('homepage CMS contracts', () => {
  it('parses a minimal homepage with block defaults', () => {
    const parsed = homepagePageSchema.parse({
      title: 'Home',
      slug: 'home',
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

  it('rejects unknown homepage blocks', () => {
    expect(() =>
      homepagePageSchema.parse({
        title: 'Home',
        slug: 'home',
        layout: [{ blockType: 'unknown' }],
      }),
    ).toThrow();
  });

  it('rejects invalid testimonial carousel intervals', () => {
    expect(() =>
      homepagePageSchema.parse({
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
