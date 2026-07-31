import type { FeaturedCommunitiesBlock } from '@mvp-realty/api-contracts';

import { CommunitySlider } from '@/components/communities/community-slider';
import type { CommunityCardData } from '@/components/communities/community-card';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/shared/reveal';
import { SectionHeader } from '@/components/layout/section-header';
import { getCommunityAreaCards } from '@/lib/cms/areas';
import { getActiveListingCountsByCommunity } from '@/lib/cms/listings';

const FEATURED_COMMUNITIES_LIMIT = 12;

export async function FeaturedCommunities({ block }: { block: FeaturedCommunitiesBlock }) {
  const listingCounts = await getActiveListingCountsByCommunity();

  let communities: CommunityCardData[];

  if (block.sourceMode === 'manual' && block.manualCommunities.length > 0) {
    communities = block.manualCommunities.map((community) => ({
      slug: community.slug,
      name: community.name,
      locality: community.locality,
      rating: community.rating,
      reviews: community.reviews,
      reviewsLabel: community.reviewsLabel,
      priceRange: community.priceRange,
      tags: community.tags,
      residences: community.residences,
      residencesLabel: community.residencesLabel,
      nowSelling: listingCounts.get(community.slug) ?? community.nowSelling,
      nowSellingLabel: community.nowSellingLabel,
      image: community.image,
      href: community.link.href,
      link: community.link,
    }));
  } else {
    communities = (await getCommunityAreaCards(FEATURED_COMMUNITIES_LIMIT)).map((community) => ({
      ...community,
      nowSelling: listingCounts.get(community.slug) ?? community.nowSelling,
    }));
  }

  return (
    <section id={block.anchorId} className="bg-surface-muted py-[clamp(78px,9vw,138px)]">
      <Container>
        <Reveal>
          <SectionHeader
            align="center"
            kicker={block.header.kicker}
            heading={block.header.heading}
            headingAccent={block.header.headingAccent}
            lede={block.header.lede}
          />
        </Reveal>

        {communities.length > 0 ? (
          <Reveal delay={0.1} className="mt-[clamp(36px,4vw,52px)]">
            <CommunitySlider communities={communities} />
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
