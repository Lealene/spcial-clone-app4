import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import type { GlobalConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { linkField } from '../fields/link';
import { mediaField } from '../fields/media';
import { revalidateGlobalAfterChange } from '../hooks/revalidate';

// Column-level conditions read siblingData — the array row, not the global doc.
const isManualColumn = (_?: unknown, sibling?: { source?: string } | null) =>
  (sibling?.source ?? 'manual') === 'manual';
const isCommunityColumn = (_?: unknown, sibling?: { source?: string } | null) =>
  sibling?.source === 'communities';

const isTextDisplayMode = (_?: unknown, sibling?: { brandDisplayMode?: string } | null) =>
  (sibling?.brandDisplayMode ?? 'text') === 'text';
const isLogoDisplayMode = (_?: unknown, sibling?: { brandDisplayMode?: string } | null) =>
  sibling?.brandDisplayMode === 'logo';

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange([CMS_CACHE_TAGS.footer])],
  },
  fields: [
    { name: 'brandName', type: 'text', required: true },
    {
      name: 'brandDisplayMode',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Text (name + accent)', value: 'text' },
        { label: 'Logo image', value: 'logo' },
      ],
      admin: {
        description:
          'Text renders brandName + brandAccentText. Logo renders the Brand logo image instead. brandName always remains the fallback alt text.',
      },
    },
    {
      name: 'brandAccentText',
      type: 'text',
      admin: { condition: isTextDisplayMode },
    },
    {
      ...mediaField({
        name: 'brandLogo',
        label: 'Brand logo',
        required: false,
        description: 'Shown only when Brand display mode is Logo.',
      }),
      admin: { condition: isLogoDisplayMode },
    },
    { name: 'brandBlurb', type: 'textarea', required: true },
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'source',
          type: 'select',
          required: true,
          defaultValue: 'manual',
          options: [
            { label: 'Manual links', value: 'manual' },
            { label: 'Communities (auto)', value: 'communities' },
          ],
          admin: {
            description:
              'Auto columns list community Areas, so a new community appears here without editing the footer.',
          },
        },
        {
          name: 'links',
          type: 'array',
          admin: { condition: isManualColumn },
          fields: [
            { name: 'label', type: 'text', required: true },
            linkField({ required: true }),
            { name: 'ariaLabel', type: 'text' },
          ],
        },
        {
          name: 'communityLimit',
          type: 'number',
          min: 1,
          max: 12,
          defaultValue: 6,
          admin: {
            condition: isCommunityColumn,
            description: 'How many communities to list, ordered by name.',
          },
        },
        {
          name: 'communityOverrides',
          type: 'relationship',
          relationTo: 'areas',
          hasMany: true,
          maxRows: 12,
          filterOptions: () => ({ kind: { equals: 'community' } }),
          admin: {
            condition: isCommunityColumn,
            description:
              'Leave empty to auto-list by name. Set to pin an exact subset and order (ignores the limit above).',
          },
        },
      ],
    },
    { name: 'bottomLeftText', type: 'text', required: true },
    {
      name: 'bottomRightLinks',
      type: 'array',
      fields: [linkField({ required: true })],
    },
    { name: 'bottomRightTextFallback', type: 'text' },
  ],
};
