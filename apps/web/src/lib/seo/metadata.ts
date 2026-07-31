import type { Metadata } from 'next';

import type { CmsImage, PageSeo } from '@mvp-realty/api-contracts';

import { env } from '@/env';

export type EntityMetadataInput = {
  /** Authored overrides. Every field is optional; blanks fall back below. */
  seo: PageSeo;
  /** App-relative path for this entity, used for the automatic canonical. */
  path: string;
  /** Used when no `metaTitle` is authored. */
  title: string;
  /** Used when no `metaDescription` is authored. */
  description?: string;
  /** Used when no `ogImage` is authored — e.g. a listing's gallery. */
  images?: CmsImage[];
};

type SocialImage = { url: string; alt?: string };

function toSocialImages(image: CmsImage | undefined, alt: string | undefined): SocialImage[] {
  if (!image) return [];
  return [{ url: image.src, alt: alt ?? image.alt }];
}

/**
 * One metadata shape for every entity that carries the `seo` group — CMS pages,
 * listings and communities. Authored values always win; the generated title,
 * description and imagery only fill the gaps, so an editor never has to fill in
 * a whole tab to change one field.
 */
export function buildEntityMetadata({
  seo,
  path,
  title: fallbackTitle,
  description: fallbackDescription,
  images = [],
}: EntityMetadataInput): Metadata {
  const title = seo.metaTitle ?? fallbackTitle;
  const description = seo.metaDescription ?? fallbackDescription;

  const canonical =
    seo.canonicalMode === 'custom' && seo.canonicalUrl
      ? new URL(seo.canonicalUrl, env.NEXT_PUBLIC_SITE_URL).toString()
      : new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();

  const ogImages = seo.ogImage
    ? toSocialImages(seo.ogImage, seo.ogImageAlt)
    : images.map((image) => ({ url: image.src, alt: image.alt }));

  const twitterImages = seo.twitterImage
    ? toSocialImages(seo.twitterImage, seo.twitterImageAlt)
    : ogImages;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: seo.index,
      follow: seo.follow,
    },
    openGraph: {
      title: seo.ogTitle ?? title,
      description: seo.ogDescription ?? description,
      url: canonical,
      type: 'website',
      images: ogImages.length > 0 ? ogImages : undefined,
    },
    twitter: {
      card: seo.twitterCard,
      title: seo.twitterTitle ?? seo.ogTitle ?? title,
      description: seo.twitterDescription ?? seo.ogDescription ?? description,
      images: twitterImages.length > 0 ? twitterImages : undefined,
    },
  };
}
