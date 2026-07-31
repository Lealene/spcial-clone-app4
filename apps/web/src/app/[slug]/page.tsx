import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CmsPageBlocksRenderer } from '@/components/blocks';
import { getPageContent, type CmsPageContentResult } from '@/lib/cms/pages';
import { getCmsPageMetadata } from '@/lib/cms/pages/metadata';
import { JsonLd } from '@/lib/seo/json-ld';
import { buildCmsPageGraph } from '@/lib/seo/web-page';

const RESERVED_PAGE_SLUGS = new Set(['admin', 'api', 'listings', 'communities', 'ui']);

/**
 * Pure editorial — `Pages` purges its own `cms-page:<slug>` tag on save, so this
 * only bounds staleness if that request never arrives.
 */
export const revalidate = 86400;

type Params = { slug: string };

function isReservedSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slug);
}

function requireCmsPage(result: CmsPageContentResult) {
  if (result.status === 'missing') notFound();
  return result.page;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const missing: Metadata = { title: 'Page not found', robots: { index: false, follow: true } };
  if (isReservedSlug(slug)) return missing;

  const result = await getPageContent(slug);
  if (result.status === 'missing') return missing;
  return getCmsPageMetadata(result.page, `/${slug}`);
}

export default async function CmsPageRoute({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();

  const page = requireCmsPage(await getPageContent(slug));
  return (
    <>
      <JsonLd nodes={buildCmsPageGraph(page, `/${slug}`)} />
      <CmsPageBlocksRenderer blocks={page.layout} />
    </>
  );
}
