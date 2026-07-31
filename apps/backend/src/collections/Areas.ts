import {
  CMS_CACHE_TAGS,
  COMMUNITY_AMENITY_ICON_LABELS,
  COMMUNITY_AMENITY_ICONS,
} from '@mvp-realty/api-contracts';
import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { seoField } from '../fields/seo';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate';

// Listings carry the area name and community facet, so both caches go stale.
const CACHE_TAGS = [CMS_CACHE_TAGS.areas, CMS_CACHE_TAGS.listings];

// Payload condition signature is (data, siblingData) — document data is the first arg.
const isCommunity = (data?: { kind?: string } | null) => data?.kind === 'community';
const isCity = (data?: { kind?: string } | null) => data?.kind === 'city';

const communityOnlyNotice = {
  name: 'communityOnlyNotice',
  type: 'ui' as const,
  admin: {
    condition: isCity,
    components: {
      Field: '/components/admin/AreaCommunityOnlyNotice',
    },
  },
};

// Derived, not duplicated: the contract is the single source for this vocabulary,
// and the web icon map is keyed off the same union.
const amenityIconOptions = COMMUNITY_AMENITY_ICONS.map((value) => ({
  label: COMMUNITY_AMENITY_ICON_LABELS[value],
  value,
}));

export const Areas: CollectionConfig = {
  slug: 'areas',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'mlsAreaMajor', 'syncEnabled', 'activeCount', 'lastSyncedAt'],
    description:
      'MLS sync targets. Community Areas power homepage community cards/strip and detail pages; cities feed listings filters.',
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/SyncAreaButton'],
      },
    },
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
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                description: 'Lowercase kebab-case, e.g. bonita-bay.',
              },
            },
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'kind',
              type: 'select',
              required: true,
              options: [
                { label: 'Community', value: 'community' },
                { label: 'City', value: 'city' },
              ],
            },
            {
              name: 'city',
              type: 'text',
              required: true,
              admin: {
                description: 'Display city, e.g. Bonita Springs.',
              },
            },
            {
              name: 'county',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g. Lee or Collier.',
              },
            },
          ],
        },
        {
          label: 'Sync',
          fields: [
            {
              name: 'mlsAreaMajor',
              type: 'text',
              required: true,
              index: true,
              admin: {
                description:
                  'Exact NABOR MLSAreaMajor value (uppercase), used with MlsStatus eq Active.',
              },
            },
            {
              name: 'syncEnabled',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'lastSyncedAt',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                description: 'Updated by the Bridge sync job.',
              },
            },
          ],
        },
        {
          label: 'Editorial',
          fields: [
            communityOnlyNotice,
            {
              name: 'broker',
              type: 'relationship',
              relationTo: 'brokers',
              index: true,
              admin: {
                description: 'Community concierge. Cities may set a fallback too.',
              },
            },
            {
              name: 'blurb',
              type: 'textarea',
              admin: {
                condition: isCommunity,
                description:
                  'Homepage strip line, e.g. "Bonita Springs · golf, marina & a private Gulf beach park".',
              },
            },
            {
              name: 'detailBlurb',
              type: 'textarea',
              admin: {
                condition: isCommunity,
                description:
                  'Detail-page intro under the H1. Distinct from `blurb`, the one-line homepage strip label.',
              },
            },
            {
              name: 'locality',
              type: 'text',
              admin: {
                condition: isCommunity,
                description:
                  'Card subtitle under the name, e.g. "Bonita Springs · private Gulf beach park".',
              },
            },
            {
              name: 'priceRange',
              type: 'text',
              admin: {
                condition: isCommunity,
                description: 'Display price band for cards, e.g. "From the $400s – $5M+".',
              },
            },
            {
              name: 'totalResidences',
              type: 'number',
              min: 0,
              admin: {
                condition: isCommunity,
                description:
                  'Total homes in the community (not active listings). Shown on featured cards.',
              },
            },
            {
              name: 'photoCount',
              type: 'number',
              min: 0,
              admin: {
                condition: isCommunity,
                description: 'Total photo count for the gallery "All N photos" button.',
              },
            },
            {
              name: 'phone',
              type: 'text',
              admin: { condition: isCommunity },
            },
            {
              name: 'facts',
              type: 'array',
              maxRows: 6,
              admin: {
                condition: isCommunity,
                description: 'Overview fact strip on the community detail page.',
              },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
            },
            {
              name: 'gallery',
              type: 'array',
              admin: {
                condition: isCommunity,
                description: 'First image is used on homepage community cards. Recommended 16:11.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'alt',
                  type: 'text',
                },
              ],
            },
            {
              name: 'about',
              type: 'richText',
              admin: { condition: isCommunity },
            },
            {
              name: 'amenities',
              type: 'array',
              admin: {
                condition: isCommunity,
                description: 'Amenity titles also appear as tags on homepage community cards.',
              },
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  options: amenityIconOptions,
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'clubs',
              type: 'array',
              admin: { condition: isCommunity },
              fields: [
                {
                  name: 'item',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'faqs',
              type: 'array',
              admin: { condition: isCommunity },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
            {
              name: 'similar',
              type: 'relationship',
              relationTo: 'areas',
              hasMany: true,
              maxRows: 6,
              filterOptions: ({ id }) => ({
                kind: { equals: 'community' },
                ...(id ? { id: { not_equals: id } } : {}),
              }),
              admin: {
                condition: isCommunity,
                description: 'Similar nearby communities rail on the detail page.',
              },
            },
          ],
        },
        {
          label: 'Reviews',
          fields: [
            {
              ...communityOnlyNotice,
              name: 'communityOnlyNoticeReviews',
            },
            {
              name: 'soldCount',
              type: 'number',
              min: 0,
              admin: {
                condition: isCommunity,
                description:
                  'Homes this brokerage has sold in this community. Manually maintained — not derived from MLS data. Leave empty to hide the tile.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            seoField({
              description:
                'Overrides only, and only meaningful for community Areas (cities have no detail page). Blank fields are generated from the name, city and blurb.',
            }),
          ],
        },
        {
          label: 'Computed stats',
          fields: [
            {
              name: 'activeCount',
              type: 'number',
              admin: {
                description: 'Written by sync from active listings in this area.',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'priceMin', type: 'number' },
                { name: 'priceMax', type: 'number' },
                { name: 'avgPricePerSqft', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'bedsMin', type: 'number' },
                { name: 'bedsMax', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'sqftMin', type: 'number' },
                { name: 'sqftMax', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'hoaMin', type: 'number' },
                { name: 'hoaMax', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'yearBuiltMin', type: 'number' },
                { name: 'yearBuiltMax', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'is55Plus', type: 'checkbox' },
                { name: 'isGated', type: 'checkbox' },
              ],
            },
          ],
        },
      ],
    },
  ],
};
