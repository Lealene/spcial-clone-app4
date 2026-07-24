import {
  cmsCanonicalUrlSchema,
  cmsPageSchema,
  pageSeoSchema,
  type CmsPage,
  type PageSeo,
} from '@mvp-realty/api-contracts';

import { normalizeOptionalMediaField } from '../media';
import { normalizeCmsPageBlocks, type CmsPageBlockDiagnostic } from './block-adapters';
import type { PayloadPageDocument } from './envelope';
import { bool, isRecord, text } from './primitives';

function normalizeSeo(raw: unknown): PageSeo {
  const seo = isRecord(raw) ? raw : {};
  const canonicalUrl = cmsCanonicalUrlSchema.safeParse(text(seo.canonicalUrl));
  const twitterCard =
    seo.twitterCard === 'summary' || seo.twitterCard === 'summary_large_image'
      ? seo.twitterCard
      : 'summary_large_image';

  return pageSeoSchema.parse({
    metaTitle: text(seo.metaTitle) || undefined,
    metaDescription: text(seo.metaDescription) || undefined,
    canonicalMode: seo.canonicalMode === 'custom' ? 'custom' : 'auto',
    canonicalUrl: canonicalUrl.success ? canonicalUrl.data : undefined,
    index: bool(seo.index, true),
    follow: bool(seo.follow, true),
    ogTitle: text(seo.ogTitle) || undefined,
    ogDescription: text(seo.ogDescription) || undefined,
    ogImage: isRecord(seo.ogImage)
      ? normalizeOptionalMediaField(seo.ogImage, 'Open Graph image')
      : undefined,
    ogImageAlt: text(seo.ogImageAlt) || undefined,
    twitterCard,
    twitterTitle: text(seo.twitterTitle) || undefined,
    twitterDescription: text(seo.twitterDescription) || undefined,
    twitterImage: isRecord(seo.twitterImage)
      ? normalizeOptionalMediaField(seo.twitterImage, 'Twitter image')
      : undefined,
    twitterImageAlt: text(seo.twitterImageAlt) || undefined,
    includeInSitemap: bool(seo.includeInSitemap, true),
  });
}

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
