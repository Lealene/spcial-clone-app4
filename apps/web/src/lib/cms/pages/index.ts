import type { CmsPage } from '@mvp-realty/api-contracts';

import { fetchJson } from '../client';
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
  | { status: 'empty'; page: CmsPage; diagnostics: CmsPageBlockDiagnostic[] }
  | { status: 'missing' }
  | { status: 'unavailable'; error: Error };

function pagePath(slug: string): string {
  const query = encodeURIComponent(slug);
  return `/api/pages?where[slug][equals]=${query}&depth=2&limit=1`;
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error('CMS page request failed.');
}

export async function getPageContent(slug: string): Promise<CmsPageContentResult> {
  try {
    const response = await fetchJson(pagePath(slug));
    const envelope = parsePayloadPageEnvelope(response);
    if (envelope.status === 'missing') return envelope;

    const normalized = normalizePage(envelope.page);
    reportCmsPageDiagnostics(normalized.diagnostics);
    if (normalized.page.layout.length === 0) {
      return { status: 'empty', ...normalized };
    }

    return { status: 'ready', ...normalized };
  } catch (reason) {
    return { status: 'unavailable', error: toError(reason) };
  }
}
