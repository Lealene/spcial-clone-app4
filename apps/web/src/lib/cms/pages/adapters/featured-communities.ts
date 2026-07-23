import type { FeaturedCommunitiesBlock } from '@mvp-realty/api-contracts';

import { hasCtaTarget, normalizeCta, normalizeLink } from '../../links';
import { normalizeMediaField } from '../../media';
import { array, isRecord, normalizeHeaderGroup, normalizeTags, num, text } from '../primitives';

export function normalizeFeaturedCommunitiesBlock(
  raw: Record<string, unknown>,
): FeaturedCommunitiesBlock {
  return {
    blockType: 'featuredCommunities',
    anchorId: text(raw.anchorId, 'communities'),
    header: normalizeHeaderGroup(raw.header),
    sourceMode: 'manual',
    manualCommunities: array(raw.manualCommunities).map((item) => {
      const row = isRecord(item) ? item : {};
      const slug = text(row.slug, text(row.name, 'community'));
      return {
        slug,
        name: text(row.name, 'Community'),
        locality: text(row.locality, 'Southwest Florida'),
        rating: num(row.rating, 0),
        reviews: num(row.reviews, 0),
        reviewsLabel: text(row.reviewsLabel, 'reviews'),
        priceRange: text(row.priceRange, 'Pricing available by request'),
        tags: normalizeTags(row.tags),
        residences: num(row.residences, 0),
        residencesLabel: text(row.residencesLabel, 'residences'),
        nowSelling: num(row.nowSelling, 0),
        nowSellingLabel: text(row.nowSellingLabel, 'now selling'),
        image: normalizeMediaField(row.image, text(row.name, 'Community image')),
        link: normalizeLink(row.link, text(row.name, 'Community'), `/communities/${slug}`),
      };
    }),
    moreLink: hasCtaTarget(raw.moreLink)
      ? normalizeCta(raw.moreLink, 'Explore all communities', '/listings')
      : undefined,
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}
