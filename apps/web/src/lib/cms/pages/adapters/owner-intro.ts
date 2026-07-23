import type { OwnerIntroBlock } from '@mvp-realty/api-contracts';

import { normalizeMediaField } from '../../media';
import { array, isRecord, text } from '../primitives';

export function normalizeOwnerIntroBlock(raw: Record<string, unknown>): OwnerIntroBlock {
  return {
    blockType: 'ownerIntro',
    anchorId: text(raw.anchorId, 'concierge'),
    portrait: normalizeMediaField(raw.portrait, 'Owner portrait'),
    portraitBadgeLabel: text(raw.portraitBadgeLabel, 'Broker & Owner'),
    kicker: text(raw.kicker, 'Meet the Owner'),
    heading: text(raw.heading, 'One person'),
    headingAccent: text(raw.headingAccent) || undefined,
    titleLine: text(raw.titleLine, 'MVP Realty concierge advisor'),
    bio: text(
      raw.bio,
      'Your MVP Realty concierge will guide each step, from first conversation to the right front door.',
    ),
    signature: text(raw.signature, 'MVP Realty'),
    credentials: array(raw.credentials).map((item) => {
      const row = isRecord(item) ? item : {};
      return { value: text(row.value, '1:1'), label: text(row.label, 'concierge guidance') };
    }),
  };
}
