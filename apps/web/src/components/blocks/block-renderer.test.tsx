import { CMS_PAGE_BLOCK_TYPES, type CmsPageBlock } from '@mvp-realty/api-contracts';
import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { homepageFixture } from '@/data/homepage-fixture';
import { blockRenderers, CmsPageBlocksRenderer } from './block-renderer';

describe('CMS page block renderer', () => {
  it('covers every known block type', () => {
    expect(Object.keys(blockRenderers)).toEqual([...CMS_PAGE_BLOCK_TYPES]);
  });

  it('dispatches every representative normalized block to a React element', () => {
    homepageFixture.layout.forEach((block) => {
      const render = blockRenderers[block.blockType] as (value: CmsPageBlock) => ReactElement;
      expect(isValidElement(render(block))).toBe(true);
    });
  });

  it('uses stable Payload IDs as list keys', () => {
    const block = homepageFixture.layout[0];
    if (!block) throw new Error('Homepage fixture must include a block.');

    const element = CmsPageBlocksRenderer({
      blocks: [
        { ...block, id: 'payload-block-1' },
        { ...block, id: 'payload-block-2' },
      ],
    }) as ReactElement<{ children: ReactElement[] }>;

    expect(element.props.children.map((child) => child.key)).toEqual([
      'payload-block-1',
      'payload-block-2',
    ]);
  });
});
