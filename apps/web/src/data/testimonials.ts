import type { Testimonial } from './types';

export const testimonials: Testimonial[] = [
  {
    slug: 'whitfield',
    name: 'Margaret & Tom Whitfield',
    location: 'Residents · Seaside Cove, Naples',
    quote:
      'We came for the lanai and the sunsets. We stayed because, for the first time in years, our calendar is full of people we love.',
    portrait: {
      src: 'https://pub-de584fcb52e3431f837b039818423714.r2.dev/seed-communities--bbLanai--3665c32d67fd.jpg',
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
      src: 'https://pub-de584fcb52e3431f837b039818423714.r2.dev/seed-homepage--valenciaBonita--3eb3d823fa06.jpg',
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
      src: 'https://pub-de584fcb52e3431f837b039818423714.r2.dev/seed-homepage--valenciaTrails--3a96abcb0c6b.jpg',
      alt: 'Portrait of Charles and Ruth Bennett',
    },
  },
];
