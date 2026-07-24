import type { LifestyleBlock } from '@mvp-realty/api-contracts';

import { hasLinkTarget, normalizeLink } from '../../links';
import { normalizeMediaField } from '../../media';
import { mapValidRows, text } from '../primitives';

export function normalizeLifestyleBlock(raw: Record<string, unknown>): LifestyleBlock {
  return {
    blockType: 'lifestyle',
    anchorId: text(raw.anchorId, 'lifestyle'),
    backgroundImage: normalizeMediaField(raw.backgroundImage),
    kicker: text(raw.kicker),
    heading: text(raw.heading),
    headingAccent: text(raw.headingAccent) || undefined,
    body: text(raw.body),
    maxTiles:
      raw.maxTiles === undefined ? 3 : typeof raw.maxTiles === 'number' ? raw.maxTiles : Number.NaN,
    tiles: mapValidRows(raw.tiles, (row) => {
      const caption = text(row.caption);
      if (!caption) return null;

      return {
        caption,
        image: normalizeMediaField(row.image, caption),
        link: hasLinkTarget(row.link) ? normalizeLink(row.link, caption) : undefined,
      };
    }),
  };
}
