import Image from 'next/image';
import { Star } from 'lucide-react';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { Kicker } from '@/components/section-header';

const CREDS = [
  { value: '18 yrs', label: 'on the Gulf Coast' },
  { value: '9', label: 'communities, known by name' },
  { value: '1:1', label: 'by appointment only' },
];

export function MeetTheOwner() {
  return (
    <section id="concierge" className="bg-surface py-[clamp(78px,9vw,138px)]">
      <Container>
        <div className="grid items-center gap-[clamp(34px,4.6vw,76px)] lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal className="relative order-1 mx-auto w-full max-w-[420px] lg:order-none lg:max-w-none">
            <span
              aria-hidden
              className="from-accent-soft to-accent/40 absolute -right-[22px] -bottom-[22px] z-0 h-[72%] w-[66%] rounded-3xl bg-gradient-to-br"
            />
            <span
              aria-hidden
              className="border-accent absolute top-[26px] -left-4 z-0 h-[46%] w-[42%] rounded-[20px] border-[1.5px] opacity-65"
            />
            <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-[22px] shadow-[0_46px_88px_-38px_rgba(8,26,48,.55)]">
              <Image
                src="/images/owner-eleanor-voss.jpg"
                alt="Portrait of Eleanor Voss, Broker and Owner of MVP Realty, with her Doberman"
                fill
                sizes="(max-width: 1024px) 420px, 35vw"
                className="object-cover"
              />
            </div>
            <div className="bg-primary absolute bottom-[30px] -left-[18px] z-20 inline-flex items-center gap-[9px] rounded-full px-[18px] py-3 text-white shadow-[0_24px_46px_-20px_rgba(8,26,48,.65)]">
              <Star className="fill-accent text-accent size-4 shrink-0" />
              <b className="font-sans text-[14px] font-bold tracking-[0.02em]">
                Broker &amp; Owner
              </b>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Kicker>Meet the Owner</Kicker>
            <h2 className="text-ink mt-[18px] font-serif text-[clamp(34px,4.4vw,58px)] leading-[1.05] font-semibold tracking-[-0.01em]">
              One person, from first call to <em className="italic">front door.</em>
            </h2>
            <p className="text-accent-deep mt-2.5 font-sans text-[13.5px] font-bold tracking-[0.06em] uppercase">
              Eleanor Voss · Broker &amp; Owner, MVP Realty
            </p>
            <p className="text-ink-soft mt-5 max-w-[54ch] font-sans text-[clamp(18px,1.35vw,21px)] leading-[1.7]">
              Eleanor has spent eighteen years matching Gulf-Coast buyers to the right gate, not
              just the right house. As the broker who owns the firm, she answers her own phone,
              walks the courts and clubhouses with you, and stays on long after the keys change
              hands. You are never handed off to a sales floor.
            </p>
            <p className="text-primary mt-[26px] font-serif text-[27px] font-medium italic">
              Eleanor Voss
            </p>
            <div className="mt-[26px] flex flex-wrap gap-[clamp(24px,3vw,44px)]">
              {CREDS.map((c) => (
                <div key={c.label}>
                  <b className="text-primary block font-serif text-[28px] leading-none font-semibold">
                    {c.value}
                  </b>
                  <span className="text-muted mt-[7px] block font-sans text-[13px]">{c.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
