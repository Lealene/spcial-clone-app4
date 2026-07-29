/**
 * Lossy Lexical → markdown-ish paragraph strings for community about copy.
 *
 * Emits `**bold**` markers (not structured spans) because `main-content.tsx`
 * already splits on `/(\*\*[^*]+\*\*)/g`. Bold is detected via bitmask
 * `(format & 1) === 1` so `format: 3` (bold+italic) still bolds.
 *
 * Adjacent bold runs are merged (`**a****b**` → `**ab**`) because Lexical
 * often splits a bold phrase across text nodes. Literal `**` in unformatted
 * text can be collapsed by that round-trip — accepted lossiness.
 *
 * Never throws; returns `[]` on anything unrecognized.
 */

const MAX_DEPTH = 32;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function walkInline(node: unknown, depth: number): string {
  if (depth > MAX_DEPTH) return '';
  if (!isRecord(node)) return '';

  const type = typeof node.type === 'string' ? node.type : '';

  if (type === 'text') {
    const text = typeof node.text === 'string' ? node.text : '';
    const format = typeof node.format === 'number' ? node.format : 0;
    const isBold = (format & 1) === 1;
    return isBold && text.length > 0 ? `**${text}**` : text;
  }

  if (type === 'linebreak') return '\n';

  if (type === 'link' || type === 'autolink') {
    const children = Array.isArray(node.children) ? node.children : [];
    return children.map((child) => walkInline(child, depth + 1)).join('');
  }

  if (Array.isArray(node.children)) {
    return node.children.map((child) => walkInline(child, depth + 1)).join('');
  }

  return '';
}

function mergeAdjacentBold(value: string): string {
  return value.replace(/\*\*([^*]*)\*\*\*\*([^*]*)\*\*/g, '**$1$2**');
}

function blockToParagraph(node: unknown, depth: number): string | null {
  if (depth > MAX_DEPTH || !isRecord(node)) return null;

  const type = typeof node.type === 'string' ? node.type : '';

  if (type === 'list' || type === 'listitem' || type === 'horizontalrule') {
    return null;
  }

  if (type === 'paragraph' || type === 'heading' || type === 'quote' || type === 'aside') {
    const children = Array.isArray(node.children) ? node.children : [];
    const text = mergeAdjacentBold(
      children.map((child) => walkInline(child, depth + 1)).join(''),
    ).trim();
    return text.length > 0 ? text : null;
  }

  // Unknown block with children — flatten as a paragraph.
  if (Array.isArray(node.children)) {
    const text = mergeAdjacentBold(
      node.children.map((child) => walkInline(child, depth + 1)).join(''),
    ).trim();
    return text.length > 0 ? text : null;
  }

  return null;
}

export function lexicalToParagraphs(value: unknown): string[] {
  if (!isRecord(value)) return [];

  const root = isRecord(value.root) ? value.root : value;
  if (!isRecord(root) || !Array.isArray(root.children)) return [];

  const paragraphs: string[] = [];
  for (const child of root.children) {
    const paragraph = blockToParagraph(child, 0);
    if (paragraph) paragraphs.push(paragraph);
  }
  return paragraphs;
}
