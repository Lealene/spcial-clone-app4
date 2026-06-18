import type { Block } from 'payload';

import { mediaField } from '../fields/media';

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    singular: 'Testimonials',
    plural: 'Testimonials',
  },
  fields: [
    { name: 'anchorId', type: 'text', defaultValue: 'testimonials' },
    { name: 'kicker', type: 'text', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'headingAccent', type: 'text' },
    { name: 'headingSuffix', type: 'text' },
    {
      name: 'stories',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      admin: { description: 'Recommended: 1-8 stories. Portraits should be 4:5.' },
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'location', type: 'text', required: true },
        { name: 'quote', type: 'textarea', required: true },
        mediaField({
          name: 'portrait',
          required: true,
          description: 'Recommended aspect ratio: 4:5.',
        }),
        { name: 'tabAriaLabel', type: 'text' },
      ],
    },
    { name: 'carouselAutoPlay', type: 'checkbox', defaultValue: true },
    { name: 'carouselIntervalMs', type: 'number', defaultValue: 6500 },
    { name: 'previousLabel', type: 'text', defaultValue: 'Previous story' },
    { name: 'nextLabel', type: 'text', defaultValue: 'Next story' },
    { name: 'tabListLabel', type: 'text', defaultValue: 'Choose a resident story' },
    { name: 'counterSeparator', type: 'text', defaultValue: '/' },
    { name: 'emptyStateHeading', type: 'text' },
    { name: 'emptyStateBody', type: 'textarea' },
  ],
};
