import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { enabledField } from '../fields/enabled';
import { linkField } from '../fields/link';
import { integerValidator } from '../fields/number';

export const CommunitiesStripBlock: Block = {
  slug: 'communitiesStrip',
  interfaceName: 'CommunitiesStripBlock',
  labels: {
    singular: 'Communities strip',
    plural: 'Communities strips',
  },
  fields: [
    enabledField(),
    anchorIdField(),
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
      name: 'items',
      type: 'array',
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max,
      admin: { description: 'Recommended: 3 compact community links.' },
      fields: [
        { name: 'name', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        {
          name: 'blurb',
          type: 'textarea',
          required: true,
          maxLength: CMS_TEXT_LIMITS.shortCopy,
        },
        { name: 'slug', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.slug },
        linkField({ required: true, requireLabel: false, hideLabel: true }),
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'mapPin',
          options: [{ label: 'Map pin', value: 'mapPin' }],
          admin: { hidden: true },
        },
      ],
    },
    {
      name: 'maxItems',
      type: 'number',
      defaultValue: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max,
      min: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.min,
      max: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max,
      validate: integerValidator,
    },
  ],
};
