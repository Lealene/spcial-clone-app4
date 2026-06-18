import type { HeroBlock } from '@mvp-realty/api-contracts';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Container } from '@/components/container';
import { Button } from '@/components/ui/button';

// Veil tint follows the active theme's deepest brand colour (via color-mix on
// --primary-deep) so the hero re-skins when the theme switches, instead of
// staying locked to navy. Heaviest at the bottom to keep the display type legible.
const veil = (pct: number) => `color-mix(in srgb, var(--primary-deep) ${pct}%, transparent)`;
const HERO_VEIL =
  `linear-gradient(180deg, ${veil(56)} 0%, ${veil(30)} 30%, ${veil(46)} 60%, ${veil(94)} 100%),` +
  `radial-gradient(125% 105% at 14% 80%, ${veil(74)} 0%, ${veil(20)} 46%, transparent 70%)`;

export function Hero({ block }: { block: HeroBlock }) {
  const showSecondary = block.showSecondaryCta && block.secondaryCta;

  return (
    <section
      id={block.anchorId}
      className="relative flex min-h-[clamp(600px,86vh,860px)] items-end overflow-hidden text-white"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={block.backgroundImage.src}
          alt={block.backgroundImage.alt}
          fill
          priority={block.backgroundImagePriority}
          sizes="100vw"
          className="animate-hero-zoom object-cover"
        />
      </div>
      <div className="absolute inset-0 z-10" style={{ background: HERO_VEIL }} />

      <Container className="relative z-20 w-full pb-[clamp(54px,6vw,96px)]">
        <span
          className="animate-hero-rise border-accent/70 mb-[26px] inline-flex items-center gap-3 border-b pb-3.5 font-sans text-[13px] font-bold uppercase tracking-[0.26em] text-white"
          style={{ animationDelay: '0.12s' }}
        >
          {block.showEyebrowMarker && <span className="bg-accent size-[7px] rotate-45" />}
          {block.eyebrow}
        </span>
        <h1
          className="animate-hero-rise m-0 max-w-[15ch] font-serif text-[clamp(46px,6.6vw,86px)] font-semibold leading-[1.02] tracking-[-0.012em] [text-shadow:0_1px_2px_rgba(6,20,38,.4),0_4px_40px_rgba(6,20,38,.6)]"
          style={{ animationDelay: '0.26s' }}
        >
          {block.heading}{' '}
          {block.headingAccent && (
            <em className="text-accent-soft italic">{block.headingAccent}</em>
          )}
        </h1>
        <p
          className="animate-hero-rise my-[24px] mb-[34px] max-w-[50ch] font-sans text-[clamp(18px,1.35vw,21px)] font-medium leading-[1.65] text-white/95 [text-shadow:0_1px_14px_rgba(8,26,48,.5)]"
          style={{ animationDelay: '0.4s' }}
        >
          {block.lede}
        </p>
        <div
          className="animate-hero-rise flex flex-wrap gap-[15px]"
          style={{ animationDelay: '0.54s' }}
        >
          <Button asChild variant="cta">
            <Link href={block.primaryCta.href} aria-label={block.primaryCta.ariaLabel}>
              {block.primaryCta.label} {block.showPrimaryCtaIcon && <ArrowRight />}
            </Link>
          </Button>
          {showSecondary && (
            <Button asChild variant="glass">
              <Link href={showSecondary.href} aria-label={showSecondary.ariaLabel}>
                {showSecondary.label}
              </Link>
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
