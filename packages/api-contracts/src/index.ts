import { z } from 'zod';

export const CMS_TEXT_LIMITS = {
  anchorId: 64,
  slug: 120,
  label: 120,
  heading: 200,
  shortCopy: 500,
  longCopy: 5000,
  url: 2048,
} as const;

export const CMS_LINK_TYPES = ['internal', 'custom', 'anchor', 'phone', 'email'] as const;
export type CmsLinkType = (typeof CMS_LINK_TYPES)[number];

export const CMS_PAGE_BLOCK_LIMITS = {
  layout: { min: 1, max: 24 },
  communitiesStripItems: { min: 1, max: 3 },
  featuredCommunities: { min: 1, max: 3 },
  featuredResidences: { min: 1, max: 3 },
  lifestyleTiles: { min: 1, max: 3 },
  testimonialStories: { min: 1, max: 8 },
  amenities: { min: 1, max: 6 },
  ownerCredentials: { min: 1, max: 4 },
  communityTags: { max: 6 },
  testimonialIntervalMs: { min: 1000, max: 60000 },
} as const;

export const cmsAnchorIdSchema = z
  .string()
  .min(1)
  .max(CMS_TEXT_LIMITS.anchorId)
  .regex(/^[A-Za-z][A-Za-z0-9_-]*$/);

function isSafeCmsHref(value: string): boolean {
  if (value.startsWith('//')) return false;
  if (value.startsWith('/')) return true;
  if (/^#[A-Za-z][A-Za-z0-9_-]*$/.test(value)) return true;
  if (/^https?:\/\/[^\s]+$/i.test(value)) return true;
  if (/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(value)) return true;
  return /^tel:\+?\d{7,}$/.test(value);
}

function isSafeCmsImageSource(value: string): boolean {
  if (value.startsWith('//')) return false;
  if (value.startsWith('/')) return true;
  return /^https?:\/\/[^\s]+$/i.test(value);
}

export const cmsHrefSchema = z
  .string()
  .min(1)
  .max(CMS_TEXT_LIMITS.url)
  .refine(isSafeCmsHref, 'Unsupported or unsafe CMS link target.');

export const cmsCanonicalUrlSchema = z
  .string()
  .min(1)
  .max(CMS_TEXT_LIMITS.url)
  .refine(
    (value) =>
      (value.startsWith('/') && !value.startsWith('//')) || /^https?:\/\/[^\s]+$/i.test(value),
    'Canonical URLs must be app-relative or absolute HTTP(S) URLs.',
  );

export const cmsImageSourceSchema = z
  .string()
  .min(1)
  .max(CMS_TEXT_LIMITS.url)
  .refine(isSafeCmsImageSource, 'Unsupported or unsafe CMS image source.');

export const cmsImageSchema = z.object({
  src: cmsImageSourceSchema,
  alt: z.string().min(1).max(CMS_TEXT_LIMITS.shortCopy),
  width: z.number().optional(),
  height: z.number().optional(),
  caption: z.string().optional(),
});
export type CmsImage = z.infer<typeof cmsImageSchema>;

export const cmsLinkSchema = z.object({
  label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  href: cmsHrefSchema,
  newTab: z.boolean().optional(),
  ariaLabel: z.string().optional(),
});
export type CmsLink = z.infer<typeof cmsLinkSchema>;

export const cmsCtaSchema = z.object({
  label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  href: cmsHrefSchema,
  newTab: z.boolean().optional(),
  ariaLabel: z.string().optional(),
});
export type CmsCta = z.infer<typeof cmsCtaSchema>;

export const sectionHeaderSchema = z.object({
  anchorId: cmsAnchorIdSchema.optional(),
  kicker: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  heading: z.string().min(1).max(CMS_TEXT_LIMITS.heading),
  headingAccent: z.string().max(CMS_TEXT_LIMITS.heading).optional(),
  lede: z.string().max(CMS_TEXT_LIMITS.shortCopy).optional(),
});
export type SectionHeaderContent = z.infer<typeof sectionHeaderSchema>;

export const pageSeoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalMode: z.enum(['auto', 'custom']).default('auto'),
  canonicalUrl: cmsCanonicalUrlSchema.optional(),
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
  anchorId: cmsAnchorIdSchema.optional(),
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
  anchorId: cmsAnchorIdSchema.optional(),
  sourceMode: z.literal('manual').default('manual'),
  maxItems: z
    .number()
    .int()
    .min(CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.min)
    .max(CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max)
    .optional(),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
        name: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        blurb: z.string().min(1).max(CMS_TEXT_LIMITS.shortCopy),
        link: cmsLinkSchema,
        icon: z.enum(['mapPin']).default('mapPin'),
      }),
    )
    .min(CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.min)
    .max(CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max),
});
export type CommunitiesStripBlock = z.infer<typeof communitiesStripBlockSchema>;

export const featuredCommunitiesBlockSchema = z.object({
  blockType: z.literal('featuredCommunities'),
  anchorId: cmsAnchorIdSchema.default('communities'),
  header: sectionHeaderSchema,
  sourceMode: z.literal('manual').default('manual'),
  manualCommunities: z
    .array(
      z.object({
        slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
        name: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        locality: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        rating: z.number().min(0).max(5),
        reviews: z.number().int().nonnegative(),
        reviewsLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label).default('reviews'),
        priceRange: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        tags: z
          .array(z.string().min(1).max(CMS_TEXT_LIMITS.label))
          .max(CMS_PAGE_BLOCK_LIMITS.communityTags.max),
        residences: z.number().int().nonnegative(),
        residencesLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label).default('residences'),
        nowSelling: z.number().int().nonnegative(),
        nowSellingLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label).default('now selling'),
        image: cmsImageSchema,
        link: cmsLinkSchema,
      }),
    )
    .min(CMS_PAGE_BLOCK_LIMITS.featuredCommunities.min)
    .max(CMS_PAGE_BLOCK_LIMITS.featuredCommunities.max),
  moreLink: cmsCtaSchema.optional(),
  emptyStateHeading: z.string().optional(),
  emptyStateBody: z.string().optional(),
});
export type FeaturedCommunitiesBlock = z.infer<typeof featuredCommunitiesBlockSchema>;

export const featuredResidencesBlockSchema = z.object({
  blockType: z.literal('featuredResidences'),
  anchorId: cmsAnchorIdSchema.default('listings'),
  header: sectionHeaderSchema,
  sourceMode: z.literal('manual').default('manual'),
  manualListings: z
    .array(
      z.object({
        slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
        name: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        locality: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        price: z.number().nonnegative().optional(),
        priceLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        beds: z.number().int().nonnegative(),
        bedsLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label).default('Beds'),
        baths: z.number().nonnegative(),
        bathsLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label).default('Baths'),
        sqft: z.number().int().nonnegative(),
        sqftLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label).default('Sq Ft'),
        badge: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        image: cmsImageSchema,
        link: cmsLinkSchema,
      }),
    )
    .min(CMS_PAGE_BLOCK_LIMITS.featuredResidences.min)
    .max(CMS_PAGE_BLOCK_LIMITS.featuredResidences.max),
  cardCtaLabel: z.string().default('View residence'),
  moreLink: cmsCtaSchema.optional(),
  emptyStateHeading: z.string().optional(),
  emptyStateBody: z.string().optional(),
});
export type FeaturedResidencesBlock = z.infer<typeof featuredResidencesBlockSchema>;

export const lifestyleBlockSchema = z.object({
  blockType: z.literal('lifestyle'),
  anchorId: cmsAnchorIdSchema.default('lifestyle'),
  backgroundImage: cmsImageSchema,
  kicker: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  body: z.string().min(1),
  maxTiles: z
    .number()
    .int()
    .min(CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.min)
    .max(CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.max)
    .optional(),
  tiles: z
    .array(
      z.object({
        caption: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        image: cmsImageSchema,
        link: cmsLinkSchema.optional(),
      }),
    )
    .min(CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.min)
    .max(CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.max),
});
export type LifestyleBlock = z.infer<typeof lifestyleBlockSchema>;

export const testimonialStorySchema = z.object({
  slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
  name: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  location: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  quote: z.string().min(1).max(CMS_TEXT_LIMITS.longCopy),
  portrait: cmsImageSchema,
  tabAriaLabel: z.string().optional(),
});

export const testimonialsBlockSchema = z.object({
  blockType: z.literal('testimonials'),
  anchorId: cmsAnchorIdSchema.default('testimonials'),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  headingSuffix: z.string().optional(),
  stories: z
    .array(testimonialStorySchema)
    .min(CMS_PAGE_BLOCK_LIMITS.testimonialStories.min)
    .max(CMS_PAGE_BLOCK_LIMITS.testimonialStories.max),
  carouselAutoPlay: z.boolean().default(true),
  carouselIntervalMs: z
    .number()
    .int()
    .min(CMS_PAGE_BLOCK_LIMITS.testimonialIntervalMs.min)
    .max(CMS_PAGE_BLOCK_LIMITS.testimonialIntervalMs.max)
    .default(6500),
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
  anchorId: cmsAnchorIdSchema.default('amenities'),
  header: sectionHeaderSchema,
  featureImage: cmsImageSchema,
  featureTitle: z.string().min(1),
  featureCaption: z.string().min(1),
  amenities: z
    .array(
      z.object({
        icon: amenityIconSchema,
        title: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        blurb: z.string().min(1).max(CMS_TEXT_LIMITS.shortCopy),
      }),
    )
    .min(CMS_PAGE_BLOCK_LIMITS.amenities.min)
    .max(CMS_PAGE_BLOCK_LIMITS.amenities.max),
  emptyStateHeading: z.string().optional(),
  emptyStateBody: z.string().optional(),
});
export type AmenitiesBlock = z.infer<typeof amenitiesBlockSchema>;

export const ownerIntroBlockSchema = z.object({
  blockType: z.literal('ownerIntro'),
  anchorId: cmsAnchorIdSchema.default('concierge'),
  portrait: cmsImageSchema,
  portraitBadgeLabel: z.string().default('Broker & Owner'),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  headingAccent: z.string().optional(),
  titleLine: z.string().min(1),
  bio: z.string().min(1),
  signature: z.string().min(1),
  credentials: z
    .array(
      z.object({
        value: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      }),
    )
    .min(CMS_PAGE_BLOCK_LIMITS.ownerCredentials.min)
    .max(CMS_PAGE_BLOCK_LIMITS.ownerCredentials.max),
});
export type OwnerIntroBlock = z.infer<typeof ownerIntroBlockSchema>;

export const leadCaptureBlockSchema = z.object({
  blockType: z.literal('leadCapture'),
  anchorId: cmsAnchorIdSchema.default('lead'),
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
      label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      placeholder: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      required: z.boolean().default(true),
    }),
    email: z.object({
      label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      placeholder: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      required: z.boolean().default(true),
    }),
    phone: z.object({
      label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      placeholder: z.string().min(1).max(CMS_TEXT_LIMITS.label),
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

export const CMS_PAGE_BLOCK_TYPES = [
  'hero',
  'communitiesStrip',
  'featuredCommunities',
  'featuredResidences',
  'lifestyle',
  'testimonials',
  'amenities',
  'ownerIntro',
  'leadCapture',
] as const;
export type CmsPageBlockType = (typeof CMS_PAGE_BLOCK_TYPES)[number];
export const cmsPageBlockTypeSchema = z.enum(CMS_PAGE_BLOCK_TYPES);

const cmsPageBlockIdentityShape = {
  id: z.string().min(1).optional(),
};

export const cmsPageBlockSchemasByType = {
  hero: heroBlockSchema.extend(cmsPageBlockIdentityShape),
  communitiesStrip: communitiesStripBlockSchema.extend(cmsPageBlockIdentityShape),
  featuredCommunities: featuredCommunitiesBlockSchema.extend(cmsPageBlockIdentityShape),
  featuredResidences: featuredResidencesBlockSchema.extend(cmsPageBlockIdentityShape),
  lifestyle: lifestyleBlockSchema.extend(cmsPageBlockIdentityShape),
  testimonials: testimonialsBlockSchema.extend(cmsPageBlockIdentityShape),
  amenities: amenitiesBlockSchema.extend(cmsPageBlockIdentityShape),
  ownerIntro: ownerIntroBlockSchema.extend(cmsPageBlockIdentityShape),
  leadCapture: leadCaptureBlockSchema.extend(cmsPageBlockIdentityShape),
} satisfies Record<CmsPageBlockType, z.ZodTypeAny>;

export const cmsPageBlockSchema = z.discriminatedUnion('blockType', [
  cmsPageBlockSchemasByType.hero,
  cmsPageBlockSchemasByType.communitiesStrip,
  cmsPageBlockSchemasByType.featuredCommunities,
  cmsPageBlockSchemasByType.featuredResidences,
  cmsPageBlockSchemasByType.lifestyle,
  cmsPageBlockSchemasByType.testimonials,
  cmsPageBlockSchemasByType.amenities,
  cmsPageBlockSchemasByType.ownerIntro,
  cmsPageBlockSchemasByType.leadCapture,
]);
export type CmsPageBlock = z.infer<typeof cmsPageBlockSchema>;

export const cmsPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  seo: pageSeoSchema.default({}),
  layout: z.array(cmsPageBlockSchema).max(CMS_PAGE_BLOCK_LIMITS.layout.max),
});
export type CmsPage = z.infer<typeof cmsPageSchema>;

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
  mobileMenuLabel: z.string().min(1),
  mobileMenuCloseLabel: z.string().min(1),
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
