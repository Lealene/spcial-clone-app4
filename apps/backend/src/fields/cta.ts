import { CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Field } from 'payload';

import { linkField } from './link';

type CtaFieldOptions = {
  name?: string;
  label?: string;
  required?: boolean;
};

export function ctaField({
  name = 'cta',
  label = 'CTA',
  required = false,
}: CtaFieldOptions = {}): Field {
  return {
    name,
    type: 'group',
    label,
    fields: [
      {
        name: 'label',
        type: 'text',
        required,
        maxLength: CMS_TEXT_LIMITS.label,
      },
      linkField({
        required,
        requireLabel: false,
        hideLabel: true,
        hideAriaLabel: true,
      }),
      {
        name: 'ariaLabel',
        type: 'text',
        maxLength: CMS_TEXT_LIMITS.label,
      },
    ],
  };
}
