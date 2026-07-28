'use client';

import Image from 'next/image';
import { LayoutGrid, X } from 'lucide-react';

import type { CmsImage } from '@mvp-realty/api-contracts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@mvp-realty/ui/components/ui/dialog';

const triggerClassName =
  'border-accent-deep/45 bg-surface-soft/95 text-primary shadow-card hover:shadow-lift absolute right-4 bottom-4 z-[3] inline-flex items-center gap-[9px] rounded-md border px-[17px] py-[11px] font-sans text-[14px] font-bold transition-[transform,box-shadow] hover:-translate-y-0.5';

/** "All N photos" trigger + full-screen dialog of every gallery image. */
export function GalleryPhotosDialog({ images }: { images: CmsImage[] }) {
  if (images.length === 0) return null;

  const count = images.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={triggerClassName}>
          <LayoutGrid className="text-accent-deep size-4" strokeWidth={1.9} />
          All {count} photos
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="bg-primary top-0 left-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-white/10 p-0 text-white sm:max-w-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
          <div className="min-w-0 text-left">
            <DialogTitle className="font-serif text-[22px] font-semibold text-white">
              All {count} photos
            </DialogTitle>
            <DialogDescription className="mt-1 font-sans text-[13px] text-white/60">
              Scroll to browse the full community gallery.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className="focus-visible:ring-accent inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Close gallery"
            >
              <X className="size-5" strokeWidth={1.8} />
            </button>
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <li
                key={`${image.src}-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white/5"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
