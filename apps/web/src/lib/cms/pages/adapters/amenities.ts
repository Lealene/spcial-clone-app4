import {
  amenityIconSchema,
  type AmenitiesBlock,
  type AmenityIcon,
} from '@mvp-realty/api-contracts';

import { normalizeMediaField } from '../../media';
import { array, isRecord, normalizeHeaderGroup, text } from '../primitives';

function normalizeAmenityIcon(value: unknown): AmenityIcon {
  const parsed = amenityIconSchema.safeParse(value);
  return parsed.success ? parsed.data : 'pool';
}

export function normalizeAmenitiesBlock(raw: Record<string, unknown>): AmenitiesBlock {
  return {
    blockType: 'amenities',
    anchorId: text(raw.anchorId, 'amenities'),
    header: normalizeHeaderGroup(raw.header),
    featureImage: normalizeMediaField(raw.featureImage, 'Amenity feature image'),
    featureTitle: text(raw.featureTitle, 'Feature'),
    featureCaption: text(raw.featureCaption, 'Resort-style amenities arranged for everyday ease.'),
    amenities: array(raw.amenities).map((item) => {
      const row = isRecord(item) ? item : {};
      return {
        icon: normalizeAmenityIcon(row.icon),
        title: text(row.title, 'Amenity'),
        blurb: text(row.blurb, 'A carefully maintained amenity for daily Gulf-Coast living.'),
      };
    }),
    emptyStateHeading: text(raw.emptyStateHeading) || undefined,
    emptyStateBody: text(raw.emptyStateBody) || undefined,
  };
}
