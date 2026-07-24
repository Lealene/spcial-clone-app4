import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { File } from 'payload';
import { getPayload } from 'payload';

import config from '@payload-config';
import type { Footer, Header, Media, Page } from '@/payload-types';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.resolve(dirname, '../../../web/public/images');

const SEED_CONTEXT = { source: 'seed-homepage-local' };

const imageFiles = {
  hero: {
    fileName: 'hero-naples-waterfront.jpg',
    alt: 'Naples bayfront residences along the Gulf Coast at golden hour',
  },
  owner: {
    fileName: 'owner-eleanor-voss.jpg',
    alt: 'Portrait of Eleanor Voss, Broker and Owner of MVP Realty, with her Doberman',
  },
  bonitaBay: {
    fileName: 'community-bonita-bay.jpg',
    alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
  },
  valenciaBonita: {
    fileName: 'community-valencia-bonita.jpg',
    alt: 'The 45,000-square-foot resort clubhouse at Valencia Bonita, framed by royal palms',
  },
  valenciaTrails: {
    fileName: 'community-valencia-trails.jpg',
    alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
  },
} as const;

type ImageKey = keyof typeof imageFiles;

type MediaDoc = Pick<Media, 'id' | 'alt' | 'url'>;

type LinkData = Header['brandHomeLink'];
type CtaData = Header['primaryCta'];
type MediaFieldData = Extract<
  Page['layout'][number],
  { backgroundImage: unknown }
>['backgroundImage'];

function customLink(label: string, href: string): LinkData {
  if (href.startsWith('tel:')) {
    return { label, type: 'phone', phone: href.replace('tel:', '') };
  }

  if (href.startsWith('mailto:')) {
    return { label, type: 'email', email: href.replace('mailto:', '') };
  }

  if (href.startsWith('#') || href.startsWith('/#')) {
    return { label, type: 'anchor', anchor: href };
  }

  return { label, type: 'custom', customUrl: href };
}

function cta(label: string, href: string, ariaLabel?: string): CtaData {
  return { label, link: customLink(label, href), ariaLabel };
}

function media(image: MediaDoc, altOverride?: string): MediaFieldData {
  return {
    image: image.id,
    altOverride,
  };
}

async function fileFor(imageKey: ImageKey): Promise<File> {
  const image = imageFiles[imageKey];
  const filePath = path.join(imagesDir, image.fileName);
  const [data, stats] = await Promise.all([readFile(filePath), stat(filePath)]);

  return {
    data,
    mimetype: 'image/jpeg',
    name: image.fileName,
    size: stats.size,
  };
}

async function upsertMedia(payload: Awaited<ReturnType<typeof getPayload>>, imageKey: ImageKey) {
  const image = imageFiles[imageKey];
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: image.alt } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const existingDoc = existing.docs[0] as MediaDoc | undefined;
  if (existingDoc) return existingDoc;

  return (await payload.create({
    collection: 'media',
    data: { alt: image.alt },
    file: await fileFor(imageKey),
    overrideAccess: true,
    context: SEED_CONTEXT,
  })) as MediaDoc;
}

async function main() {
  const payload = await getPayload({ config });

  const mediaDocs = {
    hero: await upsertMedia(payload, 'hero'),
    owner: await upsertMedia(payload, 'owner'),
    bonitaBay: await upsertMedia(payload, 'bonitaBay'),
    valenciaBonita: await upsertMedia(payload, 'valenciaBonita'),
    valenciaTrails: await upsertMedia(payload, 'valenciaTrails'),
  };

  const header: Omit<Header, 'id' | 'createdAt' | 'updatedAt'> = {
    brandHomeLink: customLink('MVP Realty home', '/'),
    brandLabel: 'MVP Realty',
    navItems: [
      { label: 'The Life', link: customLink('The Life', '/#lifestyle') },
      { label: 'Amenities', link: customLink('Amenities', '/#amenities') },
      { label: 'Communities', link: customLink('Communities', '/#communities') },
      { label: 'Residences', link: customLink('Residences', '/listings') },
    ],
    primaryCta: cta('Request My Shortlist', '/#lead'),
    mobileMenuLabel: 'Menu',
    mobileMenuCloseLabel: 'Close menu',
  };

  const footer: Omit<Footer, 'id' | 'createdAt' | 'updatedAt'> = {
    brandName: 'MVP',
    brandAccentText: 'Realty',
    brandBlurb:
      'Florida’s Gulf-Coast concierge for luxury gated communities and beachfront residences, minutes from the sand.',
    columns: [
      {
        title: 'Residences',
        links: [
          { label: 'The Anchorage', link: customLink('The Anchorage', '/listings') },
          { label: 'Lakeside Villa', link: customLink('Lakeside Villa', '/listings') },
          { label: 'The Lagoon Model', link: customLink('The Lagoon Model', '/listings') },
          { label: 'Beachfront Homes', link: customLink('Beachfront Homes', '/listings') },
        ],
      },
      {
        title: 'Explore',
        links: [
          { label: 'Amenities', link: customLink('Amenities', '/#amenities') },
          { label: 'Communities', link: customLink('Communities', '/#communities') },
          { label: 'The Life', link: customLink('The Life', '/#lifestyle') },
          { label: 'Meet the Owner', link: customLink('Meet the Owner', '/#concierge') },
        ],
      },
      {
        title: 'Concierge',
        links: [
          { label: 'Speak With Us', link: customLink('Speak With Us', '/#lead') },
          { label: '(239) 555-0148', link: customLink('(239) 555-0148', 'tel:+12395550148') },
          { label: 'By Appointment', link: customLink('By Appointment', '/#lead') },
          { label: 'About MVP', link: customLink('About MVP', '/#concierge') },
        ],
      },
    ],
    bottomLeftText: '© 2026 MVP Realty. All rights reserved.',
    bottomRightLinks: [],
    bottomRightTextFallback: 'Equal Housing Opportunity · Privacy · Terms',
  };

  const pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'Home',
    slug: 'home',
    _status: 'published',
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
        enabled: true,
        blockType: 'hero',
        backgroundImage: media(mediaDocs.hero),
        backgroundImagePriority: true,
        eyebrow: 'By Appointment · Naples & the Gulf Coast',
        heading: 'A prestigious address, and a life that',
        headingAccent: 'takes care of itself.',
        lede: 'Private gated communities minutes from the Gulf beaches, with resort amenities and a personal concierge to make your move effortless.',
        primaryCta: cta('View Residences', '/#listings'),
        secondaryCta: cta('Request My Shortlist', '/#lead'),
        showEyebrowMarker: true,
        showPrimaryCtaIcon: true,
        showSecondaryCta: true,
      },
      {
        enabled: true,
        blockType: 'communitiesStrip',
        sourceMode: 'manual',
        maxItems: 3,
        items: [
          {
            slug: 'bonita-bay',
            name: 'Bonita Bay',
            blurb: 'Bonita Springs · golf, marina & a private Gulf beach park',
            link: customLink('Bonita Bay', '/communities/bonita-bay'),
            icon: 'mapPin',
          },
          {
            slug: 'valencia-bonita',
            name: 'Valencia Bonita',
            blurb: 'Bonita Springs · 55+ gated with a resort clubhouse',
            link: customLink('Valencia Bonita', '/communities/valencia-bonita'),
            icon: 'mapPin',
          },
          {
            slug: 'valencia-trails',
            name: 'Valencia Trails',
            blurb: 'Naples · 55+ gated, resort pool minutes from the sand',
            link: customLink('Valencia Trails', '/communities/valencia-trails'),
            icon: 'mapPin',
          },
        ],
      },
      {
        enabled: true,
        blockType: 'featuredCommunities',
        anchorId: 'communities',
        header: {
          kicker: 'Featured Communities',
          heading: 'Three favorites to start your search.',
          lede: 'A short, hand-picked set of the Southwest Florida communities our clients keep coming back to.',
        },
        sourceMode: 'manual',
        manualCommunities: [
          {
            slug: 'bonita-bay',
            name: 'Bonita Bay',
            locality: 'Bonita Springs · private Gulf beach park',
            rating: 4.8,
            reviews: 57,
            reviewsLabel: 'reviews',
            priceRange: 'From the $400s – $5M+',
            tags: [{ label: 'Golf & Marina' }, { label: 'Gated' }, { label: 'Beach Park' }],
            residences: 320,
            residencesLabel: 'residences',
            nowSelling: 14,
            nowSellingLabel: 'now selling',
            image: media(mediaDocs.bonitaBay),
            link: customLink('Bonita Bay', '/communities/bonita-bay'),
          },
          {
            slug: 'valencia-bonita',
            name: 'Valencia Bonita',
            locality: 'Bonita Springs · 55+ gated',
            rating: 4.9,
            reviews: 83,
            reviewsLabel: 'reviews',
            priceRange: 'From the $500s – $1M',
            tags: [
              { label: '55+ Gated' },
              { label: 'Resort Clubhouse' },
              { label: 'Tennis & Pickleball' },
            ],
            residences: 410,
            residencesLabel: 'residences',
            nowSelling: 22,
            nowSellingLabel: 'now selling',
            image: media(mediaDocs.valenciaBonita),
            link: customLink('Valencia Bonita', '/communities/valencia-bonita'),
          },
          {
            slug: 'valencia-trails',
            name: 'Valencia Trails',
            locality: 'Naples · 55+ gated',
            rating: 4.7,
            reviews: 41,
            reviewsLabel: 'reviews',
            priceRange: 'From the $600s – $1.3M',
            tags: [{ label: 'New & Resale' }, { label: '55+ Gated' }, { label: 'Resort Pool' }],
            residences: 275,
            residencesLabel: 'residences',
            nowSelling: 9,
            nowSellingLabel: 'now selling',
            image: media(mediaDocs.valenciaTrails),
            link: customLink('Valencia Trails', '/communities/valencia-trails'),
          },
        ],
        moreLink: cta('Explore all communities', '/listings'),
      },
      {
        enabled: true,
        blockType: 'featuredResidences',
        anchorId: 'listings',
        header: {
          kicker: 'Curated Residences',
          heading: 'Homes chosen for you, not a search bar.',
          lede: 'A sample of what is selling now, with starting prices, so you can see where you fit before we ever talk.',
        },
        sourceMode: 'manual',
        manualListings: [
          {
            slug: 'the-anchorage',
            name: 'The Anchorage',
            locality: 'Seaside Cove · Naples',
            price: 1450000,
            priceLabel: 'From $1,450,000',
            beds: 3,
            bedsLabel: 'Beds',
            baths: 3.5,
            bathsLabel: 'Baths',
            sqft: 2940,
            sqftLabel: 'Sq Ft',
            badge: 'Now Selling',
            image: media(mediaDocs.bonitaBay, 'Seaside Cove residence framed by royal palms'),
            link: customLink('The Anchorage', '/listings/the-anchorage'),
          },
          {
            slug: 'lakeside-villa',
            name: 'Lakeside Villa',
            locality: 'Mangrove Bay · Bonita Springs',
            price: 865000,
            priceLabel: 'From $865,000',
            beds: 2,
            bedsLabel: 'Beds',
            baths: 2.5,
            bathsLabel: 'Baths',
            sqft: 2210,
            sqftLabel: 'Sq Ft',
            badge: '55+ Living',
            image: media(mediaDocs.valenciaBonita, 'Mangrove Bay lakefront villa at dusk'),
            link: customLink('Lakeside Villa', '/listings/lakeside-villa'),
          },
          {
            slug: 'the-lagoon-model',
            name: 'The Lagoon Model',
            locality: 'Coral Lagoon · Estero',
            price: 920000,
            priceLabel: 'From $920,000',
            beds: 3,
            bedsLabel: 'Beds',
            baths: 3,
            bathsLabel: 'Baths',
            sqft: 2560,
            sqftLabel: 'Sq Ft',
            badge: 'New Model Open',
            image: media(mediaDocs.valenciaTrails, 'Coral Lagoon decorated model interior'),
            link: customLink('The Lagoon Model', '/listings/the-lagoon-model'),
          },
        ],
        cardCtaLabel: 'View residence',
        moreLink: cta('View the full collection', '/listings'),
      },
      {
        enabled: true,
        blockType: 'lifestyle',
        anchorId: 'lifestyle',
        backgroundImage: media(
          mediaDocs.hero,
          'Residents gathered around a long candlelit table at a clubhouse dinner, talking and laughing together',
        ),
        kicker: 'The Life Inside the Gates',
        heading: 'You buy the home. You stay for',
        headingAccent: 'the people.',
        body: 'For our residents, the deciding factor is rarely the floorplan. It is the standing dinner on Thursdays, the doubles partner two doors down, and the sense that there is always a reason to step outside. You arrive with an address; within a week you have a ready-made circle.',
        maxTiles: 3,
        tiles: [
          {
            caption: 'Doubles at nine, coffee after',
            image: media(
              mediaDocs.valenciaTrails,
              'Four neighbors mid-rally in a friendly doubles pickleball match',
            ),
            link: customLink('Doubles at nine, coffee after', '#lifestyle'),
          },
          {
            caption: 'Thursday wine on the terrace',
            image: media(
              mediaDocs.valenciaBonita,
              'Residents raising their glasses together at a clubhouse wine evening',
            ),
            link: customLink('Thursday wine on the terrace', '#lifestyle'),
          },
          {
            caption: 'Live music on the lawn',
            image: media(
              mediaDocs.bonitaBay,
              'Couples dancing on the lawn at an outdoor live-music night',
            ),
            link: customLink('Live music on the lawn', '#lifestyle'),
          },
        ],
      },
      {
        enabled: true,
        blockType: 'testimonials',
        anchorId: 'testimonials',
        kicker: 'In Their Words',
        heading: 'The address impressed them. The',
        headingAccent: 'people',
        headingSuffix: 'kept them.',
        stories: [
          {
            slug: 'whitfield',
            name: 'Margaret & Tom Whitfield',
            location: 'Residents · Seaside Cove, Naples',
            quote:
              'We came for the lanai and the sunsets. We stayed because, for the first time in years, our calendar is full of people we love.',
            portrait: media(mediaDocs.owner, 'Portrait of Margaret and Tom Whitfield'),
          },
          {
            slug: 'alvarez',
            name: 'Diane Alvarez',
            location: 'Resident · Mangrove Bay, Bonita Springs',
            quote:
              'I worried about starting over at sixty-six. By the second week I had a pickleball partner, a book club, and a standing dinner. I worried about nothing.',
            portrait: media(mediaDocs.valenciaBonita, 'Portrait of Diane Alvarez'),
          },
          {
            slug: 'bennett',
            name: 'Charles & Ruth Bennett',
            location: 'Residents · Palm Reserve, Marco Island',
            quote:
              'The concierge handled the move down to the last box. We spent our first weekend on the courts, not unpacking. That was the whole difference.',
            portrait: media(mediaDocs.valenciaTrails, 'Portrait of Charles and Ruth Bennett'),
          },
        ],
        carouselAutoPlay: true,
        carouselIntervalMs: 6500,
        previousLabel: 'Previous story',
        nextLabel: 'Next story',
        tabListLabel: 'Choose a resident story',
        counterSeparator: '/',
      },
      {
        enabled: true,
        blockType: 'amenities',
        anchorId: 'amenities',
        header: {
          kicker: 'The Resort at Your Door',
          heading: 'Every day arranged like a stay at a fine resort.',
          lede: 'From the first cup of coffee at the clubhouse to sunset by the pool, the amenities are designed for an active, social life, and tended so you never have to think about the upkeep.',
        },
        featureImage: media(
          mediaDocs.hero,
          'Residents gathered with drinks at the resort pool deck on a sunny afternoon',
        ),
        featureTitle: 'The Grand Clubhouse',
        featureCaption: 'Dining, events, and the pool deck where the day’s plans get made.',
        amenities: [
          {
            icon: 'pool',
            title: 'Resort Pool',
            blurb:
              'Zero-entry pools, a heated lap lane, and shaded cabanas for the warm afternoons.',
          },
          {
            icon: 'racquet',
            title: 'Pickleball & Tennis',
            blurb:
              'Lit courts and friendly leagues that quickly turn neighbors into a circle of friends.',
          },
          {
            icon: 'fitness',
            title: 'Fitness & Wellness',
            blurb:
              'A full gym, yoga studio, and spa treatments to keep retirement genuinely active.',
          },
          {
            icon: 'dining',
            title: 'Dining & Social',
            blurb: 'Chef-led restaurants, wine evenings, and a calendar of gatherings every week.',
          },
          {
            icon: 'trails',
            title: 'Nature Trails',
            blurb: 'Miles of walking and biking paths winding past lakes, preserves, and gardens.',
          },
          {
            icon: 'calendar',
            title: 'Social Calendar',
            blurb:
              'Live music, food trucks, classes, and clubs, with always something on the books.',
          },
        ],
      },
      {
        enabled: true,
        blockType: 'ownerIntro',
        anchorId: 'concierge',
        portrait: media(mediaDocs.owner),
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
        enabled: true,
        blockType: 'leadCapture',
        anchorId: 'lead',
        kicker: 'Your Private Introduction',
        heading: 'Let a concierge prepare your shortlist.',
        body: 'Tell us a little about the life you are looking for. Your concierge will return with a curated set of residences, pricing, and current incentives, with no obligation and no sales floor.',
        helperNote: {
          icon: 'waves',
          beforeLinkText: 'Beachfront residences also available, ',
          link: customLink('by request', '#lead'),
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

  await payload.updateGlobal({
    slug: 'header',
    data: header,
    overrideAccess: true,
    context: SEED_CONTEXT,
  });

  await payload.updateGlobal({
    slug: 'footer',
    data: footer,
    overrideAccess: true,
    context: SEED_CONTEXT,
  });

  const existingHome = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const existingDoc = existingHome.docs[0];
  if (existingDoc) {
    await payload.update({
      collection: 'pages',
      id: existingDoc.id,
      data: pageData,
      overrideAccess: true,
      context: SEED_CONTEXT,
    });
  } else {
    await payload.create({
      collection: 'pages',
      data: pageData,
      overrideAccess: true,
      context: SEED_CONTEXT,
    });
  }

  payload.logger.info('Seeded homepage page, header global, footer global, and media.');
}

await main();
