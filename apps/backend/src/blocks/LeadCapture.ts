import type { Block } from 'payload';

import { linkField } from '../fields/link';

const formFieldGroup = (name: string, label: string, requiredDefault: boolean) => ({
  name,
  type: 'group' as const,
  label,
  fields: [
    { name: 'label', type: 'text' as const, required: true },
    { name: 'placeholder', type: 'text' as const, required: true },
    { name: 'required', type: 'checkbox' as const, defaultValue: requiredDefault },
  ],
});

export const LeadCaptureBlock: Block = {
  slug: 'leadCapture',
  interfaceName: 'LeadCaptureBlock',
  labels: {
    singular: 'Lead capture',
    plural: 'Lead captures',
  },
  fields: [
    { name: 'anchorId', type: 'text', defaultValue: 'lead' },
    { name: 'kicker', type: 'text', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'helperNote',
      type: 'group',
      fields: [
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'waves',
          options: [{ label: 'Waves', value: 'waves' }],
        },
        { name: 'beforeLinkText', type: 'text' },
        linkField({ required: true }),
        { name: 'afterLinkText', type: 'text' },
      ],
    },
    {
      name: 'fields',
      type: 'group',
      label: 'Form fields',
      admin: { description: 'Field set is code-defined; labels and placeholders are editable.' },
      fields: [
        formFieldGroup('name', 'Name', true),
        formFieldGroup('email', 'Email', true),
        formFieldGroup('phone', 'Phone', false),
      ],
    },
    { name: 'submitLabel', type: 'text', required: true },
    { name: 'privacyText', type: 'textarea', required: true },
    { name: 'successHeading', type: 'text', required: true },
    { name: 'successBody', type: 'textarea', required: true },
    { name: 'errorRequiredMessage', type: 'text', required: true },
    { name: 'errorInvalidEmailMessage', type: 'text', required: true },
  ],
};
