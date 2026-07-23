import type { Metadata } from 'next';

import { env } from '@/env';
import type { CmsPage } from '@mvp-realty/api-contracts';

export function getCmsPageMetadata(page: CmsPage, path: string): Metadata {
  const title = page.seo.metaTitle ?? page.title;
  const description = page.seo.metaDescription;
  const canonical = page.seo.canonicalUrl ?? new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();
  const ogImage = page.seo.ogImage;
  const twitterImage = page.seo.twitterImage ?? ogImage;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: page.seo.index,
      follow: page.seo.follow,
    },
    openGraph: {
      title: page.seo.ogTitle ?? title,
      description: page.seo.ogDescription ?? description,
      url: canonical,
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage.src,
              alt: page.seo.ogImageAlt ?? ogImage.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: page.seo.twitterCard,
      title: page.seo.twitterTitle ?? page.seo.ogTitle ?? title,
      description: page.seo.twitterDescription ?? page.seo.ogDescription ?? description,
      images: twitterImage ? [twitterImage.src] : undefined,
    },
  };
}
