import type { FeaturedResidencesBlock } from '@mvp-realty/api-contracts';

import { FeaturedResidencesSlider } from '@/components/blocks/featured-residences-slider';
import { Container } from '@/components/container';
import { SectionHeader } from '@/components/section-header';
import { getFeaturedListings } from '@/lib/cms/listings';

const FEATURED_SLIDER_LIMIT = 12;

export async function FeaturedResidences({ block }: { block: FeaturedResidencesBlock }) {
  const listings = await getFeaturedListings(FEATURED_SLIDER_LIMIT);

  if (listings.length === 0) {
    return null;
  }

  return (
    <section id={block.anchorId} className="bg-surface-soft py-[clamp(78px,9vw,138px)]">
      <Container>
        <SectionHeader
          align="center"
          kicker={block.header.kicker}
          heading={block.header.heading}
          headingAccent={block.header.headingAccent}
          lede={block.header.lede}
        />

        <FeaturedResidencesSlider listings={listings} />
      </Container>
    </section>
  );
}
