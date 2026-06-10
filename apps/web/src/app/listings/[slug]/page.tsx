import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Container } from '@/components/container';
import { listings } from '@/data/listings';
import { getPropertyView } from '@/data/property';
import { PropertyGallery } from '@/components/listings/property-gallery';
import { PropertyBreadcrumb, PropertyHeader } from '@/components/listings/property-header';
import { PropertyBody } from '@/components/listings/property-body';
import { PropertyAside } from '@/components/listings/property-aside';
import { PropertyCommunity } from '@/components/listings/property-community';
import { PropertySimilar } from '@/components/listings/property-similar';

type Params = { slug: string };

/** Pre-render every catalog listing's PDP at build time. */
export function generateStaticParams(): Params[] {
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const view = getPropertyView(slug);
  if (!view) return { title: 'Residence Not Found — MVP Realty' };

  const { listing } = view;
  return {
    title: `${listing.name} — ${listing.communityName} | MVP Realty`,
    description: `${listing.name} in ${listing.communityName}, ${listing.city} — ${listing.beds} bed, ${listing.baths} bath, ${listing.sqft.toLocaleString()} sq ft. Offered at ${view.priceLabel}. Tour this Gulf-Coast residence with your MVP Realty concierge.`,
  };
}

export default async function PropertyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const view = getPropertyView(slug);
  if (!view) notFound();

  return (
    <>
      <PropertyBreadcrumb view={view} />
      <PropertyGallery gallery={view.gallery} statusLabel={view.statusLabel} />
      <PropertyHeader view={view} />

      <Container>
        <div className="grid items-start gap-[clamp(34px,4.4vw,72px)] py-[clamp(48px,6vw,90px)] lg:grid-cols-[1fr_384px]">
          <PropertyBody view={view} />
          <PropertyAside
            propertyName={view.listing.name}
            communityName={view.listing.communityName}
          />
        </div>
      </Container>

      <PropertyCommunity
        communitySlug={view.listing.community}
        communityName={view.community.name}
        blurb={view.community.blurb}
        facts={view.community.facts}
      />
      <PropertySimilar listings={view.similar} communityName={view.listing.communityName} />
    </>
  );
}
