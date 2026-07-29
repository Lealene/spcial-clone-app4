import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import type { GlobalConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { ctaField } from '../fields/cta';
import { linkField } from '../fields/link';
import { revalidateGlobalAfterChange } from '../hooks/revalidate';

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
    { name: 'brandLabel', type: 'text', defaultValue: 'MVP Realty', required: true },
    { name: 'brandMarkAlt', type: 'text' },
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
