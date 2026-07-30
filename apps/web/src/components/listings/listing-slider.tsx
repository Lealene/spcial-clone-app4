'use client';

import type { ListingCard as ListingCardData } from '@mvp-realty/api-contracts';
import { cn } from '@mvp-realty/ui/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ListingCard } from '@/components/listings/listing-card';

import 'swiper/css';

const DEFAULT_LIMIT = 12;
const AUTOPLAY_MS = 4500;

/** Highest `slidesPerView` in the breakpoint map below. Above this many slides,
 *  Swiper's `loop` is safe at every breakpoint; below it we rewind instead. */
const MAX_SLIDES_PER_VIEW = 3;

const navButtonClass =
  'grid size-[50px] cursor-pointer place-items-center rounded-full border shadow-card transition-colors active:scale-95';

export function ListingSlider({
  listings,
  limit = DEFAULT_LIMIT,
  className,
}: {
  listings: ListingCardData[];
  limit?: number;
  className?: string;
}) {
  const slides = listings.slice(0, limit);
  const [mounted, setMounted] = useState(false);
  // Tracks the active breakpoint's slidesPerView so autoplay only runs when
  // there is actually something off-screen to advance to.
  const [perView, setPerView] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The global CSS `prefers-reduced-motion` rule only neutralizes CSS
  // animations; Swiper's autoplay is JS-driven, so it needs its own guard.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const readPerView = (instance: SwiperInstance) => {
    const value = instance.params.slidesPerView;
    setPerView(typeof value === 'number' ? value : 1);
  };

  // Autoplay is worthwhile only when slides overflow the current viewport.
  const shouldAutoplay = slides.length > perView && !reducedMotion;

  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;
    if (shouldAutoplay) autoplay.start();
    else autoplay.stop();
  }, [shouldAutoplay]);

  const goPrev = () => swiperRef.current?.slidePrev();
  const goNext = () => swiperRef.current?.slideNext();

  if (slides.length === 0) return null;

  // Avoid SSR width/lock bugs — Swiper only mounts in the browser. Mirrors the
  // carousel's first frame (partial third card) so the swap is near-invisible.
  if (!mounted) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <div className="grid grid-cols-[1.15fr] gap-5 sm:grid-cols-[1.4fr] md:grid-cols-2 lg:grid-cols-3">
          {slides.slice(0, 3).map((listing) => (
            <ListingCard key={listing.slug} listing={listing} className="h-full" />
          ))}
        </div>
      </div>
    );
  }

  // `loop` needs more slides than the widest view; smaller sets rewind instead
  // so short rails still auto-advance rather than sitting dead.
  const canLoop = slides.length > MAX_SLIDES_PER_VIEW;

  return (
    <div className={cn('relative', className)}>
      <Swiper
        modules={[A11y, Autoplay]}
        className="overflow-hidden [&_.swiper-slide]:box-border [&_.swiper-slide]:h-auto [&_.swiper-wrapper]:items-stretch"
        spaceBetween={20}
        slidesPerView={1.15}
        slidesPerGroup={1}
        loop={canLoop}
        rewind={!canLoop}
        grabCursor
        resistanceRatio={0.65}
        speed={500}
        watchOverflow={false}
        allowTouchMove
        simulateTouch
        touchStartPreventDefault={false}
        autoplay={{
          delay: AUTOPLAY_MS,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        a11y={{
          enabled: true,
          prevSlideMessage: 'Previous residence',
          nextSlideMessage: 'Next residence',
        }}
        breakpoints={{
          640: { slidesPerView: 1.4, spaceBetween: 22 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1100: { slidesPerView: MAX_SLIDES_PER_VIEW, spaceBetween: 28 },
        }}
        onSwiper={(instance) => {
          swiperRef.current = instance;
          readPerView(instance);
          requestAnimationFrame(() => instance.update());
        }}
        onBreakpoint={(instance) => readPerView(instance)}
      >
        {slides.map((listing) => (
          <SwiperSlide key={listing.slug} className="h-auto!">
            <ListingCard
              listing={listing}
              className="h-full"
              sizes="(max-width: 768px) 88vw, (max-width: 1100px) 45vw, 33vw"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && (
        <div className="mt-[clamp(28px,3.2vw,40px)] flex justify-end gap-[9px]">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous residence"
            className={cn(
              navButtonClass,
              'border-line bg-surface text-muted hover:border-accent hover:text-primary',
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next residence"
            className={cn(
              navButtonClass,
              'border-accent bg-accent text-primary hover:border-accent-deep hover:bg-accent-deep hover:text-on-cta',
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
