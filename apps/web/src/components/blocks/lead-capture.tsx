import type { LeadCaptureBlock } from '@mvp-realty/api-contracts';
import { Waves } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { LeadForm } from '@/components/leads/lead-form';
import { Reveal } from '@/components/shared/reveal';
import { Kicker } from '@/components/layout/section-header';
import { getLinkRenderProps } from '@/lib/cms/links';

export function LeadCapture({ block }: { block: LeadCaptureBlock }) {
  return (
    <section id={block.anchorId} className="bg-surface-muted py-[clamp(78px,9vw,138px)]">
      <Container className="grid items-center gap-[clamp(40px,5vw,84px)] lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <Kicker>{block.kicker}</Kicker>
          <h2 className="text-ink mt-[18px] max-w-[16ch] font-serif text-[clamp(30px,3.6vw,48px)] leading-[1.07] font-semibold tracking-[-0.01em]">
            {block.heading}
          </h2>
          <p className="text-ink-soft mt-5 max-w-[54ch] font-sans text-[clamp(18px,1.35vw,21px)] leading-[1.7]">
            {block.body}
          </p>
          <p className="border-line text-ink-soft mt-6 flex items-center gap-3 border-t pt-[22px] font-sans text-[15px]">
            <Waves className="text-accent-deep size-5 shrink-0" strokeWidth={1.7} />
            <span>
              {block.helperNote.beforeLinkText}
              <a
                {...getLinkRenderProps(block.helperNote.link)}
                className="border-cta text-primary hover:border-accent-deep border-b-[1.5px] pb-px font-bold transition-colors"
              >
                {block.helperNote.link.label}
              </a>
              {block.helperNote.afterLinkText}
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <LeadForm
            variant="shortlist"
            surface="page-lead-capture"
            tone="light"
            submitButtonVariant="primary"
            className="border-line bg-surface shadow-card rounded-xl border p-[clamp(30px,3.4vw,42px)]"
            copy={{
              submitLabel: block.submitLabel,
              successHeading: block.successHeading,
              successBody: block.successBody,
              privacyText: block.privacyText,
              errorRequired: block.errorRequiredMessage,
              errorInvalidEmail: block.errorInvalidEmailMessage,
            }}
            fields={{
              firstName: block.fields.firstName,
              lastName: block.fields.lastName,
              email: block.fields.email,
              phone: block.fields.phone,
            }}
          />
        </Reveal>
      </Container>
    </section>
  );
}
