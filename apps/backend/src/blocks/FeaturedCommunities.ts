import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { ctaField } from '../fields/cta';
import { enabledField } from '../fields/enabled';
import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';
import { integerValidator } from '../fields/number';
import { sectionHeaderField } from '../fields/sectionHeader';

export const FeaturedCommunitiesBlock: Block = {
  slug: 'featuredCommunities',
  interfaceName: 'FeaturedCommunitiesBlock',
  labels: {
    singular: 'Featured communities',
    plural: 'Featured communities',
  },
  fields: [
    enabledField(),
    anchorIdField('communities'),
    sectionHeaderField(),
    {
      name: 'sourceMode',
      type: 'select',
      defaultValue: 'manual',
      options: [{ label: 'Manual', value: 'manual' }],
      admin: {
        hidden: true,
        description: 'Reserved for selected/query modes after communities exist.',
      },
    },
    {
      name: 'manualCommunities',
      type: 'array',
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.featuredCommunities.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.featuredCommunities.max,
      admin: { description: 'Community cards. Images should be 16:11.' },
      fields: [
        { name: 'slug', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.slug },
        { name: 'name', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        { name: 'locality', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        { name: 'rating', type: 'number', required: true, min: 0, max: 5 },
        { name: 'reviews', type: 'number', required: true, min: 0, validate: integerValidator },
        {
          name: 'reviewsLabel',
          type: 'text',
          defaultValue: 'reviews',
          maxLength: CMS_TEXT_LIMITS.label,
        },
        {
          name: 'priceRange',
          type: 'text',
          required: true,
          maxLength: CMS_TEXT_LIMITS.label,
        },
        {
          name: 'tags',
          type: 'array',
          maxRows: CMS_PAGE_BLOCK_LIMITS.communityTags.max,
          fields: [
            { name: 'label', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
          ],
        },
        {
          name: 'residences',
          type: 'number',
          required: true,
          min: 0,
          validate: integerValidator,
        },
        {
          name: 'residencesLabel',
          type: 'text',
          defaultValue: 'residences',
          maxLength: CMS_TEXT_LIMITS.label,
        },
        {
          name: 'nowSelling',
          type: 'number',
          required: true,
          min: 0,
          validate: integerValidator,
        },
        {
          name: 'nowSellingLabel',
          type: 'text',
          defaultValue: 'now selling',
          maxLength: CMS_TEXT_LIMITS.label,
        },
        mediaField({
          name: 'image',
          required: true,
          description: 'Recommended aspect ratio: 16:11.',
        }),
        linkField({ required: true, requireLabel: false, hideLabel: true }),
      ],
    },
    ctaField({ name: 'moreLink', label: 'More link' }),
    { name: 'emptyStateHeading', type: 'text', admin: { hidden: true } },
    { name: 'emptyStateBody', type: 'textarea', admin: { hidden: true } },
  ],
};
