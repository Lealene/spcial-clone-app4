import { CMS_CACHE_TAGS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { GlobalConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { seoField } from '../fields/seo';
import { revalidateGlobalAfterChange } from '../hooks/revalidate';

/**
 * A global rather than a Pages doc: there is exactly one privacy policy, its slug
 * must not be editable, and it needs no page-builder layout. Counsel edits the body
 * directly here, so the field is rich text rather than a fixed set of sections —
 * legal wording changes shape, not just content.
 */
export const PrivacyPolicy: GlobalConfig = {
  slug: 'privacy-policy',
  label: 'Privacy policy',
  admin: {
    description:
      'The published privacy policy at /privacy-policy. Have counsel review changes before saving — this is a legal disclosure, not marketing copy.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange([CMS_CACHE_TAGS.privacyPolicy])],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Privacy Policy',
      maxLength: CMS_TEXT_LIMITS.heading,
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Shown under the title. Update it whenever the policy text changes.',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      maxLength: CMS_TEXT_LIMITS.shortCopy,
      admin: { description: 'Optional lead paragraph, rendered above the policy body.' },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      admin: { description: 'Use headings for each section; lists and links are supported.' },
    },
    seoField({
      description: 'Leave blank to fall back to the policy title and intro.',
    }),
  ],
};
