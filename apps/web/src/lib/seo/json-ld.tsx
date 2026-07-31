import { serializeJsonLd, type SchemaNode } from './graph';

/**
 * Renders one `@graph` block. Pages emit a single `<JsonLd>` so every node they
 * describe shares a context and can cross-reference by `@id`.
 */
export function JsonLd({ nodes }: { nodes: SchemaNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      // Serializer escapes the HTML-significant characters; see serializeJsonLd.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(nodes) }}
    />
  );
}
