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

export const CMS_AREA_DETAIL_LIMITS = {
  facts: { max: 6 },
  amenities: { max: 24 },
  clubs: { max: 24 },
  faqs: { max: 12 },
  similar: { max: 6 },
  credentials: { max: 3 },
  gallery: { min: 1 },
  aboutParagraphs: { max: 12 },
  /** Broker rating bounds; areas no longer carry a rating. */
  rating: { min: 0, max: 5 },
} as const;

export const CMS_LINK_TYPES = ['internal', 'custom', 'anchor', 'phone', 'email'] as const;
export type CmsLinkType = (typeof CMS_LINK_TYPES)[number];

export const CMS_PAGE_BLOCK_LIMITS = {
  layout: { min: 1, max: 24 },
  // Community cards/strip load from Areas; manual rows are optional legacy/fallback.
  communitiesStripItems: { min: 0, max: 3 },
  featuredCommunities: { min: 0, max: 3 },
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
  sourceMode: z.enum(['areas', 'manual']).default('areas'),
  maxItems: z.number().int().min(1).max(CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max).optional(),
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
    .max(CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max)
    .default([]),
});
export type CommunitiesStripBlock = z.infer<typeof communitiesStripBlockSchema>;

export const featuredCommunitiesBlockSchema = z.object({
  blockType: z.literal('featuredCommunities'),
  anchorId: cmsAnchorIdSchema.default('communities'),
  header: sectionHeaderSchema,
  sourceMode: z.enum(['areas', 'manual']).default('areas'),
  manualCommunities: z
    .array(
      z.object({
        slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
        name: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        locality: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        priceRange: z.string().min(1).max(CMS_TEXT_LIMITS.label),
        tags: z
          .array(z.string().min(1).max(CMS_TEXT_LIMITS.label))
          .max(CMS_PAGE_BLOCK_LIMITS.communityTags.max),
        nowSelling: z.number().int().nonnegative(),
        nowSellingLabel: z.string().min(1).max(CMS_TEXT_LIMITS.label).default('now selling'),
        image: cmsImageSchema,
        link: cmsLinkSchema,
      }),
    )
    .min(CMS_PAGE_BLOCK_LIMITS.featuredCommunities.min)
    .max(CMS_PAGE_BLOCK_LIMITS.featuredCommunities.max)
    .default([]),
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
  /**
   * DEPRECATED and unread by the renderer, which resolves the rail from listings
   * flagged `isFeatured`. Optional so a page validates without these rows; it stays
   * in the schema only until the drop migration removes the columns.
   */
  manualListings: z.array(z.unknown()).max(CMS_PAGE_BLOCK_LIMITS.featuredResidences.max).optional(),
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
    firstName: z.object({
      label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      placeholder: z.string().min(1).max(CMS_TEXT_LIMITS.label),
      required: z.boolean().default(true),
    }),
    lastName: z.object({
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

/**
 * Next.js Data Cache tags. The web app tags every CMS fetch with these and the
 * backend names them when asking the web app to invalidate, so both sides must
 * agree on the exact strings — hence living here rather than in either app.
 *
 * `all` is attached to every CMS request, so invalidating it drops everything.
 */
export const CMS_CACHE_TAGS = {
  all: 'cms',
  listings: 'listings',
  listingsFeatured: 'listings-featured',
  areas: 'areas',
  /**
   * Collection-wide pages tag. Per-page tags (`cmsPageCacheTag`) cover a page's own
   * route; this covers readers of the whole collection — the sitemap — which cannot
   * know every slug up front.
   */
  pages: 'pages',
  header: 'cms-global:header',
  footer: 'cms-global:footer',
  siteSettings: 'cms-global:site-settings',
  privacyPolicy: 'cms-global:privacy-policy',
} as const;

/** Per-page tag so editing one page does not invalidate the others. */
export function cmsPageCacheTag(slug: string): string {
  return `cms-page:${slug}`;
}

/**
 * Next.js rejects cache tags longer than this. It has to exceed
 * `CMS_TEXT_LIMITS.slug` because `cmsPageCacheTag` prefixes the slug.
 */
export const CMS_CACHE_TAG_MAX_LENGTH = 256;

/**
 * Body of `POST /api/revalidate` on the web app. Tags are opaque strings here:
 * page tags are slug-derived, so an enum would not cover them.
 */
export const cmsRevalidateRequestSchema = z.object({
  tags: z.array(z.string().min(1).max(CMS_CACHE_TAG_MAX_LENGTH)).min(1).max(50),
});
export type CmsRevalidateRequest = z.infer<typeof cmsRevalidateRequestSchema>;

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

/**
 * `bodyHtml` is pre-rendered from the Lexical body on the web side rather than
 * carried as raw editor state: the page needs real headings and lists, which the
 * paragraph-flattening helper cannot express.
 */
export const privacyPolicyGlobalSchema = z.object({
  title: z.string().min(1),
  lastUpdated: z.string().optional(),
  intro: z.string().optional(),
  bodyHtml: z.string(),
});
export type PrivacyPolicyGlobal = z.infer<typeof privacyPolicyGlobalSchema>;

// ---------------------------------------------------------------------------
// Site settings — the canonical business identity behind structured data
// ---------------------------------------------------------------------------

/** schema.org `dayOfWeek` values, as authored on the opening-hours rows. */
export const SITE_OPENING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
export const siteOpeningDaySchema = z.enum(SITE_OPENING_DAYS);
export type SiteOpeningDay = z.infer<typeof siteOpeningDaySchema>;

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM.');

export const sitePostalAddressSchema = z.object({
  streetAddress: z.string().max(CMS_TEXT_LIMITS.shortCopy).optional(),
  addressLocality: z.string().max(CMS_TEXT_LIMITS.label).optional(),
  addressRegion: z.string().max(CMS_TEXT_LIMITS.label).optional(),
  postalCode: z.string().max(CMS_TEXT_LIMITS.label).optional(),
  addressCountry: z.string().max(CMS_TEXT_LIMITS.label).optional(),
});
export type SitePostalAddress = z.infer<typeof sitePostalAddressSchema>;

export const siteGeoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type SiteGeo = z.infer<typeof siteGeoSchema>;

export const siteOpeningHoursSchema = z.object({
  days: z.array(siteOpeningDaySchema).min(1),
  opens: timeOfDaySchema,
  closes: timeOfDaySchema,
});
export type SiteOpeningHours = z.infer<typeof siteOpeningHoursSchema>;

/**
 * Everything the JSON-LD organization node and the metadata defaults need.
 * Only `name` is required — the graph omits any node property left blank, so an
 * unfilled global degrades to a minimal but still valid entity.
 */
export const siteSettingsSchema = z.object({
  name: z.string().min(1).max(CMS_TEXT_LIMITS.heading),
  legalName: z.string().max(CMS_TEXT_LIMITS.heading).optional(),
  description: z.string().max(CMS_TEXT_LIMITS.shortCopy).optional(),
  logo: cmsImageSchema.optional(),
  defaultOgImage: cmsImageSchema.optional(),
  email: z.string().email().optional(),
  phone: z.string().max(CMS_TEXT_LIMITS.label).optional(),
  phoneHref: cmsHrefSchema.optional(),
  address: sitePostalAddressSchema.optional(),
  geo: siteGeoSchema.optional(),
  priceRange: z.string().max(CMS_TEXT_LIMITS.label).optional(),
  areaServed: z.array(z.string().min(1).max(CMS_TEXT_LIMITS.label)).default([]),
  openingHours: z.array(siteOpeningHoursSchema).default([]),
  /** Social + directory profile URLs, emitted as schema.org `sameAs`. */
  sameAs: z.array(z.string().url().max(CMS_TEXT_LIMITS.url)).default([]),
  licenseNumber: z.string().max(CMS_TEXT_LIMITS.label).optional(),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

// ---------------------------------------------------------------------------
// MLS listings (Payload → web)
// ---------------------------------------------------------------------------

export const LISTING_PROPERTY_TYPES = [
  'single-family',
  'condo',
  'townhouse',
  'multi-family',
  'villa',
  'land',
  'other',
] as const;

export const LISTING_MLS_STATUSES = [
  'active',
  'pending',
  'under-contract',
  'sold',
  'coming-soon',
] as const;

/** Payload feature values stored on the collection. */
export const LISTING_PAYLOAD_FEATURES = [
  'waterfront',
  'private-pool',
  'golf',
  'gated',
  '55-plus',
] as const;

/** UI / filter feature values (mapped from Payload). */
export const LISTING_UI_FEATURES = ['waterfront', 'pool', 'golf', 'gated', '55plus'] as const;

/** PLP type facet — estate is marketing (`isEstate`), rest are propertyType. */
export const LISTING_TYPE_FACETS = [
  'estate',
  'single-family',
  'condo',
  'townhouse',
  'multi-family',
  'villa',
  'land',
  'other',
] as const;

export const listingPropertyTypeSchema = z.enum(LISTING_PROPERTY_TYPES);
export type ListingPropertyType = z.infer<typeof listingPropertyTypeSchema>;

export const listingMlsStatusSchema = z.enum(LISTING_MLS_STATUSES);
export type ListingMlsStatus = z.infer<typeof listingMlsStatusSchema>;

export const listingPayloadFeatureSchema = z.enum(LISTING_PAYLOAD_FEATURES);
export type ListingPayloadFeature = z.infer<typeof listingPayloadFeatureSchema>;

export const listingUiFeatureSchema = z.enum(LISTING_UI_FEATURES);
export type ListingUiFeature = z.infer<typeof listingUiFeatureSchema>;

export const listingTypeFacetSchema = z.enum(LISTING_TYPE_FACETS);
export type ListingTypeFacet = z.infer<typeof listingTypeFacetSchema>;

export const listingCardSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  /** Area slug — drives `?community=` and community-page join. */
  community: z.string().min(1),
  communityName: z.string().min(1),
  city: z.string().min(1),
  price: z.number().finite().nonnegative(),
  beds: z.number().finite().nonnegative(),
  baths: z.number().finite().nonnegative(),
  sqft: z.number().finite().nonnegative(),
  propertyType: listingPropertyTypeSchema.optional(),
  /** Filter facet value (estate when isEstate, else propertyType). */
  type: listingTypeFacetSchema,
  /** MLS status — also the `status` URL facet. */
  status: listingMlsStatusSchema,
  features: z.array(listingUiFeatureSchema),
  isEstate: z.boolean(),
  isActive: z.boolean(),
  image: cmsImageSchema,
});
export type ListingCard = z.infer<typeof listingCardSchema>;

export const listingGalleryShotSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});
export type ListingGalleryShot = z.infer<typeof listingGalleryShotSchema>;

export const listingSpecItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().optional(),
});
export type ListingSpecItem = z.infer<typeof listingSpecItemSchema>;

export const listingSpecGroupSchema = z.object({
  heading: z.string().min(1),
  items: z.array(listingSpecItemSchema),
  layout: z.enum(['check', 'kv']),
});
export type ListingSpecGroup = z.infer<typeof listingSpecGroupSchema>;

export const listingFloorRoomSchema = z.object({
  area: z.string().min(1),
  name: z.string().min(1),
  note: z.string().optional(),
  tone: z.enum(['primary', 'common']).optional(),
});
export type ListingFloorRoom = z.infer<typeof listingFloorRoomSchema>;

export const brokerCredentialSchema = z.object({
  value: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
});
export type BrokerCredential = z.infer<typeof brokerCredentialSchema>;

export const brokerSchema = z.object({
  slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
  name: z.string().min(1).max(CMS_TEXT_LIMITS.heading),
  /** Derived from `name` — first whitespace-separated token. */
  firstName: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  title: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  brokerage: z.string().min(1).max(CMS_TEXT_LIMITS.label).optional(),
  conciergeLabel: z.string().min(1).max(CMS_TEXT_LIMITS.heading),
  headshot: cmsImageSchema.optional(),
  phone: z.string().min(1).max(CMS_TEXT_LIMITS.label).optional(),
  phoneHref: cmsHrefSchema.optional(),
  email: z.string().email().optional(),
  bio: z.string().max(CMS_TEXT_LIMITS.longCopy).optional(),
  signature: z.string().max(CMS_TEXT_LIMITS.label).optional(),
  credentials: z.array(brokerCredentialSchema).max(CMS_AREA_DETAIL_LIMITS.credentials.max),
  rating: z
    .number()
    .min(CMS_AREA_DETAIL_LIMITS.rating.min)
    .max(CMS_AREA_DETAIL_LIMITS.rating.max)
    .optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  avgResponseMinutes: z.number().int().nonnegative().optional(),
});
export type Broker = z.infer<typeof brokerSchema>;

export const listingDetailSchema = listingCardSchema.extend({
  mlsId: z.string().min(1),
  fullAddress: z.string().min(1),
  streetAddress: z.string().optional(),
  state: z.string().default('FL'),
  zip: z.string().optional(),
  /** RESO coordinates — present together or not at all; drive the PDP location map. */
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  pricePerSqft: z.number().finite().positive().optional(),
  yearBuilt: z.number().int().optional(),
  lotSqft: z.number().finite().positive().optional(),
  taxesYearly: z.number().finite().nonnegative().optional(),
  hoaMonthly: z.number().finite().nonnegative().optional(),
  publicRemarks: z.string().optional(),
  listAgentName: z.string().optional(),
  listOfficeName: z.string().optional(),
  badge: z.string().optional(),
  neighborhoodBlurb: z.string().optional(),
  highlights: z.array(z.string()),
  gallery: z.array(listingGalleryShotSchema).min(1),
  interior: z.array(listingSpecGroupSchema),
  exterior: z.array(listingSpecGroupSchema),
  floorPlan: z.array(listingFloorRoomSchema),
  broker: brokerSchema.nullable(),
  seo: pageSeoSchema.default({}),
  /** Last MLS modification, ISO-8601. Feeds sitemap `lastModified`. */
  updatedAt: z.string().min(1).optional(),
});
export type ListingDetail = z.infer<typeof listingDetailSchema>;

/** Minimal projection behind the sharded listings sitemap. */
export const listingSitemapEntrySchema = z.object({
  slug: z.string().min(1),
  updatedAt: z.string().min(1).optional(),
});
export type ListingSitemapEntry = z.infer<typeof listingSitemapEntrySchema>;

export const AREA_KINDS = ['community', 'city'] as const;
export const areaKindSchema = z.enum(AREA_KINDS);
export type AreaKind = z.infer<typeof areaKindSchema>;

export const areaCardSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  kind: areaKindSchema,
  city: z.string().min(1),
});
export type AreaCard = z.infer<typeof areaCardSchema>;

/**
 * Amenity icon vocabulary for `areas.amenities[].icon`. Canonical source: the
 * Payload select options and the web icon map both derive from this list, and the
 * Postgres enum `enum_areas_amenities_icon` must be widened by migration to match.
 * Append only — an existing value cannot be removed without migrating stored rows.
 */
export const COMMUNITY_AMENITY_ICONS = [
  'golf',
  'marina',
  'beach',
  'racquet',
  'fitness',
  'dining',
  'trails',
  'pool',
  'club',
  'spa',
  'gate',
  'dog',
  'pickleball',
  'tennis',
  'boating',
  'kayak',
  'playground',
  'concierge',
  'valet',
  'business-center',
  'library',
  'garden',
  'bike',
  'theater',
  'sauna',
  'yoga',
  'cafe',
  'bar',
  'events',
  'card-room',
] as const;

/** Admin-facing labels, so the CMS select does not show raw slugs like `business-center`. */
export const COMMUNITY_AMENITY_ICON_LABELS: Record<
  (typeof COMMUNITY_AMENITY_ICONS)[number],
  string
> = {
  golf: 'Golf',
  marina: 'Marina',
  beach: 'Beach',
  racquet: 'Racquet sports',
  fitness: 'Fitness center',
  dining: 'Dining',
  trails: 'Trails & nature',
  pool: 'Pool',
  club: 'Clubhouse',
  spa: 'Spa',
  gate: 'Gated entry',
  dog: 'Dog park',
  pickleball: 'Pickleball',
  tennis: 'Tennis',
  boating: 'Boating',
  kayak: 'Kayak & paddle',
  playground: 'Playground',
  concierge: 'Concierge',
  valet: 'Valet parking',
  'business-center': 'Business center',
  library: 'Library',
  garden: 'Gardens',
  bike: 'Bike paths',
  theater: 'Theater',
  sauna: 'Sauna',
  yoga: 'Yoga studio',
  cafe: 'Café',
  bar: 'Bar & lounge',
  events: 'Event calendar',
  'card-room': 'Card room',
};
export const communityAmenityIconSchema = z.enum(COMMUNITY_AMENITY_ICONS);
export type CommunityAmenityIcon = z.infer<typeof communityAmenityIconSchema>;

export const communityFactSchema = z.object({
  label: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  value: z.string().min(1).max(CMS_TEXT_LIMITS.shortCopy),
});
export type CommunityFact = z.infer<typeof communityFactSchema>;

export const communityAmenitySchema = z.object({
  icon: communityAmenityIconSchema,
  title: z.string().min(1).max(CMS_TEXT_LIMITS.label),
});
export type CommunityAmenity = z.infer<typeof communityAmenitySchema>;

export const communityFaqSchema = z.object({
  q: z.string().min(1).max(CMS_TEXT_LIMITS.heading),
  a: z.string().min(1).max(CMS_TEXT_LIMITS.longCopy),
});
export type CommunityFaq = z.infer<typeof communityFaqSchema>;

export const similarCommunitySchema = z.object({
  slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
  name: z.string().min(1).max(CMS_TEXT_LIMITS.heading),
  locality: z.string().min(1).max(CMS_TEXT_LIMITS.shortCopy),
  priceRange: z.string().min(1).max(CMS_TEXT_LIMITS.shortCopy),
  image: cmsImageSchema,
});
export type SimilarCommunity = z.infer<typeof similarCommunitySchema>;

export const communityDetailSchema = z.object({
  slug: z.string().min(1).max(CMS_TEXT_LIMITS.slug),
  name: z.string().min(1).max(CMS_TEXT_LIMITS.heading),
  city: z.string().min(1).max(CMS_TEXT_LIMITS.label),
  blurb: z.string().min(1).max(CMS_TEXT_LIMITS.longCopy),
  photoCount: z.number().int().nonnegative(),
  gallery: z.array(cmsImageSchema).min(CMS_AREA_DETAIL_LIMITS.gallery.min),
  facts: z.array(communityFactSchema).max(CMS_AREA_DETAIL_LIMITS.facts.max),
  about: z.array(z.string()).max(CMS_AREA_DETAIL_LIMITS.aboutParagraphs.max),
  amenities: z.array(communityAmenitySchema).max(CMS_AREA_DETAIL_LIMITS.amenities.max),
  clubs: z.array(z.string().min(1)).max(CMS_AREA_DETAIL_LIMITS.clubs.max),
  faqs: z.array(communityFaqSchema).max(CMS_AREA_DETAIL_LIMITS.faqs.max),
  phone: z.string().max(CMS_TEXT_LIMITS.label).optional(),
  phoneHref: cmsHrefSchema.optional(),
  soldCount: z.number().int().nonnegative().optional(),
  similar: z.array(similarCommunitySchema).max(CMS_AREA_DETAIL_LIMITS.similar.max),
  broker: brokerSchema.nullable(),
  seo: pageSeoSchema.default({}),
  updatedAt: z.string().min(1).optional(),
});
export type CommunityDetail = z.infer<typeof communityDetailSchema>;

export const areaPdpMetaSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  isGated: z.boolean().nullable(),
  is55Plus: z.boolean().nullable(),
  soldCount: z.number().int().nonnegative().optional(),
  detailBlurb: z.string().optional(),
  broker: brokerSchema.nullable(),
});
export type AreaPdpMeta = z.infer<typeof areaPdpMetaSchema>;

// ---------------------------------------------------------------------------
// Lead capture (web → Payload → Wise Agent CRM)
// ---------------------------------------------------------------------------

/**
 * Two field sets across every lead surface: `tour` adds a free-text message,
 * `shortlist` does not. Presentation (tone, copy, layout) varies per call site
 * but the payload shape does not.
 */
export const LEAD_FORM_TYPES = ['tour', 'shortlist'] as const;
export const leadFormTypeSchema = z.enum(LEAD_FORM_TYPES);
export type LeadFormType = z.infer<typeof leadFormTypeSchema>;

/**
 * Wise Agent `Source` per form type. Drives their lead rules, so these strings
 * are contract — changing one silently re-routes leads in the CRM.
 */
export const LEAD_SOURCES = {
  tour: 'MVP Realty Website - Tour Request',
  shortlist: 'MVP Realty Website - Shortlist',
} as const satisfies Record<LeadFormType, string>;

/**
 * Which component submitted the lead. Reporting only — `Source` is derived from
 * `formType`, so adding a surface never needs CRM reconfiguration.
 */
export const LEAD_SURFACES = [
  'concierge-cta',
  'page-lead-capture',
  'property-tour-form',
  'community-tour-band',
  'community-agent-aside',
] as const;
export const leadSurfaceSchema = z.enum(LEAD_SURFACES);
export type LeadSurface = z.infer<typeof leadSurfaceSchema>;

export const LEAD_FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  message: 2000,
  pageUrl: CMS_TEXT_LIMITS.url,
} as const;

/**
 * Shared by the web route handler and the Payload ingest endpoint — validated
 * on both sides so the endpoint never trusts the proxy.
 */
export const leadSubmissionSchema = z.object({
  firstName: z.string().trim().min(1).max(LEAD_FIELD_LIMITS.name),
  lastName: z.string().trim().min(1).max(LEAD_FIELD_LIMITS.name),
  email: z.string().trim().email().max(LEAD_FIELD_LIMITS.email),
  phone: z.string().trim().max(LEAD_FIELD_LIMITS.phone).optional(),
  message: z.string().trim().max(LEAD_FIELD_LIMITS.message).optional(),
  formType: leadFormTypeSchema,
  surface: leadSurfaceSchema,
  pageUrl: z.string().trim().max(LEAD_FIELD_LIMITS.pageUrl).optional(),
  /** Area slug for community surfaces. Resolved to a relationship server-side. */
  areaSlug: z.string().trim().max(CMS_TEXT_LIMITS.slug).optional(),
  /** Listing slug for PDP surfaces. Resolved to a relationship server-side. */
  listingSlug: z.string().trim().max(CMS_TEXT_LIMITS.slug).optional(),
  /** Honeypot. Bots fill it; humans never see it. Non-empty means silent drop. */
  company: z.string().max(LEAD_FIELD_LIMITS.name).optional(),
});
export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

/** CRM sync state stored on the Payload lead so retries stay idempotent. */
export const LEAD_CRM_STATUSES = ['pending', 'synced', 'failed', 'skipped'] as const;
export const leadCrmStatusSchema = z.enum(LEAD_CRM_STATUSES);
export type LeadCrmStatus = z.infer<typeof leadCrmStatusSchema>;
