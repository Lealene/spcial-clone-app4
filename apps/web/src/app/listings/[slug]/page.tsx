import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { AreaPdpMeta } from '@mvp-realty/api-contracts';

import { Container } from '@/components/container';
import { PropertyGallery } from '@/components/listings/property-gallery';
import { PropertyHeader } from '@/components/listings/property-header';
import { PropertyBody } from '@/components/listings/property-body';
import { PropertyAside } from '@/components/listings/property-aside';
import { PropertyCommunity } from '@/components/listings/property-community';
import { PropertySimilar } from '@/components/listings/property-similar';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { buildPropertyView, type CommunityFact } from '@/data/property';
import { getAreaPdpMeta } from '@/lib/cms/areas';
import { getActiveListingSlugs, getActiveListings, getListingBySlug } from '@/lib/cms/listings';
import { fmtPrice } from '@/lib/listing-filters';

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const slugs = await getActiveListingSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getListingBySlug(slug);
  if (!detail) return { title: 'Residence Not Found — MVP Realty' };

  return {
    title: `${detail.name} — ${detail.communityName} | MVP Realty`,
    description: `${detail.name} in ${detail.communityName}, ${detail.city} — ${detail.beds} bed, ${detail.baths} bath${detail.sqft ? `, ${detail.sqft.toLocaleString()} sq ft` : ''}. Offered at ${fmtPrice(detail.price)}.`,
  };
}

function communityFactsFromMeta(
  areaMeta: AreaPdpMeta | null,
  communityName: string,
): {
  name: string;
  blurb: string;
  facts: CommunityFact[];
} {
  if (areaMeta) {
    return {
      name: areaMeta.name,
      blurb: areaMeta.detailBlurb ?? `${areaMeta.name} on Florida’s Gulf Coast.`,
      facts: [
        {
          icon: 'homes',
          value: areaMeta.totalResidences != null ? `${areaMeta.totalResidences} homes` : '—',
          label: 'Community',
        },
        {
          icon: 'gate',
          value: areaMeta.isGated === true ? 'Gated' : areaMeta.isGated === false ? 'Open' : '—',
          label: 'Access',
        },
        { icon: 'age', value: areaMeta.city, label: 'City' },
        { icon: 'since', value: 'SWFL', label: 'Region' },
      ],
    };
  }
  return {
    name: communityName,
    blurb: `${communityName} on Florida’s Gulf Coast.`,
    facts: [],
  };
}

export default async function PropertyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const detail = await getListingBySlug(slug);
  if (!detail) notFound();

  const active = await getActiveListings();

  const areaMeta = await getAreaPdpMeta(detail.community).catch((): null => null);

  const similar = active
    .filter((l) => l.slug !== detail.slug)
    .filter((l) => l.community === detail.community || l.type === detail.type)
    .slice(0, 3);

  const view = buildPropertyView(
    detail,
    similar,
    communityFactsFromMeta(areaMeta, detail.communityName),
  );
  const hasDetailPage = Boolean(areaMeta);

  return (
    <>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Residences', href: '/listings' },
          {
            label: view.listing.communityName,
            href: hasDetailPage
              ? `/communities/${view.listing.community}`
              : `/listings?community=${view.listing.community}`,
          },
          { label: view.listing.name },
        ]}
      />
      <PropertyGallery gallery={view.gallery} statusLabel={view.statusLabel} />
      <PropertyHeader view={view} />

      <Container>
        <div className="grid items-start gap-[clamp(34px,4vw,72px)] py-[clamp(48px,6vw,90px)] lg:grid-cols-[1fr_384px]">
          <PropertyBody view={view} />
          <PropertyAside
            propertyName={view.listing.name}
            communityName={view.listing.communityName}
            broker={detail.broker}
            soldCount={areaMeta?.soldCount}
          />
        </div>
      </Container>

      <PropertyCommunity
        communitySlug={view.listing.community}
        communityName={view.community.name}
        blurb={view.community.blurb}
        facts={view.community.facts}
        hasDetailPage={hasDetailPage}
      />
      <PropertySimilar listings={view.similar} communityName={view.listing.communityName} />
    </>
  );
}
