import Image from 'next/image';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { Kicker } from '@/components/section-header';
import { lifestyleTiles } from '@/data/lifestyle';
import { unsplash } from '@/data/images';

// Theme-aware veil (see Hero) so the band re-skins with the active palette.
const veil = (pct: number) => `color-mix(in srgb, var(--primary-deep) ${pct}%, transparent)`;
const LIFE_VEIL = `linear-gradient(95deg, ${veil(92)} 0%, ${veil(74)} 46%, ${veil(30)} 100%)`;

export function TheLife() {
  return (
    <section
      id="lifestyle"
      className="relative flex min-h-[600px] items-center overflow-hidden text-white"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={unsplash('1414235077428-338989a2e8c0', 2000)}
          alt="Residents gathered around a long candlelit table at a clubhouse dinner, talking and laughing together"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 z-10" style={{ background: LIFE_VEIL }} />

      <Container className="relative z-20 w-full py-[clamp(64px,7vw,112px)]">
        <Reveal className="max-w-[62ch]">
          <Kicker tone="dark">The Life Inside the Gates</Kicker>
          <h2 className="mt-5 max-w-[18ch] font-serif text-[clamp(34px,4.6vw,60px)] leading-[1.06] font-semibold tracking-[-0.01em]">
            You buy the home. You stay for <em className="text-accent-soft italic">the people.</em>
          </h2>
          <p className="mt-6 max-w-[48ch] font-sans text-[clamp(17px,1.3vw,19px)] leading-[1.7] text-white/90">
            For our residents, the deciding factor is rarely the floorplan. It is the standing
            dinner on Thursdays, the doubles partner two doors down, and the sense that there is
            always a reason to step outside. You arrive with an address; within a week you have a
            ready-made circle.
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-[clamp(40px,4.5vw,60px)] grid gap-[clamp(18px,1.8vw,28px)] sm:grid-cols-3"
        >
          {lifestyleTiles.map((tile) => (
            <figure
              key={tile.caption}
              className="group shadow-lift relative m-0 aspect-[3/4] overflow-hidden rounded-xl"
            >
              <Image
                src={tile.image.src}
                alt={tile.image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(to_top,rgba(8,26,48,.9),transparent)] px-[22px] pt-12 pb-5 font-sans text-[16px] font-semibold text-white">
                {tile.caption}
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
