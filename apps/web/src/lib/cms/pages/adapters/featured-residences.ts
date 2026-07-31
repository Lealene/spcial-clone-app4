import type { FeaturedResidencesBlock } from '@mvp-realty/api-contracts';

import { hasCtaTarget, normalizeCta } from '../../links';
import { normalizeHeaderGroup, text } from '../primitives';

/**
 * `manualListings` is deliberately not mapped. The renderer resolves the rail from
 * listings flagged `isFeatured` and has never read these rows, so normalizing the
 * denormalized card fields — image, link, every label — was pure wasted work on
 * every homepage request.
 */
export function normalizeFeaturedResidencesBlock(
  raw: Record<string, unknown>,
): FeaturedResidencesBlock {
  return {
    blockType: 'featuredResidences',
    anchorId: text(raw.anchorId, 'listings'),
    header: normalizeHeaderGroup(raw.header),
    sourceMode: 'manual',
    cardCtaLabel: text(raw.cardCtaLabel, 'View residence'),
    moreLink: hasCtaTarget(raw.moreLink) ? normalizeCta(raw.moreLink) : undefined,
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}
