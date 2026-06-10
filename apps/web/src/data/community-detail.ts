/**
 * Community-detail content — the editorial + structured data the
 * `/communities/[slug]` detail page renders. Lives apart from `communities.ts`
 * (the card-level catalog) so the detail page owns its richer shape without
 * touching the shared `Community`/`Listing` types. Hand-authored for design
 * exploration; shaped to mirror a future Payload `Communities` collection so
 * the page can later swap to backend fetches behind the same shapes.
 *
 * Templated structure shared across all six communities; name/city/prose and
 * the specifics (facts, models, reviews, FAQs) are customized per place so each
 * reads distinctly.
 */
import type { Image } from './types';

/** The amenity icon vocabulary the detail checklist renders (lucide-backed). */
export type CommunityAmenityIcon =
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

export type CommunityFact = {
  label: string;
  value: string;
};

export type CommunityAmenity = {
  icon: CommunityAmenityIcon;
  title: string;
};

export type CommunityModel = {
  name: string;
  /** e.g. "Coach Residence", "Single-Family · Lakefront". */
  type: string;
  beds: string;
  baths: string;
  sqft: string;
  garage: string;
  /** Which stylized floorplan SVG to draw. */
  plan: 'a' | 'b';
};

export type CommunityReviewBar = {
  label: string;
  /** 0–100, the bar fill width. */
  pct: number;
  score: string;
};

export type CommunityReview = {
  quote: string;
  who: string;
  meta: string;
};

export type CommunityFaq = {
  q: string;
  a: string;
};

/** A nearby community surfaced in the "Similar communities" rail. */
export type SimilarCommunity = {
  slug: string;
  name: string;
  /** City + short descriptor, e.g. "Bonita Springs · 55+ gated". */
  locality: string;
  rating: number;
  reviews: number;
  priceRange: string;
  residences: number;
  image: Image;
};

export type CommunityDetail = {
  slug: string;
  name: string;
  city: string;
  /** Short location blurb under the H1. */
  blurb: string;
  rating: number;
  reviews: number;
  /** Total photo count for the gallery's "All N photos" button. */
  photoCount: number;
  /** Gallery: 1 lead + 4 tiles (exactly 5). */
  gallery: Image[];
  /** Overview fact strip — exactly 6 cells. */
  facts: CommunityFact[];
  /** Overview prose paragraphs. `**bold**` spans get emphasized. */
  about: string[];
  amenities: CommunityAmenity[];
  /** Lifestyle & Clubs bulleted list. */
  clubs: string[];
  models: CommunityModel[];
  reviewBars: CommunityReviewBar[];
  reviewCards: CommunityReview[];
  faqs: CommunityFaq[];
  /** Phone shown in the "prefer to call" card + agent. */
  phone: string;
  phoneHref: string;
  /** Similar nearby communities (the other five, used 4 at a time). */
  similar: SimilarCommunity[];
};

// ---------------------------------------------------------------------------
// Shared building blocks (templated across communities)
// ---------------------------------------------------------------------------

const PHONE = '(239) 555-0148';
const PHONE_HREF = 'tel:+12395550148';

/** Card-level summary used to build each community's "similar nearby" list. */
type Summary = {
  slug: string;
  name: string;
  locality: string;
  rating: number;
  reviews: number;
  priceRange: string;
  residences: number;
  image: Image;
};

const SUMMARIES: Record<string, Summary> = {
  'bonita-bay': {
    slug: 'bonita-bay',
    name: 'Bonita Bay',
    locality: 'Bonita Springs · golf & marina',
    rating: 4.8,
    reviews: 57,
    priceRange: 'From the $400s – $5M+',
    residences: 320,
    image: {
      src: '/images/community-bonita-bay.jpg',
      alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
    },
  },
  'valencia-bonita': {
    slug: 'valencia-bonita',
    name: 'Valencia Bonita',
    locality: 'Bonita Springs · 55+ gated',
    rating: 4.9,
    reviews: 83,
    priceRange: 'From the $500s – $1M',
    residences: 410,
    image: {
      src: '/images/community-valencia-bonita.jpg',
      alt: 'The resort clubhouse at Valencia Bonita, framed by royal palms',
    },
  },
  'valencia-trails': {
    slug: 'valencia-trails',
    name: 'Valencia Trails',
    locality: 'Naples · 55+ gated',
    rating: 4.7,
    reviews: 41,
    priceRange: 'From the $600s – $1.3M',
    residences: 275,
    image: {
      src: '/images/community-valencia-trails.jpg',
      alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
    },
  },
  'seaside-cove': {
    slug: 'seaside-cove',
    name: 'Seaside Cove',
    locality: 'Naples · waterfront gated',
    rating: 4.7,
    reviews: 38,
    priceRange: 'From the $500s – $3M',
    residences: 240,
    image: {
      src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1100&q=72',
      alt: 'Waterfront residences along a Naples bayfront at golden hour in Seaside Cove',
    },
  },
  'coral-lagoon': {
    slug: 'coral-lagoon',
    name: 'Coral Lagoon',
    locality: 'Estero · lagoon & lakes',
    rating: 4.6,
    reviews: 29,
    priceRange: 'From the $400s – $1.6M',
    residences: 360,
    image: {
      src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1100&q=72',
      alt: 'A turquoise resort lagoon ringed by palms and sand at Coral Lagoon',
    },
  },
  'mangrove-bay': {
    slug: 'mangrove-bay',
    name: 'Mangrove Bay',
    locality: 'Bonita Springs · boating & nature',
    rating: 4.8,
    reviews: 44,
    priceRange: 'From the $500s – $2.4M',
    residences: 290,
    image: {
      src: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1100&q=72',
      alt: 'A mangrove-lined waterway behind coastal homes at Mangrove Bay',
    },
  },
};

function toSimilar(s: Summary): SimilarCommunity {
  return {
    slug: s.slug,
    name: s.name,
    locality: s.locality,
    rating: s.rating,
    reviews: s.reviews,
    priceRange: s.priceRange,
    residences: s.residences,
    image: s.image,
  };
}

/** All communities except `slug`, as similar-nearby cards (the page uses 4). */
function similarTo(slug: string): SimilarCommunity[] {
  return Object.values(SUMMARIES)
    .filter((s) => s.slug !== slug)
    .map(toSimilar);
}

const BARS_DEFAULT: CommunityReviewBar[] = [
  { label: 'Amenities', pct: 97, score: '4.9' },
  { label: 'Location', pct: 96, score: '4.8' },
  { label: 'Community', pct: 94, score: '4.7' },
  { label: 'Value', pct: 90, score: '4.5' },
];

// ---------------------------------------------------------------------------
// Per-community records
// ---------------------------------------------------------------------------

const DETAILS: Record<string, CommunityDetail> = {
  'bonita-bay': {
    slug: 'bonita-bay',
    name: 'Bonita Bay',
    city: 'Bonita Springs',
    blurb:
      "A 2,400-acre gated enclave on the Gulf Coast, with five golf courses, a private marina, and a members' beach park.",
    rating: 4.8,
    reviews: 57,
    photoCount: 58,
    gallery: [
      {
        src: '/images/community-bonita-bay.jpg',
        alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
      },
      {
        src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1100&q=72',
        alt: "Aerial of Bonita Bay's resort pool and clubhouse",
      },
      {
        src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1100&q=72',
        alt: 'Screened lanai and private pool overlooking the preserve',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=72',
        alt: 'Bright white kitchen with island and stone counters',
      },
      {
        src: 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=900&q=72',
        alt: 'Aerial over the community marina and tennis courts',
      },
    ],
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
    models: [
      {
        name: 'The Estero',
        type: 'Coach Residence',
        beds: '2',
        baths: '2',
        sqft: '1,860',
        garage: '2',
        plan: 'a',
      },
      {
        name: 'The Imperial',
        type: 'Single-Family · Lakefront',
        beds: '3',
        baths: '3.5',
        sqft: '2,940',
        garage: '3',
        plan: 'b',
      },
    ],
    reviewBars: BARS_DEFAULT,
    reviewCards: [
      {
        quote:
          "The marina and the beach shuttle made the decision for us. We're on the water by nine and back for dinner at the club. It feels like a permanent vacation.",
        who: 'Margaret & Tom W.',
        meta: 'Residents since 2021',
      },
      {
        quote:
          'Five golf courses and a calendar I can’t keep up with. Eleanor walked every clubhouse with us before we ever wrote an offer — no pressure, just the right fit.',
        who: 'Charles B.',
        meta: 'Resident since 2022',
      },
    ],
    faqs: [
      {
        q: 'What is the average price of homes in Bonita Bay?',
        a: 'Prices range from the low $400,000s for coach residences to $5 million and above for waterfront single-family estates and full-floor tower condominiums. Most resales trade between $700,000 and $2 million depending on view and product type.',
      },
      {
        q: 'What kinds of homes are available in Bonita Bay?',
        a: 'Bonita Bay offers single-family homes, attached coach residences, and high-rise tower condominiums — many on the golf course, a lake, or with Gulf and bay views. New construction and resale are both available.',
      },
      {
        q: 'What amenities are available at Bonita Bay?',
        a: "Residents enjoy five championship golf courses, a full-service marina, a private members' beach park with shuttle, tennis and pickleball, a lifestyle and fitness center, resort pool and spa, waterfront dining, and twelve miles of nature trails.",
      },
      {
        q: 'Is Bonita Bay a gated community?',
        a: 'Yes. Bonita Bay is fully gated with three manned entry gates and round-the-clock community patrol across its 2,400 acres.',
      },
    ],
    phone: PHONE,
    phoneHref: PHONE_HREF,
    similar: similarTo('bonita-bay'),
  },

  'valencia-bonita': {
    slug: 'valencia-bonita',
    name: 'Valencia Bonita',
    city: 'Bonita Springs',
    blurb:
      'A 55+ gated resort community anchored by a 45,000-square-foot clubhouse, with tennis, pickleball, and a calendar built around its members.',
    rating: 4.9,
    reviews: 83,
    photoCount: 46,
    gallery: [
      {
        src: '/images/community-valencia-bonita.jpg',
        alt: 'The resort clubhouse at Valencia Bonita, framed by royal palms',
      },
      {
        src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1100&q=72',
        alt: 'A single-story villa with a tile roof and paver drive at Valencia Bonita',
      },
      {
        src: 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=900&q=72',
        alt: 'A landscaped courtyard entry framed by tropical plantings',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=72',
        alt: 'A bright open kitchen with quartz island and shaker cabinets',
      },
      {
        src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=72',
        alt: 'Resort pool deck with cabanas and lounge chairs',
      },
    ],
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
    models: [
      {
        name: 'The Camden',
        type: 'Villa · Single-Story',
        beds: '2',
        baths: '2',
        sqft: '1,760',
        garage: '2',
        plan: 'a',
      },
      {
        name: 'The Julia',
        type: 'Single-Family',
        beds: '3',
        baths: '3',
        sqft: '2,480',
        garage: '2',
        plan: 'b',
      },
    ],
    reviewBars: [
      { label: 'Amenities', pct: 99, score: '5.0' },
      { label: 'Community', pct: 97, score: '4.9' },
      { label: 'Location', pct: 95, score: '4.7' },
      { label: 'Value', pct: 92, score: '4.6' },
    ],
    reviewCards: [
      {
        quote:
          "We came for the clubhouse and stayed for the people. There's something on the calendar every single day, and the pickleball crowd adopted us in a week.",
        who: 'Linda & Ray P.',
        meta: 'Residents since 2020',
      },
      {
        quote:
          'Single-story, low-maintenance, and a five-star pool — exactly the second chapter we wanted. Eleanor found us a lake-view lot that never even hit the market.',
        who: 'Susan D.',
        meta: 'Resident since 2023',
      },
    ],
    faqs: [
      {
        q: 'Is Valencia Bonita a 55+ community?',
        a: 'Yes. Valencia Bonita is an age-qualified 55+ community; at least one resident of each home must be 55 or older, with standard occupancy guidelines for others.',
      },
      {
        q: 'What is the average price of homes in Valencia Bonita?',
        a: 'Homes generally range from the $500,000s for villas to just over $1 million for larger single-family floor plans with premium lake or preserve lots. Resale pricing depends on model, view, and upgrades.',
      },
      {
        q: 'What amenities does Valencia Bonita offer?',
        a: 'The 45,000-square-foot clubhouse anchors a resort pool, lap pool, tennis and pickleball, a fitness center with studios, a spa and wellness suite, an on-site restaurant and bar, and a full social calendar.',
      },
      {
        q: 'Is Valencia Bonita gated?',
        a: 'Yes. The community has a gated, 24-hour manned entry with controlled access throughout.',
      },
    ],
    phone: PHONE,
    phoneHref: PHONE_HREF,
    similar: similarTo('valencia-bonita'),
  },

  'valencia-trails': {
    slug: 'valencia-trails',
    name: 'Valencia Trails',
    city: 'Naples',
    blurb:
      'A newer 55+ gated community north of Naples, built around a resort clubhouse and a beach-entry pool minutes from the sand.',
    rating: 4.7,
    reviews: 41,
    photoCount: 39,
    gallery: [
      {
        src: '/images/community-valencia-trails.jpg',
        alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
      },
      {
        src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1100&q=72',
        alt: 'A new single-family home with a tile roof and palm-lined drive',
      },
      {
        src: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=900&q=72',
        alt: 'A decorated model great room with high ceilings and wood floors',
      },
      {
        src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=72',
        alt: 'Resort pool and cabanas beside the clubhouse',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=72',
        alt: 'A landscaped walking trail winding past lakes',
      },
    ],
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
    models: [
      {
        name: 'The Sabal',
        type: 'Single-Family',
        beds: '3',
        baths: '3',
        sqft: '2,340',
        garage: '2',
        plan: 'a',
      },
      {
        name: 'The Heron',
        type: 'Single-Family · Lakefront',
        beds: '3',
        baths: '2',
        sqft: '2,100',
        garage: '2',
        plan: 'b',
      },
    ],
    reviewBars: [
      { label: 'Amenities', pct: 96, score: '4.8' },
      { label: 'Location', pct: 94, score: '4.7' },
      { label: 'Community', pct: 93, score: '4.6' },
      { label: 'Value', pct: 91, score: '4.5' },
    ],
    reviewCards: [
      {
        quote:
          'A brand-new house but a community that already feels like home. The clubhouse opened the month we moved in and the pool has been our backyard ever since.',
        who: 'Gary & Anne M.',
        meta: 'Residents since 2022',
      },
      {
        quote:
          'Close enough to the Naples beaches, far enough to feel like our own world. Eleanor knew exactly which lakefront lots to chase — we got the one we wanted.',
        who: 'Patricia L.',
        meta: 'Resident since 2023',
      },
    ],
    faqs: [
      {
        q: 'Is Valencia Trails a 55+ community?',
        a: 'Yes. Valencia Trails is age-qualified; at least one resident of each home must be 55 or older.',
      },
      {
        q: 'What is the average price of homes in Valencia Trails?',
        a: 'New and resale single-family homes generally range from the $600,000s to about $1.3 million depending on floor plan, lot, and upgrades.',
      },
      {
        q: 'What amenities does Valencia Trails offer?',
        a: 'A 42,000-square-foot clubhouse anchors a beach-entry resort pool, tennis and pickleball, a fitness center and group studio, a day spa and salon, a café and social hall, and lakeside walking trails.',
      },
      {
        q: 'How close is Valencia Trails to the beach?',
        a: 'The community sits north of Naples within a short drive of the Gulf beaches, with shopping and dining minutes away.',
      },
    ],
    phone: PHONE,
    phoneHref: PHONE_HREF,
    similar: similarTo('valencia-trails'),
  },

  'seaside-cove': {
    slug: 'seaside-cove',
    name: 'Seaside Cove',
    city: 'Naples',
    blurb:
      'A waterfront gated community on a protected Naples cove, with boat slips, a beach club, and walkable access to the Gulf.',
    rating: 4.7,
    reviews: 38,
    photoCount: 44,
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1100&q=72',
        alt: 'Waterfront residences along a Naples bayfront at golden hour in Seaside Cove',
      },
      {
        src: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1100&q=72',
        alt: 'A waterfront condominium with a wide screened balcony over the cove',
      },
      {
        src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=72',
        alt: 'A row of private boat slips along the community dock',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=72',
        alt: 'A bright coastal kitchen with white cabinetry and a sea-glass backsplash',
      },
      {
        src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=72',
        alt: 'A beach club pavilion and pool deck facing the Gulf',
      },
    ],
    facts: [
      { label: 'Price Range', value: 'From the $500s – $3M' },
      { label: 'Total Residences', value: '240 homes' },
      { label: 'Year Built', value: '2008 – Present' },
      { label: 'Home Types', value: 'Condo · Villa · Single-Family' },
      { label: 'Gated', value: 'Yes · waterfront entry' },
      { label: 'Boating', value: 'Deeded slips · direct Gulf' },
    ],
    about: [
      'Tucked onto a protected cove just south of Old Naples, **Seaside Cove** is a waterfront gated community for people whose mornings start on the water. Deeded boat slips give direct, no-bridge access to the Gulf, and a private beach club sits a short walk from every front door.',
      'Homes range from low-rise coastal condominiums with wide water-view balconies to a handful of single-family residences along the seawall. The architecture is light and breezy — white trim, metal roofs, deep shaded porches — built for salt air and easy living.',
      "It's the rare Naples address where you can keep a boat at your back door and still walk to dinner — and MVP Realty knows which slips, views, and floor plans are worth waiting for.",
    ],
    amenities: [
      { icon: 'marina', title: 'Deeded Boat Slips · Direct Gulf' },
      { icon: 'beach', title: 'Private Beach Club' },
      { icon: 'pool', title: 'Waterfront Resort Pool' },
      { icon: 'racquet', title: 'Har-Tru Tennis Courts' },
      { icon: 'fitness', title: 'Fitness & Yoga Pavilion' },
      { icon: 'dining', title: 'Dockside Dining & Bar' },
      { icon: 'dog', title: 'Kayak & Paddle Launch' },
      { icon: 'gate', title: 'Gated · Waterfront Entry' },
    ],
    clubs: [
      'Boating & Yacht Club',
      'Sunset Sail Society',
      'Beach Yoga',
      'Fishing Club',
      'Tennis Round Robin',
      'Paddle & Kayak Group',
      'Wine on the Water',
      'Shell & Nature Walks',
      'Supper Club',
      'Photography Circle',
      'Book Club',
      'Coastal Cleanup Crew',
    ],
    models: [
      {
        name: 'The Mariner',
        type: 'Waterfront Condominium',
        beds: '2',
        baths: '2',
        sqft: '1,480',
        garage: '1',
        plan: 'a',
      },
      {
        name: 'The Anchorage',
        type: 'Single-Family · Seawall',
        beds: '3',
        baths: '3.5',
        sqft: '2,940',
        garage: '2',
        plan: 'b',
      },
    ],
    reviewBars: [
      { label: 'Location', pct: 98, score: '4.9' },
      { label: 'Amenities', pct: 94, score: '4.7' },
      { label: 'Community', pct: 92, score: '4.6' },
      { label: 'Value', pct: 88, score: '4.4' },
    ],
    reviewCards: [
      {
        quote:
          "We keep the boat at the dock behind us and walk to the beach club for dinner. There's nothing else like it this close to Old Naples.",
        who: 'Mark & Diane H.',
        meta: 'Residents since 2019',
      },
      {
        quote:
          'The water views sold us, but the people kept us. Eleanor found a corner unit with a slip we could keep our 32-footer in — exactly what we asked for.',
        who: 'Robert K.',
        meta: 'Resident since 2021',
      },
    ],
    faqs: [
      {
        q: 'Does Seaside Cove offer boat slips?',
        a: 'Yes. Many residences include deeded boat slips with direct, no-bridge access to the Gulf, and additional slips are available within the community marina.',
      },
      {
        q: 'What is the average price of homes in Seaside Cove?',
        a: 'Coastal condominiums generally start in the $500,000s, while waterfront villas and single-family homes along the seawall range up to about $3 million depending on view and dockage.',
      },
      {
        q: 'What amenities are available at Seaside Cove?',
        a: 'Residents enjoy a private beach club, a waterfront resort pool, Har-Tru tennis, a fitness and yoga pavilion, dockside dining, a kayak and paddle launch, and deeded boat slips.',
      },
      {
        q: 'Is Seaside Cove a gated community?',
        a: 'Yes. Seaside Cove is fully gated with a controlled waterfront entry and community patrol.',
      },
    ],
    phone: PHONE,
    phoneHref: PHONE_HREF,
    similar: similarTo('seaside-cove'),
  },

  'coral-lagoon': {
    slug: 'coral-lagoon',
    name: 'Coral Lagoon',
    city: 'Estero',
    blurb:
      'A resort-lagoon community in Estero built around a turquoise Crystal Lagoon, with white-sand beaches and family-friendly amenities.',
    rating: 4.6,
    reviews: 29,
    photoCount: 41,
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1100&q=72',
        alt: 'A turquoise resort lagoon ringed by palms and white sand at Coral Lagoon',
      },
      {
        src: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1100&q=72',
        alt: 'A single-family home with a paver driveway and tile roof at Coral Lagoon',
      },
      {
        src: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=900&q=72',
        alt: 'A bright open-plan great room with lagoon views',
      },
      {
        src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=72',
        alt: 'A sandy lagoon beach with cabanas and lounge chairs',
      },
      {
        src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=72',
        alt: 'A modern clubhouse and pool deck beside the lagoon',
      },
    ],
    facts: [
      { label: 'Price Range', value: 'From the $400s – $1.6M' },
      { label: 'Total Residences', value: '360 homes' },
      { label: 'Year Built', value: '2019 – Present' },
      { label: 'Home Types', value: 'Villa · Single-Family' },
      { label: 'Gated', value: 'Yes · controlled entry' },
      { label: 'Lagoon', value: '5-acre Crystal Lagoon' },
    ],
    about: [
      'In fast-growing Estero, **Coral Lagoon** is built around something you usually have to fly to find: a five-acre turquoise Crystal Lagoon with white-sand beaches, swim-up zones, and paddle craft, right in the middle of the neighborhood.',
      'Around the water sits a relaxed mix of villas and single-family homes — contemporary, open, and built for indoor-outdoor Florida living. The vibe is bright and social, with a beach club, a café, and a calendar that works for snowbirds, families, and year-round residents alike.',
      'For buyers who want resort energy without resort prices, Coral Lagoon is one of the best values on the Gulf Coast — and MVP Realty keeps a close eye on every new release and resale here.',
    ],
    amenities: [
      { icon: 'beach', title: '5-Acre Crystal Lagoon & Beaches' },
      { icon: 'pool', title: 'Resort Pool & Splash Zone' },
      { icon: 'dog', title: 'Kayak & Paddleboard Launch' },
      { icon: 'racquet', title: 'Pickleball & Tennis Courts' },
      { icon: 'fitness', title: 'Fitness Center & Studio' },
      { icon: 'dining', title: 'Lagoon Café & Bar' },
      { icon: 'trails', title: 'Lakeside Walking Paths' },
      { icon: 'gate', title: 'Gated · Controlled Entry' },
    ],
    clubs: [
      'Paddle & Kayak Club',
      'Beach Volleyball',
      'Pickleball League',
      'Aqua Fitness',
      'Family Movie Nights',
      'Food Truck Fridays',
      'Yoga by the Lagoon',
      'Cornhole League',
      'Garden Club',
      'Wine & Social',
      'Book Club',
      'Volunteer Crew',
    ],
    models: [
      {
        name: 'The Reef',
        type: 'Villa · Single-Story',
        beds: '2',
        baths: '2.5',
        sqft: '1,920',
        garage: '2',
        plan: 'a',
      },
      {
        name: 'The Lagoon',
        type: 'Single-Family',
        beds: '3',
        baths: '3',
        sqft: '2,560',
        garage: '2',
        plan: 'b',
      },
    ],
    reviewBars: [
      { label: 'Amenities', pct: 95, score: '4.8' },
      { label: 'Value', pct: 94, score: '4.7' },
      { label: 'Community', pct: 90, score: '4.5' },
      { label: 'Location', pct: 88, score: '4.4' },
    ],
    reviewCards: [
      {
        quote:
          'The lagoon is exactly as ridiculous as it looks in the photos — in the best way. Our grandkids think we live at a resort, and honestly so do we.',
        who: 'Dennis & Carol T.',
        meta: 'Residents since 2021',
      },
      {
        quote:
          'Best value we toured in all of Southwest Florida. Eleanor lined up three floor plans in one afternoon and never once pushed us — we bought the one we loved.',
        who: 'Angela R.',
        meta: 'Resident since 2022',
      },
    ],
    faqs: [
      {
        q: 'What is the Crystal Lagoon at Coral Lagoon?',
        a: 'It is a five-acre, crystal-clear swimming lagoon with white-sand beaches, swim zones, and paddle craft at the center of the community — a private, resort-style waterfront for residents.',
      },
      {
        q: 'What is the average price of homes in Coral Lagoon?',
        a: 'Villas generally start in the $400,000s, with larger single-family homes ranging up to about $1.6 million depending on floor plan, lot, and proximity to the lagoon.',
      },
      {
        q: 'What amenities does Coral Lagoon offer?',
        a: 'The Crystal Lagoon and beaches anchor a resort pool and splash zone, kayak and paddleboard launch, pickleball and tennis, a fitness center, a lagoon café and bar, and walking paths.',
      },
      {
        q: 'Is Coral Lagoon a gated community?',
        a: 'Yes. Coral Lagoon is gated with a controlled entry and is family-friendly with no age restriction.',
      },
    ],
    phone: PHONE,
    phoneHref: PHONE_HREF,
    similar: similarTo('coral-lagoon'),
  },

  'mangrove-bay': {
    slug: 'mangrove-bay',
    name: 'Mangrove Bay',
    city: 'Bonita Springs',
    blurb:
      'A low-density boating community along the mangrove waterways of Bonita Springs, with private docks and direct access to Estero Bay.',
    rating: 4.8,
    reviews: 44,
    photoCount: 37,
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1100&q=72',
        alt: 'A mangrove-lined waterway behind coastal homes at Mangrove Bay',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=72',
        alt: 'A coastal home at dusk with a private dock at Mangrove Bay',
      },
      {
        src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=72',
        alt: 'A screened lanai and pool overlooking a mangrove waterway',
      },
      {
        src: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=900&q=72',
        alt: 'A bright great room with vaulted ceilings opening to the water',
      },
      {
        src: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=72',
        alt: 'Kayaks staged at a community launch beside the mangroves',
      },
    ],
    facts: [
      { label: 'Price Range', value: 'From the $500s – $2.4M' },
      { label: 'Total Residences', value: '290 homes' },
      { label: 'Year Built', value: '2012 – Present' },
      { label: 'Home Types', value: 'Villa · Single-Family' },
      { label: 'Gated', value: 'Yes · low-density' },
      { label: 'Boating', value: 'Private docks · Estero Bay' },
    ],
    about: [
      'Threaded along the tidal creeks where Bonita Springs meets Estero Bay, **Mangrove Bay** is a quiet, low-density boating community for people who measure a good day by the tide chart. Many homes back to a private dock with direct, protected access to the bay and the Gulf beyond.',
      'This is the unhurried end of the Gulf-Coast spectrum: generous lots, single-family homes and villas tucked among preserves, and a strong conservation ethic that keeps the mangroves and wildlife front and center. Kayak and paddle launches sit minutes from every street.',
      'For boaters and naturalists who want privacy without leaving town, Mangrove Bay is a quiet gem — and MVP Realty knows which homesites carry the deep-water access and dockage worth holding out for.',
    ],
    amenities: [
      { icon: 'marina', title: 'Private Docks · Estero Bay Access' },
      { icon: 'dog', title: 'Kayak & Paddleboard Launches' },
      { icon: 'pool', title: 'Community Pool & Spa' },
      { icon: 'racquet', title: 'Tennis & Pickleball Courts' },
      { icon: 'fitness', title: 'Fitness & Wellness Center' },
      { icon: 'trails', title: 'Mangrove Nature Boardwalks' },
      { icon: 'dining', title: 'Boathouse Social Pavilion' },
      { icon: 'gate', title: 'Gated · Low-Density Entry' },
    ],
    clubs: [
      'Boating & Cruising Club',
      'Fishing Society',
      'Kayak & Paddle Group',
      'Birding & Nature Walks',
      'Tennis Round Robin',
      'Sunset Social',
      'Conservation Volunteers',
      'Photography Circle',
      'Wine & Supper Club',
      'Yoga on the Dock',
      'Book Club',
      'Coastal Cleanup Crew',
    ],
    models: [
      {
        name: 'The Egret',
        type: 'Single-Family · Waterfront',
        beds: '4',
        baths: '3.5',
        sqft: '3,010',
        garage: '3',
        plan: 'b',
      },
      {
        name: 'The Tidewater',
        type: 'Villa · Single-Story',
        beds: '2',
        baths: '2.5',
        sqft: '2,210',
        garage: '2',
        plan: 'a',
      },
    ],
    reviewBars: [
      { label: 'Location', pct: 97, score: '4.9' },
      { label: 'Community', pct: 95, score: '4.8' },
      { label: 'Amenities', pct: 92, score: '4.6' },
      { label: 'Value', pct: 90, score: '4.5' },
    ],
    reviewCards: [
      {
        quote:
          'We back to a creek and keep the skiff at our own dock. Dolphins most mornings, manatees in winter. It feels a hundred miles from anywhere and it’s ten minutes to town.',
        who: 'Bill & Joan F.',
        meta: 'Residents since 2018',
      },
      {
        quote:
          'Privacy, water access, and big lots — exactly what we couldn’t find anywhere else. Eleanor held out for the deep-water lot we wanted and it was worth the wait.',
        who: 'Steven M.',
        meta: 'Resident since 2020',
      },
    ],
    faqs: [
      {
        q: 'Does Mangrove Bay have boat access?',
        a: 'Yes. Many homes back to a private dock with direct, protected access to Estero Bay and the Gulf, and the community maintains kayak and paddleboard launches.',
      },
      {
        q: 'What is the average price of homes in Mangrove Bay?',
        a: 'Villas generally start in the $500,000s, while larger waterfront single-family homes with deep-water dockage range up to about $2.4 million.',
      },
      {
        q: 'What amenities does Mangrove Bay offer?',
        a: 'Residents enjoy private docks with bay access, kayak and paddle launches, a community pool and spa, tennis and pickleball, a fitness center, mangrove nature boardwalks, and a boathouse social pavilion.',
      },
      {
        q: 'Is Mangrove Bay a gated community?',
        a: 'Yes. Mangrove Bay is a gated, low-density community with a strong conservation focus across its preserves and waterways.',
      },
    ],
    phone: PHONE,
    phoneHref: PHONE_HREF,
    similar: similarTo('mangrove-bay'),
  },
};

/** All detail slugs — drives `generateStaticParams`. */
export const COMMUNITY_DETAIL_SLUGS = Object.keys(DETAILS);

/** Lookup helper for `/communities/[slug]`. Returns `undefined` for unknown slugs. */
export function getCommunityDetail(slug: string): CommunityDetail | undefined {
  return DETAILS[slug];
}
