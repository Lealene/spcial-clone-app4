import type { CommunityDetail, ListingCard } from '@mvp-realty/api-contracts';

import { buildBreadcrumbList } from './breadcrumbs';
import { absoluteUrl, type SchemaNode } from './graph';
import { agentId, breadcrumbId, communityPlaceId, ref, webPageId, websiteId } from './ids';
import { listingPath } from './listing';
import { buildAgentNode } from './organization';

const MAX_IMAGES = 12;

export function communityPath(slug: string): string {
  return `/communities/${slug}`;
}

export function communityDescription(community: CommunityDetail): string {
  return community.blurb;
}

/**
 * Deliberately no `aggregateRating` or `Review`. The CMS carries a rating for
 * the neighbourhood, but review markup has to describe first-party reviews of
 * the marked-up item, and self-published ratings of a place you sell homes in
 * are exactly what Google issues manual actions for.
 */
export function buildCommunityGraph(
  community: CommunityDetail,
  homes: ListingCard[],
): SchemaNode[] {
  const path = communityPath(community.slug);
  const url = absoluteUrl(path);

  // `GatedResidenceCommunity` (a `Residence`, so still a `Place`) is what these
  // actually are, and the narrower type is a stronger entity signal than a bare
  // `Place` for a named neighbourhood.
  const placeNode: SchemaNode = {
    '@type': 'GatedResidenceCommunity',
    '@id': communityPlaceId(community.slug),
    name: community.name,
    description: community.blurb,
    url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: community.city,
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    telephone: community.phone,
    photo: community.gallery.slice(0, MAX_IMAGES).map((image) => image.src),
    amenityFeature: community.amenities.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity.title,
      value: true,
    })),
  };

  const homesNode: SchemaNode | null =
    homes.length > 0
      ? {
          '@type': 'ItemList',
          name: `Homes for sale in ${community.name}`,
          numberOfItems: homes.length,
          itemListElement: homes.map((home, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: home.name,
            url: absoluteUrl(listingPath(home.slug)),
          })),
        }
      : null;

  // Its own node rather than a property of the page: an FAQPage and a WebPage
  // cannot be the same entity, and merging them makes both invalid.
  const faqNode: SchemaNode | null =
    community.faqs.length > 0
      ? {
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: community.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        }
      : null;

  // Only two levels: there is no /communities index route to point a middle
  // crumb at, and a breadcrumb URL that 404s is worse than a shorter trail.
  const breadcrumb = buildBreadcrumbList(
    [
      { name: 'Home', path: '/' },
      { name: community.name, path },
    ],
    path,
  );

  const pageNode: SchemaNode = {
    '@type': 'WebPage',
    '@id': webPageId(path),
    url,
    name: `${community.name} — ${community.city}, FL`,
    description: community.blurb,
    isPartOf: ref(websiteId()),
    about: ref(communityPlaceId(community.slug)),
    primaryImageOfPage: community.gallery[0]?.src,
    dateModified: community.updatedAt,
    breadcrumb: breadcrumb ? ref(breadcrumbId(path)) : undefined,
    // The agent covering this community. `Place` has no `agent` property, so
    // the association lives on the page node as `provider` — the same property
    // the listing graph uses, so one broker reads consistently across both.
    ...(community.broker ? { provider: ref(agentId(community.broker.slug)) } : {}),
  };

  return [
    pageNode,
    placeNode,
    homesNode,
    faqNode,
    community.broker ? buildAgentNode(community.broker) : null,
    breadcrumb,
  ].filter((node): node is SchemaNode => node !== null);
}
