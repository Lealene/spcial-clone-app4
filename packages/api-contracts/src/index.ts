import { z } from 'zod';

export const cmsImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().optional(),
  height: z.number().optional(),
  caption: z.string().optional(),
});
export type CmsImage = z.infer<typeof cmsImageSchema>;

export const cmsLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  newTab: z.boolean().optional(),
  ariaLabel: z.string().optional(),
});
export type CmsLink = z.infer<typeof cmsLinkSchema>;

export const cmsCtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  newTab: z.boolean().optional(),
  ariaLabel: z.string().optional(),
});
export type CmsCta = z.infer<typeof cmsCtaSchema>;

export const sectionHeaderSchema = z.object({
  anchorId: z.string().optional(),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  lede: z.string().optional(),
});
export type SectionHeaderContent = z.infer<typeof sectionHeaderSchema>;

export const pageSeoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  index: z.boolean().default(true),
  follow: z.boolean().default(true),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: cmsImageSchema.optional(),
  ogImageAlt: z.string().optional(),
  twitterCard: z.enum(['summary', 'summary_large_image']).default('summary_large_image'),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: cmsImageSchema.optional(),
  twitterImageAlt: z.string().optional(),
  includeInSitemap: z.boolean().default(true),
});
export type PageSeo = z.infer<typeof pageSeoSchema>;

export const heroBlockSchema = z.object({
  blockType: z.literal('hero'),
  anchorId: z.string().optional(),
  backgroundImage: cmsImageSchema,
  backgroundImagePriority: z.boolean().default(true),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  lede: z.string().min(1),
  primaryCta: cmsCtaSchema,
  secondaryCta: cmsCtaSchema.optional(),
  showEyebrowMarker: z.boolean().default(true),
  showPrimaryCtaIcon: z.boolean().default(true),
  showSecondaryCta: z.boolean().default(true),
});
export type HeroBlock = z.infer<typeof heroBlockSchema>;

export const communitiesStripBlockSchema = z.object({
  blockType: z.literal('communitiesStrip'),
  anchorId: z.string().optional(),
  sourceMode: z.literal('manual').default('manual'),
  maxItems: z.number().optional(),
  items: z.array(
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      blurb: z.string().min(1),
      link: cmsLinkSchema,
      icon: z.enum(['mapPin']).default('mapPin'),
    }),
  ),
});
export type CommunitiesStripBlock = z.infer<typeof communitiesStripBlockSchema>;

export const featuredCommunitiesBlockSchema = z.object({
  blockType: z.literal('featuredCommunities'),
  anchorId: z.string().default('communities'),
  header: sectionHeaderSchema,
  sourceMode: z.literal('manual').default('manual'),
  manualCommunities: z.array(
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      locality: z.string().min(1),
      rating: z.number(),
      reviews: z.number(),
      reviewsLabel: z.string().default('reviews'),
      priceRange: z.string().min(1),
      tags: z.array(z.string()),
      residences: z.number(),
      residencesLabel: z.string().default('residences'),
      nowSelling: z.number(),
      nowSellingLabel: z.string().default('now selling'),
      image: cmsImageSchema,
      link: cmsLinkSchema,
    }),
  ),
  moreLink: cmsCtaSchema.optional(),
  emptyStateHeading: z.string().optional(),
  emptyStateBody: z.string().optional(),
});
export type FeaturedCommunitiesBlock = z.infer<typeof featuredCommunitiesBlockSchema>;

export const featuredResidencesBlockSchema = z.object({
  blockType: z.literal('featuredResidences'),
  anchorId: z.string().default('listings'),
  header: sectionHeaderSchema,
  sourceMode: z.literal('manual').default('manual'),
  manualListings: z.array(
    z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      locality: z.string().min(1),
      price: z.number().optional(),
      priceLabel: z.string().min(1),
      beds: z.number(),
      bedsLabel: z.string().default('Beds'),
      baths: z.number(),
      bathsLabel: z.string().default('Baths'),
      sqft: z.number(),
      sqftLabel: z.string().default('Sq Ft'),
      badge: z.string().min(1),
      image: cmsImageSchema,
      link: cmsLinkSchema,
    }),
  ),
  cardCtaLabel: z.string().default('View residence'),
  moreLink: cmsCtaSchema.optional(),
  emptyStateHeading: z.string().optional(),
  emptyStateBody: z.string().optional(),
});
export type FeaturedResidencesBlock = z.infer<typeof featuredResidencesBlockSchema>;

export const lifestyleBlockSchema = z.object({
  blockType: z.literal('lifestyle'),
  anchorId: z.string().default('lifestyle'),
  backgroundImage: cmsImageSchema,
  kicker: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  body: z.string().min(1),
  maxTiles: z.number().optional(),
  tiles: z.array(
    z.object({
      caption: z.string().min(1),
      image: cmsImageSchema,
      link: cmsLinkSchema.optional(),
    }),
  ),
});
export type LifestyleBlock = z.infer<typeof lifestyleBlockSchema>;

export const testimonialStorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  quote: z.string().min(1),
  portrait: cmsImageSchema,
  tabAriaLabel: z.string().optional(),
});

export const testimonialsBlockSchema = z.object({
  blockType: z.literal('testimonials'),
  anchorId: z.string().default('testimonials'),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  headingSuffix: z.string().optional(),
  stories: z.array(testimonialStorySchema),
  carouselAutoPlay: z.boolean().default(true),
  carouselIntervalMs: z.number().int().min(1000).default(6500),
  previousLabel: z.string().default('Previous story'),
  nextLabel: z.string().default('Next story'),
  tabListLabel: z.string().default('Choose a resident story'),
  counterSeparator: z.string().default('/'),
  emptyStateHeading: z.string().optional(),
  emptyStateBody: z.string().optional(),
});
export type TestimonialsBlock = z.infer<typeof testimonialsBlockSchema>;

export const amenityIconSchema = z.enum([
  'pool',
  'racquet',
  'fitness',
  'dining',
  'trails',
  'calendar',
]);
export type AmenityIcon = z.infer<typeof amenityIconSchema>;

export const amenitiesBlockSchema = z.object({
  blockType: z.literal('amenities'),
  anchorId: z.string().default('amenities'),
  header: sectionHeaderSchema,
  featureImage: cmsImageSchema,
  featureTitle: z.string().min(1),
  featureCaption: z.string().min(1),
  amenities: z.array(
    z.object({
      icon: amenityIconSchema,
      title: z.string().min(1),
      blurb: z.string().min(1),
    }),
  ),
  emptyStateHeading: z.string().optional(),
  emptyStateBody: z.string().optional(),
});
export type AmenitiesBlock = z.infer<typeof amenitiesBlockSchema>;

export const ownerIntroBlockSchema = z.object({
  blockType: z.literal('ownerIntro'),
  anchorId: z.string().default('concierge'),
  portrait: cmsImageSchema,
  portraitBadgeLabel: z.string().default('Broker & Owner'),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  titleLine: z.string().min(1),
  bio: z.string().min(1),
  signature: z.string().min(1),
  credentials: z.array(
    z.object({
      value: z.string().min(1),
      label: z.string().min(1),
    }),
  ),
});
export type OwnerIntroBlock = z.infer<typeof ownerIntroBlockSchema>;

export const leadCaptureBlockSchema = z.object({
  blockType: z.literal('leadCapture'),
  anchorId: z.string().default('lead'),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  body: z.string().min(1),
  helperNote: z.object({
    icon: z.enum(['waves']).default('waves'),
    beforeLinkText: z.string().default(''),
    link: cmsLinkSchema,
    afterLinkText: z.string().default(''),
  }),
  fields: z.object({
    name: z.object({
      label: z.string(),
      placeholder: z.string(),
      required: z.boolean().default(true),
    }),
    email: z.object({
      label: z.string(),
      placeholder: z.string(),
      required: z.boolean().default(true),
    }),
    phone: z.object({
      label: z.string(),
      placeholder: z.string(),
      required: z.boolean().default(false),
    }),
  }),
  submitLabel: z.string().min(1),
  privacyText: z.string().min(1),
  successHeading: z.string().min(1),
  successBody: z.string().min(1),
  errorRequiredMessage: z.string().min(1),
  errorInvalidEmailMessage: z.string().min(1),
});
export type LeadCaptureBlock = z.infer<typeof leadCaptureBlockSchema>;

export const homepageBlockSchema = z.discriminatedUnion('blockType', [
  heroBlockSchema,
  communitiesStripBlockSchema,
  featuredCommunitiesBlockSchema,
  featuredResidencesBlockSchema,
  lifestyleBlockSchema,
  testimonialsBlockSchema,
  amenitiesBlockSchema,
  ownerIntroBlockSchema,
  leadCaptureBlockSchema,
]);
export type HomepageBlock = z.infer<typeof homepageBlockSchema>;

export const homepagePageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  seo: pageSeoSchema.default({}),
  layout: z.array(homepageBlockSchema),
});
export type HomepagePage = z.infer<typeof homepagePageSchema>;

export const headerGlobalSchema = z.object({
  brandHomeLink: cmsLinkSchema,
  brandLabel: z.string().min(1),
  brandMarkAlt: z.string().optional(),
  navItems: z.array(
    z.object({
      label: z.string().min(1),
      link: cmsLinkSchema,
      ariaLabel: z.string().optional(),
    }),
  ),
  primaryCta: cmsCtaSchema,
  mobileMenuLabel: z.string().default('Menu'),
  mobileMenuCloseLabel: z.string().default('Close menu'),
});
export type HeaderGlobal = z.infer<typeof headerGlobalSchema>;

export const footerGlobalSchema = z.object({
  brandName: z.string().min(1),
  brandAccentText: z.string().optional(),
  brandBlurb: z.string().min(1),
  columns: z.array(
    z.object({
      title: z.string().min(1),
      links: z.array(
        z.object({
          label: z.string().min(1),
          link: cmsLinkSchema,
          ariaLabel: z.string().optional(),
        }),
      ),
    }),
  ),
  bottomLeftText: z.string().min(1),
  bottomRightLinks: z.array(cmsLinkSchema).default([]),
  bottomRightTextFallback: z.string().optional(),
});
export type FooterGlobal = z.infer<typeof footerGlobalSchema>;
