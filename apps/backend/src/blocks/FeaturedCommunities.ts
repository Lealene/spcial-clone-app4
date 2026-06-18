import type { Block } from 'payload';

import { ctaField } from '../fields/cta';
import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';
import { sectionHeaderField } from '../fields/sectionHeader';

export const FeaturedCommunitiesBlock: Block = {
  slug: 'featuredCommunities',
  interfaceName: 'FeaturedCommunitiesBlock',
  labels: {
    singular: 'Featured communities',
    plural: 'Featured communities',
  },
  fields: [
    { name: 'anchorId', type: 'text', defaultValue: 'communities' },
    sectionHeaderField(),
    {
      name: 'sourceMode',
      type: 'select',
      defaultValue: 'manual',
      options: [{ label: 'Manual', value: 'manual' }],
      admin: { description: 'Selected/query modes are added after communities exist.' },
    },
    {
      name: 'manualCommunities',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      admin: { description: 'Community cards. Images should be 16:11.' },
      fields: [
        { name: 'slug', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'locality', type: 'text', required: true },
        { name: 'rating', type: 'number', required: true },
        { name: 'reviews', type: 'number', required: true },
        { name: 'reviewsLabel', type: 'text', defaultValue: 'reviews' },
        { name: 'priceRange', type: 'text', required: true },
        { name: 'tags', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
        { name: 'residences', type: 'number', required: true },
        { name: 'residencesLabel', type: 'text', defaultValue: 'residences' },
        { name: 'nowSelling', type: 'number', required: true },
        { name: 'nowSellingLabel', type: 'text', defaultValue: 'now selling' },
        mediaField({
          name: 'image',
          required: true,
          description: 'Recommended aspect ratio: 16:11.',
        }),
        linkField({ required: true }),
      ],
    },
    ctaField({ name: 'moreLink', label: 'More link' }),
    { name: 'emptyStateHeading', type: 'text' },
    { name: 'emptyStateBody', type: 'textarea' },
  ],
};
