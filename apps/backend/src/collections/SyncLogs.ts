import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';

export const SyncLogs: CollectionConfig = {
  slug: 'sync-logs',
  admin: {
    useAsTitle: 'runAt',
    defaultColumns: ['runAt', 'trigger', 'status', 'durationMs'],
    description: 'Bridge MLS sync run history. Zero-listing areas are flagged as warnings.',
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'runAt',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'trigger',
      type: 'select',
      required: true,
      options: [
        { label: 'Cron', value: 'cron' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'durationMs',
      type: 'number',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
    },
    {
      name: 'message',
      type: 'text',
      admin: {
        description: 'High-level summary, e.g. zero-listing warnings.',
      },
    },
    {
      name: 'areas',
      type: 'array',
      fields: [
        {
          name: 'area',
          type: 'relationship',
          relationTo: 'areas',
          required: true,
        },
        { name: 'areaSlug', type: 'text' },
        { name: 'fetched', type: 'number', required: true },
        { name: 'created', type: 'number', required: true },
        { name: 'updated', type: 'number', required: true },
        { name: 'deactivated', type: 'number', required: true },
        {
          name: 'warnings',
          type: 'array',
          fields: [{ name: 'item', type: 'text', required: true }],
        },
        {
          name: 'errors',
          type: 'array',
          fields: [{ name: 'item', type: 'text', required: true }],
        },
      ],
    },
  ],
};
