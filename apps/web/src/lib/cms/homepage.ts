import {
  amenityIconSchema,
  footerGlobalSchema,
  headerGlobalSchema,
  homepagePageSchema,
  type AmenityIcon,
  type FooterGlobal,
  type HeaderGlobal,
  type HomepageBlock,
  type HomepagePage,
} from '@mvp-realty/api-contracts';

import { footerFixture, headerFixture, homepageFixture } from '@/data/homepage-fixture';
import { env } from '@/env';
import { normalizeCta, normalizeLink } from './links';
import { normalizeMediaField } from './media';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(new URL(path, env.NEXT_PUBLIC_BACKEND_URL), {
    next: { tags: ['cms'] },
  });

  if (!response.ok) throw new Error(`CMS fetch failed: ${response.status}`);
  return response.json();
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeHeader(raw: unknown): HeaderGlobal {
  const data = isRecord(raw) ? raw : {};
  return headerGlobalSchema.parse({
    brandHomeLink: normalizeLink(data.brandHomeLink, 'MVP Realty home', '/'),
    brandLabel: text(data.brandLabel, 'MVP Realty'),
    brandMarkAlt: text(data.brandMarkAlt) || undefined,
    navItems: array(data.navItems).map((item) => {
      const row = isRecord(item) ? item : {};
      return {
        label: text(row.label, 'Link'),
        link: normalizeLink(row.link, text(row.label, 'Link'), '#'),
        ariaLabel: text(row.ariaLabel) || undefined,
      };
    }),
    primaryCta: normalizeCta(data.primaryCta, 'Request My Shortlist', '/#lead'),
    mobileMenuLabel: text(data.mobileMenuLabel, 'Menu'),
    mobileMenuCloseLabel: text(data.mobileMenuCloseLabel, 'Close menu'),
  });
}

function normalizeFooter(raw: unknown): FooterGlobal {
  const data = isRecord(raw) ? raw : {};
  return footerGlobalSchema.parse({
    brandName: text(data.brandName, 'MVP'),
    brandAccentText: text(data.brandAccentText) || undefined,
    brandBlurb: text(data.brandBlurb, footerFixture.brandBlurb),
    columns: array(data.columns).map((column) => {
      const col = isRecord(column) ? column : {};
      return {
        title: text(col.title, 'Links'),
        links: array(col.links).map((item) => {
          const row = isRecord(item) ? item : {};
          return {
            label: text(row.label, 'Link'),
            link: normalizeLink(row.link, text(row.label, 'Link'), '#'),
            ariaLabel: text(row.ariaLabel) || undefined,
          };
        }),
      };
    }),
    bottomLeftText: text(data.bottomLeftText, footerFixture.bottomLeftText),
    bottomRightLinks: array(data.bottomRightLinks).map((item) => {
      const row = isRecord(item) ? item : {};
      return normalizeLink(row.link ?? item, 'Link', '#');
    }),
    bottomRightTextFallback: text(data.bottomRightTextFallback) || undefined,
  });
}

function normalizeTags(value: unknown): string[] {
  return array(value)
    .map((item) => {
      if (typeof item === 'string') return item;
      if (isRecord(item)) return text(item.label);
      return '';
    })
    .filter(Boolean);
}

function hasPayloadTarget(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const type = text(value.type, 'custom');
  if (type === 'internal') return Boolean(value.page);
  if (type === 'custom') return Boolean(text(value.customUrl));
  if (type === 'anchor') return Boolean(text(value.anchor));
  if (type === 'phone') return Boolean(text(value.phone));
  if (type === 'email') return Boolean(text(value.email));
  return false;
}

function hasCtaTarget(value: unknown): boolean {
  return isRecord(value) && hasPayloadTarget(value.link);
}

function normalizeHeaderGroup(value: unknown) {
  const group = isRecord(value) ? value : {};
  return {
    anchorId: text(group.anchorId) || undefined,
    kicker: text(group.kicker, 'Featured'),
    heading: text(group.heading, 'Featured'),
    headingAccent: text(group.headingAccent) || undefined,
    lede: text(group.lede) || undefined,
  };
}

function normalizeBlock(raw: unknown): HomepageBlock | null {
  if (!isRecord(raw) || typeof raw.blockType !== 'string') return null;

  switch (raw.blockType) {
    case 'hero':
      return {
        blockType: 'hero',
        anchorId: text(raw.anchorId) || undefined,
        backgroundImage: normalizeMediaField(
          raw.backgroundImage,
          homepageFixture.layout[0]?.blockType === 'hero'
            ? homepageFixture.layout[0].backgroundImage.alt
            : 'Hero image',
        ),
        backgroundImagePriority: bool(raw.backgroundImagePriority, true),
        eyebrow: text(raw.eyebrow, 'By Appointment'),
        heading: text(raw.heading, 'A prestigious address'),
        headingAccent: text(raw.headingAccent) || undefined,
        lede: text(raw.lede, 'Private gated communities minutes from the Gulf beaches.'),
        primaryCta: normalizeCta(raw.primaryCta, 'View Residences', '/#listings'),
        secondaryCta: hasCtaTarget(raw.secondaryCta)
          ? normalizeCta(raw.secondaryCta, 'Request My Shortlist', '/#lead')
          : undefined,
        showEyebrowMarker: bool(raw.showEyebrowMarker, true),
        showPrimaryCtaIcon: bool(raw.showPrimaryCtaIcon, true),
        showSecondaryCta: bool(raw.showSecondaryCta, true),
      };
    case 'communitiesStrip':
      return {
        blockType: 'communitiesStrip',
        anchorId: text(raw.anchorId) || undefined,
        sourceMode: 'manual',
        maxItems: num(raw.maxItems, 3),
        items: array(raw.items).map((item) => {
          const row = isRecord(item) ? item : {};
          return {
            slug: text(row.slug, text(row.name, 'community')),
            name: text(row.name, 'Community'),
            blurb: text(row.blurb, ''),
            link: normalizeLink(
              row.link,
              text(row.name, 'Community'),
              `/communities/${text(row.slug, '')}`,
            ),
            icon: 'mapPin' as const,
          };
        }),
      };
    case 'featuredCommunities':
      return {
        blockType: 'featuredCommunities',
        anchorId: text(raw.anchorId, 'communities'),
        header: normalizeHeaderGroup(raw.header),
        sourceMode: 'manual',
        manualCommunities: array(raw.manualCommunities).map((item) => {
          const row = isRecord(item) ? item : {};
          const slug = text(row.slug, text(row.name, 'community'));
          return {
            slug,
            name: text(row.name, 'Community'),
            locality: text(row.locality, ''),
            rating: num(row.rating, 0),
            reviews: num(row.reviews, 0),
            reviewsLabel: text(row.reviewsLabel, 'reviews'),
            priceRange: text(row.priceRange, ''),
            tags: normalizeTags(row.tags),
            residences: num(row.residences, 0),
            residencesLabel: text(row.residencesLabel, 'residences'),
            nowSelling: num(row.nowSelling, 0),
            nowSellingLabel: text(row.nowSellingLabel, 'now selling'),
            image: normalizeMediaField(row.image, text(row.name, 'Community image')),
            link: normalizeLink(row.link, text(row.name, 'Community'), `/communities/${slug}`),
          };
        }),
        moreLink: hasCtaTarget(raw.moreLink)
          ? normalizeCta(raw.moreLink, 'Explore all communities', '/listings')
          : undefined,
        emptyStateHeading: text(raw.emptyStateHeading) || undefined,
        emptyStateBody: text(raw.emptyStateBody) || undefined,
      };
    case 'featuredResidences':
      return {
        blockType: 'featuredResidences',
        anchorId: text(raw.anchorId, 'listings'),
        header: normalizeHeaderGroup(raw.header),
        sourceMode: 'manual',
        manualListings: array(raw.manualListings).map((item) => {
          const row = isRecord(item) ? item : {};
          const slug = text(row.slug, text(row.name, 'listing'));
          return {
            slug,
            name: text(row.name, 'Residence'),
            locality: text(row.locality, ''),
            price: typeof row.price === 'number' ? row.price : undefined,
            priceLabel: text(row.priceLabel, ''),
            beds: num(row.beds, 0),
            bedsLabel: text(row.bedsLabel, 'Beds'),
            baths: num(row.baths, 0),
            bathsLabel: text(row.bathsLabel, 'Baths'),
            sqft: num(row.sqft, 0),
            sqftLabel: text(row.sqftLabel, 'Sq Ft'),
            badge: text(row.badge, ''),
            image: normalizeMediaField(row.image, text(row.name, 'Residence image')),
            link: normalizeLink(row.link, text(row.name, 'Residence'), `/listings/${slug}`),
          };
        }),
        cardCtaLabel: text(raw.cardCtaLabel, 'View residence'),
        moreLink: hasCtaTarget(raw.moreLink)
          ? normalizeCta(raw.moreLink, 'View the full collection', '/listings')
          : undefined,
        emptyStateHeading: text(raw.emptyStateHeading) || undefined,
        emptyStateBody: text(raw.emptyStateBody) || undefined,
      };
    case 'lifestyle':
      return {
        blockType: 'lifestyle',
        anchorId: text(raw.anchorId, 'lifestyle'),
        backgroundImage: normalizeMediaField(raw.backgroundImage, 'Lifestyle background'),
        kicker: text(raw.kicker, 'The Life'),
        heading: text(raw.heading, 'You buy the home.'),
        headingAccent: text(raw.headingAccent) || undefined,
        body: text(raw.body, ''),
        maxTiles: num(raw.maxTiles, 3),
        tiles: array(raw.tiles).map((item) => {
          const row = isRecord(item) ? item : {};
          return {
            caption: text(row.caption, ''),
            image: normalizeMediaField(row.image, text(row.caption, 'Lifestyle image')),
            link: hasPayloadTarget(row.link)
              ? normalizeLink(row.link, text(row.caption, 'Tile'), '#')
              : undefined,
          };
        }),
      };
    case 'testimonials':
      return {
        blockType: 'testimonials',
        anchorId: text(raw.anchorId, 'testimonials'),
        kicker: text(raw.kicker, 'In Their Words'),
        heading: text(raw.heading, 'The address impressed them. The'),
        headingAccent: text(raw.headingAccent) || undefined,
        headingSuffix: text(raw.headingSuffix) || undefined,
        stories: array(raw.stories).map((item) => {
          const row = isRecord(item) ? item : {};
          return {
            slug: text(row.slug, text(row.name, 'story')),
            name: text(row.name, 'Resident'),
            location: text(row.location, ''),
            quote: text(row.quote, ''),
            portrait: normalizeMediaField(row.portrait, text(row.name, 'Resident portrait')),
            tabAriaLabel: text(row.tabAriaLabel) || undefined,
          };
        }),
        carouselAutoPlay: bool(raw.carouselAutoPlay, true),
        carouselIntervalMs: num(raw.carouselIntervalMs, 6500),
        previousLabel: text(raw.previousLabel, 'Previous story'),
        nextLabel: text(raw.nextLabel, 'Next story'),
        tabListLabel: text(raw.tabListLabel, 'Choose a resident story'),
        counterSeparator: text(raw.counterSeparator, '/'),
        emptyStateHeading: text(raw.emptyStateHeading) || undefined,
        emptyStateBody: text(raw.emptyStateBody) || undefined,
      };
    case 'amenities':
      return {
        blockType: 'amenities',
        anchorId: text(raw.anchorId, 'amenities'),
        header: normalizeHeaderGroup(raw.header),
        featureImage: normalizeMediaField(raw.featureImage, 'Amenity feature image'),
        featureTitle: text(raw.featureTitle, 'Feature'),
        featureCaption: text(raw.featureCaption, ''),
        amenities: array(raw.amenities).map((item) => {
          const row = isRecord(item) ? item : {};
          return {
            icon: normalizeAmenityIcon(row.icon),
            title: text(row.title, 'Amenity'),
            blurb: text(row.blurb, ''),
          };
        }),
        emptyStateHeading: text(raw.emptyStateHeading) || undefined,
        emptyStateBody: text(raw.emptyStateBody) || undefined,
      };
    case 'ownerIntro':
      return {
        blockType: 'ownerIntro',
        anchorId: text(raw.anchorId, 'concierge'),
        portrait: normalizeMediaField(raw.portrait, 'Owner portrait'),
        portraitBadgeLabel: text(raw.portraitBadgeLabel, 'Broker & Owner'),
        kicker: text(raw.kicker, 'Meet the Owner'),
        heading: text(raw.heading, 'One person'),
        headingAccent: text(raw.headingAccent) || undefined,
        titleLine: text(raw.titleLine, ''),
        bio: text(raw.bio, ''),
        signature: text(raw.signature, ''),
        credentials: array(raw.credentials).map((item) => {
          const row = isRecord(item) ? item : {};
          return { value: text(row.value, ''), label: text(row.label, '') };
        }),
      };
    case 'leadCapture':
      return {
        blockType: 'leadCapture',
        anchorId: text(raw.anchorId, 'lead'),
        kicker: text(raw.kicker, 'Your Private Introduction'),
        heading: text(raw.heading, ''),
        body: text(raw.body, ''),
        helperNote: {
          icon: 'waves',
          beforeLinkText: text(
            isRecord(raw.helperNote) ? raw.helperNote.beforeLinkText : undefined,
          ),
          link: normalizeLink(
            isRecord(raw.helperNote) ? raw.helperNote.link : undefined,
            'by request',
            '#lead',
          ),
          afterLinkText: text(isRecord(raw.helperNote) ? raw.helperNote.afterLinkText : undefined),
        },
        fields: {
          name: normalizeFormField(
            isRecord(raw.fields) ? raw.fields.name : undefined,
            'Your name',
            'Jane & Robert Ellison',
            true,
          ),
          email: normalizeFormField(
            isRecord(raw.fields) ? raw.fields.email : undefined,
            'Email address',
            'you@example.com',
            true,
          ),
          phone: normalizeFormField(
            isRecord(raw.fields) ? raw.fields.phone : undefined,
            'Phone (optional)',
            '(239) 555-0148',
            false,
          ),
        },
        submitLabel: text(raw.submitLabel, 'Request My Shortlist'),
        privacyText: text(raw.privacyText, ''),
        successHeading: text(raw.successHeading, 'Your request is in.'),
        successBody: text(raw.successBody, ''),
        errorRequiredMessage: text(
          raw.errorRequiredMessage,
          'Please share your name and email so your concierge can reach you.',
        ),
        errorInvalidEmailMessage: text(
          raw.errorInvalidEmailMessage,
          'That email address looks incomplete.',
        ),
      };
    default:
      return null;
  }
}

function normalizeAmenityIcon(value: unknown): AmenityIcon {
  const parsed = amenityIconSchema.safeParse(value);
  return parsed.success ? parsed.data : 'pool';
}

function normalizeFormField(raw: unknown, label: string, placeholder: string, required: boolean) {
  const field = isRecord(raw) ? raw : {};
  return {
    label: text(field.label, label),
    placeholder: text(field.placeholder, placeholder),
    required: bool(field.required, required),
  };
}

function normalizePage(raw: unknown): HomepagePage {
  const page = isRecord(raw) ? raw : {};
  const seo = isRecord(page.seo) ? page.seo : {};
  const normalized = {
    title: text(page.title, homepageFixture.title),
    slug: text(page.slug, homepageFixture.slug),
    seo: {
      metaTitle: text(seo.metaTitle) || undefined,
      metaDescription: text(seo.metaDescription) || undefined,
      canonicalUrl: text(seo.canonicalUrl) || undefined,
      index: bool(seo.index, true),
      follow: bool(seo.follow, true),
      ogTitle: text(seo.ogTitle) || undefined,
      ogDescription: text(seo.ogDescription) || undefined,
      ogImage: isRecord(seo.ogImage)
        ? normalizeMediaField({ image: seo.ogImage }, 'Open Graph image')
        : undefined,
      ogImageAlt: text(seo.ogImageAlt) || undefined,
      twitterCard: text(seo.twitterCard, 'summary_large_image'),
      twitterTitle: text(seo.twitterTitle) || undefined,
      twitterDescription: text(seo.twitterDescription) || undefined,
      twitterImage: isRecord(seo.twitterImage)
        ? normalizeMediaField({ image: seo.twitterImage }, 'Twitter image')
        : undefined,
      twitterImageAlt: text(seo.twitterImageAlt) || undefined,
      includeInSitemap: bool(seo.includeInSitemap, true),
    },
    layout: array(page.layout)
      .map(normalizeBlock)
      .filter((block): block is HomepageBlock => block !== null),
  };

  return homepagePageSchema.parse(normalized);
}

export async function getHomepageContent(): Promise<HomepagePage> {
  try {
    const response = await fetchJson('/api/pages?where[slug][equals]=home&depth=2&limit=1');
    const docs = isRecord(response) ? array(response.docs) : [];
    const page = docs[0];
    if (!page) return homepageFixture;
    const parsed = normalizePage(page);
    return parsed.layout.length > 0 ? parsed : homepageFixture;
  } catch {
    return homepageFixture;
  }
}

export async function getHeaderContent(): Promise<HeaderGlobal> {
  try {
    return normalizeHeader(await fetchJson('/api/globals/header?depth=2'));
  } catch {
    return headerFixture;
  }
}

export async function getFooterContent(): Promise<FooterGlobal> {
  try {
    return normalizeFooter(await fetchJson('/api/globals/footer?depth=2'));
  } catch {
    return footerFixture;
  }
}
