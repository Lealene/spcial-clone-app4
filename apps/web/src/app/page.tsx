import type { Metadata } from 'next';

import { BlockRenderer } from '@/components/home/block-renderer';
import { env } from '@/env';
import { getHomepageContent } from '@/lib/cms/homepage';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomepageContent();
  const title = page.seo.metaTitle ?? page.title;
  const description = page.seo.metaDescription;
  const canonical = page.seo.canonicalUrl ?? new URL('/', env.NEXT_PUBLIC_SITE_URL).toString();
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

export default async function HomePage() {
  const page = await getHomepageContent();

  return (
    <>
      {page.layout.map((block, index) => (
        <BlockRenderer key={`${block.blockType}-${index}`} block={block} />
      ))}
    </>
  );
}
