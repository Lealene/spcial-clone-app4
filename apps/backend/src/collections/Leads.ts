import {
  LEAD_CRM_STATUSES,
  LEAD_FIELD_LIMITS,
  LEAD_FORM_TYPES,
  LEAD_SURFACES,
} from '@mvp-realty/api-contracts';
import type { CollectionConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { leadsSubmitEndpoint } from '../endpoints/leads-submit';

const titleCase = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'formType', 'surface', 'crmStatus', 'createdAt'],
    description:
      'Website lead submissions. Source of truth — Wise Agent sync is an outbound mirror, so a failed sync never loses a lead.',
  },
  // Serves POST /api/leads/submit.
  endpoints: [leadsSubmitEndpoint],
  access: {
    // The ingest endpoint writes with overrideAccess after validating a shared
    // secret; nothing else may create. Reads stay admin-only (leads are PII).
    create: () => false,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
          maxLength: LEAD_FIELD_LIMITS.name,
          admin: { width: '50%' },
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          maxLength: LEAD_FIELD_LIMITS.name,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          index: true,
          admin: { width: '50%' },
        },
        {
          name: 'phone',
          type: 'text',
          maxLength: LEAD_FIELD_LIMITS.phone,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      maxLength: LEAD_FIELD_LIMITS.message,
      admin: { description: 'Sent to Wise Agent in the lead email, not as a contact field.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'formType',
          type: 'select',
          required: true,
          index: true,
          options: LEAD_FORM_TYPES.map((value) => ({ label: titleCase(value), value })),
          admin: {
            width: '50%',
            description: 'Determines the Wise Agent Source. Do not repurpose existing values.',
          },
        },
        {
          name: 'surface',
          type: 'select',
          required: true,
          options: LEAD_SURFACES.map((value) => ({ label: titleCase(value), value })),
          admin: { width: '50%', description: 'Which component submitted. Reporting only.' },
        },
      ],
    },
    {
      name: 'pageUrl',
      type: 'text',
      maxLength: LEAD_FIELD_LIMITS.pageUrl,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'area',
          type: 'relationship',
          relationTo: 'areas',
          admin: { width: '50%', description: 'Resolved from the submitted community slug.' },
        },
        {
          name: 'listing',
          type: 'relationship',
          relationTo: 'listings',
          admin: { width: '50%', description: 'Resolved from the submitted listing slug.' },
        },
      ],
    },
    {
      name: 'crm',
      type: 'group',
      label: 'Wise Agent sync',
      admin: {
        description:
          'Written by the syncLeadToWiseAgent job, which emails the Wise Agent lead-capture address. Read-only in practice.',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          index: true,
          options: LEAD_CRM_STATUSES.map((value) => ({ label: titleCase(value), value })),
          admin: {
            description:
              'synced means the mail provider accepted the lead email — email parsing sends no confirmation back. skipped means no lead-capture address or SMTP transport was configured when the job ran; requeue with `leads:resync`.',
          },
        },
        { name: 'syncedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'error', type: 'textarea' },
      ],
    },
  ],
};
