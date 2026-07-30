'use client';

import { useState } from 'react';
import type { CmsImage } from '@mvp-realty/api-contracts';
import { cn } from '@mvp-realty/ui/lib/utils';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';

import { Container } from '@/components/container';
import { GalleryLightbox } from '@/components/gallery-lightbox';

/**
 * Grid templates keyed by tile count (0–4 after the lead).
 * Complete literal class strings so Tailwind's CSS-first scan can see them.
 */
const GRID_BY_TILES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'grid-cols-1 grid-rows-1',
  1: 'grid-cols-2 grid-rows-1',
  2: 'grid-cols-[1.4fr_1fr] grid-rows-2',
  3: 'grid-cols-[1.4fr_1fr] grid-rows-2 md:grid-cols-[1.62fr_1fr_1fr]',
  4: 'grid-cols-[1.4fr_1fr] grid-rows-2 md:grid-cols-[1.62fr_1fr_1fr]',
};

const LEAD_BY_TILES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: '',
  1: '',
  2: 'row-span-2',
  3: 'row-span-2',
  4: 'row-span-2',
};

/**
 * Gallery mosaic — one lead image plus up to four tiles. Any tile opens the
 * shared lightbox at that photo, matching the listing PDP mosaic. "All N photos"
 * opens every CMS gallery image (not the authored marketing photoCount).
 */
export function Gallery({ images }: { images: CmsImage[]; photoCount: number }) {
  const [viewerAt, setViewerAt] = useState<number | null>(null);

  const visible = images.slice(0, 5);
  const [lead, ...rest] = visible;
  if (!lead) return null;

  const tiles = rest.slice(0, 4);
  const tileCount = Math.min(tiles.length, 4) as 0 | 1 | 2 | 3 | 4;
  // Show whenever there is more than one photo to browse in the lightbox.
  const allPhotosButton =
    images.length > 1 ? (
      <AllPhotosButton count={images.length} onOpen={() => setViewerAt(0)} />
    ) : null;

  return (
    <div className="pt-[clamp(20px,2.4vw,30px)]">
      <Container>
        <div
          className={cn(
            'grid aspect-[16/10] gap-3.5 overflow-hidden rounded-xl md:aspect-[1.92/1]',
            GRID_BY_TILES[tileCount],
          )}
        >
          <GalleryTile
            image={lead}
            className={LEAD_BY_TILES[tileCount]}
            sizes="(max-width: 768px) 60vw, 45vw"
            onOpen={() => setViewerAt(0)}
            overlay={tiles.length === 0 ? allPhotosButton : null}
          />
          {tiles.map((tile, i) => (
            <GalleryTile
              key={tile.src}
              image={tile}
              className={cn(tileCount === 4 && i >= 2 && 'hidden md:block')}
              sizes="(max-width: 768px) 40vw, 22vw"
              onOpen={() => setViewerAt(i + 1)}
              overlay={i === tiles.length - 1 ? allPhotosButton : null}
            />
          ))}
        </div>
      </Container>

      <GalleryLightbox
        images={images}
        open={viewerAt !== null}
        onOpenChange={(next) => setViewerAt(next ? 0 : null)}
        startIndex={viewerAt ?? 0}
        title="Community photos"
      />
    </div>
  );
}

/**
 * The tile is a `figure` with a full-bleed button on top rather than a `button`
 * wrapper, so the "All N photos" overlay stays clickable in its own right.
 */
function GalleryTile({
  image,
  className,
  sizes,
  onOpen,
  overlay,
}: {
  image: CmsImage;
  className?: string;
  sizes: string;
  onOpen: () => void;
  overlay?: React.ReactNode;
}) {
  return (
    <figure className={cn('group relative m-0 overflow-hidden', className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
      />
      <span
        className="pointer-events-none absolute inset-0 bg-[rgba(8,26,48,0)] transition-colors duration-300 group-hover:bg-[rgba(8,26,48,0.12)]"
        aria-hidden
      />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View photo: ${image.alt}`}
        className="focus-visible:ring-ring absolute inset-0 cursor-pointer shadow-[inset_0_0_0_0_var(--accent)] transition-shadow duration-200 outline-none group-hover:shadow-[inset_0_0_0_3px_var(--accent)] focus-visible:ring-2 focus-visible:ring-inset"
      />
      {overlay}
    </figure>
  );
}

/** Sized down below `sm` because it overlays a tile only ~110px wide on a phone. */
function AllPhotosButton({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="border-accent-deep/45 bg-surface-soft/95 text-primary shadow-card hover:shadow-lift absolute right-2 bottom-2 z-[3] inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-sans text-[12px] font-bold transition-[transform,box-shadow] hover:-translate-y-0.5 sm:right-4 sm:bottom-4 sm:gap-[9px] sm:px-[17px] sm:py-[11px] sm:text-[14px]"
    >
      <LayoutGrid className="text-accent-deep size-3.5 sm:size-4" strokeWidth={1.9} />
      <span className="hidden sm:inline">All {count} photos</span>
      <span className="sm:hidden">{count} photos</span>
    </button>
  );
}
