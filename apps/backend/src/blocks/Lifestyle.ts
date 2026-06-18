import type { Block } from 'payload';

import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';

export const LifestyleBlock: Block = {
  slug: 'lifestyle',
  interfaceName: 'LifestyleBlock',
  labels: {
    singular: 'Lifestyle',
    plural: 'Lifestyle sections',
  },
  fields: [
    { name: 'anchorId', type: 'text', defaultValue: 'lifestyle' },
    mediaField({
      name: 'backgroundImage',
      required: true,
      description: 'Full-width landscape, at least 2000px wide.',
    }),
    { name: 'kicker', type: 'text', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'headingAccent', type: 'text' },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'tiles',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      admin: { description: 'Recommended: 3 tiles. Images should be 3:4.' },
      fields: [
        { name: 'caption', type: 'text', required: true },
        mediaField({
          name: 'image',
          required: true,
          description: 'Recommended aspect ratio: 3:4.',
        }),
        linkField({ required: false }),
      ],
    },
    { name: 'maxTiles', type: 'number', defaultValue: 3 },
  ],
};
