import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS, cmsPageCacheTag } from '@mvp-realty/api-contracts';
import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { publishedOrAuthenticated } from '../access/publishedOrAuthenticated';
import { pageBlocks } from '../blocks';
import { seoField } from '../fields/seo';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate';

const reservedSlugs = new Set(['admin', 'api', 'listings', 'communities', 'ui']);

function slugOf(doc: unknown): string | undefined {
  if (typeof doc !== 'object' || doc === null) return undefined;
  const slug = (doc as { slug?: unknown }).slug;
  return typeof slug === 'string' && slug.length > 0 ? slug : undefined;
}

/** Page caches are keyed by slug, so a rename must clear the old key too. */
function pageCacheTags(doc: unknown, previousDoc?: unknown): string[] {
  return [slugOf(doc), slugOf(previousDoc)]
    .filter((slug): slug is string => Boolean(slug))
    .map(cmsPageCacheTag);
}

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
  hooks: {
    afterChange: [revalidateAfterChange(pageCacheTags)],
    afterDelete: [revalidateAfterDelete(pageCacheTags)],
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
