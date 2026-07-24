import { CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Field } from 'payload';

import { anchorIdField } from './anchorId';

type SectionHeaderFieldOptions = {
  name?: string;
  label?: string;
  includeAnchor?: boolean;
};

export function sectionHeaderField({
  name = 'header',
  label = 'Section header',
  includeAnchor = false,
}: SectionHeaderFieldOptions = {}): Field {
  return {
    name,
    type: 'group',
    label,
    fields: [
      ...(includeAnchor ? [anchorIdField()] : []),
      {
        name: 'kicker',
        type: 'text',
        required: true,
        maxLength: CMS_TEXT_LIMITS.label,
      },
      {
        name: 'heading',
        type: 'text',
        required: true,
        maxLength: CMS_TEXT_LIMITS.heading,
      },
      {
        name: 'headingAccent',
        type: 'text',
        maxLength: CMS_TEXT_LIMITS.heading,
        admin: {
          description: 'Optional phrase rendered with the existing emphasized style.',
        },
      },
      {
        name: 'lede',
        type: 'textarea',
        maxLength: CMS_TEXT_LIMITS.shortCopy,
      },
    ],
  };
}
