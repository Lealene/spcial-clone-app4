import type { CommunitiesStripBlock } from '@mvp-realty/api-contracts';

import { normalizeLink } from '../../links';
import { mapValidRows, text } from '../primitives';

export function normalizeCommunitiesStripBlock(
  raw: Record<string, unknown>,
): CommunitiesStripBlock {
  return {
    blockType: 'communitiesStrip',
    anchorId: text(raw.anchorId) || undefined,
    sourceMode: 'manual',
    maxItems:
      raw.maxItems === undefined ? 3 : typeof raw.maxItems === 'number' ? raw.maxItems : Number.NaN,
    items: mapValidRows(raw.items, (row) => {
      const slug = text(row.slug);
      const name = text(row.name);
      const blurb = text(row.blurb);
      if (!slug || !name || !blurb) return null;

      return {
        slug,
        name,
        blurb,
        link: normalizeLink(row.link, name),
        icon: 'mapPin',
      };
    }),
  };
}
