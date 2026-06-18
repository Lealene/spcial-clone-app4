import type { Block } from 'payload';

import { ctaField } from '../fields/cta';
import { mediaField } from '../fields/media';

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    {
      name: 'anchorId',
      type: 'text',
      admin: { description: 'Optional plain section ID without #.' },
    },
    mediaField({
      name: 'backgroundImage',
      label: 'Background image',
      required: true,
      description: 'Full-width landscape, at least 2000px wide.',
    }),
    { name: 'backgroundImagePriority', type: 'checkbox', defaultValue: true },
    { name: 'eyebrow', type: 'text', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'headingAccent', type: 'text' },
    { name: 'lede', type: 'textarea', required: true },
    ctaField({ name: 'primaryCta', label: 'Primary CTA', required: true }),
    ctaField({ name: 'secondaryCta', label: 'Secondary CTA' }),
    { name: 'showEyebrowMarker', type: 'checkbox', defaultValue: true },
    { name: 'showPrimaryCtaIcon', type: 'checkbox', defaultValue: true },
    { name: 'showSecondaryCta', type: 'checkbox', defaultValue: true },
  ],
};
