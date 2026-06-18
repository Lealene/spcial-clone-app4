import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';
import { homepageBlocks } from '../blocks';
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
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Use home for the / route. Do not include slashes.',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) return 'Slug is required.';
        if (value.includes('/')) return 'Slug must not include slashes.';
        if (reservedSlugs.has(value) && value !== 'home') {
          return 'This slug is reserved by an existing app route.';
        }
        return true;
      },
    },
    seoField,
    {
      name: 'layout',
      type: 'blocks',
      blocks: homepageBlocks,
      required: true,
      minRows: 1,
      admin: {
        description:
          'Sort homepage sections here. Visual style remains controlled by the frontend.',
      },
    },
  ],
};
