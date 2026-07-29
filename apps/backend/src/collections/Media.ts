import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate';

// An image can be referenced from any page, global, area, or listing, and Media
// carries no back-reference to say which — so this is the one blanket invalidation.
const CACHE_TAGS = [CMS_CACHE_TAGS.all];

export const Media: CollectionConfig = {
  slug: 'media',
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
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
};
