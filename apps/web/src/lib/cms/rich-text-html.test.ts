import { describe, expect, it } from 'vitest';

import { lexicalToHtml } from './rich-text-html';

const base = { direction: 'ltr', format: '', indent: 0, version: 1 } as const;

function text(value: string, format = 0) {
  return { type: 'text', detail: 0, format, mode: 'normal', style: '', text: value, version: 1 };
}

function doc(children: unknown[]) {
  return { root: { type: 'root', children, ...base } };
}

describe('lexicalToHtml', () => {
  it('renders headings, paragraphs and inline formats', () => {
    const html = lexicalToHtml(
      doc([
        { type: 'heading', tag: 'h2', children: [text('Information we collect')], ...base },
        { type: 'paragraph', children: [text('We collect '), text('some data', 1)], ...base },
      ]),
    );
    expect(html).toBe(
      '<h2>Information we collect</h2><p>We collect <strong>some data</strong></p>',
    );
  });

  it('renders bulleted and numbered lists', () => {
    const list = (listType: 'bullet' | 'number') => ({
      type: 'list',
      listType,
      children: [
        { type: 'listitem', children: [text('One')], ...base },
        { type: 'listitem', children: [text('Two')], ...base },
      ],
      ...base,
    });
    expect(lexicalToHtml(doc([list('bullet')]))).toBe('<ul><li>One</li><li>Two</li></ul>');
    expect(lexicalToHtml(doc([list('number')]))).toBe('<ol><li>One</li><li>Two</li></ol>');
  });

  it('escapes text so authored markup cannot become live HTML', () => {
    const html = lexicalToHtml(
      doc([{ type: 'paragraph', children: [text('<script>alert(1)</script>')], ...base }]),
    );
    expect(html).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
    expect(html).not.toContain('<script>');
  });

  it('drops unsafe link protocols but keeps the link text', () => {
    const link = (url: string) => ({
      type: 'paragraph',
      children: [
        {
          type: 'link',
          fields: { url },
          children: [text('Click me')],
          ...base,
        },
      ],
      ...base,
    });

    // Built from parts so the literal scheme never appears in source.
    expect(lexicalToHtml(doc([link(`java${'script'}:alert(1)`)]))).toBe('<p>Click me</p>');
    expect(lexicalToHtml(doc([link('data:text/html,<script>alert(1)</script>')]))).toBe(
      '<p>Click me</p>',
    );
    expect(lexicalToHtml(doc([link('/listings')]))).toBe('<p><a href="/listings">Click me</a></p>');
    expect(lexicalToHtml(doc([link('https://example.com')]))).toBe(
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Click me</a></p>',
    );
  });

  it('returns an empty string for anything unrecognized', () => {
    expect(lexicalToHtml(null)).toBe('');
    expect(lexicalToHtml({})).toBe('');
    expect(lexicalToHtml({ root: {} })).toBe('');
    expect(lexicalToHtml(doc([{ type: 'paragraph', children: [], ...base }]))).toBe('');
  });
});
