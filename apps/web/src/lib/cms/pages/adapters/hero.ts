import type { HeroBlock } from '@mvp-realty/api-contracts';

import { homepageFixture } from '@/data/homepage-fixture';
import { hasCtaTarget, normalizeCta } from '../../links';
import { normalizeMediaField } from '../../media';
import { bool, text } from '../primitives';

export function normalizeHeroBlock(raw: Record<string, unknown>): HeroBlock {
  return {
    blockType: 'hero',
    anchorId: text(raw.anchorId) || undefined,
    backgroundImage: normalizeMediaField(
      raw.backgroundImage,
      homepageFixture.layout[0]?.blockType === 'hero'
        ? homepageFixture.layout[0].backgroundImage.alt
        : 'Hero image',
    ),
    backgroundImagePriority: bool(raw.backgroundImagePriority, true),
    eyebrow: text(raw.eyebrow, 'By Appointment'),
    heading: text(raw.heading, 'A prestigious address'),
    headingAccent: text(raw.headingAccent) || undefined,
    lede: text(raw.lede, 'Private gated communities minutes from the Gulf beaches.'),
    primaryCta: normalizeCta(raw.primaryCta, 'View Residences', '/#listings'),
    secondaryCta: hasCtaTarget(raw.secondaryCta)
      ? normalizeCta(raw.secondaryCta, 'Request My Shortlist', '/#lead')
      : undefined,
    showEyebrowMarker: bool(raw.showEyebrowMarker, true),
    showPrimaryCtaIcon: bool(raw.showPrimaryCtaIcon, true),
    showSecondaryCta: bool(raw.showSecondaryCta, true),
  };
}
