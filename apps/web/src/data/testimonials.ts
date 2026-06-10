import type { Testimonial } from './types';
import { unsplash } from './images';

export const testimonials: Testimonial[] = [
  {
    slug: 'whitfield',
    name: 'Margaret & Tom Whitfield',
    location: 'Residents · Seaside Cove, Naples',
    quote:
      'We came for the lanai and the sunsets. We stayed because, for the first time in years, our calendar is full of people we love.',
    portrait: {
      src: unsplash('1566616213894-2d4e1baee5d8', 900),
      alt: 'Portrait of Margaret and Tom Whitfield',
    },
  },
  {
    slug: 'alvarez',
    name: 'Diane Alvarez',
    location: 'Resident · Mangrove Bay, Bonita Springs',
    quote:
      'I worried about starting over at sixty-six. By the second week I had a pickleball partner, a book club, and a standing dinner. I worried about nothing.',
    portrait: {
      src: unsplash('1551836022-deb4988cc6c0', 900),
      alt: 'Portrait of Diane Alvarez',
    },
  },
  {
    slug: 'bennett',
    name: 'Charles & Ruth Bennett',
    location: 'Residents · Palm Reserve, Marco Island',
    quote:
      'The concierge handled the move down to the last box. We spent our first weekend on the courts, not unpacking. That was the whole difference.',
    portrait: {
      src: unsplash('1560250097-0b93528c311a', 900),
      alt: 'Portrait of Charles and Ruth Bennett',
    },
  },
  {
    slug: 'petrakis',
    name: 'Sofia Petrakis',
    location: 'Resident · Heron Point, Naples',
    quote:
      "The maintenance team treats our place like their own. A storm passed through and the shutters were down before we'd even thought to call. We never lose a night's sleep over the house.",
    portrait: {
      src: unsplash('1573497019940-1c28c88b4f3e', 900),
      alt: 'Portrait of Sofia Petrakis',
    },
  },
  {
    slug: 'okafor',
    name: 'James & Adaeze Okafor',
    location: 'Residents · Coral Lagoon, Estero',
    quote:
      'Our grandkids ask to visit now. The pool, the lake, the ice-cream socials on Fridays. They think we moved to a resort. Honestly, so do we.',
    portrait: {
      src: unsplash('1545167622-3a6ac756afa4', 900),
      alt: 'Portrait of James and Adaeze Okafor',
    },
  },
  {
    slug: 'bianchi',
    name: 'Eleanor Bianchi',
    location: 'Resident · Mangrove Bay, Bonita Springs',
    quote:
      'I came down on my own after losing my husband. I expected quiet. Instead I found a table that saved me a seat the very first week. This place gave me my people back.',
    portrait: {
      src: unsplash('1592621385612-4d7129426394', 900),
      alt: 'Portrait of Eleanor Bianchi',
    },
  },
];
