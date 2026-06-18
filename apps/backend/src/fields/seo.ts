import type { Field } from 'payload';

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Search',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            {
              name: 'canonicalMode',
              type: 'select',
              defaultValue: 'auto',
              options: [
                { label: 'Automatic', value: 'auto' },
                { label: 'Custom', value: 'custom' },
              ],
            },
            {
              name: 'canonicalUrl',
              type: 'text',
              admin: {
                condition: (_, siblingData) => siblingData?.canonicalMode === 'custom',
              },
            },
          ],
        },
        {
          label: 'Robots',
          fields: [
            { name: 'index', type: 'checkbox', defaultValue: true },
            { name: 'follow', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'ogTitle', type: 'text' },
            { name: 'ogDescription', type: 'textarea' },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
            { name: 'ogImageAlt', type: 'text' },
            {
              name: 'twitterCard',
              type: 'select',
              defaultValue: 'summary_large_image',
              options: [
                { label: 'Summary', value: 'summary' },
                { label: 'Summary large image', value: 'summary_large_image' },
              ],
            },
            { name: 'twitterTitle', type: 'text' },
            { name: 'twitterDescription', type: 'textarea' },
            { name: 'twitterImage', type: 'upload', relationTo: 'media' },
            { name: 'twitterImageAlt', type: 'text' },
          ],
        },
        {
          label: 'Sitemap',
          fields: [{ name: 'includeInSitemap', type: 'checkbox', defaultValue: true }],
        },
      ],
    },
  ],
};
