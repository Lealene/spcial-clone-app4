import { Suspense } from 'react';
import Image from 'next/image';

import { Container } from '@/components/container';
import { Kicker } from '@/components/section-header';
import { HeroSearch } from './hero-search';

/** Compact PLP hero — navy photo header with the keyword/beds search inside. */
export function ListingsHero({ total, communities }: { total: number; communities: number }) {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-naples-waterfront.jpg"
          alt="Naples bayfront residences along the Gulf Coast at golden hour"
          fill
          priority
          sizes="100vw"
          className="motion-safe:animate-hero-zoom object-cover"
        />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,26,48,.62) 0%, rgba(8,26,48,.44) 42%, rgba(6,20,38,.78) 100%), radial-gradient(120% 120% at 12% 88%, rgba(6,20,38,.6) 0%, rgba(6,20,38,0) 60%)',
        }}
      />
      <Container className="relative z-[2] py-[clamp(54px,7vw,104px)]">
        <Kicker tone="dark">The Collection</Kicker>
        <h1 className="mt-[18px] max-w-[17ch] font-serif text-[clamp(38px,5.2vw,68px)] leading-[1.04] font-semibold tracking-[-0.012em] [text-shadow:0_4px_40px_rgba(6,20,38,0.5)]">
          Find your place on the <em className="text-accent-soft italic">Gulf Coast.</em>
        </h1>
        <p className="mt-5 max-w-[54ch] font-sans text-[clamp(17px,1.3vw,20px)] leading-[1.6] font-medium text-white/90">
          Browse luxury residences across Southwest Florida&rsquo;s premier gated communities —
          refine by community, price, and the life you want, or let a concierge shortlist them for
          you.
        </p>

        <Suspense
          fallback={
            /* Matches the real search's wrapped height on narrow screens so
               hydration doesn't jump the page. */
            <div className="bg-surface-soft/40 mt-[clamp(28px,3.4vw,40px)] h-[186px] max-w-[780px] rounded-xl sm:h-[78px]" />
          }
        >
          <HeroSearch />
        </Suspense>

        <p className="mt-[18px] flex items-center gap-[9px] font-sans text-[14px] text-white/80">
          <span className="bg-accent size-1.5 rounded-full" aria-hidden />
          <b className="font-bold text-white">{total}</b> residences across {communities}{' '}
          communities · prices from the $500s
        </p>
      </Container>
    </section>
  );
}
