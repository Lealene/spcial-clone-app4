import Image from 'next/image';
import {
  CalendarDays,
  Dumbbell,
  Trees,
  Trophy,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { amenities } from '@/data/amenities';
import { unsplash } from '@/data/images';
import type { AmenityIcon } from '@/data/types';

const ICONS: Record<AmenityIcon, LucideIcon> = {
  pool: Waves,
  racquet: Trophy,
  fitness: Dumbbell,
  dining: Utensils,
  trails: Trees,
  calendar: CalendarDays,
};

export function Amenities() {
  return (
    <section id="amenities" className="bg-surface py-[clamp(78px,9vw,138px)]">
      <Container>
        <Reveal>
          <SectionHeader
            kicker="The Resort at Your Door"
            heading="Every day arranged like a stay at a fine resort."
            lede="From the first cup of coffee at the clubhouse to sunset by the pool, the amenities are designed for an active, social life, and tended so you never have to think about the upkeep."
          />
        </Reveal>

        <Reveal
          delay={0.1}
          className="grid items-stretch gap-[clamp(34px,4.4vw,72px)] lg:grid-cols-[1.15fr_1fr]"
        >
          <div className="shadow-lift relative order-1 min-h-[360px] overflow-hidden rounded-xl lg:order-none lg:min-h-[480px]">
            <Image
              src={unsplash('1576013551627-0cc20b96c2a7', 1400)}
              alt="Residents gathered with drinks at the resort pool deck on a sunny afternoon"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(to_top,rgba(8,26,48,.86),transparent)] p-7 text-white">
              <b className="block font-serif text-[24px] font-semibold">The Grand Clubhouse</b>
              <span className="font-sans text-[15px] text-white/85">
                Dining, events, and the pool deck where the day&rsquo;s plans get made.
              </span>
            </div>
          </div>

          <div className="border-line bg-line grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2">
            {amenities.map((a) => {
              const Icon = ICONS[a.icon];
              return (
                <div
                  key={a.title}
                  className="bg-surface hover:bg-surface-soft flex flex-col gap-[13px] px-[26px] py-7 transition-colors duration-300"
                >
                  <span className="bg-surface-muted grid size-[46px] place-items-center rounded-md shadow-[inset_0_0_0_1px_var(--line)]">
                    <Icon className="text-primary size-6" strokeWidth={1.7} />
                  </span>
                  <h4 className="text-primary m-0 font-serif text-[21px] font-semibold">
                    {a.title}
                  </h4>
                  <p className="text-ink-soft m-0 font-sans text-[15.5px] leading-[1.55]">
                    {a.blurb}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
