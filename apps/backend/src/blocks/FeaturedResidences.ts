import type { Block } from 'payload';

import { ctaField } from '../fields/cta';
import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';
import { sectionHeaderField } from '../fields/sectionHeader';

export const FeaturedResidencesBlock: Block = {
  slug: 'featuredResidences',
  interfaceName: 'FeaturedResidencesBlock',
  labels: {
    singular: 'Featured residences',
    plural: 'Featured residences',
  },
  fields: [
    { name: 'anchorId', type: 'text', defaultValue: 'listings' },
    sectionHeaderField(),
    {
      name: 'sourceMode',
      type: 'select',
      defaultValue: 'manual',
      options: [{ label: 'Manual', value: 'manual' }],
      admin: { description: 'Selected/query modes are added after listings exist.' },
    },
    {
      name: 'manualListings',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      admin: { description: 'Residence cards. Images should be 4:3.' },
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'locality', type: 'text', required: true },
        { name: 'price', type: 'number' },
        { name: 'priceLabel', type: 'text', required: true },
        { name: 'beds', type: 'number', required: true },
        { name: 'bedsLabel', type: 'text', defaultValue: 'Beds' },
        { name: 'baths', type: 'number', required: true },
        { name: 'bathsLabel', type: 'text', defaultValue: 'Baths' },
        { name: 'sqft', type: 'number', required: true },
        { name: 'sqftLabel', type: 'text', defaultValue: 'Sq Ft' },
        { name: 'badge', type: 'text', required: true },
        mediaField({
          name: 'image',
          required: true,
          description: 'Recommended aspect ratio: 4:3.',
        }),
        linkField({ required: true }),
      ],
    },
    { name: 'cardCtaLabel', type: 'text', defaultValue: 'View residence' },
    ctaField({ name: 'moreLink', label: 'More link' }),
    { name: 'emptyStateHeading', type: 'text' },
    { name: 'emptyStateBody', type: 'textarea' },
  ],
};
