import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { CommunityDetail } from '@mvp-realty/api-contracts';

import { Container } from '@/components/container';
import { DetailHeader } from '@/components/communities/detail-header';
import { Gallery } from '@/components/communities/gallery';
import { SectionTabs, type Tab } from '@/components/communities/section-tabs';
import { MainContent } from '@/components/communities/main-content';
import { AgentAside } from '@/components/communities/agent-aside';
import { SimilarCommunities } from '@/components/communities/similar-communities';
import { TourBand } from '@/components/communities/tour-band';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { getCommunityDetailBySlug, getCommunityDetailSlugs } from '@/lib/cms/areas';
import { getListingsForArea } from '@/lib/cms/listings';
import { buildCommunityGraph, communityDescription, communityPath } from '@/lib/seo/community';
import { JsonLd } from '@/lib/seo/json-ld';
import { buildEntityMetadata } from '@/lib/seo/metadata';

type Params = { slug: string };

/**
 * Editorial content, purged on the `areas` tag when an Area is saved. Longer
 * backstop than listings because nothing here moves on its own.
 */
export const revalidate = 3600;

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const slugs = await getCommunityDetailSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityDetailBySlug(slug).catch((): null => null);
  if (!community) return { title: 'Community not found', robots: { index: false, follow: true } };

  return buildEntityMetadata({
    seo: community.seo,
    path: communityPath(community.slug),
    title: `${community.name} — Homes for Sale in ${community.city}, FL`,
    description: communityDescription(community),
    images: community.gallery.slice(0, 4),
  });
}

/** Tabs mirror only the blocks `MainContent` actually renders for this community. */
function sectionsFor(community: CommunityDetail): Tab[] {
  const sections: Tab[] = [];
  if (community.facts.length > 0 || community.about.length > 0) {
    sections.push({ id: 'overview', label: 'Overview' });
  }
  sections.push({ id: 'homes', label: 'Homes for Sale' });
  if (community.amenities.length > 0) sections.push({ id: 'amenities', label: 'Amenities' });
  if (community.clubs.length > 0) sections.push({ id: 'lifestyle', label: 'Lifestyle' });
  if (community.reviewBars.length > 0 || community.reviewCards.length > 0) {
    sections.push({ id: 'reviews', label: 'Reviews' });
  }
  if (community.faqs.length > 0) sections.push({ id: 'faqs', label: 'FAQs' });
  return sections;
}

export default async function CommunityPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const community = await getCommunityDetailBySlug(slug);
  if (!community) notFound();

  const homes = await getListingsForArea(slug).catch(
    (): Awaited<ReturnType<typeof getListingsForArea>> => [],
  );

  const sections = sectionsFor(community);

  return (
    <>
      <JsonLd nodes={buildCommunityGraph(community, homes)} />
      <PageBreadcrumb
        flush
        items={[
          { label: 'Home', href: '/' },
          { label: 'Communities', href: '/#communities' },
          { label: community.city, href: '/#communities' },
          { label: community.name },
        ]}
      />
      <DetailHeader community={community} />
      <Gallery images={community.gallery} photoCount={community.photoCount} />
      <SectionTabs sections={sections} />

      <Container className="grid items-start gap-[clamp(34px,4vw,64px)] py-[clamp(46px,5vw,72px)] lg:grid-cols-[minmax(0,1fr)_372px]">
        <MainContent
          community={community}
          homes={homes}
          brokerFirstName={community.broker?.firstName}
        />
        <AgentAside
          communityName={community.name}
          communitySlug={community.slug}
          broker={community.broker}
          phone={community.phone}
          phoneHref={community.phoneHref}
        />
      </Container>

      <SimilarCommunities communities={community.similar} />
      <TourBand
        communityName={community.name}
        communitySlug={community.slug}
        brokerFirstName={community.broker?.firstName}
      />
    </>
  );
}
