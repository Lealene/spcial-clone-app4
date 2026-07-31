import { absoluteUrl, siteOrigin } from './graph';

/**
 * Stable `@id`s let nodes reference each other by handle instead of repeating
 * themselves — the organization is described once in the root layout and every
 * other page points at the same URI, which is what lets a crawler merge them
 * into one entity.
 */
export function organizationId(): string {
  return `${siteOrigin()}/#organization`;
}

export function websiteId(): string {
  return `${siteOrigin()}/#website`;
}

export function webPageId(path: string): string {
  return `${absoluteUrl(path)}#webpage`;
}

export function breadcrumbId(path: string): string {
  return `${absoluteUrl(path)}#breadcrumb`;
}

export function listingId(slug: string): string {
  return `${absoluteUrl(`/listings/${slug}`)}#listing`;
}

export function residenceId(slug: string): string {
  return `${absoluteUrl(`/listings/${slug}`)}#residence`;
}

export function communityPlaceId(slug: string): string {
  return `${absoluteUrl(`/communities/${slug}`)}#place`;
}

export function agentId(slug: string): string {
  return `${siteOrigin()}/#agent-${slug}`;
}

/** A bare `{"@id": …}` reference to a node described elsewhere in the graph. */
export function ref(id: string): { '@id': string } {
  return { '@id': id };
}
