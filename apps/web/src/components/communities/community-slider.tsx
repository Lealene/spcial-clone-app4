'use client';

import { cn } from '@mvp-realty/ui/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { CommunityCard, type CommunityCardData } from '@/components/communities/community-card';

import 'swiper/css';

const AUTOPLAY_MS = 4500;
const GRID_BREAKPOINT = 3;

const navButtonClass =
  'grid size-[50px] cursor-pointer place-items-center rounded-full border shadow-card transition-colors active:scale-95';

function CommunityGrid({
  communities,
  className,
}: {
  communities: CommunityCardData[];
  className?: string;
}) {
  return (
    <div
      className={cn('grid gap-[clamp(20px,2.2vw,30px)] sm:grid-cols-2 lg:grid-cols-3', className)}
    >
      {communities.map((community) => (
        <CommunityCard key={community.slug} community={community} />
      ))}
    </div>
  );
}

export function CommunitySlider({
  communities,
  className,
}: {
  communities: CommunityCardData[];
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (communities.length === 0) return null;

  // Three or fewer: static grid, no swiper chrome.
  if (communities.length <= GRID_BREAKPOINT) {
    return <CommunityGrid communities={communities} className={className} />;
  }

  // Avoid SSR width/lock bugs — Swiper only mounts in the browser.
  if (!mounted) {
    return <CommunityGrid communities={communities.slice(0, 3)} className={className} />;
  }

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
        loop
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
          prevSlideMessage: 'Previous community',
          nextSlideMessage: 'Next community',
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
        {communities.map((community) => (
          <SwiperSlide key={community.slug} className="h-auto!">
            <CommunityCard
              community={community}
              sizes="(max-width: 768px) 88vw, (max-width: 1100px) 45vw, 33vw"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-[clamp(28px,3.2vw,40px)] flex justify-end gap-[9px]">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous community"
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
          aria-label="Next community"
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
