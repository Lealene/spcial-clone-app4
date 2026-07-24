import type { HeroBlock } from '@mvp-realty/api-contracts';

import { hasCtaTarget, normalizeCta } from '../../links';
import { normalizeMediaField } from '../../media';
import { bool, text } from '../primitives';

export function normalizeHeroBlock(raw: Record<string, unknown>): HeroBlock {
  return {
    blockType: 'hero',
    anchorId: text(raw.anchorId) || undefined,
    backgroundImage: normalizeMediaField(raw.backgroundImage),
    backgroundImagePriority: bool(raw.backgroundImagePriority, true),
    eyebrow: text(raw.eyebrow),
    heading: text(raw.heading),
    headingAccent: text(raw.headingAccent) || undefined,
    lede: text(raw.lede),
    primaryCta: normalizeCta(raw.primaryCta),
    secondaryCta: hasCtaTarget(raw.secondaryCta) ? normalizeCta(raw.secondaryCta) : undefined,
    showEyebrowMarker: bool(raw.showEyebrowMarker, true),
    showPrimaryCtaIcon: bool(raw.showPrimaryCtaIcon, true),
    showSecondaryCta: bool(raw.showSecondaryCta, true),
  };
}
