import type { Payload } from 'payload';

import type { Footer, Header, Page } from '@/payload-types';

import { seedAreaGalleries, seedAreas } from '../areas/seed';
import { validateHomepageSeedAssets } from './assets';
import { footerIsUnseeded, headerIsUnseeded } from './fresh';
import {
  placeholderHomepageSeedMedia,
  reconcileHomepageSeedMedia,
  type HomepageSeedMediaDoc,
  type HomepageSeedMediaDocs,
} from './media';
import { seedDataDifferencePaths, seedDataMatches } from './normalize';

const SEED_CONTEXT = { source: 'seed-homepage-local' };

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

function media(image: HomepageSeedMediaDoc, altOverride?: string): MediaFieldData {
  return {
    image: image.id,
    altOverride,
  };
}

export function buildHomepageSeedData(mediaDocs: HomepageSeedMediaDocs) {
  const header: Omit<Header, 'id' | 'createdAt' | 'updatedAt'> = {
    brandHomeLink: customLink('55 Living Team home', '/'),
    brandDisplayMode: 'text',
    brandLabel: '55 Living Team',
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
    brandDisplayMode: 'text',
    brandAccentText: 'Realty',
    brandBlurb:
      'Florida’s Gulf-Coast concierge for luxury gated communities and beachfront residences, minutes from the sand.',
    columns: [
      {
        title: 'Residences',
        source: 'manual',
        links: [
          { label: 'The Anchorage', link: customLink('The Anchorage', '/listings') },
          { label: 'Lakeside Villa', link: customLink('Lakeside Villa', '/listings') },
          { label: 'The Lagoon Model', link: customLink('The Lagoon Model', '/listings') },
          { label: 'Beachfront Homes', link: customLink('Beachfront Homes', '/listings') },
        ],
      },
      {
        title: 'Explore',
        source: 'manual',
        links: [
          { label: 'Amenities', link: customLink('Amenities', '/#amenities') },
          { label: 'Communities', link: customLink('Communities', '/#communities') },
          { label: 'The Life', link: customLink('The Life', '/#lifestyle') },
          { label: 'Meet the Owner', link: customLink('Meet the Owner', '/#concierge') },
        ],
      },
      {
        title: 'Concierge',
        source: 'manual',
        links: [
          { label: 'Speak With Us', link: customLink('Speak With Us', '/#lead') },
          { label: '(239) 555-0148', link: customLink('(239) 555-0148', 'tel:+12395550148') },
          { label: 'By Appointment', link: customLink('By Appointment', '/#lead') },
          { label: 'About MVP', link: customLink('About MVP', '/#concierge') },
        ],
      },
    ],
    // The Equal Housing notice moves left because the footer renders
    // `bottomRightTextFallback` only while `bottomRightLinks` is empty — filling the
    // links in would otherwise silently drop a fair-housing disclosure.
    bottomLeftText: '© 2026 55 Living Team. All rights reserved. · Equal Housing Opportunity',
    bottomRightLinks: [
      { link: customLink('Privacy Policy', '/privacy-policy') },
      { link: customLink('Sitemap', '/sitemap.xml') },
    ],
    bottomRightTextFallback: 'Equal Housing Opportunity · Privacy · Terms',
  };

  const pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'Home',
    slug: 'home',
    _status: 'published',
    seo: {
      metaTitle: '55 Living Team — Gulf-Coast Concierge for Luxury Gated Communities',
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
        sourceMode: 'areas',
        maxItems: 3,
        items: [],
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
        sourceMode: 'areas',
        manualCommunities: [],
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
        // No `link` on these tiles. They previously pointed at '#lifestyle' — the
        // anchor of the block they live in — so clicking went nowhere while the
        // anchor still showed a pointer cursor, advertising a destination that did
        // not exist. `TheLife` renders a plain `div` when a tile has no link.
        tiles: [
          {
            caption: 'Doubles at nine, coffee after',
            image: media(
              mediaDocs.valenciaTrails,
              'Four neighbors mid-rally in a friendly doubles pickleball match',
            ),
          },
          {
            caption: 'Thursday wine on the terrace',
            image: media(
              mediaDocs.valenciaBonita,
              'Residents raising their glasses together at a clubhouse wine evening',
            ),
          },
          {
            caption: 'Live music on the lawn',
            image: media(
              mediaDocs.bonitaBay,
              'Couples dancing on the lawn at an outdoor live-music night',
            ),
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
            
            quote:
              'We came for the lanai and the sunsets. We stayed because, for the first time in years, our calendar is full of people we love.',
            portrait: media(mediaDocs.owner, 'Portrait of Margaret and Tom Whitfield'),
          },
          {
            slug: 'alvarez',
            name: 'Diane Alvarez',
            
            quote:
              'I worried about starting over at sixty-six. By the second week I had a pickleball partner, a book club, and a standing dinner. I worried about nothing.',
            portrait: media(mediaDocs.valenciaBonita, 'Portrait of Diane Alvarez'),
          },
          {
            slug: 'bennett',
            name: 'Charles & Ruth Bennett',
            
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
        titleLine: 'Eleanor Voss · Broker & Owner, 55 Living Team',
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

  return { header, footer, pageData };
}

export type HomepageSeedReport = {
  mediaCreated: number;
  orphanFilesRemoved: number;
  modifiedFilesPreserved: number;
  headerChanged: boolean;
  footerChanged: boolean;
  pageChanged: boolean;
};

export async function seedHomepage(payload: Payload): Promise<HomepageSeedReport> {
  await validateHomepageSeedAssets();
  const placeholderData = buildHomepageSeedData(placeholderHomepageSeedMedia());
  const [currentHeader, currentFooter, existingHome] = await Promise.all([
    payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true }),
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }),
  ]);

  if (!seedDataMatches(currentHeader, placeholderData.header) && !headerIsUnseeded(currentHeader)) {
    throw new Error(
      `Header content differs from the canonical homepage seed at: ${seedDataDifferencePaths(currentHeader, placeholderData.header).join(', ')}.`,
    );
  }

  if (!seedDataMatches(currentFooter, placeholderData.footer) && !footerIsUnseeded(currentFooter)) {
    throw new Error(
      `Footer content differs from the canonical homepage seed at: ${seedDataDifferencePaths(currentFooter, placeholderData.footer).join(', ')}.`,
    );
  }

  // Recreate missing seed media before the drift check — deleting Media nulls page
  // relationships, and find-by-existing-media would throw before we can repair.
  const mediaResult = await reconcileHomepageSeedMedia(payload);
  const { header, footer, pageData } = buildHomepageSeedData(mediaResult.mediaDocs);

  const existingDoc = existingHome.docs[0];
  if (existingDoc && mediaResult.created.length === 0) {
    if (!seedDataMatches(existingDoc, pageData)) {
      const driftPaths = seedDataDifferencePaths(existingDoc, pageData);
      // Safe to repair: broken media refs, or community blocks moving to Areas source.
      const onlyReparableDrift = driftPaths.every(
        (path) => /\.image$/.test(path) || /^layout\[1\]/.test(path) || /^layout\[2\]/.test(path),
      );
      if (!onlyReparableDrift) {
        throw new Error(
          `The home page differs from the canonical homepage seed at: ${driftPaths.join(', ')}.`,
        );
      }
    }
  }

  let headerChanged = false;
  if (!seedDataMatches(currentHeader, header)) {
    await payload.updateGlobal({
      slug: 'header',
      data: header,
      overrideAccess: true,
      context: SEED_CONTEXT,
    });
    headerChanged = true;
  }

  let footerChanged = false;
  if (!seedDataMatches(currentFooter, footer)) {
    await payload.updateGlobal({
      slug: 'footer',
      data: footer,
      overrideAccess: true,
      context: SEED_CONTEXT,
    });
    footerChanged = true;
  }

  let pageChanged = false;
  if (existingDoc) {
    if (!seedDataMatches(existingDoc, pageData)) {
      await payload.update({
        collection: 'pages',
        id: existingDoc.id,
        data: pageData,
        overrideAccess: true,
        context: SEED_CONTEXT,
      });
      pageChanged = true;
    }
  } else {
    await payload.create({
      collection: 'pages',
      data: pageData,
      overrideAccess: true,
      context: SEED_CONTEXT,
    });
    pageChanged = true;
  }

  await seedAreas(payload);
  await seedAreaGalleries(payload, mediaResult.mediaDocs);

  return {
    mediaCreated: mediaResult.created.length,
    orphanFilesRemoved: mediaResult.removedOrphanFileNames.length,
    modifiedFilesPreserved: mediaResult.preservedModifiedFileNames.length,
    headerChanged,
    footerChanged,
    pageChanged,
  };
}
