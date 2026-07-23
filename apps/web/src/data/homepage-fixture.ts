import type { FooterGlobal, HeaderGlobal, CmsPage } from '@mvp-realty/api-contracts';

import { amenities } from './amenities';
import { featuredCommunities, heroCommunities } from './communities';
import { unsplash } from './images';
import { lifestyleTiles } from './lifestyle';
import { featuredResidences } from './residences';
import { testimonials } from './testimonials';

const link = (label: string, href: string) => ({ label, href });

export const headerFixture: HeaderGlobal = {
  brandHomeLink: link('MVP Realty home', '/'),
  brandLabel: 'MVP Realty',
  navItems: [
    { label: 'The Life', link: link('The Life', '/#lifestyle') },
    { label: 'Amenities', link: link('Amenities', '/#amenities') },
    { label: 'Communities', link: link('Communities', '/#communities') },
    { label: 'Residences', link: link('Residences', '/listings') },
  ],
  primaryCta: link('Request My Shortlist', '/#lead'),
  mobileMenuLabel: 'Menu',
  mobileMenuCloseLabel: 'Close menu',
};

export const footerFixture: FooterGlobal = {
  brandName: 'MVP',
  brandAccentText: 'Realty',
  brandBlurb:
    'Florida’s Gulf-Coast concierge for luxury gated communities and beachfront residences, minutes from the sand.',
  columns: [
    {
      title: 'Residences',
      links: [
        { label: 'The Anchorage', link: link('The Anchorage', '/listings') },
        { label: 'Lakeside Villa', link: link('Lakeside Villa', '/listings') },
        { label: 'The Lagoon Model', link: link('The Lagoon Model', '/listings') },
        { label: 'Beachfront Homes', link: link('Beachfront Homes', '/listings') },
      ],
    },
    {
      title: 'Explore',
      links: [
        { label: 'Amenities', link: link('Amenities', '/#amenities') },
        { label: 'Communities', link: link('Communities', '/#communities') },
        { label: 'The Life', link: link('The Life', '/#lifestyle') },
        { label: 'Meet the Owner', link: link('Meet the Owner', '/#concierge') },
      ],
    },
    {
      title: 'Concierge',
      links: [
        { label: 'Speak With Us', link: link('Speak With Us', '/#lead') },
        { label: '(239) 555-0148', link: link('(239) 555-0148', 'tel:+12395550148') },
        { label: 'By Appointment', link: link('By Appointment', '/#lead') },
        { label: 'About MVP', link: link('About MVP', '/#concierge') },
      ],
    },
  ],
  bottomLeftText: '© 2026 MVP Realty. All rights reserved.',
  bottomRightLinks: [],
  bottomRightTextFallback: 'Equal Housing Opportunity · Privacy · Terms',
};

export const homepageFixture: CmsPage = {
  title: 'Home',
  slug: 'home',
  seo: {
    metaTitle: 'MVP Realty — Gulf-Coast Concierge for Luxury Gated Communities',
    metaDescription:
      'A prestigious Gulf-Coast address with resort amenities and a personal concierge. Private gated communities minutes from the Naples beaches.',
    index: true,
    follow: true,
    twitterCard: 'summary_large_image',
    includeInSitemap: true,
  },
  layout: [
    {
      blockType: 'hero',
      backgroundImage: {
        src: '/images/hero-naples-waterfront.jpg',
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
      sourceMode: 'manual',
      maxItems: 3,
      items: heroCommunities.map((community) => ({
        ...community,
        link: link(community.name, `/communities/${community.slug}`),
        icon: 'mapPin',
      })),
    },
    {
      blockType: 'featuredCommunities',
      anchorId: 'communities',
      header: {
        kicker: 'Featured Communities',
        heading: 'Three favorites to start your search.',
        lede: 'A short, hand-picked set of the Southwest Florida communities our clients keep coming back to.',
      },
      sourceMode: 'manual',
      manualCommunities: featuredCommunities.map((community) => ({
        ...community,
        reviewsLabel: 'reviews',
        residencesLabel: 'residences',
        nowSellingLabel: 'now selling',
        link: link(community.name, `/communities/${community.slug}`),
      })),
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
      manualListings: featuredResidences.map((residence) => ({
        ...residence,
        bedsLabel: 'Beds',
        bathsLabel: 'Baths',
        sqftLabel: 'Sq Ft',
        link: link(residence.name, `/listings/${residence.slug}`),
      })),
      cardCtaLabel: 'View residence',
      moreLink: link('View the full collection', '/listings'),
    },
    {
      blockType: 'lifestyle',
      anchorId: 'lifestyle',
      backgroundImage: {
        src: unsplash('1414235077428-338989a2e8c0', 2000),
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
        src: unsplash('1576013551627-0cc20b96c2a7', 1400),
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
        src: '/images/owner-eleanor-voss.jpg',
        alt: 'Portrait of Eleanor Voss, Broker and Owner of MVP Realty, with her Doberman',
      },
      portraitBadgeLabel: 'Broker & Owner',
      kicker: 'Meet the Owner',
      heading: 'One person, from first call to',
      headingAccent: 'front door.',
      titleLine: 'Eleanor Voss · Broker & Owner, MVP Realty',
      bio: 'Eleanor has spent eighteen years matching Gulf-Coast buyers to the right gate, not just the right house. As the broker who owns the firm, she answers her own phone, walks the courts and clubhouses with you, and stays on long after the keys change hands. You are never handed off to a sales floor.',
      signature: 'Eleanor Voss',
      credentials: [
        { value: '18 yrs', label: 'on the Gulf Coast' },
        { value: '9', label: 'communities, known by name' },
        { value: '1:1', label: 'by appointment only' },
      ],
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
        name: { label: 'Your name', placeholder: 'Jane & Robert Ellison', required: true },
        email: { label: 'Email address', placeholder: 'you@example.com', required: true },
        phone: { label: 'Phone (optional)', placeholder: '(239) 555-0148', required: false },
      },
      submitLabel: 'Request My Shortlist',
      privacyText:
        'A private introduction to MVP Realty. We never share your details, and you will only hear from your own concierge.',
      successHeading: 'Your request is in.',
      successBody:
        'Thank you. Your concierge will be in touch shortly with a shortlist prepared just for you — no sales floor, no obligation.',
      errorRequiredMessage: 'Please share your name and email so your concierge can reach you.',
      errorInvalidEmailMessage: 'That email address looks incomplete.',
    },
  ],
};
