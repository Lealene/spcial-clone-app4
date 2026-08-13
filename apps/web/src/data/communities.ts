import type { Community, HeroCommunity } from './types';

/** Compact set surfaced in the hero strip directly under the fold. */
export const heroCommunities: HeroCommunity[] = [
  {
    slug: 'bonita-bay',
    name: 'Bonita Bay',
    blurb: 'Bonita Springs · golf, marina & a private Gulf beach park',
  },
  {
    slug: 'valencia-bonita',
    name: 'Valencia Bonita',
    blurb: 'Bonita Springs · 55+ gated with a resort clubhouse',
  },
  {
    slug: 'valencia-trails',
    name: 'Valencia Trails',
    blurb: 'Naples · 55+ gated, resort pool minutes from the sand',
  },
];

export const featuredCommunities: Community[] = [
  {
    slug: 'bonita-bay',
    name: 'Bonita Bay',
    locality: 'Bonita Springs · private Gulf beach park',
    priceRange: 'From the $400s – $5M+',
    tags: [
      'Five Championship Golf Courses',
      'Full-Service Marina',
      'Private Beach Park & Shuttle',
      'Tennis & Pickleball Courts',
      'Lifestyle & Fitness Center',
      'Waterfront Dining & Social',
    ],
    nowSelling: 103,
    image: {
      src: 'https://pub-de584fcb52e3431f837b039818423714.r2.dev/seed-homepage--bonitaBay--978435a6e300.jpg',
      alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
    },
  },
  {
    slug: 'valencia-bonita',
    name: 'Valencia Bonita',
    locality: 'Bonita Springs · 55+ gated',
    priceRange: 'From the $500s – $1M',
    tags: [
      '45,000 Sq Ft Social Clubhouse',
      'Resort & Lap Pools',
      'Tennis & Pickleball Courts',
      'Fitness Center & Studios',
      'Spa & Wellness Suite',
      'On-Site Restaurant & Bar',
    ],
    nowSelling: 18,
    image: {
      src: 'https://pub-de584fcb52e3431f837b039818423714.r2.dev/46823846_281274406064033_6998392021895348224_n.jpg',
      alt: 'The resort clubhouse at Valencia Bonita, framed by royal palms',
    },
  },
  {
    slug: 'valencia-trails',
    name: 'Valencia Trails',
    locality: 'Naples · 55+ gated',
    priceRange: 'From the $600s – $1.3M',
    tags: [
      '42,000 Sq Ft Resort Clubhouse',
      'Beach-Entry Resort Pool',
      'Tennis & Pickleball Courts',
      'Fitness Center & Group Studio',
      'Day Spa & Salon',
      'Café & Social Hall',
    ],
    nowSelling: 23,
    image: {
      src: 'https://pub-de584fcb52e3431f837b039818423714.r2.dev/seed-homepage--valenciaTrails--3a96abcb0c6b.jpg',
      alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
    },
  },
];

export const communityListingCountsFallback = new Map(
  featuredCommunities.map((community) => [community.slug, community.nowSelling]),
);
