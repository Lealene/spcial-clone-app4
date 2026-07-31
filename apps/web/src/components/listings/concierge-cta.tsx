import Image from 'next/image';

import { Container } from '@/components/layout/container';
import { LeadForm } from '@/components/leads/lead-form';
import { Kicker } from '@/components/layout/section-header';
import { unsplash } from '@/data/images';

/** Bottom concierge band — shortlist request over the navy hero treatment. */
export function ConciergeCta() {
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
            Tell us the life you want and our concierge will send a curated set of residences with
            current pricing, incentives, and the quiet listings that never hit the search.
          </p>
        </div>

        <div className="rounded-xl border border-white/15 bg-white/[0.06] p-[clamp(28px,3vw,38px)] backdrop-blur-md">
          <LeadForm
            variant="shortlist"
            surface="concierge-cta"
            tone="dark"
            copy={{
              submitLabel: 'Request My Shortlist',
              successHeading: 'Your request is in.',
              successBody:
                'Our concierge will reach out within one business day with your shortlist.',
              privacyText: 'No spam, ever. Just a curated shortlist from a local expert.',
            }}
          />
        </div>
      </Container>
    </section>
  );
}
