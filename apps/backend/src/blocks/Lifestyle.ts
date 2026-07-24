import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { enabledField } from '../fields/enabled';
import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';
import { integerValidator } from '../fields/number';

export const LifestyleBlock: Block = {
  slug: 'lifestyle',
  interfaceName: 'LifestyleBlock',
  labels: {
    singular: 'Lifestyle',
    plural: 'Lifestyle sections',
  },
  fields: [
    enabledField(),
    anchorIdField('lifestyle'),
    mediaField({
      name: 'backgroundImage',
      required: true,
      description: 'Full-width landscape, at least 2000px wide.',
    }),
    { name: 'kicker', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    { name: 'heading', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'headingAccent', type: 'text', maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'body', type: 'textarea', required: true, maxLength: CMS_TEXT_LIMITS.longCopy },
    {
      name: 'tiles',
      type: 'array',
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.max,
      admin: { description: 'Recommended: 3 tiles. Images should be 3:4.' },
      fields: [
        { name: 'caption', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        mediaField({
          name: 'image',
          required: true,
          description: 'Recommended aspect ratio: 3:4.',
        }),
        linkField({ required: false, requireLabel: false, hideLabel: true }),
      ],
    },
    {
      name: 'maxTiles',
      type: 'number',
      defaultValue: CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.max,
      min: CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.min,
      max: CMS_PAGE_BLOCK_LIMITS.lifestyleTiles.max,
      validate: integerValidator,
    },
  ],
};
