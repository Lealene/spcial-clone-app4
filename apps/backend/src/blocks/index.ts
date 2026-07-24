import { CMS_PAGE_BLOCK_TYPES, type CmsPageBlockType } from '@mvp-realty/api-contracts';
import type { Block } from 'payload';

import { AmenitiesBlock } from './Amenities';
import { CommunitiesStripBlock } from './CommunitiesStrip';
import { FeaturedCommunitiesBlock } from './FeaturedCommunities';
import { FeaturedResidencesBlock } from './FeaturedResidences';
import { HeroBlock } from './Hero';
import { LeadCaptureBlock } from './LeadCapture';
import { LifestyleBlock } from './Lifestyle';
import { OwnerIntroBlock } from './OwnerIntro';
import { TestimonialsBlock } from './Testimonials';

export const pageBlocksByType = {
  hero: HeroBlock,
  communitiesStrip: CommunitiesStripBlock,
  featuredCommunities: FeaturedCommunitiesBlock,
  featuredResidences: FeaturedResidencesBlock,
  lifestyle: LifestyleBlock,
  testimonials: TestimonialsBlock,
  amenities: AmenitiesBlock,
  ownerIntro: OwnerIntroBlock,
  leadCapture: LeadCaptureBlock,
} satisfies Record<CmsPageBlockType, Block>;

export const pageBlocks = CMS_PAGE_BLOCK_TYPES.map((blockType) => pageBlocksByType[blockType]);
