import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import type { GlobalConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { ctaField } from '../fields/cta';
import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';
import { revalidateGlobalAfterChange } from '../hooks/revalidate';

const isLogoDisplayMode = (_?: unknown, sibling?: { brandDisplayMode?: string } | null) =>
  sibling?.brandDisplayMode === 'logo';

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  access: {
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange([CMS_CACHE_TAGS.header])],
  },
  fields: [
    linkField({ name: 'brandHomeLink', label: 'Brand home link', required: true }),
    {
      name: 'brandDisplayMode',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Text (house mark + wordmark)', value: 'text' },
        { label: 'Logo image', value: 'logo' },
      ],
      admin: {
        description:
          'Text renders the house mark + brandLabel wordmark. Logo renders the Brand logo image instead. brandLabel / brandMarkAlt always remain the link’s accessible name, in either mode.',
      },
    },
    { name: 'brandLabel', type: 'text', defaultValue: 'MVP Realty', required: true },
    { name: 'brandMarkAlt', type: 'text' },
    {
      ...mediaField({
        name: 'brandLogo',
        label: 'Brand logo',
        required: false,
        description: 'Shown only when Brand display mode is Logo.',
      }),
      admin: { condition: isLogoDisplayMode },
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        linkField({ required: true }),
        { name: 'ariaLabel', type: 'text' },
      ],
    },
    ctaField({ name: 'primaryCta', label: 'Primary CTA', required: true }),
    { name: 'mobileMenuLabel', type: 'text', defaultValue: 'Menu', required: true },
    { name: 'mobileMenuCloseLabel', type: 'text', defaultValue: 'Close menu', required: true },
  ],
};
