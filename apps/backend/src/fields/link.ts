import {
  CMS_LINK_TYPES,
  CMS_TEXT_LIMITS,
  cmsHrefSchema,
  type CmsLinkType,
} from '@mvp-realty/api-contracts';
import type { Field, Validate } from 'payload';

const hasValue = (value: unknown) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return Boolean(value);
};

const linkTargetNames = ['page', 'customUrl', 'anchor', 'phone', 'email'] as const;

function linkIsActive(siblingData: Record<string, unknown> | undefined): boolean {
  if (!siblingData) return false;
  return (
    hasValue(siblingData.label) ||
    hasValue(siblingData.ariaLabel) ||
    siblingData.newTab === true ||
    linkTargetNames.some((name) => hasValue(siblingData[name]))
  );
}

const targetRequired =
  (
    required: boolean,
    type: CmsLinkType,
    message: string,
    validateValue?: (value: unknown) => boolean,
  ): Validate =>
  (value, { siblingData }) => {
    const data = siblingData as Record<string, unknown> | undefined;
    if (!required && !linkIsActive(data)) return true;
    if (data?.type !== type) return true;
    if (!hasValue(value)) return message;
    return !validateValue || validateValue(value) ? true : message;
  };

function isSafeCustomUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !cmsHrefSchema.safeParse(value).success) return false;
  return (
    (value.startsWith('/') && !value.startsWith('//')) ||
    value.startsWith('https://') ||
    value.startsWith('http://')
  );
}

function isSafeAnchor(value: unknown): boolean {
  return typeof value === 'string' && /^(?:\/)?#[A-Za-z][A-Za-z0-9_-]*$/.test(value);
}

function isSafePhone(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return value.replace(/\D/g, '').length >= 7;
}

const linkTypeLabels: Record<CmsLinkType, string> = {
  internal: 'Internal page',
  custom: 'Custom URL',
  anchor: 'Anchor',
  phone: 'Phone',
  email: 'Email',
};

export const linkTypeOptions = CMS_LINK_TYPES.map((value) => ({
  label: linkTypeLabels[value],
  value,
}));

type LinkFieldOptions = {
  name?: string;
  label?: string;
  required?: boolean;
  requireLabel?: boolean;
  hideLabel?: boolean;
  hideAriaLabel?: boolean;
};

export function linkField({
  name = 'link',
  label = 'Link',
  required = false,
  requireLabel = required,
  hideLabel = false,
  hideAriaLabel = false,
}: LinkFieldOptions = {}): Field {
  const validateLabel: Validate = (value, { siblingData }) => {
    const data = siblingData as Record<string, unknown> | undefined;
    if (!requireLabel && !linkIsActive(data)) return true;
    return hasValue(value) || !requireLabel ? true : 'Enter a link label.';
  };

  return {
    name,
    type: 'group',
    label,
    fields: [
      {
        name: 'label',
        type: 'text',
        required: requireLabel,
        maxLength: CMS_TEXT_LIMITS.label,
        validate: validateLabel,
        admin: hideLabel ? { hidden: true } : undefined,
      },
      {
        name: 'type',
        type: 'select',
        required,
        defaultValue: 'custom',
        dbName: 'type',
        enumName: 'link_type',
        options: linkTypeOptions,
      },
      {
        name: 'page',
        type: 'relationship',
        relationTo: 'pages',
        validate: targetRequired(required, 'internal', 'Choose an internal page.'),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'internal',
        },
      },
      {
        name: 'customUrl',
        type: 'text',
        maxLength: CMS_TEXT_LIMITS.url,
        validate: targetRequired(
          required,
          'custom',
          'Enter a safe app-relative or HTTP(S) URL.',
          isSafeCustomUrl,
        ),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'custom',
          description: 'Use a single-leading-slash app route or an HTTP(S) URL.',
        },
      },
      {
        name: 'anchor',
        type: 'text',
        maxLength: CMS_TEXT_LIMITS.anchorId + 2,
        validate: targetRequired(
          required,
          'anchor',
          'Enter an anchor such as #lead or /#lead.',
          isSafeAnchor,
        ),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'anchor',
          description: 'Examples: #lead, /#lead.',
        },
      },
      {
        name: 'phone',
        type: 'text',
        maxLength: CMS_TEXT_LIMITS.label,
        validate: targetRequired(
          required,
          'phone',
          'Enter a phone number with at least seven digits.',
          isSafePhone,
        ),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'phone',
        },
      },
      {
        name: 'email',
        type: 'email',
        validate: targetRequired(required, 'email', 'Enter an email address.'),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'email',
        },
      },
      {
        name: 'newTab',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          condition: (_, siblingData) =>
            siblingData?.type === 'internal' || siblingData?.type === 'custom',
        },
      },
      {
        name: 'ariaLabel',
        type: 'text',
        maxLength: CMS_TEXT_LIMITS.label,
        admin: hideAriaLabel ? { hidden: true } : undefined,
      },
    ],
  };
}
