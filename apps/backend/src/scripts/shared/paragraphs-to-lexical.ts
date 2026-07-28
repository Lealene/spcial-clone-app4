type LexicalTextNode = {
  type: 'text';
  detail: 0;
  format: number;
  mode: 'normal';
  style: '';
  text: string;
  version: 1;
};

type LexicalParagraphNode = {
  type: 'paragraph';
  children: LexicalTextNode[];
  direction: 'ltr';
  format: '';
  indent: 0;
  version: 1;
};

export type LexicalRoot = {
  root: {
    type: 'root';
    children: LexicalParagraphNode[];
    direction: 'ltr';
    format: '';
    indent: 0;
    version: 1;
  };
};

function textNode(text: string, format = 0): LexicalTextNode {
  return {
    type: 'text',
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text,
    version: 1,
  };
}

/** Split a paragraph on `**bold**` markers into Lexical text nodes. */
function paragraphChildren(paragraph: string): LexicalTextNode[] {
  const children: LexicalTextNode[] = [];
  const pattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(paragraph)) !== null) {
    if (match.index > lastIndex) {
      children.push(textNode(paragraph.slice(lastIndex, match.index)));
    }
    children.push(textNode(match[1] ?? '', 1));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < paragraph.length) {
    children.push(textNode(paragraph.slice(lastIndex)));
  }

  if (children.length === 0) {
    children.push(textNode(''));
  }

  return children;
}

/**
 * Convert plain paragraphs (with optional `**bold**` markers) into Lexical JSON
 * suitable for Payload richText fields.
 */
export function paragraphsToLexical(paragraphs: string[]): LexicalRoot {
  return {
    root: {
      type: 'root',
      children: paragraphs.map((paragraph) => ({
        type: 'paragraph' as const,
        children: paragraphChildren(paragraph),
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1 as const,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}
