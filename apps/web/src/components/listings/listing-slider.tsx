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
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goPrev = () => {
    const instance = swiperRef.current;
    if (!instance) return;
    instance.slidePrev();
    instance.autoplay?.start();
  };

  const goNext = () => {
    const instance = swiperRef.current;
    if (!instance) return;
    instance.slideNext();
    instance.autoplay?.start();
  };

  if (slides.length === 0) return null;

  // Avoid SSR width/lock bugs — Swiper only mounts in the browser.
  if (!mounted) {
    return (
      <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {slides.slice(0, 3).map((listing) => (
          <ListingCard key={listing.slug} listing={listing} className="h-full" />
        ))}
      </div>
    );
  }

  const canLoop = slides.length > 3;

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
      onMouseLeave={() => swiperRef.current?.autoplay?.start()}
    >
      <Swiper
        modules={[A11y, Autoplay]}
        className="overflow-hidden [&_.swiper-slide]:box-border [&_.swiper-slide]:h-auto [&_.swiper-wrapper]:items-stretch"
        spaceBetween={20}
        slidesPerView={1.15}
        slidesPerGroup={1}
        loop={canLoop}
        grabCursor
        resistanceRatio={0.65}
        speed={500}
        watchOverflow={false}
        allowTouchMove
        simulateTouch
        touchStartPreventDefault={false}
        autoplay={
          canLoop
            ? {
                delay: AUTOPLAY_MS,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        a11y={{
          enabled: true,
          prevSlideMessage: 'Previous residence',
          nextSlideMessage: 'Next residence',
        }}
        breakpoints={{
          640: { slidesPerView: 1.4, spaceBetween: 22 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1100: { slidesPerView: 3, spaceBetween: 28 },
        }}
        onSwiper={(instance) => {
          swiperRef.current = instance;
          requestAnimationFrame(() => instance.update());
        }}
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
    </div>
  );
}
