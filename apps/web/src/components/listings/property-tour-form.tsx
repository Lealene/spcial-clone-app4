import type { Broker } from '@mvp-realty/api-contracts';

import { LeadForm } from '@/components/leads/lead-form';
import { Button } from '@/components/ui/button';

/**
 * "Tour this home" form for the PDP aside.
 *
 * "Message the Concierge" is a mailto link, not a second submit — it used to be
 * `type="submit"` inside the same form, so clicking it fired a tour request.
 * It renders only when the broker has an email.
 */
export function PropertyTourForm({
  propertyName,
  listingSlug,
  broker,
}: {
  propertyName: string;
  listingSlug?: string;
  broker?: Broker | null;
}) {
  const firstName = broker?.firstName ?? 'Your concierge';

  return (
    <div className="bg-surface border-line shadow-card rounded-xl border p-[clamp(22px,2.4vw,28px)]">
      <p className="text-primary font-serif text-[22px] font-semibold">Tour this home</p>
      <p className="text-muted mb-[18px] mt-1 font-sans text-[14px]">
        No obligation. Your concierge replies within minutes, not days.
      </p>

      <LeadForm
        variant="tour"
        surface="property-tour-form"
        tone="light"
        listingSlug={listingSlug}
        copy={{
          submitLabel: 'Request a Tour',
          successHeading: 'Your request is in.',
          successBody: `${firstName} will reach out shortly about ${propertyName}.`,
          privacyText:
            'By requesting information you agree 55 Living Team may call, text, or email you about this property. Consent is not a condition of purchase.',
        }}
        fields={{
          message: {
            label: 'How can we help?',
            placeholder: `I'd love to tour ${propertyName} this weekend.`,
          },
        }}
        footer={
          broker?.email ? (
            <Button asChild variant="outline" size="full" className="mt-[10px]">
              <a
                href={`mailto:${broker.email}?subject=${encodeURIComponent(
                  `Question about ${propertyName}`,
                )}`}
              >
                Message the Concierge
              </a>
            </Button>
          ) : null
        }
      />
    </div>
  );
}
