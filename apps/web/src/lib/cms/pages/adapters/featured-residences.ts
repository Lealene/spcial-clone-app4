import type { FeaturedResidencesBlock } from '@mvp-realty/api-contracts';

import { hasCtaTarget, normalizeCta, normalizeLink } from '../../links';
import { normalizeMediaField } from '../../media';
import { mapValidRows, normalizeHeaderGroup, text } from '../primitives';

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function normalizeFeaturedResidencesBlock(
  raw: Record<string, unknown>,
): FeaturedResidencesBlock {
  return {
    blockType: 'featuredResidences',
    anchorId: text(raw.anchorId, 'listings'),
    header: normalizeHeaderGroup(raw.header),
    sourceMode: 'manual',
    manualListings: mapValidRows(raw.manualListings, (row) => {
      const slug = text(row.slug);
      const name = text(row.name);
      const locality = text(row.locality);
      const priceLabel = text(row.priceLabel);
      const beds = finiteNumber(row.beds);
      const baths = finiteNumber(row.baths);
      const sqft = finiteNumber(row.sqft);
      const badge = text(row.badge);
      const price =
        row.price === undefined || row.price === null ? undefined : finiteNumber(row.price);

      if (
        !slug ||
        !name ||
        !locality ||
        !priceLabel ||
        beds === null ||
        baths === null ||
        sqft === null ||
        !badge ||
        price === null
      ) {
        return null;
      }

      return {
        slug,
        name,
        locality,
        price,
        priceLabel,
        beds,
        bedsLabel: text(row.bedsLabel, 'Beds'),
        baths,
        bathsLabel: text(row.bathsLabel, 'Baths'),
        sqft,
        sqftLabel: text(row.sqftLabel, 'Sq Ft'),
        badge,
        image: normalizeMediaField(row.image, name),
        link: normalizeLink(row.link, name),
      };
    }),
    cardCtaLabel: text(raw.cardCtaLabel, 'View residence'),
    moreLink: hasCtaTarget(raw.moreLink) ? normalizeCta(raw.moreLink) : undefined,
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}
