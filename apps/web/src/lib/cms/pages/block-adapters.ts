import {
  CMS_PAGE_BLOCK_TYPES,
  type CmsPageBlock,
  type CmsPageBlockType,
} from '@mvp-realty/api-contracts';

import { normalizeAmenitiesBlock } from './adapters/amenities';
import { normalizeCommunitiesStripBlock } from './adapters/communities-strip';
import { normalizeFeaturedCommunitiesBlock } from './adapters/featured-communities';
import { normalizeFeaturedResidencesBlock } from './adapters/featured-residences';
import { normalizeHeroBlock } from './adapters/hero';
import { normalizeLeadCaptureBlock } from './adapters/lead-capture';
import { normalizeLifestyleBlock } from './adapters/lifestyle';
import { normalizeOwnerIntroBlock } from './adapters/owner-intro';
import { normalizeTestimonialsBlock } from './adapters/testimonials';
import { isRecord } from './primitives';

export type CmsPageBlockAdapter = (raw: Record<string, unknown>) => CmsPageBlock;

export const cmsPageBlockAdapters = {
  hero: normalizeHeroBlock,
  communitiesStrip: normalizeCommunitiesStripBlock,
  featuredCommunities: normalizeFeaturedCommunitiesBlock,
  featuredResidences: normalizeFeaturedResidencesBlock,
  lifestyle: normalizeLifestyleBlock,
  testimonials: normalizeTestimonialsBlock,
  amenities: normalizeAmenitiesBlock,
  ownerIntro: normalizeOwnerIntroBlock,
  leadCapture: normalizeLeadCaptureBlock,
} satisfies Record<CmsPageBlockType, CmsPageBlockAdapter>;

const cmsPageBlockTypeSet = new Set<string>(CMS_PAGE_BLOCK_TYPES);

export function normalizeCmsPageBlock(raw: unknown): CmsPageBlock | null {
  if (!isRecord(raw) || typeof raw.blockType !== 'string') return null;
  if (!cmsPageBlockTypeSet.has(raw.blockType)) return null;

  const adapter = cmsPageBlockAdapters[raw.blockType as CmsPageBlockType];
  return adapter(raw);
}
