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
      defaultValue: 'areas',
      options: [
        { label: 'Areas collection', value: 'areas' },
        { label: 'Manual (legacy)', value: 'manual' },
      ],
      admin: {
        description:
          'Areas mode loads strip items from Areas (kind=community). Edit name/blurb on the Area document.',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: false,
      minRows: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max,
      admin: {
        condition: (_, siblingData) => siblingData?.sourceMode === 'manual',
        description: 'Legacy manual strip items. Prefer Areas collection.',
      },
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
      min: 1,
      max: CMS_PAGE_BLOCK_LIMITS.communitiesStripItems.max,
      validate: integerValidator,
      admin: {
        description: 'How many community Areas to show in the strip.',
      },
    },
  ],
};
