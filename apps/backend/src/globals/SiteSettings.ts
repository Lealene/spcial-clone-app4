import { CMS_CACHE_TAGS, CMS_TEXT_LIMITS, SITE_OPENING_DAYS } from '@mvp-realty/api-contracts';
import type { GlobalConfig } from 'payload';

import { authenticated } from '../access/authenticated';
import { revalidateGlobalAfterChange } from '../hooks/revalidate';

const dayOptions = SITE_OPENING_DAYS.map((day) => ({ label: day, value: day }));

/**
 * The single source of business identity. Everything here feeds the site-wide
 * `RealEstateAgent` JSON-LD node and the default social/meta tags, so the values
 * must match the brokerage's Google Business Profile exactly — inconsistent NAP
 * is what stops the entity from consolidating in local search.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    description:
      'Business identity used for structured data (JSON-LD) and default social sharing tags. Keep the name, address and phone identical to the Google Business Profile.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange([CMS_CACHE_TAGS.siteSettings])],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              defaultValue: '55 Living Team',
              maxLength: CMS_TEXT_LIMITS.heading,
              admin: { description: 'Public brand name, e.g. "55 Living Team".' },
            },
            {
              name: 'legalName',
              type: 'text',
              maxLength: CMS_TEXT_LIMITS.heading,
              admin: { description: 'Registered entity name, if it differs from the brand.' },
            },
            {
              name: 'description',
              type: 'textarea',
              maxLength: CMS_TEXT_LIMITS.shortCopy,
              admin: { description: 'Falls back to the built-in site description when blank.' },
            },
            {
              name: 'licenseNumber',
              type: 'text',
              maxLength: CMS_TEXT_LIMITS.label,
              admin: { description: 'Florida real estate license number.' },
            },
            {
              name: 'priceRange',
              type: 'text',
              maxLength: CMS_TEXT_LIMITS.label,
              admin: { description: 'schema.org priceRange, e.g. "$$$$".' },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'phone', type: 'text', maxLength: CMS_TEXT_LIMITS.label },
            { name: 'email', type: 'email' },
            {
              name: 'address',
              type: 'group',
              fields: [
                { name: 'streetAddress', type: 'text', maxLength: CMS_TEXT_LIMITS.shortCopy },
                { name: 'addressLocality', type: 'text', maxLength: CMS_TEXT_LIMITS.label },
                {
                  name: 'addressRegion',
                  type: 'text',
                  defaultValue: 'FL',
                  maxLength: CMS_TEXT_LIMITS.label,
                },
                { name: 'postalCode', type: 'text', maxLength: CMS_TEXT_LIMITS.label },
                {
                  name: 'addressCountry',
                  type: 'text',
                  defaultValue: 'US',
                  maxLength: CMS_TEXT_LIMITS.label,
                },
              ],
            },
            {
              name: 'geo',
              type: 'group',
              admin: { description: 'Office coordinates. Emitted only when both are set.' },
              fields: [
                { name: 'latitude', type: 'number', min: -90, max: 90 },
                { name: 'longitude', type: 'number', min: -180, max: 180 },
              ],
            },
            {
              name: 'openingHours',
              type: 'array',
              labels: { singular: 'Hours row', plural: 'Hours rows' },
              fields: [
                {
                  name: 'days',
                  type: 'select',
                  hasMany: true,
                  required: true,
                  options: dayOptions,
                },
                {
                  name: 'opens',
                  type: 'text',
                  required: true,
                  admin: { description: '24-hour HH:MM, e.g. 09:00.' },
                },
                {
                  name: 'closes',
                  type: 'text',
                  required: true,
                  admin: { description: '24-hour HH:MM, e.g. 17:30.' },
                },
              ],
            },
            {
              name: 'areaServed',
              type: 'array',
              labels: { singular: 'Area', plural: 'Areas served' },
              admin: { description: 'Cities and regions the brokerage covers.' },
              fields: [{ name: 'value', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Brand & social',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Square or wide logo used as the organization logo.' },
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Fallback social card for pages without their own image.' },
            },
            {
              name: 'sameAs',
              type: 'array',
              labels: { singular: 'Profile', plural: 'Profiles' },
              admin: {
                description:
                  'Absolute URLs to official profiles (Facebook, Instagram, LinkedIn, Zillow, Google Business Profile).',
              },
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  maxLength: CMS_TEXT_LIMITS.url,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
