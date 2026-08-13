import type { CmsPage } from '@mvp-realty/api-contracts';

import { amenities } from './amenities';
import { lifestyleTiles } from './lifestyle';
import { testimonials } from './testimonials';

const link = (label: string, href: string) => ({ label, href });
const mediaBaseUrl = 'https://pub-de584fcb52e3431f837b039818423714.r2.dev';

/** Read-only fallback snapshot of the published homepage, captured 2026-08-14. */

export const homepageFixture: CmsPage = {
  title: 'Home',
  slug: 'home',
  seo: {
    metaTitle: '55 Living Team — Gulf-Coast Concierge for Luxury Gated Communities',
    metaDescription:
      'A prestigious Gulf-Coast address with resort amenities and a personal concierge. Private gated communities minutes from the Naples beaches.',
    canonicalMode: 'auto',
    index: true,
    follow: true,
    twitterCard: 'summary_large_image',
    includeInSitemap: true,
  },
  layout: [
    {
      blockType: 'hero',
      backgroundImage: {
        src: `${mediaBaseUrl}/seed-homepage--hero--9a64ed39f1e6.jpg`,
        alt: 'Naples bayfront residences along the Gulf Coast at golden hour',
      },
      backgroundImagePriority: true,
      eyebrow: 'By Appointment · Naples & the Gulf Coast',
      heading: 'A prestigious address, and a life that',
      headingAccent: 'takes care of itself.',
      lede: 'Private gated communities minutes from the Gulf beaches, with resort amenities and a personal concierge to make your move effortless.',
      primaryCta: link('View Residences', '/#listings'),
      secondaryCta: link('Request My Shortlist', '/#lead'),
      showEyebrowMarker: true,
      showPrimaryCtaIcon: true,
      showSecondaryCta: true,
    },
    {
      blockType: 'communitiesStrip',
      sourceMode: 'areas',
      maxItems: 3,
      items: [],
    },
    {
      blockType: 'featuredCommunities',
      anchorId: 'communities',
      header: {
        kicker: 'Featured Communities',
        heading: 'Three favorites to start your search.',
        lede: 'A short, hand-picked set of the Southwest Florida communities our clients keep coming back to.',
      },
      sourceMode: 'areas',
      manualCommunities: [],
      moreLink: link('Explore all communities', '/listings'),
    },
    {
      blockType: 'featuredResidences',
      anchorId: 'listings',
      header: {
        kicker: 'Curated Residences',
        heading: 'Homes chosen for you, not a search bar.',
        lede: 'A sample of what is selling now, with starting prices, so you can see where you fit before we ever talk.',
      },
      sourceMode: 'manual',
      cardCtaLabel: 'View residence',
      moreLink: link('View the full collection', '/listings'),
    },
    {
      blockType: 'lifestyle',
      anchorId: 'lifestyle',
      backgroundImage: {
        src: `${mediaBaseUrl}/seed-homepage--hero--9a64ed39f1e6.jpg`,
        alt: 'Residents gathered around a long candlelit table at a clubhouse dinner, talking and laughing together',
      },
      kicker: 'The Life Inside the Gates',
      heading: 'You buy the home. You stay for',
      headingAccent: 'the people.',
      body: 'For our residents, the deciding factor is rarely the floorplan. It is the standing dinner on Thursdays, the doubles partner two doors down, and the sense that there is always a reason to step outside. You arrive with an address; within a week you have a ready-made circle.',
      maxTiles: 3,
      tiles: lifestyleTiles,
    },
    {
      blockType: 'testimonials',
      anchorId: 'testimonials',
      kicker: 'In Their Words',
      heading: 'The address impressed them. The',
      headingAccent: 'people',
      headingSuffix: 'kept them.',
      stories: testimonials,
      carouselAutoPlay: true,
      carouselIntervalMs: 6500,
      previousLabel: 'Previous story',
      nextLabel: 'Next story',
      tabListLabel: 'Choose a resident story',
      counterSeparator: '/',
    },
    {
      blockType: 'amenities',
      anchorId: 'amenities',
      header: {
        kicker: 'The Resort at Your Door',
        heading: 'Every day arranged like a stay at a fine resort.',
        lede: 'From the first cup of coffee at the clubhouse to sunset by the pool, the amenities are designed for an active, social life, and tended so you never have to think about the upkeep.',
      },
      featureImage: {
        src: `${mediaBaseUrl}/seed-homepage--hero--9a64ed39f1e6.jpg`,
        alt: 'Residents gathered with drinks at the resort pool deck on a sunny afternoon',
      },
      featureTitle: 'The Grand Clubhouse',
      featureCaption: 'Dining, events, and the pool deck where the day’s plans get made.',
      amenities,
    },
    {
      blockType: 'ownerIntro',
      anchorId: 'concierge',
      portrait: {
        src: `${mediaBaseUrl}/55Living_Headshot_Kim_accent.png`,
        alt: 'Portrait of Kim Noble, Senior Real Estate Specialist, with her Doberman',
      },
      portraitBadgeLabel: 'Real Estate Advisor',
      kicker: 'Meet the Real Estate Advisor',
      heading: 'One person, from first call to',
      headingAccent: 'front door.',
      titleLine: 'Kim Noble Senior Real Estate Specialist',
      bio: "Since 2005, I've specialized in helping buyers discover the Southwest Florida lifestyle that best fits their next chapter. My unique niche combines expertise in active adult lifestyle communities and new construction, giving my clients access to opportunities and insights that few REALTORS® can offer. With an intimate knowledge of the local market and a personalized approach, I'm committed to helping you make a confident, informed decision. Whether you're searching for a low-maintenance home, a golf community, or a resort-style neighborhood, I'll help you find the perfect place to call home.",
      signature: 'Kim Noble',
      credentials: [],
    },
    {
      blockType: 'leadCapture',
      anchorId: 'lead',
      kicker: 'Your Private Introduction',
      heading: 'Let a concierge prepare your shortlist.',
      body: 'Tell us a little about the life you are looking for. Your concierge will return with a curated set of residences, pricing, and current incentives, with no obligation and no sales floor.',
      helperNote: {
        icon: 'waves',
        beforeLinkText: 'Beachfront residences also available, ',
        link: link('by request', '#lead'),
        afterLinkText: '.',
      },
      fields: {
        firstName: { label: 'First name', placeholder: 'Jane', required: true },
        lastName: { label: 'Last name', placeholder: 'Ellison', required: true },
        email: { label: 'Email address', placeholder: 'you@example.com', required: true },
        phone: { label: 'Phone (optional)', placeholder: '(239) 555-0148', required: false },
      },
      submitLabel: 'Request My Shortlist',
      privacyText:
        'A private introduction to 55 Living Team. We never share your details, and you will only hear from your own concierge.',
      successHeading: 'Your request is in.',
      successBody:
        'Thank you. Your concierge will be in touch shortly with a shortlist prepared just for you — no sales floor, no obligation.',
      errorRequiredMessage: 'Please share your name and email so your concierge can reach you.',
      errorInvalidEmailMessage: 'That email address looks incomplete.',
    },
  ],
};
