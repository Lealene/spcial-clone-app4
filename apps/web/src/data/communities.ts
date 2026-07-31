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
    tags: ['Golf & Marina', 'Gated', 'Beach Park'],
    nowSelling: 14,
    image: {
      src: '/images/community-bonita-bay.jpg',
      alt: "Bonita Bay's landmark stone entrance monument framed by oaks and flowering beds",
    },
  },
  {
    slug: 'valencia-bonita',
    name: 'Valencia Bonita',
    locality: 'Bonita Springs · 55+ gated',
    priceRange: 'From the $500s – $1M',
    tags: ['55+ Gated', 'Resort Clubhouse', 'Tennis & Pickleball'],
    nowSelling: 22,
    image: {
      src: '/images/community-valencia-bonita.jpg',
      alt: 'The 45,000-square-foot resort clubhouse at Valencia Bonita, framed by royal palms',
    },
  },
  {
    slug: 'valencia-trails',
    name: 'Valencia Trails',
    locality: 'Naples · 55+ gated',
    priceRange: 'From the $600s – $1.3M',
    tags: ['New & Resale', '55+ Gated', 'Resort Pool'],
    nowSelling: 9,
    image: {
      src: '/images/community-valencia-trails.jpg',
      alt: 'Aerial of the resort-style beach-entry pool and clubhouse at Valencia Trails',
    },
  },
];
