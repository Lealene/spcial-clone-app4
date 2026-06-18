import type { Block } from 'payload';

import { mediaField } from '../fields/media';

export const OwnerIntroBlock: Block = {
  slug: 'ownerIntro',
  interfaceName: 'OwnerIntroBlock',
  labels: {
    singular: 'Owner intro',
    plural: 'Owner intros',
  },
  fields: [
    { name: 'anchorId', type: 'text', defaultValue: 'concierge' },
    mediaField({ name: 'portrait', required: true, description: 'Recommended aspect ratio: 4:5.' }),
    { name: 'portraitBadgeLabel', type: 'text', defaultValue: 'Broker & Owner' },
    { name: 'kicker', type: 'text', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'headingAccent', type: 'text' },
    { name: 'titleLine', type: 'text', required: true },
    { name: 'bio', type: 'textarea', required: true },
    { name: 'signature', type: 'text', required: true },
    {
      name: 'credentials',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      admin: { description: 'Recommended: 1-4 credential stats.' },
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
};
