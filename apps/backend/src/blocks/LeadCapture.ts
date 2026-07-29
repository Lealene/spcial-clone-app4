import { CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { enabledField } from '../fields/enabled';
import { linkField } from '../fields/link';

const formFieldGroup = (name: string, label: string, requiredDefault: boolean) => ({
  name,
  type: 'group' as const,
  label,
  fields: [
    {
      name: 'label',
      type: 'text' as const,
      required: true,
      maxLength: CMS_TEXT_LIMITS.label,
    },
    {
      name: 'placeholder',
      type: 'text' as const,
      required: true,
      maxLength: CMS_TEXT_LIMITS.label,
    },
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
    enabledField(),
    anchorIdField('lead'),
    { name: 'kicker', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    { name: 'heading', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'body', type: 'textarea', required: true, maxLength: CMS_TEXT_LIMITS.longCopy },
    {
      name: 'helperNote',
      type: 'group',
      fields: [
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'waves',
          options: [{ label: 'Waves', value: 'waves' }],
          admin: { hidden: true },
        },
        { name: 'beforeLinkText', type: 'text', maxLength: CMS_TEXT_LIMITS.shortCopy },
        linkField({ required: true }),
        { name: 'afterLinkText', type: 'text', maxLength: CMS_TEXT_LIMITS.shortCopy },
      ],
    },
    {
      name: 'fields',
      type: 'group',
      label: 'Form fields',
      admin: { description: 'Field set is code-defined; labels and placeholders are editable.' },
      fields: [
        // Split because Wise Agent's webcontact requires CFirst and CLast.
        formFieldGroup('firstName', 'First name', true),
        formFieldGroup('lastName', 'Last name', true),
        formFieldGroup('email', 'Email', true),
        formFieldGroup('phone', 'Phone', false),
      ],
    },
    { name: 'submitLabel', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    { name: 'privacyText', type: 'textarea', required: true, maxLength: CMS_TEXT_LIMITS.shortCopy },
    { name: 'successHeading', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'successBody', type: 'textarea', required: true, maxLength: CMS_TEXT_LIMITS.shortCopy },
    {
      name: 'errorRequiredMessage',
      type: 'text',
      required: true,
      maxLength: CMS_TEXT_LIMITS.shortCopy,
    },
    {
      name: 'errorInvalidEmailMessage',
      type: 'text',
      required: true,
      maxLength: CMS_TEXT_LIMITS.shortCopy,
    },
  ],
};
