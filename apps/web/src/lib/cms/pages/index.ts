import { cmsPageCacheTag, type CmsPage } from '@mvp-realty/api-contracts';

import { fetchJson } from '../client';
import { CmsDataError } from '../errors';
import { getFooterContent, getHeaderContent } from '../site-chrome';
import type { CmsPageBlockDiagnostic } from './block-adapters';
import { reportCmsPageDiagnostics } from './diagnostics';
import { parsePayloadPageEnvelope } from './envelope';
import { normalizePage } from './page';

export {
  cmsPageBlockAdapters,
  normalizeCmsPageBlock,
  normalizeCmsPageBlocks,
} from './block-adapters';
export type { CmsPageBlockDiagnostic } from './block-adapters';
export { parsePayloadPageEnvelope } from './envelope';
export { normalizePage } from './page';
export { getFooterContent, getHeaderContent };

export type CmsPageContentResult =
  | { status: 'ready'; page: CmsPage; diagnostics: CmsPageBlockDiagnostic[] }
  | { status: 'missing' };

function pagePath(slug: string): string {
  const query = encodeURIComponent(slug);
  return `/api/pages?where[slug][equals]=${query}&depth=2&limit=1`;
}

export async function getPageContent(slug: string): Promise<CmsPageContentResult> {
  const response = await fetchJson(pagePath(slug), { tags: [cmsPageCacheTag(slug)] });
  const envelope = parsePayloadPageEnvelope(response);
  if (envelope.status === 'missing') return envelope;

  const normalized = normalizePage(envelope.page);
  reportCmsPageDiagnostics(normalized.diagnostics);
  if (normalized.page.layout.length === 0) {
    throw new CmsDataError('CMS page has no renderable blocks.', {
      kind: 'no-renderable-blocks',
      resource: `page:${slug}`,
    });
  }

  return { status: 'ready', ...normalized };
}
