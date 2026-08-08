import { Phone } from 'lucide-react';

import type { Broker } from '@mvp-realty/api-contracts';

import { BrokerAvatar } from '@/components/shared/broker-avatar';
import { LeadForm } from '@/components/leads/lead-form';

/**
 * Sticky agent sidebar — navy concierge card (when a broker resolves), the
 * "Ask about {community}" lead form, and a "prefer to call" card.
 */
export function AgentAside({
  communityName,
  communitySlug,
  broker,
  phone,
  phoneHref,
}: {
  communityName: string;
  communitySlug?: string;
  broker: Broker | null;
  phone?: string;
  phoneHref?: string;
}) {
  const resolvedPhone = broker?.phone ?? phone;
  const resolvedPhoneHref = broker?.phoneHref ?? phoneHref;
  const firstName = broker?.firstName ?? 'your concierge';

  return (
    <aside className="grid gap-[18px] lg:sticky lg:top-[var(--chrome-h,154px)] lg:max-h-[calc(100dvh-var(--chrome-h,154px)-12px)] lg:overflow-y-auto lg:overscroll-contain">
      <div className="border-line bg-surface shadow-card overflow-hidden rounded-xl border">
        {broker ? (
          <div className="bg-primary text-on-primary flex items-center gap-4 px-[26px] py-6">
            <BrokerAvatar
              name={broker.name}
              headshot={broker.headshot}
              className="size-[62px] shadow-[inset_0_0_0_2px_rgba(255,183,3,0.6)]"
            />
            <div>
              <span className="text-accent font-sans text-[12px] font-bold tracking-[0.1em] uppercase">
                {broker.conciergeLabel.replaceAll('{community}', communityName)}
              </span>
              <b className="mt-1 block font-serif text-[22px] font-semibold">{broker.name}</b>
              <span className="mt-[3px] block font-sans text-[13px] text-white/70">
                {[broker.title, broker.brokerage].filter(Boolean).join(', ')}
              </span>
            </div>
          </div>
        ) : null}

        <div className="px-[26px] pt-6 pb-[26px]">
          <LeadForm
            variant="tour"
            surface="community-agent-aside"
            tone="light"
            areaSlug={communitySlug}
            heading={
              <p className="text-primary mb-4 font-serif text-[20px] leading-[1.2] font-semibold">
                Ask about {communityName}
              </p>
            }
            copy={{
              submitLabel: 'Request Community Info',
              successHeading: 'Your request is in.',
              successBody: `${firstName} will reach out within one business day about ${communityName}.`,
              privacyText: (
                <>
                  A private introduction — no sales floor, no obligation. You&rsquo;ll only ever
                  hear from {firstName}.
                </>
              ),
            }}
            fields={{
              message: {
                label: 'How can we help?',
                placeholder: "I'm interested in a 3-bed near the marina…",
              },
            }}
          />
        </div>
      </div>

      {resolvedPhone && resolvedPhoneHref ? (
        <a
          href={resolvedPhoneHref}
          className="border-line bg-surface-soft text-primary hover:border-accent-deep flex items-center justify-center gap-2.5 rounded-xl border px-6 py-5 font-sans text-[15px] font-bold transition-colors"
        >
          <Phone className="text-accent-deep size-[17px]" strokeWidth={1.8} />
          Prefer to call? {resolvedPhone}
        </a>
      ) : null}
    </aside>
  );
}
