import type { Block } from 'payload';

import { mediaField } from '../fields/media';
import { sectionHeaderField } from '../fields/sectionHeader';

const amenityIcons = [
  { label: 'Pool', value: 'pool' },
  { label: 'Racquet', value: 'racquet' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'Dining', value: 'dining' },
  { label: 'Trails', value: 'trails' },
  { label: 'Calendar', value: 'calendar' },
];

export const AmenitiesBlock: Block = {
  slug: 'amenities',
  interfaceName: 'AmenitiesBlock',
  labels: {
    singular: 'Amenities',
    plural: 'Amenities',
  },
  fields: [
    { name: 'anchorId', type: 'text', defaultValue: 'amenities' },
    sectionHeaderField(),
    mediaField({
      name: 'featureImage',
      required: true,
      description: 'Large landscape feature image.',
    }),
    { name: 'featureTitle', type: 'text', required: true },
    { name: 'featureCaption', type: 'textarea', required: true },
    {
      name: 'amenities',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      admin: { description: 'Recommended: 1-6 amenity cards.' },
      fields: [
        { name: 'icon', type: 'select', required: true, options: amenityIcons },
        { name: 'title', type: 'text', required: true },
        { name: 'blurb', type: 'textarea', required: true },
      ],
    },
    { name: 'emptyStateHeading', type: 'text' },
    { name: 'emptyStateBody', type: 'textarea' },
  ],
};
