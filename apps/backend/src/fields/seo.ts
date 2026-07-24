import { CMS_TEXT_LIMITS, cmsCanonicalUrlSchema } from '@mvp-realty/api-contracts';
import type { Field, Validate } from 'payload';

const validateCanonicalUrl: Validate = (value, { siblingData }) => {
  if (siblingData?.canonicalMode !== 'custom') return true;
  return cmsCanonicalUrlSchema.safeParse(value).success
    ? true
    : 'Enter a safe app-relative or HTTP(S) canonical URL.';
};

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
            { name: 'metaTitle', type: 'text', maxLength: 70 },
            { name: 'metaDescription', type: 'textarea', maxLength: 200 },
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
              maxLength: CMS_TEXT_LIMITS.url,
              validate: validateCanonicalUrl,
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
            { name: 'ogTitle', type: 'text', maxLength: 70 },
            { name: 'ogDescription', type: 'textarea', maxLength: 200 },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
            { name: 'ogImageAlt', type: 'text', maxLength: CMS_TEXT_LIMITS.shortCopy },
            {
              name: 'twitterCard',
              type: 'select',
              defaultValue: 'summary_large_image',
              options: [
                { label: 'Summary', value: 'summary' },
                { label: 'Summary large image', value: 'summary_large_image' },
              ],
            },
            { name: 'twitterTitle', type: 'text', maxLength: 70 },
            { name: 'twitterDescription', type: 'textarea', maxLength: 200 },
            { name: 'twitterImage', type: 'upload', relationTo: 'media' },
            { name: 'twitterImageAlt', type: 'text', maxLength: CMS_TEXT_LIMITS.shortCopy },
          ],
        },
        {
          label: 'Sitemap',
          fields: [
            {
              name: 'includeInSitemap',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Reserved for the future generated sitemap.' },
            },
          ],
        },
      ],
    },
  ],
};
