import type { Residence } from './types';
import { unsplash } from './images';

export const featuredResidences: Residence[] = [
  {
    slug: 'the-anchorage',
    name: 'The Anchorage',
    locality: 'Seaside Cove · Naples',
    price: 1450000,
    priceLabel: 'From $1,450,000',
    beds: 3,
    baths: 3.5,
    sqft: 2940,
    badge: 'Now Selling',
    image: {
      src: unsplash('1613977257363-707ba9348227', 1100),
      alt: 'Seaside Cove residence framed by royal palms',
    },
  },
  {
    slug: 'lakeside-villa',
    name: 'Lakeside Villa',
    locality: 'Mangrove Bay · Bonita Springs',
    price: 865000,
    priceLabel: 'From $865,000',
    beds: 2,
    baths: 2.5,
    sqft: 2210,
    badge: '55+ Living',
    image: {
      src: unsplash('1600585154340-be6161a56a0c', 1100),
      alt: 'Mangrove Bay lakefront villa at dusk',
    },
  },
  {
    slug: 'the-lagoon-model',
    name: 'The Lagoon Model',
    locality: 'Coral Lagoon · Estero',
    price: 920000,
    priceLabel: 'From $920,000',
    beds: 3,
    baths: 3,
    sqft: 2560,
    badge: 'New Model Open',
    image: {
      src: unsplash('1600566753086-00f18fb6b3ea', 1100),
      alt: 'Coral Lagoon decorated model interior',
    },
  },
];
