'use client';

import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';

import type { CmsImage } from '@mvp-realty/api-contracts';

import { GalleryLightbox } from '@/components/gallery-lightbox';

/**
 * "All N photos" trigger that opens the shared lightbox. Sized down below `sm`
 * because it overlays a tile that is only ~110px wide on a phone.
 */
export function GalleryPhotosDialog({ images }: { images: CmsImage[] }) {
  const [open, setOpen] = useState(false);

  if (images.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-accent-deep/45 bg-surface-soft/95 text-primary shadow-card hover:shadow-lift absolute right-2 bottom-2 z-[3] inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-sans text-[12px] font-bold transition-[transform,box-shadow] hover:-translate-y-0.5 sm:right-4 sm:bottom-4 sm:gap-[9px] sm:px-[17px] sm:py-[11px] sm:text-[14px]"
      >
        <LayoutGrid className="text-accent-deep size-3.5 sm:size-4" strokeWidth={1.9} />
        <span className="hidden sm:inline">All {images.length} photos</span>
        <span className="sm:hidden">{images.length} photos</span>
      </button>

      <GalleryLightbox
        images={images}
        open={open}
        onOpenChange={setOpen}
        title="Community photos"
      />
    </>
  );
}
