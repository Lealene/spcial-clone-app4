import type { Residence } from './types';

/**
 * CMS seed / fixture cards for the featuredResidences block schema.
 * The live homepage rail ignores these and renders Payload listings with
 * `isFeatured: true` instead.
 */
export const featuredResidences: Residence[] = [
  {
    slug: 'bonita-bay-featured',
    name: 'Gulf-front coach home',
    locality: 'Bonita Bay · Bonita Springs',
    price: 1450000,
    priceLabel: 'From $1,450,000',
    beds: 3,
    baths: 3.5,
    sqft: 2940,
    badge: 'Featured',
    image: {
      src: '/images/community-bonita-bay.jpg',
      alt: 'Bonita Bay residence framed by oaks and flowering beds',
    },
  },
  {
    slug: 'valencia-bonita-featured',
    name: 'Resort villa',
    locality: 'Valencia Bonita · Bonita Springs',
    price: 865000,
    priceLabel: 'From $865,000',
    beds: 2,
    baths: 2.5,
    sqft: 2210,
    badge: '55+ Living',
    image: {
      src: '/images/community-valencia-bonita.jpg',
      alt: 'Valencia Bonita villa near the resort clubhouse',
    },
  },
  {
    slug: 'valencia-trails-featured',
    name: 'Pool home',
    locality: 'Valencia Trails · Naples',
    price: 920000,
    priceLabel: 'From $920,000',
    beds: 3,
    baths: 3,
    sqft: 2560,
    badge: 'New Listing',
    image: {
      src: '/images/community-valencia-trails.jpg',
      alt: 'Valencia Trails home near the resort-style pool',
    },
  },
];
