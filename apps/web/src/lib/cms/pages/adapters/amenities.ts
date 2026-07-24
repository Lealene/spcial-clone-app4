import { amenityIconSchema, type AmenitiesBlock } from '@mvp-realty/api-contracts';

import { normalizeMediaField } from '../../media';
import { mapValidRows, normalizeHeaderGroup, text } from '../primitives';

export function normalizeAmenitiesBlock(raw: Record<string, unknown>): AmenitiesBlock {
  return {
    blockType: 'amenities',
    anchorId: text(raw.anchorId, 'amenities'),
    header: normalizeHeaderGroup(raw.header),
    featureImage: normalizeMediaField(raw.featureImage),
    featureTitle: text(raw.featureTitle),
    featureCaption: text(raw.featureCaption),
    amenities: mapValidRows(raw.amenities, (row) => {
      const icon = amenityIconSchema.safeParse(row.icon);
      const title = text(row.title);
      const blurb = text(row.blurb);
      if (!icon.success || !title || !blurb) return null;

      return { icon: icon.data, title, blurb };
    }),
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}
