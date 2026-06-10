'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { Kicker } from '@/components/section-header';
import { testimonials } from '@/data/testimonials';

const AUTO_MS = 6500;
const pad = (n: number) => (n < 10 ? '0' : '') + n;

// Accent-tinted glow over the dark testimonials band; follows the active theme.
const glow = (pct: number) => `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;
const SPOT_GLOW =
  `radial-gradient(120% 90% at 88% 10%, ${glow(10)}, transparent 55%),` +
  `radial-gradient(80% 70% at 6% 96%, ${glow(7)}, transparent 60%)`;

export function Testimonials() {
  const total = testimonials.length;
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = useRef(false);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (reduced.current || timer.current) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % total), AUTO_MS);
  }, [total]);

  const goto = useCallback(
    (n: number) => {
      setIndex(((n % total) + total) % total);
      stop();
      play();
    },
    [total, stop, play],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const hovered = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    play();
    return stop;
  }, [play, stop]);

  // Arrow-key navigation, only while the carousel is hovered or holds focus —
  // attached to the document so the section stays a non-interactive landmark.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const node = sectionRef.current;
      if (!node) return;
      if (!hovered.current && !node.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') goto(index - 1);
      if (e.key === 'ArrowRight') goto(index + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [goto, index]);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="bg-primary-deep relative overflow-hidden py-[clamp(78px,9vw,138px)] text-white"
      onMouseEnter={() => {
        hovered.current = true;
        stop();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        play();
      }}
      onFocusCapture={stop}
      onBlurCapture={play}
    >
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: SPOT_GLOW }} />
      <Container className="relative z-10">
        <Reveal>
          <Kicker tone="dark">In Their Words</Kicker>
          <h2 className="mt-[18px] max-w-[20ch] font-serif text-[clamp(34px,4.4vw,58px)] leading-[1.05] font-semibold tracking-[-0.01em] text-white">
            The address impressed them. The <em className="text-accent-soft italic">people</em> kept
            them.
          </h2>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-[clamp(40px,4vw,64px)] grid items-center gap-[clamp(36px,5vw,84px)] lg:grid-cols-[minmax(340px,440px)_1fr]"
          aria-roledescription="carousel"
        >
          {/* Portrait stack */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] shadow-[0_50px_90px_-40px_rgba(0,0,0,.7)] before:pointer-events-none before:absolute before:inset-0 before:z-20 before:bg-[linear-gradient(to_top,rgba(8,26,48,.62),transparent_46%)] after:pointer-events-none after:absolute after:inset-0 after:z-30 after:rounded-[18px] after:shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]">
            {testimonials.map((t, i) => (
              <figure
                key={t.slug}
                className={cn(
                  'absolute inset-0 m-0 transition-[opacity,transform] duration-[1000ms] ease-out',
                  i === index
                    ? '[transform:scale(1)] opacity-100'
                    : '[transform:scale(1.06)] opacity-0',
                )}
              >
                <Image
                  src={t.portrait.src}
                  alt={t.portrait.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 440px"
                  className="object-cover"
                />
              </figure>
            ))}
            <div className="bg-primary-deep/50 absolute bottom-[18px] left-[18px] z-40 flex items-center gap-[9px] rounded-full py-[9px] pr-3.5 pl-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] backdrop-blur-[10px]">
              <span className="bg-accent size-[7px] shrink-0 rounded-full shadow-[0_0_0_4px_rgba(255,183,3,.2)]" />
              <span className="font-sans text-[13px] font-semibold tracking-[0.04em] whitespace-nowrap text-white">
                {testimonials[index]?.name}
              </span>
            </div>
          </div>

          {/* Quote side */}
          <div className="relative">
            <span
              aria-hidden
              className="text-accent pointer-events-none absolute -top-[0.28em] -left-1 z-0 font-serif text-[clamp(120px,13vw,190px)] leading-[0.7] font-bold opacity-[0.16]"
            >
              &ldquo;
            </span>

            <div className="relative z-10 min-h-[clamp(220px,22vw,260px)]">
              {testimonials.map((t, i) => (
                <article
                  key={t.slug}
                  className={cn(
                    'transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
                    i === index
                      ? 'relative [transform:none] opacity-100'
                      : 'pointer-events-none absolute inset-0 translate-y-3.5 opacity-0',
                  )}
                  aria-hidden={i !== index}
                >
                  <blockquote className="m-0 font-serif text-[clamp(23px,2.35vw,33px)] leading-[1.42] font-medium tracking-[-0.005em] text-white italic">
                    {t.quote}
                  </blockquote>
                  <div className="mt-[clamp(24px,2.4vw,34px)] flex items-center gap-3.5">
                    <span className="bg-accent h-0.5 w-[30px] shrink-0" />
                    <div>
                      <b className="block font-sans text-[17px] font-bold tracking-[0.005em] text-white">
                        {t.name}
                      </b>
                      <span className="mt-[3px] block font-sans text-[14px] text-white/60">
                        {t.location}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-[clamp(34px,3.6vw,52px)] flex flex-col gap-[22px] border-t border-white/10 pt-[26px] sm:flex-row sm:items-center sm:justify-between">
              <div
                className="flex flex-wrap gap-2.5"
                role="tablist"
                aria-label="Choose a resident story"
              >
                {testimonials.map((t, i) => (
                  <button
                    key={t.slug}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={t.name}
                    onClick={() => goto(i)}
                    className={cn(
                      'relative size-[46px] overflow-hidden rounded-full transition-[opacity,filter,transform,box-shadow] duration-300',
                      i === index
                        ? 'opacity-100 shadow-[0_0_0_2px_var(--primary-deep),0_0_0_4px_var(--accent)]'
                        : 'opacity-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)] grayscale-[0.5] hover:-translate-y-0.5 hover:opacity-85 hover:grayscale-0',
                    )}
                  >
                    <Image
                      src={t.portrait.src}
                      alt=""
                      width={46}
                      height={46}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className="font-sans text-[14px] tracking-[0.12em] whitespace-nowrap text-white/55">
                  <b className="font-bold text-white">{pad(index + 1)}</b> / {pad(total)}
                </span>
                <div className="flex gap-[9px]">
                  <button
                    type="button"
                    onClick={() => goto(index - 1)}
                    aria-label="Previous story"
                    className="hover:border-accent hover:bg-accent hover:text-on-cta grid size-[50px] place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors active:scale-95"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goto(index + 1)}
                    aria-label="Next story"
                    className="hover:border-accent hover:bg-accent hover:text-on-cta grid size-[50px] place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors active:scale-95"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
