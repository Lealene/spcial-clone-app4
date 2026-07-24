import type { OwnerIntroBlock } from '@mvp-realty/api-contracts';

import { normalizeMediaField } from '../../media';
import { mapValidRows, text } from '../primitives';

export function normalizeOwnerIntroBlock(raw: Record<string, unknown>): OwnerIntroBlock {
  return {
    blockType: 'ownerIntro',
    anchorId: text(raw.anchorId, 'concierge'),
    portrait: normalizeMediaField(raw.portrait),
    portraitBadgeLabel: text(raw.portraitBadgeLabel, 'Broker & Owner'),
    kicker: text(raw.kicker),
    heading: text(raw.heading),
    headingAccent: text(raw.headingAccent) || undefined,
    titleLine: text(raw.titleLine),
    bio: text(raw.bio),
    signature: text(raw.signature),
    credentials: mapValidRows(raw.credentials, (row) => {
      const value = text(row.value);
      const label = text(row.label);
      return value && label ? { value, label } : null;
    }),
  };
}
