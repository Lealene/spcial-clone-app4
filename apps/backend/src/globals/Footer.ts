import type { GlobalConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { linkField } from '../fields/link';

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    { name: 'brandName', type: 'text', required: true },
    { name: 'brandAccentText', type: 'text' },
    { name: 'brandBlurb', type: 'textarea', required: true },
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            linkField({ required: true }),
            { name: 'ariaLabel', type: 'text' },
          ],
        },
      ],
    },
    { name: 'bottomLeftText', type: 'text', required: true },
    {
      name: 'bottomRightLinks',
      type: 'array',
      fields: [linkField({ required: true })],
    },
    { name: 'bottomRightTextFallback', type: 'text' },
  ],
};
