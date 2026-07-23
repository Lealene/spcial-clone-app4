import type { CmsPageBlock, CmsPageBlockType } from '@mvp-realty/api-contracts';
import type { ReactNode } from 'react';

import { Amenities } from './amenities';
import { CommunitiesStrip } from './communities-strip';
import { FeaturedCommunities } from './featured-communities';
import { FeaturedResidences } from './featured-residences';
import { Hero } from './hero';
import { LeadCapture } from './lead-capture';
import { MeetTheOwner } from './meet-the-owner';
import { Testimonials } from './testimonials';
import { TheLife } from './the-life';

type RendererMap = {
  [BlockType in CmsPageBlockType]: (
    block: Extract<CmsPageBlock, { blockType: BlockType }>,
  ) => ReactNode;
};

export const blockRenderers = {
  hero: (block) => <Hero block={block} />,
  communitiesStrip: (block) => <CommunitiesStrip block={block} />,
  featuredCommunities: (block) => <FeaturedCommunities block={block} />,
  featuredResidences: (block) => <FeaturedResidences block={block} />,
  lifestyle: (block) => <TheLife block={block} />,
  testimonials: (block) => <Testimonials block={block} />,
  amenities: (block) => <Amenities block={block} />,
  ownerIntro: (block) => <MeetTheOwner block={block} />,
  leadCapture: (block) => <LeadCapture block={block} />,
} satisfies RendererMap;

export function CmsPageBlockRenderer({ block }: { block: CmsPageBlock }) {
  const render = blockRenderers[block.blockType] as (value: CmsPageBlock) => ReactNode;
  return render(block);
}

export function CmsPageBlocksRenderer({ blocks }: { blocks: CmsPageBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <CmsPageBlockRenderer key={`${block.blockType}-${index}`} block={block} />
      ))}
    </>
  );
}

export const BlockRenderer = CmsPageBlockRenderer;
