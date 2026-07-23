import type { CommunitiesStripBlock } from '@mvp-realty/api-contracts';

import { normalizeLink } from '../../links';
import { array, isRecord, num, text } from '../primitives';

export function normalizeCommunitiesStripBlock(
  raw: Record<string, unknown>,
): CommunitiesStripBlock {
  return {
    blockType: 'communitiesStrip',
    anchorId: text(raw.anchorId) || undefined,
    sourceMode: 'manual',
    maxItems: num(raw.maxItems, 3),
    items: array(raw.items).map((item) => {
      const row = isRecord(item) ? item : {};
      return {
        slug: text(row.slug, text(row.name, 'community')),
        name: text(row.name, 'Community'),
        blurb: text(row.blurb, 'Explore this Gulf-Coast community.'),
        link: normalizeLink(
          row.link,
          text(row.name, 'Community'),
          `/communities/${text(row.slug, '')}`,
        ),
        icon: 'mapPin',
      };
    }),
  };
}
