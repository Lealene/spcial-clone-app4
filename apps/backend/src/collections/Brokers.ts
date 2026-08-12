import { CMS_AREA_DETAIL_LIMITS, CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate';

// Brokers reach the web app only through populated area and listing relationships.
const CACHE_TAGS = [CMS_CACHE_TAGS.areas, CMS_CACHE_TAGS.listings];

export const Brokers: CollectionConfig = {
  slug: 'brokers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title', 'brokerage', 'phone', 'updatedAt'],
    description: 'Agent/broker identity for community concierge and listing PDP asides.',
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [revalidateAfterChange(CACHE_TAGS)],
    afterDelete: [revalidateAfterDelete(CACHE_TAGS)],
  },
  defaultPopulate: {
    name: true,
    slug: true,
    title: true,
    conciergeLabel: true,
    brokerage: true,
    phone: true,
    // Needed by the PDP "Message the Concierge" mailto link; without it the
    // populated broker has no email and the button silently never renders.
    email: true,
    headshot: true,
    rating: true,
    reviewCount: true,
    avgResponseMinutes: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name, e.g. Eleanor Voss.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Lowercase kebab-case, e.g. eleanor-voss.',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) return 'Slug is required.';
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Slug must use lowercase letters, numbers, and single hyphens.';
        }
        return true;
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Role line, e.g. Broker & Owner.',
      },
    },
    {
      name: 'brokerage',
      type: 'text',
      required: true,
      admin: {
        description: 'Brokerage name. PDP joins with ·; community aside joins with ,.',
      },
    },
    {
      name: 'conciergeLabel',
      type: 'text',
      defaultValue: 'Your {community} Concierge',
      admin: {
        description:
          '`{community}` is replaced with the area name; omit the token for a fixed label.',
      },
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Square portrait.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Display format; tel: href is derived at read time.',
      },
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Plain text (not rich text).',
      },
    },
    {
      name: 'signature',
      type: 'text',
    },
    {
      name: 'credentials',
      type: 'array',
      required: false,
      maxRows: CMS_AREA_DETAIL_LIMITS.credentials.max,
      admin: { description: 'Optional: up to 3 credential stats.' },
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          admin: {
            step: 0.1,
            width: '33%',
            description: 'Display-only, manually maintained. Leave empty to hide.',
          },
        },
        {
          name: 'reviewCount',
          type: 'number',
          min: 0,
          admin: {
            width: '33%',
            description: 'Display-only, manually maintained. Leave empty to hide.',
          },
        },
        {
          name: 'avgResponseMinutes',
          type: 'number',
          min: 0,
          admin: {
            width: '33%',
            description: 'Rendered as "N min". Leave empty to hide.',
          },
        },
      ],
    },
  ],
};
