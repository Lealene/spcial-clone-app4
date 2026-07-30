'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@mvp-realty/ui/components/ui/dialog';

/**
 * Minimal shape shared by `GalleryShot` (apps/web/src/data/property.ts) and
 * `CmsImage` (@mvp-realty/api-contracts) — CmsImage is a structural superset,
 * so both pass without an adapter.
 */
export type LightboxImage = {
  src: string;
  alt: string;
};

/** Horizontal pointer travel (px) that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 48;

const controlClass =
  'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none disabled:cursor-default disabled:pointer-events-none disabled:opacity-40';

/**
 * Full-screen photo viewer with prev/next arrows, keyboard and swipe
 * navigation, and an "n of N" position counter. Shared by the listing PDP
 * mosaic and the community gallery so both behave identically.
 */
export function GalleryLightbox({
  images,
  open,
  onOpenChange,
  startIndex = 0,
  title = 'Photo gallery',
}: {
  images: LightboxImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex?: number;
  title?: string;
}) {
  const count = images.length;
  const [index, setIndex] = useState(startIndex);
  const pointerStartX = useRef<number | null>(null);

  // Re-seat the viewer whenever it is opened from a different tile. Clamped so
  // a stale index can never point past a shorter gallery.
  useEffect(() => {
    if (open) setIndex(Math.min(Math.max(startIndex, 0), Math.max(count - 1, 0)));
  }, [open, startIndex, count]);

  const go = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((current) => (current + delta + count) % count);
    },
    [count],
  );

  // Arrow keys step through photos. Radix already handles Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, go]);

  if (count === 0) return null;

  const active = images[Math.min(index, count - 1)];
  if (!active) return null;

  const onPointerDown = (event: React.PointerEvent) => {
    pointerStartX.current = event.clientX;
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointerStartX.current;
    pointerStartX.current = null;
    if (start === null) return;
    const travel = event.clientX - start;
    if (Math.abs(travel) < SWIPE_THRESHOLD) return;
    go(travel > 0 ? -1 : 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-primary top-0 left-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-white/10 p-0 text-white sm:max-w-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-8 sm:py-4">
          <div className="min-w-0 text-left">
            <DialogTitle className="truncate font-serif text-[18px] font-semibold text-white sm:text-[22px]">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-0.5 font-sans text-[13px] text-white/60">
              {index + 1} of {count}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={controlClass}
            aria-label="Close gallery"
          >
            <X className="size-5" strokeWidth={1.8} />
          </button>
        </div>

        <div
          className="relative min-h-0 flex-1 touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <Image
            key={active.src}
            src={active.src}
            alt={active.alt}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className={`${controlClass} absolute top-1/2 left-2 -translate-y-1/2 bg-black/45 backdrop-blur-sm sm:left-5`}
              >
                <ChevronLeft className="size-6" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className={`${controlClass} absolute top-1/2 right-2 -translate-y-1/2 bg-black/45 backdrop-blur-sm sm:right-5`}
              >
                <ChevronRight className="size-6" strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 sm:px-8">
            {images.map((image, i) => (
              <button
                type="button"
                key={`${image.src}-${i}`}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}: ${image.alt}`}
                aria-current={i === index}
                className={`relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-md transition-opacity focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none ${
                  i === index ? 'ring-accent opacity-100 ring-2' : 'opacity-55 hover:opacity-85'
                }`}
              >
                <Image src={image.src} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
