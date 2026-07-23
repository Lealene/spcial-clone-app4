import type { LifestyleBlock } from '@mvp-realty/api-contracts';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { Kicker } from '@/components/section-header';

// Theme-aware veil (see Hero) so the band re-skins with the active palette.
const veil = (pct: number) => `color-mix(in srgb, var(--primary-deep) ${pct}%, transparent)`;
const LIFE_VEIL = `linear-gradient(95deg, ${veil(92)} 0%, ${veil(74)} 46%, ${veil(30)} 100%)`;

export function TheLife({ block }: { block: LifestyleBlock }) {
  const tiles = block.tiles.slice(0, block.maxTiles ?? block.tiles.length);

  return (
    <section
      id={block.anchorId}
      className="relative flex min-h-[600px] items-center overflow-hidden text-white"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={block.backgroundImage.src}
          alt={block.backgroundImage.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 z-10" style={{ background: LIFE_VEIL }} />

      <Container className="relative z-20 w-full py-[clamp(64px,7vw,112px)]">
        <Reveal className="max-w-[62ch]">
          <Kicker tone="dark">{block.kicker}</Kicker>
          <h2 className="mt-5 max-w-[18ch] font-serif text-[clamp(34px,4.6vw,60px)] font-semibold leading-[1.06] tracking-[-0.01em]">
            {block.heading}{' '}
            {block.headingAccent && (
              <em className="text-accent-soft italic">{block.headingAccent}</em>
            )}
          </h2>
          <p className="mt-6 max-w-[48ch] font-sans text-[clamp(17px,1.3vw,19px)] leading-[1.7] text-white/90">
            {block.body}
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-[clamp(40px,4.5vw,60px)] grid gap-[clamp(18px,1.8vw,28px)] sm:grid-cols-3"
        >
          {tiles.map((tile) => {
            const figure = (
              <figure className="shadow-lift group relative m-0 aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  src={tile.image.src}
                  alt={tile.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(to_top,rgba(8,26,48,.9),transparent)] px-[22px] pb-5 pt-12 font-sans text-[16px] font-semibold text-white">
                  {tile.caption}
                </figcaption>
              </figure>
            );

            return tile.link ? (
              <Link key={tile.caption} href={tile.link.href} aria-label={tile.link.ariaLabel}>
                {figure}
              </Link>
            ) : (
              <div key={tile.caption}>{figure}</div>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}
