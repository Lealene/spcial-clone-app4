import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { enabledField } from '../fields/enabled';
import { mediaField } from '../fields/media';

export const OwnerIntroBlock: Block = {
  slug: 'ownerIntro',
  interfaceName: 'OwnerIntroBlock',
  labels: {
    singular: 'Owner intro',
    plural: 'Owner intros',
  },
  fields: [
    enabledField(),
    anchorIdField('concierge'),
    mediaField({ name: 'portrait', required: true, description: 'Recommended aspect ratio: 4:5.' }),
    {
      name: 'portraitBadgeLabel',
      type: 'text',
      defaultValue: 'Broker & Owner',
      maxLength: CMS_TEXT_LIMITS.label,
    },
    { name: 'kicker', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    { name: 'heading', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'headingAccent', type: 'text', maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'titleLine', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    { name: 'bio', type: 'textarea', required: true, maxLength: CMS_TEXT_LIMITS.longCopy },
    { name: 'signature', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    {
      name: 'credentials',
      type: 'array',
      required: false,
      minRows: CMS_PAGE_BLOCK_LIMITS.ownerCredentials.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.ownerCredentials.max,
      admin: { description: 'Optional: up to 4 credential stats.' },
      fields: [
        { name: 'value', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
        { name: 'label', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
      ],
    },
  ],
};
