import { describe, expect, it } from 'vitest';

import { paragraphsToLexical } from './paragraphs-to-lexical';

describe('paragraphsToLexical', () => {
  it('emits plain text paragraphs with no bold', () => {
    const result = paragraphsToLexical(['Hello world.']);
    expect(result.root.children).toHaveLength(1);
    expect(result.root.children[0]?.children).toEqual([
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: 'Hello world.',
        version: 1,
      },
    ]);
  });

  it('marks bold mid-sentence', () => {
    const result = paragraphsToLexical(['Hello **Bonita Bay** today.']);
    const texts = result.root.children[0]?.children.map((node) => ({
      text: node.text,
      format: node.format,
    }));
    expect(texts).toEqual([
      { text: 'Hello ', format: 0 },
      { text: 'Bonita Bay', format: 1 },
      { text: ' today.', format: 0 },
    ]);
  });

  it('marks bold at the start', () => {
    const result = paragraphsToLexical(['**Valencia Bonita** is great.']);
    const texts = result.root.children[0]?.children.map((node) => ({
      text: node.text,
      format: node.format,
    }));
    expect(texts).toEqual([
      { text: 'Valencia Bonita', format: 1 },
      { text: ' is great.', format: 0 },
    ]);
  });

  it('handles multiple bold spans', () => {
    const result = paragraphsToLexical(['See **one** and **two**.']);
    const texts = result.root.children[0]?.children.map((node) => ({
      text: node.text,
      format: node.format,
    }));
    expect(texts).toEqual([
      { text: 'See ', format: 0 },
      { text: 'one', format: 1 },
      { text: ' and ', format: 0 },
      { text: 'two', format: 1 },
      { text: '.', format: 0 },
    ]);
  });

  it('handles adjacent bold spans', () => {
    const result = paragraphsToLexical(['**a****b**']);
    const texts = result.root.children[0]?.children.map((node) => ({
      text: node.text,
      format: node.format,
    }));
    expect(texts).toEqual([
      { text: 'a', format: 1 },
      { text: 'b', format: 1 },
    ]);
  });
});
