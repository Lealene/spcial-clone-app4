import type { CmsImage } from '@mvp-realty/api-contracts';
import { cn } from '@mvp-realty/ui/lib/utils';
import Image from 'next/image';

import { Container } from '@/components/container';
import { GalleryPhotosDialog } from './gallery-photos-dialog';

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
 * Gallery mosaic — one lead image plus up to four tiles. "All N photos" opens
 * a dialog of every CMS gallery image (not the authored marketing photoCount).
 */
export function Gallery({ images }: { images: CmsImage[]; photoCount: number }) {
  const visible = images.slice(0, 5);
  const [lead, ...rest] = visible;
  if (!lead) return null;

  const tiles = rest.slice(0, 4);
  const tileCount = Math.min(tiles.length, 4) as 0 | 1 | 2 | 3 | 4;
  // Show whenever there is more than one photo to browse in the modal.
  const allPhotosButton = images.length > 1 ? <GalleryPhotosDialog images={images} /> : null;

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
            overlay={tiles.length === 0 ? allPhotosButton : null}
          />
          {tiles.map((tile, i) => (
            <GalleryTile
              key={tile.src}
              image={tile}
              className={cn(tileCount === 4 && i >= 2 && 'hidden md:block')}
              sizes="(max-width: 768px) 40vw, 22vw"
              overlay={i === tiles.length - 1 ? allPhotosButton : null}
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
  image: CmsImage;
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
