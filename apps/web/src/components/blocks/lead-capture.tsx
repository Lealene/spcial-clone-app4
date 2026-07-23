'use client';

import type { LeadCaptureBlock } from '@mvp-realty/api-contracts';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Waves } from 'lucide-react';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { Kicker } from '@/components/section-header';
import { Button } from '@/components/ui/button';

const inputClass =
  'w-full rounded-md border border-line bg-surface-soft px-4 py-[15px] font-sans text-[16px] font-medium text-ink outline-none transition-[border-color,background-color] placeholder:text-muted focus:border-accent-deep focus:bg-surface';

export function LeadCapture({ block }: { block: LeadCaptureBlock }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    if (block.fields.name.required && !name) {
      setError(block.errorRequiredMessage);
      return;
    }
    if (block.fields.email.required && !email) {
      setError(block.errorRequiredMessage);
      return;
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError(block.errorInvalidEmailMessage);
      return;
    }
    setError(null);
    // TODO: wire backend — for now we fake a successful submission.
    setSubmitted(true);
  }

  return (
    <section id={block.anchorId} className="bg-surface-muted py-[clamp(78px,9vw,138px)]">
      <Container className="grid items-center gap-[clamp(40px,5vw,84px)] lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <Kicker>{block.kicker}</Kicker>
          <h2 className="text-ink mt-[18px] max-w-[16ch] font-serif text-[clamp(30px,3.6vw,48px)] font-semibold leading-[1.07] tracking-[-0.01em]">
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
                href={block.helperNote.link.href}
                className="border-cta text-primary hover:border-accent-deep border-b-[1.5px] pb-px font-bold transition-colors"
              >
                {block.helperNote.link.label}
              </a>
              {block.helperNote.afterLinkText}
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {submitted ? (
            <div className="border-line bg-surface shadow-card rounded-xl border p-[clamp(30px,3.4vw,42px)]">
              <span className="bg-cta text-on-cta grid size-12 place-items-center rounded-full">
                <Check className="size-6" />
              </span>
              <h3 className="text-primary mt-5 font-serif text-[26px] font-semibold">
                {block.successHeading}
              </h3>
              <p className="text-ink-soft mt-3 font-sans text-[16px] leading-[1.6]">
                {block.successBody}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="border-line bg-surface shadow-card rounded-xl border p-[clamp(30px,3.4vw,42px)]"
            >
              <label
                htmlFor="lead-name"
                className="text-ink mb-[9px] block font-sans text-[14px] font-bold"
              >
                {block.fields.name.label}
              </label>
              <input
                id="lead-name"
                name="name"
                type="text"
                placeholder={block.fields.name.placeholder}
                autoComplete="name"
                required={block.fields.name.required}
                className={inputClass}
              />

              <label
                htmlFor="lead-email"
                className="text-ink mb-[9px] mt-5 block font-sans text-[14px] font-bold"
              >
                {block.fields.email.label}
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                placeholder={block.fields.email.placeholder}
                autoComplete="email"
                required={block.fields.email.required}
                className={inputClass}
              />

              <label
                htmlFor="lead-phone"
                className="text-ink mb-[9px] mt-5 block font-sans text-[14px] font-bold"
              >
                {block.fields.phone.label}
              </label>
              <input
                id="lead-phone"
                name="phone"
                type="tel"
                placeholder={block.fields.phone.placeholder}
                autoComplete="tel"
                required={block.fields.phone.required}
                className={inputClass}
              />

              {error && (
                <p
                  role="alert"
                  className="text-destructive mt-4 font-sans text-[14px] font-semibold"
                >
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" size="full" className="mt-6">
                {block.submitLabel} <ArrowRight />
              </Button>
              <p className="text-muted mt-4 font-sans text-[13.5px] leading-[1.5]">
                {block.privacyText}
              </p>
            </form>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
