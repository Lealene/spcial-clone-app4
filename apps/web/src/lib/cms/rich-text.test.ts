import { describe, expect, it } from 'vitest';

import { lexicalToParagraphs } from './rich-text';

const PROSE_SPLIT = /(\*\*[^*]+\*\*)/g;

describe('lexicalToParagraphs', () => {
  it('returns [] for unrecognized input', () => {
    expect(lexicalToParagraphs(null)).toEqual([]);
    expect(lexicalToParagraphs('string')).toEqual([]);
    expect(lexicalToParagraphs({})).toEqual([]);
  });

  it('extracts plain paragraphs', () => {
    expect(
      lexicalToParagraphs({
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Hello world.', format: 0 }],
            },
          ],
        },
      }),
    ).toEqual(['Hello world.']);
  });

  it('emits **bold** for format bitmask 1', () => {
    expect(
      lexicalToParagraphs({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Hello ', format: 0 },
                { type: 'text', text: 'Bonita Bay', format: 1 },
                { type: 'text', text: ' today.', format: 0 },
              ],
            },
          ],
        },
      }),
    ).toEqual(['Hello **Bonita Bay** today.']);
  });

  it('treats format 3 (bold+italic) as bold', () => {
    expect(
      lexicalToParagraphs({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Both', format: 3 }],
            },
          ],
        },
      }),
    ).toEqual(['**Both**']);
  });

  it('merges adjacent bold runs', () => {
    expect(
      lexicalToParagraphs({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'a', format: 1 },
                { type: 'text', text: 'b', format: 1 },
              ],
            },
          ],
        },
      }),
    ).toEqual(['**ab**']);
  });

  it('flattens headings and quotes to paragraphs', () => {
    expect(
      lexicalToParagraphs({
        root: {
          children: [
            { type: 'heading', children: [{ type: 'text', text: 'Title', format: 0 }] },
            { type: 'quote', children: [{ type: 'text', text: 'Quoted', format: 0 }] },
          ],
        },
      }),
    ).toEqual(['Title', 'Quoted']);
  });

  it('inlines link text and drops lists', () => {
    expect(
      lexicalToParagraphs({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'See ', format: 0 },
                {
                  type: 'link',
                  children: [{ type: 'text', text: 'here', format: 0 }],
                },
              ],
            },
            {
              type: 'list',
              children: [
                { type: 'listitem', children: [{ type: 'text', text: 'Item', format: 0 }] },
              ],
            },
          ],
        },
      }),
    ).toEqual(['See here']);
  });

  it('splits with main-content Prose regex into expected parts', () => {
    const [paragraph] = lexicalToParagraphs({
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Welcome to ', format: 0 },
              { type: 'text', text: 'Bonita Bay', format: 1 },
              { type: 'text', text: '.', format: 0 },
            ],
          },
        ],
      },
    });

    expect(paragraph?.split(PROSE_SPLIT).filter(Boolean)).toEqual([
      'Welcome to ',
      '**Bonita Bay**',
      '.',
    ]);
  });
});
