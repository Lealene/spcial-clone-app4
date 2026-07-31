import type {
  ListingCard,
  ListingDetail,
  ListingMlsStatus,
  ListingPropertyType,
} from '@mvp-realty/api-contracts';

import { buildBreadcrumbList } from './breadcrumbs';
import { absoluteUrl, type SchemaNode } from './graph';
import { agentId, breadcrumbId, listingId, ref, residenceId, webPageId, websiteId } from './ids';
import { buildAgentNode } from './organization';

const MAX_IMAGES = 12;

/**
 * schema.org has a residence type for most of what the MLS reports. Anything
 * unmapped falls back to `Residence`, the shared supertype — `land` is the one
 * case with no residence at all, handled by the caller.
 */
const RESIDENCE_TYPES: Record<ListingPropertyType, string> = {
  'single-family': 'SingleFamilyResidence',
  condo: 'Apartment',
  townhouse: 'SingleFamilyResidence',
  'multi-family': 'ApartmentComplex',
  villa: 'House',
  land: 'Place',
  other: 'Residence',
};

/**
 * Offer availability. `coming-soon` is deliberately `PreOrder` rather than
 * `InStock`: the home cannot be transacted yet, and claiming otherwise is the
 * kind of mismatch that gets structured data ignored.
 */
const AVAILABILITY: Record<ListingMlsStatus, string> = {
  active: 'https://schema.org/InStock',
  pending: 'https://schema.org/LimitedAvailability',
  'under-contract': 'https://schema.org/LimitedAvailability',
  sold: 'https://schema.org/SoldOut',
  'coming-soon': 'https://schema.org/PreOrder',
};

export function listingPath(slug: string): string {
  return `/listings/${slug}`;
}

/**
 * MLS cities arrive upper-cased ("FORT MYERS BEACH"). Shouting at a searcher
 * from a snippet reads as spam, so every city that reaches copy goes through
 * here. `communityName` is authored and already presentable.
 */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, sep: string, char: string) => sep + char.toUpperCase());
}

/**
 * "Bonita Bay, Bonita Springs" — or just the city when the listing sits in a
 * city-level area, where the community and the city are the same place and
 * naming it twice reads like a bug.
 */
export function listingPlaceLabel(listing: ListingDetail): string {
  const city = toTitleCase(listing.city);
  return listing.communityName.toLowerCase() === city.toLowerCase()
    ? city
    : `${listing.communityName}, ${city}`;
}

/** Sentence used for both the meta description and the listing `description`. */
export function listingDescription(listing: ListingDetail): string {
  const specs = [
    listing.beds > 0 ? `${listing.beds} bed` : null,
    listing.baths > 0 ? `${listing.baths} bath` : null,
    listing.sqft > 0 ? `${listing.sqft.toLocaleString('en-US')} sq ft` : null,
  ].filter(Boolean);

  const lede = `${listing.name} in ${listingPlaceLabel(listing)}${
    specs.length > 0 ? ` — ${specs.join(', ')}` : ''
  }. Offered at $${listing.price.toLocaleString('en-US')}.`;

  const remarks = listing.publicRemarks?.trim();
  if (!remarks) return lede;
  // Meta descriptions are truncated around 160 chars; lead with the facts and
  // spend whatever is left on the agent's own copy.
  const room = 300 - lede.length;
  return room > 40 ? `${lede} ${remarks.slice(0, room).trim()}` : lede;
}

function buildResidenceNode(listing: ListingDetail): SchemaNode {
  const type = RESIDENCE_TYPES[listing.propertyType ?? 'other'];
  // Vacant land is a `Place`, not an `Accommodation`, so the dwelling
  // properties below are not part of its vocabulary. Only lot size and
  // location apply.
  const isAccommodation = type !== 'Place';

  return {
    '@type': type,
    '@id': residenceId(listing.slug),
    name: listing.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.streetAddress ?? listing.fullAddress,
      addressLocality: toTitleCase(listing.city),
      addressRegion: listing.state,
      postalCode: listing.zip,
      addressCountry: 'US',
    },
    geo:
      listing.latitude != null && listing.longitude != null
        ? {
            '@type': 'GeoCoordinates',
            latitude: listing.latitude,
            longitude: listing.longitude,
          }
        : undefined,
    numberOfBedrooms: isAccommodation && listing.beds > 0 ? listing.beds : undefined,
    numberOfBathroomsTotal: isAccommodation && listing.baths > 0 ? listing.baths : undefined,
    floorSize:
      isAccommodation && listing.sqft > 0
        ? { '@type': 'QuantitativeValue', value: listing.sqft, unitCode: 'FTK' }
        : undefined,
    // schema.org has no `lotSize`; `additionalProperty` is the generic escape
    // hatch and keeps the figure machine-readable with its unit.
    additionalProperty: listing.lotSqft
      ? {
          '@type': 'PropertyValue',
          name: 'Lot size',
          value: listing.lotSqft,
          unitCode: 'FTK',
        }
      : undefined,
    yearBuilt: isAccommodation ? listing.yearBuilt : undefined,
    amenityFeature: listing.features.map((feature) => ({
      '@type': 'LocationFeatureSpecification',
      name: feature,
      value: true,
    })),
    photo: listing.gallery.slice(0, MAX_IMAGES).map((shot) => shot.src),
  };
}

/**
 * `RealEstateListing` is a `WebPage` subtype, so it doubles as this route's page
 * node — no separate `WebPage` is emitted. The home itself is a distinct entity
 * under `about`, which is what carries the address, geo and specs.
 */
export function buildListingGraph(
  listing: ListingDetail,
  options: {
    /**
     * Where the community crumb points. Must match the visible breadcrumb —
     * communities without a detail page link to a filtered listings view.
     */
    communityHref: string;
  },
): SchemaNode[] {
  const path = listingPath(listing.slug);
  const url = absoluteUrl(path);
  const images = listing.gallery.slice(0, MAX_IMAGES).map((shot) => shot.src);

  const breadcrumb = buildBreadcrumbList(
    [
      { name: 'Home', path: '/' },
      { name: 'Residences', path: '/listings' },
      { name: listing.communityName, path: options.communityHref },
      { name: listing.name, path },
    ],
    path,
  );

  const listingNode: SchemaNode = {
    '@type': 'RealEstateListing',
    '@id': listingId(listing.slug),
    url,
    name: listing.name,
    description: listingDescription(listing),
    image: images,
    // `dateModified`, not `datePosted`: the feed gives us a last-changed
    // timestamp, and a price change should not make an old listing look newly
    // published.
    dateModified: listing.updatedAt,
    isPartOf: ref(websiteId()),
    breadcrumb: breadcrumb ? ref(breadcrumbId(path)) : undefined,
    about: buildResidenceNode(listing),
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'USD',
      availability: AVAILABILITY[listing.status],
      url,
      // Named so a crawler can tell the listing brokerage from ours when the
      // home is another office's inventory shown on this site.
      seller: listing.listOfficeName
        ? { '@type': 'RealEstateAgent', name: listing.listOfficeName }
        : undefined,
    },
    provider: listing.broker ? ref(agentId(listing.broker.slug)) : undefined,
  };

  return [
    listingNode,
    ...(listing.broker ? [buildAgentNode(listing.broker)] : []),
    ...(breadcrumb ? [breadcrumb] : []),
  ].filter(Boolean) as SchemaNode[];
}

/**
 * Listings index. An `ItemList` of URLs (not embedded listing nodes) — the
 * detail pages describe themselves, and pointing at them is what invites the
 * crawl rather than duplicating the data.
 */
export function buildListingCollectionGraph(
  listings: ListingCard[],
  options: { path: string; name: string; description: string },
): SchemaNode[] {
  return [
    {
      '@type': 'CollectionPage',
      '@id': webPageId(options.path),
      url: absoluteUrl(options.path),
      name: options.name,
      description: options.description,
      isPartOf: ref(websiteId()),
      breadcrumb: ref(breadcrumbId(options.path)),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: listings.length,
        itemListElement: listings.map((listing, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: listing.name,
          url: absoluteUrl(listingPath(listing.slug)),
        })),
      },
    },
    buildBreadcrumbList(
      [
        { name: 'Home', path: '/' },
        { name: options.name, path: options.path },
      ],
      options.path,
    ),
  ].filter((node): node is SchemaNode => node !== null);
}

export { AVAILABILITY as LISTING_AVAILABILITY };
