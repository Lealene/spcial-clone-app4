import type { HeroBlock } from '@mvp-realty/api-contracts';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { getLinkRenderProps } from '@/lib/cms/links';

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
      // Sticky nav is in document flow (not fixed), so the hero already starts
      // below it. Keep a modest min-height, grow with content, never clip copy.
      className="relative flex min-h-[clamp(520px,72vh,780px)] flex-col justify-end text-white"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={block.backgroundImage.src}
          alt={block.backgroundImage.alt}
          fill
          priority={block.backgroundImagePriority}
          sizes="100vw"
          className="animate-hero-zoom object-cover"
        />
        <div className="absolute inset-0" style={{ background: HERO_VEIL }} aria-hidden />
      </div>

      <Container className="relative z-20 w-full pt-8 pb-[clamp(48px,5.5vw,80px)]">
        <span
          className="animate-hero-rise border-accent/70 mb-6 inline-flex items-center gap-3 border-b pb-3.5 font-sans text-[13px] font-bold tracking-[0.26em] text-white uppercase"
          style={{ animationDelay: '0.12s' }}
        >
          {block.showEyebrowMarker && <span className="bg-accent size-[7px] rotate-45" />}
          {block.eyebrow}
        </span>
        <h1
          className="animate-hero-rise m-0 max-w-[16ch] font-serif text-[clamp(36px,5.2vw,72px)] leading-[1.06] font-semibold tracking-[-0.012em] [text-shadow:0_1px_2px_rgba(6,20,38,.4),0_4px_40px_rgba(6,20,38,.6)]"
          style={{ animationDelay: '0.26s' }}
        >
          {block.heading}{' '}
          {block.headingAccent && (
            <em className="text-accent-soft italic">{block.headingAccent}</em>
          )}
        </h1>
        <p
          className="animate-hero-rise mt-5 mb-8 max-w-[48ch] font-sans text-[clamp(16px,1.25vw,19px)] leading-[1.65] font-medium text-white/95 [text-shadow:0_1px_14px_rgba(8,26,48,.5)]"
          style={{ animationDelay: '0.4s' }}
        >
          {block.lede}
        </p>
        <div
          className="animate-hero-rise flex flex-wrap gap-[15px]"
          style={{ animationDelay: '0.54s' }}
        >
          <Button asChild variant="cta">
            <Link {...getLinkRenderProps(block.primaryCta)}>
              {block.primaryCta.label} {block.showPrimaryCtaIcon && <ArrowRight />}
            </Link>
          </Button>
          {showSecondary && (
            <Button asChild variant="glass">
              <Link {...getLinkRenderProps(showSecondary)}>{showSecondary.label}</Link>
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
