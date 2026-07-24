import { CMS_TEXT_LIMITS } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { anchorIdField } from '../fields/anchorId';
import { ctaField } from '../fields/cta';
import { enabledField } from '../fields/enabled';
import { mediaField } from '../fields/media';

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    enabledField(),
    anchorIdField(),
    mediaField({
      name: 'backgroundImage',
      label: 'Background image',
      required: true,
      description: 'Full-width landscape, at least 2000px wide.',
    }),
    { name: 'backgroundImagePriority', type: 'checkbox', defaultValue: true },
    { name: 'eyebrow', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.label },
    { name: 'heading', type: 'text', required: true, maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'headingAccent', type: 'text', maxLength: CMS_TEXT_LIMITS.heading },
    { name: 'lede', type: 'textarea', required: true, maxLength: CMS_TEXT_LIMITS.shortCopy },
    ctaField({ name: 'primaryCta', label: 'Primary CTA', required: true }),
    ctaField({ name: 'secondaryCta', label: 'Secondary CTA' }),
    { name: 'showEyebrowMarker', type: 'checkbox', defaultValue: true },
    { name: 'showPrimaryCtaIcon', type: 'checkbox', defaultValue: true },
    { name: 'showSecondaryCta', type: 'checkbox', defaultValue: true },
  ],
};
