/**
 * Lexical → HTML for long-form CMS prose (currently the privacy policy).
 *
 * Distinct from `rich-text.ts`, which flattens everything to paragraph strings and
 * drops headings and lists — fine for a community blurb, useless for a legal
 * document whose structure *is* the content.
 *
 * Deliberately hand-rolled rather than pulling in
 * `@payloadcms/richtext-lexical/html`: that package carries the entire editor and
 * its React admin surface, which is a large dependency for one route.
 *
 * Security: every text value and href goes through `escapeHtml`, and only an
 * allow-list of tags is ever emitted, so the output is safe to inject. Unknown node
 * types degrade to their children rather than raising.
 */

const MAX_DEPTH = 32;

/** Format bitmask from Lexical's TextNode. */
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 1 << 1;
const FORMAT_STRIKETHROUGH = 1 << 2;
const FORMAT_UNDERLINE = 1 << 3;
const FORMAT_CODE = 1 << 4;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Only app-relative paths and http(s)/mailto/tel absolutes. Anything else — most
 * importantly `javascript:` — becomes a non-link so a malformed or hostile editor
 * payload cannot produce an executable href.
 */
function safeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const href = value.trim();
  if (!href) return null;
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (href.startsWith('#')) return href;
  return /^(https?:\/\/|mailto:|tel:)/i.test(href) ? href : null;
}

function wrapFormats(text: string, format: number): string {
  if (!text) return '';
  let out = text;
  if (format & FORMAT_CODE) out = `<code>${out}</code>`;
  if (format & FORMAT_STRIKETHROUGH) out = `<s>${out}</s>`;
  if (format & FORMAT_UNDERLINE) out = `<u>${out}</u>`;
  if (format & FORMAT_ITALIC) out = `<em>${out}</em>`;
  if (format & FORMAT_BOLD) out = `<strong>${out}</strong>`;
  return out;
}

function children(node: Record<string, unknown>): unknown[] {
  return Array.isArray(node.children) ? node.children : [];
}

function renderInline(node: unknown, depth: number): string {
  if (depth > MAX_DEPTH || !isRecord(node)) return '';

  const type = typeof node.type === 'string' ? node.type : '';

  if (type === 'text') {
    const text = typeof node.text === 'string' ? node.text : '';
    const format = typeof node.format === 'number' ? node.format : 0;
    return wrapFormats(escapeHtml(text), format);
  }

  if (type === 'linebreak') return '<br />';

  const inner = children(node)
    .map((child) => renderInline(child, depth + 1))
    .join('');

  if (type === 'link' || type === 'autolink') {
    const fields = isRecord(node.fields) ? node.fields : {};
    const href = safeHref(fields.url ?? node.url);
    if (!href) return inner;
    const external = /^https?:\/\//i.test(href);
    const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${escapeHtml(href)}"${rel}>${inner}</a>`;
  }

  return inner;
}

function headingTag(tag: unknown): string {
  return typeof tag === 'string' && /^h[1-6]$/.test(tag) ? tag : 'h2';
}

function renderList(node: Record<string, unknown>, depth: number): string {
  const ordered = node.listType === 'number';
  const tag = ordered ? 'ol' : 'ul';
  const items = children(node)
    .map((item) => {
      if (!isRecord(item)) return '';
      // A nested list arrives as a child of the list item, so blocks are rendered
      // through the block path rather than the inline one.
      const inner = children(item)
        .map((child) =>
          isRecord(child) && (child.type === 'list' || child.type === 'paragraph')
            ? renderBlock(child, depth + 1)
            : renderInline(child, depth + 1),
        )
        .join('');
      return inner.trim() ? `<li>${inner}</li>` : '';
    })
    .join('');
  return items ? `<${tag}>${items}</${tag}>` : '';
}

function renderBlock(node: unknown, depth: number): string {
  if (depth > MAX_DEPTH || !isRecord(node)) return '';

  const type = typeof node.type === 'string' ? node.type : '';

  if (type === 'horizontalrule') return '<hr />';
  if (type === 'list') return renderList(node, depth);

  if (type === 'heading') {
    const tag = headingTag(node.tag);
    const inner = children(node)
      .map((child) => renderInline(child, depth + 1))
      .join('');
    return inner.trim() ? `<${tag}>${inner}</${tag}>` : '';
  }

  if (type === 'quote') {
    const inner = children(node)
      .map((child) => renderInline(child, depth + 1))
      .join('');
    return inner.trim() ? `<blockquote>${inner}</blockquote>` : '';
  }

  // Paragraphs and anything unrecognized with children.
  const inner = children(node)
    .map((child) =>
      isRecord(child) && (child.type === 'list' || child.type === 'heading')
        ? renderBlock(child, depth + 1)
        : renderInline(child, depth + 1),
    )
    .join('');
  return inner.trim() ? `<p>${inner}</p>` : '';
}

/** Never throws; returns `''` on anything unrecognized. */
export function lexicalToHtml(value: unknown): string {
  if (!isRecord(value)) return '';
  const root = isRecord(value.root) ? value.root : value;
  if (!Array.isArray(root.children)) return '';

  return root.children
    .map((child) => renderBlock(child, 0))
    .filter(Boolean)
    .join('');
}
