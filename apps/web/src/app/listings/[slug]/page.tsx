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
import { JsonLd } from '@/lib/seo/json-ld';
import {
  buildListingGraph,
  listingDescription,
  listingPath,
  listingPlaceLabel,
  toTitleCase,
} from '@/lib/seo/listing';
import { buildEntityMetadata } from '@/lib/seo/metadata';

type Params = { slug: string };

/** Backstop only; the `listings` tag purge is what makes edits appear. */
export const revalidate = 900;

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
  const detail = await getListingBySlug(slug).catch((): null => null);
  if (!detail) return { title: 'Residence not found', robots: { index: false, follow: true } };

  return buildEntityMetadata({
    seo: detail.seo,
    path: listingPath(detail.slug),
    title: `${detail.name} — ${listingPlaceLabel(detail)} | ${fmtPrice(detail.price)}`,
    description: listingDescription(detail),
    // Gallery order is the agent's; the hero shot is the intended social card.
    images: detail.gallery.slice(0, 4).map((shot) => ({ src: shot.src, alt: shot.alt })),
  });
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

  // Location first: same community, then same city, and only then the same
  // property type elsewhere. The previous single `community || type` filter let
  // a Bonita Springs condo qualify for a Fort Myers Beach listing purely by
  // being a condo, which contradicted the "More residences in <place>" heading.
  const pool = active.filter((l) => l.slug !== detail.slug);
  const sameCommunity = pool.filter((l) => l.community === detail.community);
  const sameCity = pool.filter((l) => l.city === detail.city && l.community !== detail.community);
  const sameTypeElsewhere = pool.filter((l) => l.type === detail.type && l.city !== detail.city);
  const similar = [...sameCommunity, ...sameCity, ...sameTypeElsewhere].slice(0, 3);

  // Only promise a place in the heading when every card actually shares it.
  const similarScope =
    similar.length === 0
      ? null
      : similar.every((l) => l.community === detail.community)
        ? detail.communityName
        : similar.every((l) => l.city === detail.city)
          ? toTitleCase(detail.city)
          : null;

  const view = buildPropertyView(
    detail,
    similar,
    communityFactsFromMeta(areaMeta, detail.communityName),
  );
  const hasDetailPage = Boolean(areaMeta);
  const communityHref = hasDetailPage
    ? `/communities/${view.listing.community}`
    : `/listings?community=${view.listing.community}`;

  return (
    <>
      <JsonLd nodes={buildListingGraph(detail, { communityHref })} />
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Residences', href: '/listings' },
          {
            label: view.listing.communityName,
            href: communityHref,
          },
          { label: view.listing.name },
        ]}
      />
      <PropertyGallery gallery={view.gallery} statusLabel={view.statusLabel} />
      <PropertyHeader view={view} />

      <Container>
        <div className="grid items-start gap-[clamp(34px,4vw,72px)] py-[clamp(48px,6vw,90px)] lg:grid-cols-[minmax(0,1fr)_384px]">
          <PropertyBody view={view} />
          <PropertyAside
            propertyName={view.listing.name}
            listingSlug={view.listing.slug}
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
      <PropertySimilar listings={view.similar} scopeLabel={similarScope} />
    </>
  );
}
