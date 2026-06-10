import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Container } from '@/components/container';
import { DetailHeader } from '@/components/communities/detail-header';
import { Gallery } from '@/components/communities/gallery';
import { SectionTabs } from '@/components/communities/section-tabs';
import { MainContent } from '@/components/communities/main-content';
import { AgentAside } from '@/components/communities/agent-aside';
import { SimilarCommunities } from '@/components/communities/similar-communities';
import { TourBand } from '@/components/communities/tour-band';
import { COMMUNITY_DETAIL_SLUGS, getCommunityDetail } from '@/data/community-detail';
import { listings } from '@/data/listings';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return COMMUNITY_DETAIL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const community = getCommunityDetail(slug);
  if (!community) return { title: 'Community Not Found — MVP Realty' };

  return {
    title: `${community.name} — ${community.city}, FL · MVP Realty`,
    description: community.blurb,
  };
}

export default async function CommunityPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const community = getCommunityDetail(slug);
  if (!community) notFound();

  const homes = listings.filter((l) => l.community === slug);

  return (
    <>
      <DetailHeader community={community} />
      <Gallery images={community.gallery} photoCount={community.photoCount} />
      <SectionTabs />

      <Container className="grid items-start gap-[clamp(34px,4vw,64px)] py-[clamp(46px,5vw,72px)] lg:grid-cols-[minmax(0,1fr)_372px]">
        <MainContent community={community} homes={homes} />
        <AgentAside
          communityName={community.name}
          phone={community.phone}
          phoneHref={community.phoneHref}
        />
      </Container>

      <SimilarCommunities communities={community.similar} />
      <TourBand communityName={community.name} />
    </>
  );
}
