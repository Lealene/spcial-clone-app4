'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Images } from 'lucide-react';

import { Container } from '@/components/container';
import type { GalleryShot } from '@/data/property';

/**
 * PDP gallery mosaic — one large hero tile plus four smaller shots. Clicking a
 * thumbnail swaps it into the hero slot (matches the source design's behavior).
 * Interactive, so it's a client leaf.
 */
export function PropertyGallery({
  gallery,
  statusLabel,
}: {
  gallery: GalleryShot[];
  statusLabel: string;
}) {
  // Index 0 is the hero; the rest fill the four tiles. We track the hero index
  // and render the remaining four in source order around it.
  const [heroIdx, setHeroIdx] = useState(0);
  const hero = gallery[heroIdx] ?? gallery[0];
  const tiles = gallery
    .map((shot, i) => ({ shot, i }))
    .filter(({ i }) => i !== heroIdx)
    .slice(0, 4);

  if (!hero) return null;

  return (
    <section className="pt-[clamp(22px,3vw,34px)]">
      <Container>
        <div className="grid grid-cols-1 gap-3.5 overflow-hidden rounded-xl md:h-[clamp(420px,42vw,560px)] md:grid-cols-[1.6fr_1fr_1fr] md:grid-rows-2">
          {/* Hero tile — aspect-ratio on mobile so no empty second row; fills mosaic on md+ */}
          <figure className="group relative col-span-1 m-0 aspect-[16/10] cursor-pointer overflow-hidden md:row-span-2 md:aspect-auto md:h-full md:min-h-0">
            <div className="absolute top-4 left-4 z-[3] flex flex-wrap gap-[9px]">
              <span className="bg-cta text-on-cta shadow-card inline-flex items-center gap-[7px] rounded-md px-[13px] py-[7px] font-sans text-[11.5px] font-extrabold tracking-[0.1em] uppercase">
                <span
                  className="bg-on-cta size-[7px] rounded-full ring-[3px] ring-black/15"
                  aria-hidden
                />
                {statusLabel}
              </span>
              <span className="border-accent-deep/40 bg-surface-soft/95 text-primary shadow-card inline-flex items-center gap-[7px] rounded-md border px-[13px] py-[7px] font-sans text-[11.5px] font-extrabold tracking-[0.1em] uppercase">
                <Check className="text-accent-deep size-[14px]" strokeWidth={2.4} />
                Verified
              </span>
            </div>
            <Image
              key={hero.src}
              src={hero.src}
              alt={hero.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
            />
            <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_0_var(--accent)] transition-shadow duration-200 group-hover:shadow-[inset_0_0_0_3px_var(--accent)]" />
          </figure>

          {/* Four thumbnail tiles — desktop mosaic only */}
          {tiles.map(({ shot, i }, tileIdx) => (
            <button
              type="button"
              key={shot.src}
              onClick={() => setHeroIdx(i)}
              aria-label={`Show photo: ${shot.alt}`}
              className="group focus-visible:ring-ring relative m-0 hidden min-h-0 cursor-pointer overflow-hidden rounded-none outline-none focus-visible:ring-2 md:block md:h-full"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                loading="lazy"
                sizes="25vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
              />
              <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_0_var(--accent)] transition-shadow duration-200 group-hover:shadow-[inset_0_0_0_3px_var(--accent)]" />
              {tileIdx === tiles.length - 1 && (
                <span className="border-primary/20 absolute right-4 bottom-4 z-[3] inline-flex items-center gap-[9px] rounded-md border bg-[rgba(8,26,48,0.8)] px-4 py-[11px] font-sans text-[13.5px] font-bold text-white backdrop-blur-sm">
                  <Images className="size-4" strokeWidth={2} />
                  All {gallery.length} photos
                </span>
              )}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
