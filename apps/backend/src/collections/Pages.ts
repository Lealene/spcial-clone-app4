import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';
import { pageBlocks } from '../blocks';
import { seoField } from '../fields/seo';

const reservedSlugs = new Set(['admin', 'api', 'listings', 'communities', 'ui']);

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: CMS_TEXT_LIMITS.heading,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: CMS_TEXT_LIMITS.slug,
      admin: {
        description: 'Use home for the / route. Enter a lowercase kebab-case segment.',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) return 'Slug is required.';
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Slug must use lowercase letters, numbers, and single hyphens.';
        }
        if (reservedSlugs.has(value)) return 'This slug is reserved by an existing app route.';
        return true;
      },
    },
    seoField,
    {
      name: 'layout',
      type: 'blocks',
      blocks: pageBlocks,
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.layout.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.layout.max,
      admin: {
        description:
          'Sort reusable CMS page blocks here. Visual style remains controlled by the frontend.',
      },
    },
  ],
};
