import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import type { Listing } from '@/data/types';
import { fmtPrice, LABELS } from '@/lib/listing-filters';

/** Compact tag labels for the card's feature pills (shorter than the facet labels). */
const TAG_LABEL: Record<string, string> = {
  waterfront: 'Waterfront',
  pool: 'Private Pool',
  golf: 'Golf',
  gated: 'Gated',
  '55plus': '55+',
};

/** Statuses that get the filled-gold badge (vs. the quiet cream one). */
const GOLD_STATUS = new Set(['active', 'coming-soon']);

/**
 * Listing card — the PLP grid tile, also reused by PDP "Similar Homes" and the
 * community "Homes for Sale" block. Presentational; no client state.
 */
export function ListingCard({
  listing,
  className,
  sizes = '(max-width: 680px) 100vw, (max-width: 1180px) 50vw, 33vw',
}: {
  listing: Listing;
  className?: string;
  sizes?: string;
}) {
  const formatStat = (value: number) => (value > 0 ? value.toLocaleString() : '—');
  const stats = [
    { value: formatStat(listing.beds), label: 'Beds' },
    { value: formatStat(listing.baths), label: 'Baths' },
    { value: formatStat(listing.sqft), label: 'Sq Ft' },
  ];

  return (
    <article
      className={cn(
        'group border-line bg-surface shadow-card hover:shadow-lift relative flex flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[5px]',
        className,
      )}
    >
      <Link
        href={`/listings/${listing.slug}`}
        className="relative block aspect-[16/11] overflow-hidden"
      >
        <span
          className={cn(
            'shadow-card absolute top-3.5 left-3.5 z-10 rounded-md px-3 py-[7px] font-sans text-[11px] font-extrabold tracking-[0.1em] uppercase',
            GOLD_STATUS.has(listing.status)
              ? 'bg-cta text-on-cta'
              : 'border-accent-deep/40 bg-surface-soft/95 text-primary border',
          )}
        >
          {LABELS[listing.status]}
        </span>
        <Image
          src={listing.image.src}
          alt={listing.image.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-6 pt-[22px]">
        <p className="text-primary font-sans text-[23px] leading-none font-extrabold">
          <span className="text-muted mr-1.5 text-[13px] font-bold tracking-[0.04em] uppercase">
            From
          </span>
          {fmtPrice(listing.price)}
        </p>
        <h3 className="text-ink mt-[13px] font-serif text-[22px] leading-[1.12] font-semibold">
          <Link href={`/listings/${listing.slug}`} className="hover:text-primary transition-colors">
            {listing.name}
          </Link>
        </h3>
        <div className="text-muted mt-1.5 flex items-center gap-[7px] font-sans text-[14px] font-medium">
          <MapPin className="text-accent-deep size-[14px] shrink-0" strokeWidth={1.8} />
          {listing.communityName} · {listing.city}
        </div>

        <div className="border-line-soft mt-4 flex border-t pt-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn('flex-1 text-left', i > 0 && 'border-line-soft border-l pl-[13px]')}
            >
              <b className="text-primary block font-sans text-[17px] leading-none font-extrabold">
                {s.value}
              </b>
              <span className="text-muted mt-1.5 block font-sans text-[11px] font-bold tracking-[0.06em] uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-[7px]">
          {listing.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="border-line bg-surface-muted text-ink-soft rounded-full border px-2.5 py-[5px] font-sans text-[11.5px] font-bold"
            >
              {TAG_LABEL[f] ?? f}
            </span>
          ))}
        </div>

        <Link
          href={`/listings/${listing.slug}`}
          className="border-line-soft text-primary mt-5 inline-flex items-center gap-[9px] border-t pt-[18px] font-sans text-[14.5px] font-bold"
        >
          View residence
          <ArrowRight className="text-accent-deep size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
