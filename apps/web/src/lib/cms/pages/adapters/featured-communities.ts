import type { FeaturedCommunitiesBlock } from '@mvp-realty/api-contracts';

import { hasCtaTarget, normalizeCta, normalizeLink } from '../../links';
import { normalizeMediaField } from '../../media';
import { mapValidRows, normalizeHeaderGroup, normalizeTags, text } from '../primitives';

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function normalizeFeaturedCommunitiesBlock(
  raw: Record<string, unknown>,
): FeaturedCommunitiesBlock {
  const sourceMode = text(raw.sourceMode) === 'manual' ? 'manual' : 'areas';

  return {
    blockType: 'featuredCommunities',
    anchorId: text(raw.anchorId, 'communities'),
    header: normalizeHeaderGroup(raw.header),
    sourceMode,
    manualCommunities: mapValidRows(raw.manualCommunities, (row) => {
      const slug = text(row.slug);
      const name = text(row.name);
      const locality = text(row.locality);
      const priceRange = text(row.priceRange);
      const nowSelling = finiteNumber(row.nowSelling);

      if (!slug || !name || !locality || !priceRange || nowSelling === null) {
        return null;
      }

      return {
        slug,
        name,
        locality,
        priceRange,
        tags: normalizeTags(row.tags),
        nowSelling,
        nowSellingLabel: text(row.nowSellingLabel, 'now selling'),
        image: normalizeMediaField(row.image, name),
        link: normalizeLink(row.link, name),
      };
    }),
    moreLink: hasCtaTarget(raw.moreLink) ? normalizeCta(raw.moreLink) : undefined,
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}
