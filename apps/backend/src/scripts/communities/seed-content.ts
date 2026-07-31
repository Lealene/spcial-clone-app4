/**
 * Ports the former hand-authored community-detail fixture into Areas.
 *
 * Replacing, not merging: `payload.update` with an `amenities` array replaces
 * the whole array, so the 3 existing seed amenity rows become 8.
 */
import type { Payload, PayloadRequest } from 'payload';

import { paragraphsToLexical } from '../shared/paragraphs-to-lexical';
import type { CommunitySeedMediaDocs } from './media';

type SeedReq = { req?: Pick<PayloadRequest, 'transactionID'> };

type AmenityIcon =
  | 'golf'
  | 'marina'
  | 'beach'
  | 'racquet'
  | 'fitness'
  | 'dining'
  | 'trails'
  | 'pool'
  | 'club'
  | 'spa'
  | 'gate'
  | 'dog';

type CommunityContentSeed = {
  slug: string;
  detailBlurb: string;
  photoCount: number;
  phone: string;
  soldCount: number;
  facts: Array<{ label: string; value: string }>;
  about: string[];
  amenities: Array<{ icon: AmenityIcon; title: string }>;
  clubs: string[];
  faqs: Array<{ question: string; answer: string }>;
  galleryKeys: Array<{
    key: keyof CommunitySeedMediaDocs | 'homepage';
    homepageKey?: string;
    alt: string;
  }>;
  similarSlugs: string[];
};

const PHONE = '(239) 555-0148';

const COMMUNITY_CONTENT_SEEDS: CommunityContentSeed[] = [
  {
    slug: 'bonita-bay',
    detailBlurb:
      "A 2,400-acre gated enclave on the Gulf Coast, with five golf courses, a private marina, and a members' beach park.",
    photoCount: 58,
    phone: PHONE,
    soldCount: 90,
    facts: [
      { label: 'Price Range', value: 'From the $400s – $5M+' },
      { label: 'Total Residences', value: '320 homes' },
      { label: 'Year Built', value: '1985 – Present' },
      { label: 'Home Types', value: 'Single-Family · Coach · Tower' },
      { label: 'Gated', value: 'Yes · three manned gates' },
      { label: 'Beach Park', value: 'Private · resident shuttle' },
    ],
    about: [
      "Set along the Imperial River where it meets Estero Bay, **Bonita Bay** is one of Southwest Florida's most established gated communities — 2,400 acres of preserved wetlands, oak canopies, and shoreline given over to a single, unhurried idea of coastal living. Residents move between five championship golf courses, a full-service marina, and a private beach park reached by the community's own shuttle.",
      "Inside the gates you'll find everything from lakefront single-family homes to coach residences and full-floor tower condominiums with Gulf views. The pace is social but never crowded: morning tee times, afternoons on the courts, and evenings at the lifestyle center, where the calendar fills itself.",
      'It is the kind of address that rarely needs explaining — and the kind of move MVP Realty makes effortless, from your first walk-through to the day the keys change hands.',
    ],
    amenities: [
      { icon: 'golf', title: 'Five Championship Golf Courses' },
      { icon: 'marina', title: 'Full-Service Marina' },
      { icon: 'beach', title: 'Private Beach Park & Shuttle' },
      { icon: 'racquet', title: 'Tennis & Pickleball Courts' },
      { icon: 'fitness', title: 'Lifestyle & Fitness Center' },
      { icon: 'dining', title: 'Waterfront Dining & Social' },
      { icon: 'trails', title: '12 Miles of Nature Trails' },
      { icon: 'pool', title: 'Resort Pool & Spa' },
    ],
    clubs: [
      'Bonita Bay Yacht Club',
      "Members' Golf League",
      'Pickleball Social',
      'Garden & Orchid Society',
      'Beach Park Shuttle Group',
      'Wine & Supper Club',
      'Kayak & Paddleboard Club',
      'Tennis Round Robin',
      'Photography Circle',
      'Book & Lecture Series',
      'Cycling & Trails Group',
      'Charitable Foundation',
    ],
    faqs: [
      {
        question: 'What is the average price of homes in Bonita Bay?',
        answer:
          'Prices range from the low $400,000s for coach residences to $5 million and above for waterfront single-family estates and full-floor tower condominiums. Most resales trade between $700,000 and $2 million depending on view and product type.',
      },
      {
        question: 'What kinds of homes are available in Bonita Bay?',
        answer:
          'Bonita Bay offers single-family homes, attached coach residences, and high-rise tower condominiums — many on the golf course, a lake, or with Gulf and bay views. New construction and resale are both available.',
      },
      {
        question: 'What amenities are available at Bonita Bay?',
        answer:
          "Residents enjoy five championship golf courses, a full-service marina, a private members' beach park with shuttle, tennis and pickleball, a lifestyle and fitness center, resort pool and spa, waterfront dining, and twelve miles of nature trails.",
      },
      {
        question: 'Is Bonita Bay a gated community?',
        answer:
          'Yes. Bonita Bay is fully gated with three manned entry gates and round-the-clock community patrol across its 2,400 acres.',
      },
    ],
    galleryKeys: [
      {
        key: 'homepage',
        homepageKey: 'bonitaBay',
        alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
      },
      { key: 'bbPool', alt: "Aerial of Bonita Bay's resort pool and clubhouse" },
      { key: 'bbLanai', alt: 'Screened lanai and private pool overlooking the preserve' },
      { key: 'sharedKitchen', alt: 'Bright white kitchen with island and stone counters' },
      { key: 'bbMarina', alt: 'Aerial over the community marina and tennis courts' },
    ],
    similarSlugs: ['valencia-bonita', 'valencia-trails'],
  },
  {
    slug: 'valencia-bonita',
    detailBlurb:
      'A 55+ gated resort community anchored by a 45,000-square-foot clubhouse, with tennis, pickleball, and a calendar built around its members.',
    photoCount: 46,
    phone: PHONE,
    soldCount: 90,
    facts: [
      { label: 'Price Range', value: 'From the $500s – $1M' },
      { label: 'Total Residences', value: '410 homes' },
      { label: 'Year Built', value: '2016 – Present' },
      { label: 'Home Types', value: 'Villa · Single-Family' },
      { label: 'Community', value: '55+ · age-qualified' },
      { label: 'Clubhouse', value: '45,000 sq ft · resort-style' },
    ],
    about: [
      'In the heart of Bonita Springs, **Valencia Bonita** is GL Homes’ flagship 55+ community — 410 single-story villas and single-family homes wrapped around a 45,000-square-foot social clubhouse that runs more like a private resort than an HOA amenity.',
      'Days here are made of choices: a class in the arts studio, a set of pickleball, laps in the resort pool, then a show in the on-site social hall. The maintenance-light, single-story floor plans are built for an unhurried second act, with paver drives, tile roofs, and screened lanais throughout.',
      'It is one of the most sought-after age-qualified addresses on the Gulf Coast — and MVP Realty knows every floor plan, every street, and every quiet listing before it reaches the search.',
    ],
    amenities: [
      { icon: 'club', title: '45,000 Sq Ft Social Clubhouse' },
      { icon: 'pool', title: 'Resort & Lap Pools' },
      { icon: 'racquet', title: 'Tennis & Pickleball Courts' },
      { icon: 'fitness', title: 'Fitness Center & Studios' },
      { icon: 'spa', title: 'Spa & Wellness Suite' },
      { icon: 'dining', title: 'On-Site Restaurant & Bar' },
      { icon: 'trails', title: 'Walking & Biking Paths' },
      { icon: 'gate', title: 'Gated · 24-Hour Manned Entry' },
    ],
    clubs: [
      'Pickleball League',
      'Mahjong & Canasta',
      'Travel Club',
      'Veterans Group',
      'Line Dancing',
      'Wine & Social Club',
      'Arts & Ceramics Studio',
      'Water Aerobics',
      'Bocce League',
      'Theatre & Show Series',
      'Book Club',
      'Charitable Giving Circle',
    ],
    faqs: [
      {
        question: 'Is Valencia Bonita a 55+ community?',
        answer:
          'Yes. Valencia Bonita is an age-qualified 55+ community; at least one resident of each home must be 55 or older, with standard occupancy guidelines for others.',
      },
      {
        question: 'What is the average price of homes in Valencia Bonita?',
        answer:
          'Homes generally range from the $500,000s for villas to just over $1 million for larger single-family floor plans with premium lake or preserve lots. Resale pricing depends on model, view, and upgrades.',
      },
      {
        question: 'What amenities does Valencia Bonita offer?',
        answer:
          'The 45,000-square-foot clubhouse anchors a resort pool, lap pool, tennis and pickleball, a fitness center with studios, a spa and wellness suite, an on-site restaurant and bar, and a full social calendar.',
      },
      {
        question: 'Is Valencia Bonita gated?',
        answer:
          'Yes. The community has a gated, 24-hour manned entry with controlled access throughout.',
      },
    ],
    galleryKeys: [
      {
        key: 'homepage',
        homepageKey: 'valenciaBonita',
        alt: 'The resort clubhouse at Valencia Bonita, framed by royal palms',
      },
      {
        key: 'vbVilla',
        alt: 'A single-story villa with a tile roof and paver drive at Valencia Bonita',
      },
      { key: 'vbCourtyard', alt: 'A landscaped courtyard entry framed by tropical plantings' },
      { key: 'vbKitchen', alt: 'A bright open kitchen with quartz island and shaker cabinets' },
      { key: 'vbPool', alt: 'Resort pool deck with cabanas and lounge chairs' },
    ],
    similarSlugs: ['bonita-bay', 'valencia-trails'],
  },
  {
    slug: 'valencia-trails',
    detailBlurb:
      'A newer 55+ gated community north of Naples, built around a resort clubhouse and a beach-entry pool minutes from the sand.',
    photoCount: 39,
    phone: PHONE,
    soldCount: 90,
    facts: [
      { label: 'Price Range', value: 'From the $600s – $1.3M' },
      { label: 'Total Residences', value: '275 homes' },
      { label: 'Year Built', value: '2021 – Present' },
      { label: 'Home Types', value: 'Single-Family' },
      { label: 'Community', value: '55+ · age-qualified' },
      { label: 'Pool', value: 'Resort · beach-entry' },
    ],
    about: [
      'Just north of Naples, **Valencia Trails** is one of GL Homes’ newest 55+ communities — 275 single-family homes set around a 42,000-square-foot clubhouse and a beach-entry resort pool, all within a short drive of the Gulf beaches.',
      'The draw here is newness with a settled feel: contemporary open floor plans, energy-efficient construction, and a lifestyle director who keeps the social hall, the courts, and the trails in constant use. Lakes and preserves thread between the streets, so most homesites look out on water or green.',
      'For buyers who want a brand-new home without giving up an established community feel, Valencia Trails is hard to beat — and MVP Realty tracks every release, incentive, and resale as it comes.',
    ],
    amenities: [
      { icon: 'club', title: '42,000 Sq Ft Resort Clubhouse' },
      { icon: 'pool', title: 'Beach-Entry Resort Pool' },
      { icon: 'racquet', title: 'Tennis & Pickleball Courts' },
      { icon: 'fitness', title: 'Fitness Center & Group Studio' },
      { icon: 'spa', title: 'Day Spa & Salon' },
      { icon: 'dining', title: 'Café & Social Hall' },
      { icon: 'trails', title: 'Lakeside Walking Trails' },
      { icon: 'gate', title: 'Gated · Controlled Entry' },
    ],
    clubs: [
      'Pickleball Club',
      'Cycling Group',
      'Mahjong & Cards',
      'Yoga & Pilates',
      'Garden Club',
      'Wine Society',
      'Crafts & Pottery',
      'Lap Swim Club',
      'Bocce League',
      'Live Music Nights',
      'Book Club',
      'Volunteer Network',
    ],
    faqs: [
      {
        question: 'Is Valencia Trails a 55+ community?',
        answer:
          'Yes. Valencia Trails is age-qualified; at least one resident of each home must be 55 or older.',
      },
      {
        question: 'What is the average price of homes in Valencia Trails?',
        answer:
          'New and resale single-family homes generally range from the $600,000s to about $1.3 million depending on floor plan, lot, and upgrades.',
      },
      {
        question: 'What amenities does Valencia Trails offer?',
        answer:
          'A 42,000-square-foot clubhouse anchors a beach-entry resort pool, tennis and pickleball, a fitness center and group studio, a day spa and salon, a café and social hall, and lakeside walking trails.',
      },
      {
        question: 'How close is Valencia Trails to the beach?',
        answer:
          'The community sits north of Naples within a short drive of the Gulf beaches, with shopping and dining minutes away.',
      },
    ],
    galleryKeys: [
      {
        key: 'homepage',
        homepageKey: 'valenciaTrails',
        alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
      },
      { key: 'vtHome', alt: 'A new single-family home with a tile roof and palm-lined drive' },
      {
        key: 'vtGreatroom',
        alt: 'A decorated model great room with high ceilings and wood floors',
      },
      { key: 'vtPool', alt: 'Resort pool and cabanas beside the clubhouse' },
      { key: 'vtTrail', alt: 'A landscaped walking trail winding past lakes' },
    ],
    similarSlugs: ['bonita-bay', 'valencia-bonita'],
  },
];

type HomepageMediaDocs = {
  bonitaBay: { id: number };
  valenciaBonita: { id: number };
  valenciaTrails: { id: number };
};

function resolveGallery(
  seed: CommunityContentSeed,
  communityMedia: CommunitySeedMediaDocs,
  homepageMedia: HomepageMediaDocs,
): Array<{ image: number; alt: string }> {
  return seed.galleryKeys.map((row) => {
    if (row.key === 'homepage') {
      const homepageKey = row.homepageKey as keyof HomepageMediaDocs;
      return { image: homepageMedia[homepageKey].id, alt: row.alt };
    }
    return { image: communityMedia[row.key].id, alt: row.alt };
  });
}

export async function seedCommunityContent(
  payload: Payload,
  options: {
    communityMedia: CommunitySeedMediaDocs;
    homepageMedia: HomepageMediaDocs;
  },
  seedReq: SeedReq = {},
): Promise<{ updated: number; skipped: string[] }> {
  let updated = 0;
  const skipped: string[] = [];
  const { req } = seedReq;

  for (const seed of COMMUNITY_CONTENT_SEEDS) {
    const existing = await payload.find({
      collection: 'areas',
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const doc = existing.docs[0];
    if (!doc) {
      payload.logger.warn({
        msg: `seedCommunityContent skipped missing area ${seed.slug} (no mlsAreaMajor bootstrap).`,
      });
      skipped.push(seed.slug);
      continue;
    }

    await payload.update({
      collection: 'areas',
      id: doc.id,
      data: {
        detailBlurb: seed.detailBlurb,
        photoCount: seed.photoCount,
        phone: seed.phone,
        soldCount: seed.soldCount,
        facts: seed.facts,
        about: paragraphsToLexical(seed.about),
        amenities: seed.amenities,
        clubs: seed.clubs.map((item) => ({ item })),
        faqs: seed.faqs,
        gallery: resolveGallery(seed, options.communityMedia, options.homepageMedia),
      },
      overrideAccess: true,
      req,
    });
    updated += 1;
  }

  return { updated, skipped };
}

/** Second pass after all three communities exist. */
export async function attachSimilarAreas(payload: Payload, options: SeedReq = {}): Promise<number> {
  let updated = 0;
  const { req } = options;

  for (const seed of COMMUNITY_CONTENT_SEEDS) {
    const area = await payload.find({
      collection: 'areas',
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    });
    const doc = area.docs[0];
    if (!doc) continue;

    const similarIds: number[] = [];
    for (const similarSlug of seed.similarSlugs) {
      const similar = await payload.find({
        collection: 'areas',
        where: { slug: { equals: similarSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      });
      const similarDoc = similar.docs[0];
      if (similarDoc) similarIds.push(similarDoc.id);
    }

    await payload.update({
      collection: 'areas',
      id: doc.id,
      data: { similar: similarIds },
      overrideAccess: true,
      req,
    });
    updated += 1;
  }

  return updated;
}
