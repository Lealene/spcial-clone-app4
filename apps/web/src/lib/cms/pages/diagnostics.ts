import type { CmsPageBlockDiagnostic } from './block-adapters';

export function reportCmsPageDiagnostics(diagnostics: CmsPageBlockDiagnostic[]): void {
  if (diagnostics.length === 0) return;

  console.warn('[cms-page] skipped CMS blocks', diagnostics);
}
