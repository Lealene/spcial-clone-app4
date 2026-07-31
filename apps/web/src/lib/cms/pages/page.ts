import { cmsPageSchema, type CmsPage } from '@mvp-realty/api-contracts';

import { normalizeSeo } from '../seo';
import { normalizeCmsPageBlocks, type CmsPageBlockDiagnostic } from './block-adapters';
import type { PayloadPageDocument } from './envelope';

export type CmsPageNormalizationResult = {
  page: CmsPage;
  diagnostics: CmsPageBlockDiagnostic[];
};

export function normalizePage(raw: PayloadPageDocument): CmsPageNormalizationResult {
  const { blocks, diagnostics } = normalizeCmsPageBlocks(raw.layout, raw.slug);
  const page = cmsPageSchema.parse({
    title: raw.title,
    slug: raw.slug,
    seo: normalizeSeo(raw.seo),
    layout: blocks,
  });

  return { page, diagnostics };
}
