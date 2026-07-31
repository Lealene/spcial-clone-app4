import { CMS_CACHE_TAGS } from '@mvp-realty/api-contracts';
import type { CollectionConfig, Field } from 'payload';

import { authenticated } from '../access/authenticated';
import { seoField } from '../fields/seo';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate';

const CACHE_TAGS = [CMS_CACHE_TAGS.listings, CMS_CACHE_TAGS.listingsFeatured];

const stringList = (name: string, label?: string): Field => ({
  name,
  type: 'array',
  label,
  fields: [{ name: 'item', type: 'text', required: true }],
});

export const Listings: CollectionConfig = {
  slug: 'listings',
  admin: {
    useAsTitle: 'fullAddress',
    defaultColumns: [
      'fullAddress',
      'area',
      'price',
      'mlsStatus',
      'isFeatured',
      'isActive',
      'syncedAt',
    ],
    description: 'MLS listings ingested from Bridge. Public read for the web listings PLP/PDP.',
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
              name: 'listingKey',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                description: 'Bridge/RESO ListingKey — upsert key for sync.',
              },
            },
            {
              name: 'mlsId',
              type: 'text',
              required: true,
              index: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              admin: {
                description: '{street}-{city}-fl-{mlsId}',
              },
            },
            {
              name: 'area',
              type: 'relationship',
              relationTo: 'areas',
              required: true,
              index: true,
            },
            {
              name: 'broker',
              type: 'relationship',
              relationTo: 'brokers',
              required: false,
              index: true,
              admin: {
                description:
                  'Optional override for the listing PDP aside. Falls back to the area broker when empty.',
              },
            },
            {
              name: 'isActive',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'False when delisted; page can stay live, grids hide it.',
              },
            },
            {
              name: 'syncedAt',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
              },
            },
            {
              name: 'modificationTimestamp',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                description: 'RESO ModificationTimestamp from the feed.',
              },
            },
          ],
        },
        {
          label: 'Location & price',
          fields: [
            { name: 'fullAddress', type: 'text', required: true },
            { name: 'streetAddress', type: 'text' },
            { name: 'city', type: 'text', required: true },
            { name: 'state', type: 'text', defaultValue: 'FL' },
            { name: 'zip', type: 'text' },
            {
              type: 'row',
              fields: [
                {
                  name: 'latitude',
                  type: 'number',
                  admin: {
                    description: 'RESO Latitude — centers the PDP location map.',
                  },
                },
                {
                  name: 'longitude',
                  type: 'number',
                  admin: {
                    description: 'RESO Longitude — centers the PDP location map.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'price', type: 'number', required: true },
                { name: 'beds', type: 'number' },
                { name: 'baths', type: 'number' },
                { name: 'sqft', type: 'number' },
                { name: 'pricePerSqft', type: 'number' },
              ],
            },
            {
              name: 'propertyType',
              type: 'select',
              options: [
                { label: 'Single family', value: 'single-family' },
                { label: 'Condo', value: 'condo' },
                { label: 'Townhouse', value: 'townhouse' },
                { label: 'Multi-family', value: 'multi-family' },
                { label: 'Villa', value: 'villa' },
                { label: 'Land', value: 'land' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'mlsStatus',
              type: 'select',
              required: true,
              defaultValue: 'active',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Under contract', value: 'under-contract' },
                { label: 'Sold', value: 'sold' },
                { label: 'Coming soon', value: 'coming-soon' },
              ],
            },
            {
              name: 'features',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Waterfront', value: 'waterfront' },
                { label: 'Private pool', value: 'private-pool' },
                { label: 'Golf', value: 'golf' },
                { label: 'Gated', value: 'gated' },
                { label: '55+', value: '55-plus' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'yearBuilt', type: 'number' },
                { name: 'lotSqft', type: 'number' },
                { name: 'taxesYearly', type: 'number' },
                { name: 'hoaMonthly', type: 'number' },
              ],
            },
          ],
        },
        {
          label: 'Photos',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Primary photo mirrored to R2 by the hero job.',
              },
            },
            {
              name: 'heroMediaKey',
              type: 'text',
              admin: {
                description:
                  'Bridge MediaKey of the mirrored hero — skip re-download when unchanged.',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: { description: 'Bridge CDN URL — always present.' },
                },
                {
                  name: 'mediaKey',
                  type: 'text',
                  required: true,
                  admin: { description: 'Change-detection key from Bridge MediaKey.' },
                },
                { name: 'order', type: 'number', required: true },
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Unused in Phase 1; reserved for full-gallery mirror.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            { name: 'publicRemarks', type: 'textarea' },
            { name: 'listAgentName', type: 'text' },
            { name: 'listOfficeName', type: 'text' },
            {
              name: 'interiorSpecs',
              type: 'group',
              fields: [
                stringList('interiorFeatures', 'Interior features'),
                stringList('appliances'),
                stringList('flooring'),
                stringList('heating'),
                stringList('cooling'),
                stringList('laundryFeatures', 'Laundry'),
              ],
            },
            {
              name: 'exteriorSpecs',
              type: 'group',
              fields: [
                stringList('roof'),
                stringList('constructionMaterials', 'Construction'),
                stringList('parkingFeatures', 'Parking'),
                stringList('poolFeatures', 'Pool'),
                stringList('lotFeatures', 'Lot'),
                stringList('sewer'),
                stringList('waterSource', 'Water'),
              ],
            },
          ],
        },
        {
          label: 'Author',
          fields: [
            {
              name: 'badge',
              type: 'text',
              admin: {
                description: 'Optional marketing label. Sync never writes this.',
              },
            },
            {
              name: 'isFeatured',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                description:
                  'Show on the homepage curated residences rail. Sync never writes this.',
              },
            },
            {
              name: 'isEstate',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Marketing price tier — not an MLS field.',
              },
            },
            {
              name: 'neighborhoodBlurb',
              type: 'textarea',
            },
            stringList('highlights'),
            {
              name: 'floorPlan',
              type: 'array',
              admin: {
                description: 'Author-only room list; hide on PDP when empty.',
              },
              fields: [
                { name: 'area', type: 'text', required: true },
                { name: 'name', type: 'text', required: true },
                { name: 'note', type: 'text' },
                {
                  name: 'tone',
                  type: 'select',
                  options: [
                    { label: 'Primary', value: 'primary' },
                    { label: 'Common', value: 'common' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            seoField({
              description:
                'Overrides only. Anything left blank is generated from the address, community, price and specs.',
            }),
          ],
        },
        {
          label: 'Raw',
          fields: [
            {
              name: 'rawData',
              type: 'json',
              admin: {
                description: 'Full RESO record for debugging / later field extraction.',
              },
            },
          ],
        },
      ],
    },
  ],
};
