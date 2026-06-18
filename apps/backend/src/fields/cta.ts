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
      },
      linkField({ required }),
      {
        name: 'ariaLabel',
        type: 'text',
      },
    ],
  };
}
