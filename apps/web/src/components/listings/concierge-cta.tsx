'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';

import { Container } from '@/components/container';
import { Kicker } from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { unsplash } from '@/data/images';

/**
 * Bottom concierge band. The form is a stub — it fakes success and shows a
 * confirmation state. TODO: wire backend (lead capture) when Payload is ready.
 */
export function ConciergeCta() {
  const [sent, setSent] = useState(false);

  return (
    <section id="concierge" className="bg-primary-deep relative overflow-hidden text-white">
      <div className="absolute inset-0 z-0 opacity-[0.34]">
        <Image
          src={unsplash('1505691938895-1758d7feb511', 1600)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(100deg, rgba(8,26,48,.96) 0%, rgba(8,26,48,.74) 52%, rgba(8,26,48,.42) 100%)',
        }}
      />
      <Container className="relative z-[2] grid items-center gap-[clamp(34px,5vw,72px)] py-[clamp(60px,7vw,104px)] lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Kicker tone="dark">Your Personal Concierge</Kicker>
          <h2 className="mt-[18px] max-w-[16ch] font-serif text-[clamp(32px,4vw,54px)] leading-[1.05] font-semibold tracking-[-0.01em]">
            Let us hand-pick your <em className="text-accent-soft italic">shortlist.</em>
          </h2>
          <p className="mt-5 max-w-[46ch] font-sans text-[clamp(17px,1.3vw,19px)] leading-[1.65] text-white/85">
            Tell us the life you want and Eleanor will send a curated set of residences with current
            pricing, incentives, and the quiet listings that never hit the search.
          </p>
        </div>

        <div className="rounded-xl border border-white/15 bg-white/[0.06] p-[clamp(28px,3vw,38px)] backdrop-blur-md">
          {sent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="bg-cta text-on-cta grid size-12 place-items-center rounded-full">
                <Check className="size-6" strokeWidth={2.5} />
              </span>
              <p className="mt-4 font-serif text-[22px] font-semibold text-white">
                Your request is in.
              </p>
              <p className="mt-2 font-sans text-[14.5px] text-white/75">
                Eleanor will reach out within one business day with your shortlist.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              {[
                { id: 'cc-name', label: 'Full name', type: 'text', placeholder: 'Your name' },
                { id: 'cc-email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
                { id: 'cc-phone', label: 'Phone', type: 'tel', placeholder: '(239) 555-0100' },
              ].map((field) => (
                <label key={field.id} htmlFor={field.id} className="mt-4 block first:mt-0">
                  <span className="mb-2 block font-sans text-[13px] font-bold text-white/90">
                    {field.label}
                  </span>
                  <input
                    id={field.id}
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    className="bg-primary-deep/40 focus:border-accent focus:bg-primary-deep/60 w-full rounded-md border border-white/20 px-[15px] py-3.5 font-sans text-[15.5px] font-medium text-white transition-[border-color,background-color] outline-none placeholder:text-white/50"
                  />
                </label>
              ))}
              <Button type="submit" variant="cta" size="full" className="mt-[22px]">
                Request My Shortlist
                <ArrowRight />
              </Button>
              <p className="mt-3.5 text-center font-sans text-[12.5px] leading-[1.5] text-white/55">
                No spam, ever. Just a curated shortlist from a local expert.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
