import { CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Field } from 'payload';

type MediaFieldOptions = {
  name?: string;
  label?: string;
  required?: boolean;
  description?: string;
  caption?: boolean;
};

export function mediaField({
  name = 'image',
  label = 'Image',
  required = false,
  description,
  caption = false,
}: MediaFieldOptions = {}): Field {
  return {
    name,
    type: 'group',
    label,
    fields: [
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        required,
        admin: {
          description,
        },
      },
      {
        name: 'altOverride',
        type: 'text',
        maxLength: CMS_TEXT_LIMITS.shortCopy,
        admin: {
          description: 'Optional. Falls back to the media alt text.',
        },
      },
      ...(caption
        ? [
            {
              name: 'caption',
              type: 'text' as const,
              maxLength: CMS_TEXT_LIMITS.shortCopy,
            },
          ]
        : []),
    ],
  };
}
