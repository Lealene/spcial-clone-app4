import { Container } from '@/components/layout/container';
import { LeadForm } from '@/components/leads/lead-form';
import { Kicker } from '@/components/layout/section-header';

/** Bottom navy "Request a Tour" band — split copy plus the tour lead form. */
export function TourBand({
  communityName,
  communitySlug,
  brokerFirstName,
}: {
  communityName: string;
  communitySlug?: string;
  brokerFirstName?: string;
}) {
  const firstName = brokerFirstName ?? 'Your concierge';

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
          <h2 className="mt-4 max-w-[16ch] font-serif text-[clamp(30px,3.6vw,46px)] font-semibold leading-[1.07] tracking-[-0.01em]">
            Let a concierge plan your <em className="text-accent-soft italic">private tour.</em>
          </h2>
          <p className="mt-5 max-w-[46ch] font-sans text-[18px] leading-[1.7] text-white/85">
            Tell us what you&rsquo;re looking for and {firstName} will arrange a walk-through of the
            clubhouses, the amenities, and the residences that fit — along with current pricing and
            incentives. No obligation, no sales floor.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.14] bg-white/[0.05] p-[clamp(26px,3vw,38px)] backdrop-blur-[6px]">
          <LeadForm
            variant="tour"
            surface="community-tour-band"
            tone="dark"
            areaSlug={communitySlug}
            copy={{
              submitLabel: 'Request My Tour',
              successHeading: 'Your tour request is in.',
              successBody: `${firstName} will reach out within one business day to plan your visit to ${communityName}.`,
              privacyText:
                '55 Living Team does not provide or maintain community HOA information. We never share your details.',
            }}
            fields={{
              message: {
                label: "What you're looking for",
                placeholder: "Ex: I'd like a 3-bed near the marina this winter",
              },
            }}
          />
        </div>
      </Container>
    </section>
  );
}
