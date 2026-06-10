import type { LifestyleTile } from './types';
import { unsplash } from './images';

export const lifestyleTiles: LifestyleTile[] = [
  {
    caption: 'Doubles at nine, coffee after',
    image: {
      src: unsplash('1626224583764-f87db24ac4ea', 1100),
      alt: 'Four neighbors mid-rally in a friendly doubles pickleball match',
    },
  },
  {
    caption: 'Thursday wine on the terrace',
    image: {
      src: unsplash('1511795409834-ef04bbd61622', 1100),
      alt: 'Residents raising their glasses together at a clubhouse wine evening',
    },
  },
  {
    caption: 'Live music on the lawn',
    image: {
      src: unsplash('1429962714451-bb934ecdc4ec', 1100),
      alt: 'Couples dancing on the lawn at an outdoor live-music night',
    },
  },
];
