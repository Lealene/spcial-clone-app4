import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { ctaField } from '../fields/cta';
import { enabledField } from '../fields/enabled';
import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';
import { integerValidator } from '../fields/number';
import { sectionHeaderField } from '../fields/sectionHeader';

export const FeaturedResidencesBlock: Block = {
  slug: 'featuredResidences',
  interfaceName: 'FeaturedResidencesBlock',
  labels: {
    singular: 'Featured residences',
    plural: 'Featured residences',
  },
  fields: [
    enabledField(),
    anchorIdField('listings'),
    sectionHeaderField(),
    {
      name: 'sourceMode',
      type: 'select',
      defaultValue: 'manual',
      options: [{ label: 'Manual', value: 'manual' }],
      admin: {
        hidden: true,
        description: 'Reserved for selected/query modes after listings exist.',
      },
    },
    {
      name: 'manualListings',
      type: 'array',
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.featuredResidences.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.featuredResidences.max,
      admin: { description: 'Residence cards. Images should be 4:3.' },
      fields: [
        { name: 'slug', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.slug },
        { name: 'name', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        { name: 'locality', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        {
          name: 'price',
          type: 'number',
          min: 0,
          admin: { description: 'Reserved for future sorting; priceLabel is displayed.' },
        },
        {
          name: 'priceLabel',
          type: 'text',
          required: true,
          maxLength: CMS_TEXT_LIMITS.label,
        },
        { name: 'beds', type: 'number', required: true, min: 0, validate: integerValidator },
        {
          name: 'bedsLabel',
          type: 'text',
          defaultValue: 'Beds',
          maxLength: CMS_TEXT_LIMITS.label,
        },
        { name: 'baths', type: 'number', required: true, min: 0 },
        {
          name: 'bathsLabel',
          type: 'text',
          defaultValue: 'Baths',
          maxLength: CMS_TEXT_LIMITS.label,
        },
        { name: 'sqft', type: 'number', required: true, min: 0, validate: integerValidator },
        {
          name: 'sqftLabel',
          type: 'text',
          defaultValue: 'Sq Ft',
          maxLength: CMS_TEXT_LIMITS.label,
        },
        { name: 'badge', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        mediaField({
          name: 'image',
          required: true,
          description: 'Recommended aspect ratio: 4:3.',
        }),
        linkField({ required: true, requireLabel: false, hideLabel: true }),
      ],
    },
    {
      name: 'cardCtaLabel',
      type: 'text',
      defaultValue: 'View residence',
      maxLength: CMS_TEXT_LIMITS.label,
    },
    ctaField({ name: 'moreLink', label: 'More link' }),
    { name: 'emptyStateHeading', type: 'text', admin: { hidden: true } },
    { name: 'emptyStateBody', type: 'textarea', admin: { hidden: true } },
  ],
};
