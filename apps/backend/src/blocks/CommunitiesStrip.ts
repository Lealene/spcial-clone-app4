import type { Block } from 'payload';

import { linkField } from '../fields/link';

export const CommunitiesStripBlock: Block = {
  slug: 'communitiesStrip',
  interfaceName: 'CommunitiesStripBlock',
  labels: {
    singular: 'Communities strip',
    plural: 'Communities strips',
  },
  fields: [
    { name: 'anchorId', type: 'text' },
    {
      name: 'sourceMode',
      type: 'select',
      defaultValue: 'manual',
      options: [{ label: 'Manual', value: 'manual' }],
      admin: { description: 'Selected/query modes are added after communities exist.' },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      admin: { description: 'Recommended: 3 compact community links.' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'blurb', type: 'textarea', required: true },
        { name: 'slug', type: 'text', required: true },
        linkField({ required: true }),
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'mapPin',
          options: [{ label: 'Map pin', value: 'mapPin' }],
        },
      ],
    },
    { name: 'maxItems', type: 'number', defaultValue: 3 },
  ],
};
