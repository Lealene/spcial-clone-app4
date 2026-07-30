'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Images } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import { Container } from '@/components/container';
import { GalleryLightbox } from '@/components/gallery-lightbox';
import type { GalleryShot } from '@/data/property';

/** How many tiles follow the hero in the mosaic. */
type TileCount = 0 | 1 | 2 | 3 | 4;

/**
 * Mosaic templates keyed by tile count, so a listing with two photos renders
 * two filled tiles instead of leaving holes in a five-photo layout. Each row
 * fills its columns exactly at every count. Complete literal class strings so
 * Tailwind's CSS-first scan can see them — never interpolate these.
 */
const GRID_BY_TILES: Record<TileCount, string> = {
  0: 'md:grid-cols-1 md:grid-rows-1',
  1: 'md:grid-cols-2 md:grid-rows-1',
  2: 'md:grid-cols-[1.6fr_1fr] md:grid-rows-2',
  3: 'md:grid-cols-[1.6fr_1fr] md:grid-rows-3',
  4: 'md:grid-cols-[1.6fr_1fr_1fr] md:grid-rows-2',
};

/** Hero spans the full height of the left column. */
const HERO_SPAN_BY_TILES: Record<TileCount, string> = {
  0: '',
  1: '',
  2: 'md:row-span-2',
  3: 'md:row-span-3',
  4: 'md:row-span-2',
};

/** `sizes` has to track the template, or narrow layouts under-fetch. */
const HERO_SIZES_BY_TILES: Record<TileCount, string> = {
  0: '(max-width: 768px) 100vw, 92vw',
  1: '(max-width: 768px) 100vw, 46vw',
  2: '(max-width: 768px) 100vw, 57vw',
  3: '(max-width: 768px) 100vw, 57vw',
  4: '(max-width: 768px) 100vw, 40vw',
};

const TILE_SIZES_BY_TILES: Record<TileCount, string> = {
  0: '25vw',
  1: '46vw',
  2: '35vw',
  3: '35vw',
  4: '25vw',
};

/**
 * PDP gallery mosaic — a hero tile plus up to four smaller shots, sized to the
 * number of photos actually available. Any tile opens the shared lightbox at
 * that photo. Interactive, so it's a client leaf.
 */
export function PropertyGallery({
  gallery,
  statusLabel,
}: {
  gallery: GalleryShot[];
  statusLabel: string;
}) {
  const [viewerAt, setViewerAt] = useState<number | null>(null);

  const hero = gallery[0];
  if (!hero) return null;

  // The mosaic shows at most five photos; the lightbox reaches all of them.
  const tiles = gallery.slice(1, 5);
  const tileCount = tiles.length as TileCount;

  return (
    <section className="pt-[clamp(22px,3vw,34px)]">
      <Container>
        <div
          className={cn(
            'relative grid grid-cols-1 gap-3.5 overflow-hidden rounded-xl md:aspect-[1.92/1]',
            GRID_BY_TILES[tileCount],
          )}
        >
          <figure
            className={cn(
              'group relative col-span-1 m-0 aspect-[16/10] overflow-hidden md:aspect-auto md:h-full md:min-h-0',
              HERO_SPAN_BY_TILES[tileCount],
            )}
          >
            <div className="absolute top-4 left-4 z-[3] flex max-w-[calc(100%-2rem)] flex-wrap gap-[9px]">
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
              src={hero.src}
              alt={hero.alt}
              fill
              priority
              sizes={HERO_SIZES_BY_TILES[tileCount]}
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
            />
            <button
              type="button"
              onClick={() => setViewerAt(0)}
              aria-label={`View photo: ${hero.alt}`}
              className="focus-visible:ring-ring absolute inset-0 cursor-pointer shadow-[inset_0_0_0_0_var(--accent)] transition-shadow duration-200 outline-none group-hover:shadow-[inset_0_0_0_3px_var(--accent)] focus-visible:ring-2 focus-visible:ring-inset"
            />
          </figure>

          {/* Thumbnail tiles — desktop mosaic only */}
          {tiles.map((shot, i) => (
            <button
              type="button"
              key={`${shot.src}-${i}`}
              onClick={() => setViewerAt(i + 1)}
              aria-label={`View photo: ${shot.alt}`}
              className="group focus-visible:ring-ring relative m-0 hidden min-h-0 cursor-pointer overflow-hidden rounded-none outline-none focus-visible:ring-2 md:block md:h-full"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                loading="lazy"
                sizes={TILE_SIZES_BY_TILES[tileCount]}
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
              />
              <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_0_var(--accent)] transition-shadow duration-200 group-hover:shadow-[inset_0_0_0_3px_var(--accent)]" />
            </button>
          ))}

          {/* Its own control, and visible on mobile where the tiles are hidden. */}
          {gallery.length > 1 && (
            <button
              type="button"
              onClick={() => setViewerAt(0)}
              className="border-primary/20 hover:shadow-lift absolute right-4 bottom-4 z-[4] inline-flex cursor-pointer items-center gap-2 rounded-md border bg-[rgba(8,26,48,0.8)] px-3.5 py-2.5 font-sans text-[13px] font-bold text-white backdrop-blur-sm transition-[transform,box-shadow] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:px-4 sm:py-[11px] sm:text-[13.5px]"
            >
              <Images className="size-4" strokeWidth={2} />
              All {gallery.length} photos
            </button>
          )}
        </div>
      </Container>

      <GalleryLightbox
        images={gallery}
        open={viewerAt !== null}
        onOpenChange={(next) => setViewerAt(next ? 0 : null)}
        startIndex={viewerAt ?? 0}
        title="Residence photos"
      />
    </section>
  );
}
