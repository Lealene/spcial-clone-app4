import type { FeaturedResidencesBlock } from '@mvp-realty/api-contracts';

import { hasCtaTarget, normalizeCta, normalizeLink } from '../../links';
import { normalizeMediaField } from '../../media';
import { array, isRecord, normalizeHeaderGroup, num, text } from '../primitives';

export function normalizeFeaturedResidencesBlock(
  raw: Record<string, unknown>,
): FeaturedResidencesBlock {
  return {
    blockType: 'featuredResidences',
    anchorId: text(raw.anchorId, 'listings'),
    header: normalizeHeaderGroup(raw.header),
    sourceMode: 'manual',
    manualListings: array(raw.manualListings).map((item) => {
      const row = isRecord(item) ? item : {};
      const slug = text(row.slug, text(row.name, 'listing'));
      return {
        slug,
        name: text(row.name, 'Residence'),
        locality: text(row.locality, 'Southwest Florida'),
        price: typeof row.price === 'number' ? row.price : undefined,
        priceLabel: text(row.priceLabel, 'Pricing available by request'),
        beds: num(row.beds, 0),
        bedsLabel: text(row.bedsLabel, 'Beds'),
        baths: num(row.baths, 0),
        bathsLabel: text(row.bathsLabel, 'Baths'),
        sqft: num(row.sqft, 0),
        sqftLabel: text(row.sqftLabel, 'Sq Ft'),
        badge: text(row.badge, 'Featured'),
        image: normalizeMediaField(row.image, text(row.name, 'Residence image')),
        link: normalizeLink(row.link, text(row.name, 'Residence'), `/listings/${slug}`),
      };
    }),
    cardCtaLabel: text(raw.cardCtaLabel, 'View residence'),
    moreLink: hasCtaTarget(raw.moreLink)
      ? normalizeCta(raw.moreLink, 'View the full collection', '/listings')
      : undefined,
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}
