import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { enabledField } from '../fields/enabled';
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
    enabledField(),
    anchorIdField('amenities'),
    sectionHeaderField(),
    mediaField({
      name: 'featureImage',
      required: true,
      description: 'Large landscape feature image.',
    }),
    { name: 'featureTitle', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    {
      name: 'featureCaption',
      type: 'textarea',
      required: true,
      maxLength: CMS_TEXT_LIMITS.shortCopy,
    },
    {
      name: 'amenities',
      type: 'array',
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.amenities.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.amenities.max,
      admin: { description: 'Recommended: 1-6 amenity cards.' },
      fields: [
        { name: 'icon', type: 'select', required: true, options: amenityIcons },
        { name: 'title', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        {
          name: 'blurb',
          type: 'textarea',
          required: true,
          maxLength: CMS_TEXT_LIMITS.shortCopy,
        },
      ],
    },
    { name: 'emptyStateHeading', type: 'text', admin: { hidden: true } },
    { name: 'emptyStateBody', type: 'textarea', admin: { hidden: true } },
  ],
};
