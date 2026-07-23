import type { LifestyleBlock } from '@mvp-realty/api-contracts';

import { hasLinkTarget, normalizeLink } from '../../links';
import { normalizeMediaField } from '../../media';
import { array, isRecord, num, text } from '../primitives';

export function normalizeLifestyleBlock(raw: Record<string, unknown>): LifestyleBlock {
  return {
    blockType: 'lifestyle',
    anchorId: text(raw.anchorId, 'lifestyle'),
    backgroundImage: normalizeMediaField(raw.backgroundImage, 'Lifestyle background'),
    kicker: text(raw.kicker, 'The Life'),
    heading: text(raw.heading, 'You buy the home.'),
    headingAccent: text(raw.headingAccent) || undefined,
    body: text(
      raw.body,
      'Discover the community lifestyle, amenities, and neighbors that make each address feel complete.',
    ),
    maxTiles: num(raw.maxTiles, 3),
    tiles: array(raw.tiles).map((item) => {
      const row = isRecord(item) ? item : {};
      return {
        caption: text(row.caption, 'Community lifestyle'),
        image: normalizeMediaField(row.image, text(row.caption, 'Lifestyle image')),
        link: hasLinkTarget(row.link)
          ? normalizeLink(row.link, text(row.caption, 'Tile'), '#')
          : undefined,
      };
    }),
  };
}
