import { cmsPageSchema, type CmsPageBlock, type CmsPage } from '@mvp-realty/api-contracts';

import { homepageFixture } from '@/data/homepage-fixture';
import { normalizeMediaField } from '../media';
import { normalizeCmsPageBlock } from './block-adapters';
import { array, bool, isRecord, text } from './primitives';

function normalizeSeo(raw: unknown) {
  const seo = isRecord(raw) ? raw : {};
  return {
    metaTitle: text(seo.metaTitle) || undefined,
    metaDescription: text(seo.metaDescription) || undefined,
    canonicalUrl: text(seo.canonicalUrl) || undefined,
    index: bool(seo.index, true),
    follow: bool(seo.follow, true),
    ogTitle: text(seo.ogTitle) || undefined,
    ogDescription: text(seo.ogDescription) || undefined,
    ogImage: isRecord(seo.ogImage)
      ? normalizeMediaField({ image: seo.ogImage }, 'Open Graph image')
      : undefined,
    ogImageAlt: text(seo.ogImageAlt) || undefined,
    twitterCard: text(seo.twitterCard, 'summary_large_image'),
    twitterTitle: text(seo.twitterTitle) || undefined,
    twitterDescription: text(seo.twitterDescription) || undefined,
    twitterImage: isRecord(seo.twitterImage)
      ? normalizeMediaField({ image: seo.twitterImage }, 'Twitter image')
      : undefined,
    twitterImageAlt: text(seo.twitterImageAlt) || undefined,
    includeInSitemap: bool(seo.includeInSitemap, true),
  };
}

export function normalizePage(raw: unknown): CmsPage {
  const page = isRecord(raw) ? raw : {};
  const normalized = {
    title: text(page.title, homepageFixture.title),
    slug: text(page.slug, homepageFixture.slug),
    seo: normalizeSeo(page.seo),
    layout: array(page.layout)
      .map(normalizeCmsPageBlock)
      .filter((block): block is CmsPageBlock => block !== null),
  };

  return cmsPageSchema.parse(normalized);
}
