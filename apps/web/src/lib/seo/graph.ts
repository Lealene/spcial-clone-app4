import { env } from '@/env';

/** A single schema.org node. Loosely typed on purpose — vocabularies vary per type. */
export type SchemaNode = Record<string, unknown>;

/** Absolute URL for an app path, e.g. `/listings/foo` → `https://site/listings/foo`. */
export function absoluteUrl(path: string): string {
  return new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();
}

/** Origin without a trailing slash — the base for every `@id`. */
export function siteOrigin(): string {
  return new URL(env.NEXT_PUBLIC_SITE_URL).origin;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Drop empty values so partially-filled CMS content never emits `"foo": null`
 * or `"foo": []`, both of which validators flag. Applied once at serialization
 * so builders can assign optional fields unconditionally and stay readable.
 */
export function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items as unknown as T;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, prune(item)] as const)
      .filter(([, item]) => {
        if (item === undefined || item === null || item === '') return false;
        if (Array.isArray(item) && item.length === 0) return false;
        // A node reduced to nothing but `@type` carries no information.
        return !(isPlainObject(item) && Object.keys(item).every((key) => key === '@type'));
      });
    return Object.fromEntries(entries) as T;
  }

  return value;
}

/**
 * Serialize a graph for a `<script type="application/ld+json">` body.
 *
 * `<` is escaped because the JSON sits inside an HTML element: an unescaped
 * `</script>` in CMS copy would otherwise close the tag early. `&` and the line
 * separators are escaped for the same class of reason.
 */
export function serializeJsonLd(nodes: SchemaNode[]): string {
  const graph = prune({ '@context': 'https://schema.org', '@graph': nodes });
  return JSON.stringify(graph)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
