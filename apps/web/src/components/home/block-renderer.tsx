import type { HomepageBlock } from '@mvp-realty/api-contracts';

import { Amenities } from './amenities';
import { CommunitiesStrip } from './communities-strip';
import { FeaturedCommunities } from './featured-communities';
import { FeaturedResidences } from './featured-residences';
import { Hero } from './hero';
import { LeadCapture } from './lead-capture';
import { MeetTheOwner } from './meet-the-owner';
import { Testimonials } from './testimonials';
import { TheLife } from './the-life';

export function BlockRenderer({ block }: { block: HomepageBlock }) {
  switch (block.blockType) {
    case 'hero':
      return <Hero block={block} />;
    case 'communitiesStrip':
      return <CommunitiesStrip block={block} />;
    case 'featuredCommunities':
      return <FeaturedCommunities block={block} />;
    case 'featuredResidences':
      return <FeaturedResidences block={block} />;
    case 'lifestyle':
      return <TheLife block={block} />;
    case 'testimonials':
      return <Testimonials block={block} />;
    case 'amenities':
      return <Amenities block={block} />;
    case 'ownerIntro':
      return <MeetTheOwner block={block} />;
    case 'leadCapture':
      return <LeadCapture block={block} />;
    default:
      return null;
  }
}
