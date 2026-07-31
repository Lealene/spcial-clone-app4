import type { CmsPage } from '@mvp-realty/api-contracts';

import { buildBreadcrumbList } from './breadcrumbs';
import { absoluteUrl, type SchemaNode } from './graph';
import { breadcrumbId, organizationId, ref, webPageId, websiteId } from './ids';

/**
 * Slugs whose page is really a contact surface. `ContactPage` is a `WebPage`
 * subtype, so this only narrows the type — nothing downstream changes.
 */
const CONTACT_SLUGS = new Set(['contact', 'contact-us', 'get-in-touch']);

export function buildWebPageNode(
  page: CmsPage,
  path: string,
  options: { hasBreadcrumb?: boolean } = {},
): SchemaNode {
  const isHome = path === '/';

  return {
    '@type': isHome ? 'WebPage' : CONTACT_SLUGS.has(page.slug) ? 'ContactPage' : 'WebPage',
    '@id': webPageId(path),
    url: absoluteUrl(path),
    name: page.seo.metaTitle ?? page.title,
    description: page.seo.metaDescription,
    isPartOf: ref(websiteId()),
    about: isHome ? ref(organizationId()) : undefined,
    primaryImageOfPage: page.seo.ogImage?.src,
    breadcrumb: options.hasBreadcrumb ? ref(breadcrumbId(path)) : undefined,
  };
}

export function buildCmsPageGraph(page: CmsPage, path: string): SchemaNode[] {
  const crumbs =
    path === '/'
      ? []
      : [
          { name: 'Home', path: '/' },
          { name: page.title, path },
        ];

  const breadcrumb = buildBreadcrumbList(crumbs, path);
  return [
    buildWebPageNode(page, path, { hasBreadcrumb: breadcrumb !== null }),
    ...(breadcrumb ? [breadcrumb] : []),
  ];
}
