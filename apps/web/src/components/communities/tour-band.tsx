'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

import { Container } from '@/components/container';
import { Kicker } from '@/components/section-header';
import { Button } from '@/components/ui/button';

const INPUT =
  'focus:border-accent w-full rounded-md border border-white/[0.22] bg-white/[0.06] px-[15px] py-3.5 font-sans text-[15px] font-medium text-white outline-none transition-[border-color,background-color] placeholder:text-white/55 focus:bg-white/10';

/**
 * Bottom navy "Request a Tour" band — split copy + a stubbed tour-request form
 * (fakes success). TODO: wire backend (lead capture) when Payload is ready.
 */
export function TourBand({ communityName }: { communityName: string }) {
  const [sent, setSent] = useState(false);

  return (
    <section id="tour" className="bg-primary relative overflow-hidden text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(120% 90% at 90% 8%, rgba(255,183,3,.10), transparent 56%)',
        }}
        aria-hidden
      />
      <Container className="relative grid grid-cols-1 items-center gap-[clamp(36px,5vw,72px)] py-[clamp(56px,6vw,92px)] lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Kicker tone="dark">Want more about {communityName}?</Kicker>
          <h2 className="mt-4 max-w-[16ch] font-serif text-[clamp(30px,3.6vw,46px)] leading-[1.07] font-semibold tracking-[-0.01em]">
            Let a concierge plan your <em className="text-accent-soft italic">private tour.</em>
          </h2>
          <p className="mt-5 max-w-[46ch] font-sans text-[18px] leading-[1.7] text-white/85">
            Tell us what you&rsquo;re looking for and Eleanor will arrange a walk-through of the
            clubhouses, the amenities, and the residences that fit — along with current pricing and
            incentives. No obligation, no sales floor.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.14] bg-white/[0.05] p-[clamp(26px,3vw,38px)] backdrop-blur-[6px]">
          {sent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="bg-cta text-on-cta grid size-12 place-items-center rounded-full">
                <Check className="size-6" strokeWidth={2.5} />
              </span>
              <p className="mt-4 font-serif text-[22px] font-semibold text-white">
                Your tour request is in.
              </p>
              <p className="mt-2 font-sans text-[14.5px] text-white/75">
                Eleanor will reach out within one business day to plan your visit to {communityName}
                .
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  autoComplete="given-name"
                  aria-label="First name"
                  className={INPUT}
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  autoComplete="family-name"
                  aria-label="Last name"
                  className={INPUT}
                />
              </div>
              <input
                type="email"
                required
                placeholder="Email address"
                autoComplete="email"
                aria-label="Email address"
                className={`${INPUT} mt-3`}
              />
              <input
                type="tel"
                placeholder="Phone number"
                autoComplete="tel"
                aria-label="Phone number"
                className={`${INPUT} mt-3`}
              />
              <input
                type="text"
                placeholder="Ex: I'd like a 3-bed near the marina this winter"
                aria-label="What you're looking for"
                className={`${INPUT} mt-3`}
              />
              <Button type="submit" variant="cta" size="full" className="mt-4">
                Request My Tour
                <ArrowRight />
              </Button>
              <p className="mt-[13px] font-sans text-[12.5px] leading-[1.5] text-white/60">
                MVP Realty does not provide or maintain community HOA information. We never share
                your details.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
