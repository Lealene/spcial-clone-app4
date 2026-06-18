import type { Field, Validate } from 'payload';

const hasValue = (value: unknown) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return Boolean(value);
};

const targetRequired =
  (type: string, message: string): Validate =>
  (value, { siblingData }) =>
    siblingData?.type === type && !hasValue(value) ? message : true;

const linkTypeOptions = [
  { label: 'Internal page', value: 'internal' },
  { label: 'Custom URL', value: 'custom' },
  { label: 'Anchor', value: 'anchor' },
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
];

type LinkFieldOptions = {
  name?: string;
  label?: string;
  required?: boolean;
};

export function linkField({
  name = 'link',
  label = 'Link',
  required = false,
}: LinkFieldOptions = {}): Field {
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
      {
        name: 'type',
        type: 'select',
        required: true,
        defaultValue: 'custom',
        options: linkTypeOptions,
      },
      {
        name: 'page',
        type: 'relationship',
        relationTo: 'pages',
        validate: targetRequired('internal', 'Choose an internal page.'),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'internal',
        },
      },
      {
        name: 'customUrl',
        type: 'text',
        validate: targetRequired('custom', 'Enter a custom URL.'),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'custom',
          description: 'Use for existing app routes such as /listings until they are CMS pages.',
        },
      },
      {
        name: 'anchor',
        type: 'text',
        validate: targetRequired('anchor', 'Enter an anchor.'),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'anchor',
          description: 'Examples: #lead, /#lead.',
        },
      },
      {
        name: 'phone',
        type: 'text',
        validate: targetRequired('phone', 'Enter a phone number.'),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'phone',
        },
      },
      {
        name: 'email',
        type: 'email',
        validate: targetRequired('email', 'Enter an email address.'),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'email',
        },
      },
      {
        name: 'newTab',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'ariaLabel',
        type: 'text',
      },
    ],
  };
}
