import type { Broker, SiteSettings } from '@mvp-realty/api-contracts';

import { siteOrigin, type SchemaNode } from './graph';
import { agentId, organizationId, ref, websiteId } from './ids';

/**
 * `RealEstateAgent` rather than a bare `Organization`: it is a `LocalBusiness`
 * subtype, so it carries address, geo, hours and priceRange, which is what
 * makes the entity eligible to consolidate with the Google Business Profile.
 */
export function buildOrganizationNode(settings: SiteSettings): SchemaNode {
  const address = settings.address ? { '@type': 'PostalAddress', ...settings.address } : undefined;

  return {
    '@type': 'RealEstateAgent',
    '@id': organizationId(),
    name: settings.name,
    legalName: settings.legalName,
    description: settings.description,
    url: siteOrigin(),
    telephone: settings.phone,
    email: settings.email,
    address,
    geo: settings.geo ? { '@type': 'GeoCoordinates', ...settings.geo } : undefined,
    priceRange: settings.priceRange,
    areaServed: settings.areaServed.map((name) => ({ '@type': 'Place', name })),
    openingHoursSpecification: settings.openingHours.map((row) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: row.days,
      opens: row.opens,
      closes: row.closes,
    })),
    sameAs: settings.sameAs,
    logo: settings.logo
      ? {
          '@type': 'ImageObject',
          url: settings.logo.src,
          width: settings.logo.width,
          height: settings.logo.height,
        }
      : undefined,
    image: settings.logo?.src ?? settings.defaultOgImage?.src,
    // schema.org has no real-estate licence property; `identifier` is the
    // generic escape hatch and keeps the number machine-readable.
    identifier: settings.licenseNumber
      ? {
          '@type': 'PropertyValue',
          name: 'Real estate license',
          value: settings.licenseNumber,
        }
      : undefined,
  };
}

export function buildWebSiteNode(settings: SiteSettings): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': websiteId(),
    url: siteOrigin(),
    name: settings.name,
    description: settings.description,
    publisher: ref(organizationId()),
    inLanguage: 'en-US',
  };
}

/**
 * A `Broker` as a person who works for the brokerage. Referenced by `@id` from
 * listing and community graphs so the same agent is one entity site-wide.
 *
 * `Person`, not `RealEstateAgent`: that type is a `LocalBusiness`, and a person
 * is not an organization. `jobTitle` and `worksFor` are Person properties and
 * would be invalid on the business type; the brokerage itself carries the
 * `RealEstateAgent` signal, and `worksFor` ties the two together.
 */
export function buildAgentNode(broker: Broker): SchemaNode {
  return {
    '@type': 'Person',
    '@id': agentId(broker.slug),
    name: broker.name,
    jobTitle: broker.title,
    description: broker.bio,
    telephone: broker.phone,
    email: broker.email,
    image: broker.headshot?.src,
    worksFor: ref(organizationId()),
  };
}
