import type { CmsImage, CmsLink } from '@mvp-realty/api-contracts';
import { cn } from '@mvp-realty/ui/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

import { getLinkRenderProps } from '@/lib/cms/links';

export type CommunityCardData = {
  slug: string;
  name: string;
  locality: string;
  rating: number | null;
  reviews: number;
  reviewsLabel: string;
  priceRange: string;
  tags: string[];
  residences: number | null;
  residencesLabel: string;
  nowSelling: number;
  nowSellingLabel: string;
  image: CmsImage;
  href: string;
  link?: CmsLink;
};

export function CommunityCard({
  community,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: {
  community: CommunityCardData;
  className?: string;
  sizes?: string;
}) {
  const linkProps = community.link ? getLinkRenderProps(community.link) : { href: community.href };

  return (
    <Link
      {...linkProps}
      className={cn(
        'border-line bg-surface shadow-card hover:shadow-lift group flex h-full flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[5px]',
        className,
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        {community.rating != null ? (
          <span className="border-accent/40 bg-primary-deep/75 shadow-card absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-[7px] rounded-md border px-3 py-[7px] font-sans text-[13px] font-extrabold text-white backdrop-blur-[7px]">
            <Star className="fill-accent text-accent size-3.5" />
            {community.rating.toFixed(1)}{' '}
            <em className="font-semibold text-white/65 not-italic">
              ({community.reviews} {community.reviewsLabel})
            </em>
          </span>
        ) : null}
        <Image
          src={community.image.src}
          alt={community.image.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
        />
      </div>
      <div className="flex flex-1 flex-col p-[24px] pt-6 pb-[26px]">
        <h3 className="text-primary font-serif text-[25px] leading-[1.1] font-semibold">
          {community.name}
        </h3>
        <div className="text-muted mt-1.5 flex items-center gap-[7px] font-sans text-[15px] font-medium">
          <MapPin className="text-accent-deep size-[15px] shrink-0" strokeWidth={1.8} />
          {community.locality}
        </div>
        <div className="text-ink mt-4 font-sans text-[19px] font-extrabold">
          {community.priceRange}
        </div>
        {community.tags.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap gap-2">
            {community.tags.map((t) => (
              <span
                key={t}
                className="border-line bg-surface-muted text-ink-soft rounded-full border px-[11px] py-[5px] font-sans text-[12px] font-bold tracking-[0.03em]"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-[18px]">
          {community.residences != null ? (
            <span className="text-muted font-sans text-[14px] font-semibold">
              <b className="text-primary font-extrabold">{community.residences}</b>{' '}
              {community.residencesLabel}
            </span>
          ) : (
            <span />
          )}
          <span className="text-accent-deep inline-flex items-center gap-[7px] font-sans text-[13px] font-extrabold whitespace-nowrap">
            <span className="bg-accent size-[7px] rounded-full shadow-[0_0_0_3px_rgba(255,183,3,0.22)]" />
            {community.nowSelling} {community.nowSellingLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
