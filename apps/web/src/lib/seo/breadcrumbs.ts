import { absoluteUrl, type SchemaNode } from './graph';
import { breadcrumbId } from './ids';

export type BreadcrumbItem = {
  name: string;
  /** App-relative path. The last crumb should point at the current page. */
  path: string;
};

/**
 * `pagePath` keys the `@id` so the trail belongs to the page that renders it,
 * not to the deepest crumb — they coincide today but not for filtered views.
 */
export function buildBreadcrumbList(items: BreadcrumbItem[], pagePath: string): SchemaNode | null {
  if (items.length === 0) return null;

  return {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId(pagePath),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
