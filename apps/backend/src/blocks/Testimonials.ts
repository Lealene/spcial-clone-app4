import { CMS_PAGE_BLOCK_LIMITS, CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { enabledField } from '../fields/enabled';
import { mediaField } from '../fields/media';
import { integerValidator } from '../fields/number';

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: {
    singular: 'Testimonials',
    plural: 'Testimonials',
  },
  fields: [
    enabledField(),
    anchorIdField('testimonials'),
    { name: 'kicker', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    { name: 'heading', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'headingAccent', type: 'text', maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'headingSuffix', type: 'text', maxLength: CMS_TEXT_LIMITS.heading },
    {
      name: 'stories',
      type: 'array',
      required: true,
      minRows: CMS_PAGE_BLOCK_LIMITS.testimonialStories.min,
      maxRows: CMS_PAGE_BLOCK_LIMITS.testimonialStories.max,
      admin: { description: 'Recommended: 1-8 stories. Portraits should be 4:5.' },
      fields: [
        { name: 'slug', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.slug },
        { name: 'name', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },

        { name: 'quote', type: 'textarea', required: true, maxLength: CMS_TEXT_LIMITS.longCopy },
        mediaField({
          name: 'portrait',
          required: true,
          description: 'Recommended aspect ratio: 4:5.',
        }),
        { name: 'tabAriaLabel', type: 'text', maxLength: CMS_TEXT_LIMITS.label },
      ],
    },
    { name: 'carouselAutoPlay', type: 'checkbox', defaultValue: true },
    {
      name: 'carouselIntervalMs',
      type: 'number',
      defaultValue: 6500,
      min: CMS_PAGE_BLOCK_LIMITS.testimonialIntervalMs.min,
      max: CMS_PAGE_BLOCK_LIMITS.testimonialIntervalMs.max,
      validate: integerValidator,
    },
    {
      name: 'previousLabel',
      type: 'text',
      defaultValue: 'Previous story',
      maxLength: CMS_TEXT_LIMITS.label,
    },
    {
      name: 'nextLabel',
      type: 'text',
      defaultValue: 'Next story',
      maxLength: CMS_TEXT_LIMITS.label,
    },
    {
      name: 'tabListLabel',
      type: 'text',
      defaultValue: 'Choose a resident story',
      maxLength: CMS_TEXT_LIMITS.label,
    },
    { name: 'counterSeparator', type: 'text', defaultValue: '/', maxLength: 4 },
    { name: 'emptyStateHeading', type: 'text', admin: { hidden: true } },
    { name: 'emptyStateBody', type: 'textarea', admin: { hidden: true } },
  ],
};
