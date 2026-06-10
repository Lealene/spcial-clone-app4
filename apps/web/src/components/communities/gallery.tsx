import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';

import { Container } from '@/components/container';
import { cn } from '@mvp-realty/ui/lib/utils';
import type { Image as ImageType } from '@/data/types';

/**
 * Gallery mosaic — one lead image spanning two rows plus four tiles, with an
 * "All N photos" button anchored over the last tile. The button is a stub link
 * to the gallery anchor (no lightbox yet). Mirrors the source `c-gallery`.
 */
export function Gallery({ images, photoCount }: { images: ImageType[]; photoCount: number }) {
  const [lead, ...tiles] = images;
  if (!lead) return null;

  return (
    <div className="pt-[clamp(20px,2.4vw,30px)]">
      <Container>
        <div className="grid aspect-[16/10] grid-cols-[1.4fr_1fr] grid-rows-2 gap-3.5 overflow-hidden rounded-xl md:aspect-[1.92/1] md:grid-cols-[1.62fr_1fr_1fr]">
          <GalleryTile image={lead} className="row-span-2" sizes="(max-width: 768px) 60vw, 45vw" />
          {tiles.map((tile, i) => (
            <GalleryTile
              key={tile.src}
              image={tile}
              // Tiles 4 + 5 (0-indexed 2 + 3) collapse on small screens.
              className={cn(i >= 2 && 'hidden md:block')}
              sizes="(max-width: 768px) 40vw, 22vw"
              overlay={
                i === tiles.length - 1 ? (
                  <a
                    href="#gallery"
                    className="border-accent-deep/45 bg-surface-soft/95 text-primary shadow-card hover:shadow-lift absolute right-4 bottom-4 z-[3] inline-flex items-center gap-[9px] rounded-md border px-[17px] py-[11px] font-sans text-[14px] font-bold transition-[transform,box-shadow] hover:-translate-y-0.5"
                  >
                    <LayoutGrid className="text-accent-deep size-4" strokeWidth={1.9} />
                    All {photoCount} photos
                  </a>
                ) : null
              }
            />
          ))}
        </div>
      </Container>
    </div>
  );
}

function GalleryTile({
  image,
  className,
  sizes,
  overlay,
}: {
  image: ImageType;
  className?: string;
  sizes: string;
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
        className="absolute inset-0 bg-[rgba(8,26,48,0)] transition-colors duration-300 group-hover:bg-[rgba(8,26,48,0.12)]"
        aria-hidden
      />
      {overlay}
    </figure>
  );
}
