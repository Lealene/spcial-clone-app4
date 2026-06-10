'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Check, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';

const INPUT =
  'bg-surface-soft border-line text-ink focus:border-accent-deep focus:bg-surface w-full rounded-md border px-3.5 py-[13px] font-sans text-[15px] font-medium outline-none transition-[border-color,background-color] placeholder:text-muted';

/**
 * Sticky agent sidebar — navy concierge card for Eleanor Voss, a stubbed
 * "Ask about {community}" form (fakes success), and a "prefer to call" card.
 * TODO: wire backend (lead capture) when Payload is ready.
 */
export function AgentAside({
  communityName,
  phone,
  phoneHref,
}: {
  communityName: string;
  phone: string;
  phoneHref: string;
}) {
  const [sent, setSent] = useState(false);

  return (
    <aside className="grid gap-[18px] lg:sticky lg:top-[150px]">
      <div className="border-line bg-surface shadow-card overflow-hidden rounded-xl border">
        <div className="bg-primary text-on-primary flex items-center gap-4 px-[26px] py-6">
          <div className="size-[62px] shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_2px_rgba(255,183,3,0.6)]">
            <Image
              src="/images/owner-eleanor-voss.jpg"
              alt="Eleanor Voss, Broker & Owner of MVP Realty"
              width={62}
              height={62}
              className="size-full object-cover"
            />
          </div>
          <div>
            <span className="text-accent font-sans text-[12px] font-bold tracking-[0.1em] uppercase">
              Your Concierge
            </span>
            <b className="mt-1 block font-serif text-[22px] font-semibold">Eleanor Voss</b>
            <span className="mt-[3px] block font-sans text-[13px] text-white/70">
              Broker &amp; Owner, MVP Realty
            </span>
          </div>
        </div>

        <div className="px-[26px] pt-6 pb-[26px]">
          {sent ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="bg-cta text-on-cta grid size-12 place-items-center rounded-full">
                <Check className="size-6" strokeWidth={2.5} />
              </span>
              <p className="text-primary mt-4 font-serif text-[20px] font-semibold">
                Your request is in.
              </p>
              <p className="text-muted mt-2 font-sans text-[14px]">
                Eleanor will reach out within one business day about {communityName}.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <p className="text-primary mb-4 font-serif text-[20px] leading-[1.2] font-semibold">
                Ask about {communityName}
              </p>
              <div className="mb-2.5 grid grid-cols-2 gap-2.5">
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
                className={`${INPUT} mt-2.5`}
              />
              <input
                type="tel"
                placeholder="Phone number"
                autoComplete="tel"
                aria-label="Phone number"
                className={`${INPUT} mt-2.5`}
              />
              <textarea
                placeholder="How can we help? I'm interested in a 3-bed near the marina…"
                aria-label="Message"
                className={`${INPUT} mt-2.5 min-h-[76px] resize-y leading-[1.5]`}
              />
              <Button type="submit" variant="cta" size="full" className="mt-3.5">
                Request Community Info
                <ArrowRight />
              </Button>
              <p className="text-muted mt-[13px] font-sans text-[12px] leading-[1.5]">
                A private introduction — no sales floor, no obligation. You&rsquo;ll only ever hear
                from Eleanor.
              </p>
            </form>
          )}
        </div>
      </div>

      <div className="border-line bg-surface-soft rounded-xl border px-6 py-5 text-center">
        <span className="text-muted font-sans text-[14px]">Prefer to call?</span>
        <a
          href={phoneHref}
          className="text-primary mt-1.5 inline-flex items-center gap-[9px] font-sans text-[18px] font-extrabold"
        >
          <Phone className="text-accent-deep size-[17px]" strokeWidth={1.8} />
          {phone}
        </a>
      </div>
    </aside>
  );
}
