'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Waves } from 'lucide-react';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { Kicker } from '@/components/section-header';
import { Button } from '@/components/ui/button';

const inputClass =
  'w-full rounded-md border border-line bg-surface-soft px-4 py-[15px] font-sans text-[16px] font-medium text-ink outline-none transition-[border-color,background-color] placeholder:text-muted focus:border-accent-deep focus:bg-surface';

export function LeadCapture() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    if (!name || !email) {
      setError('Please share your name and email so your concierge can reach you.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('That email address looks incomplete.');
      return;
    }
    setError(null);
    // TODO: wire backend — for now we fake a successful submission.
    setSubmitted(true);
  }

  return (
    <section id="lead" className="bg-surface-muted py-[clamp(78px,9vw,138px)]">
      <Container className="grid items-center gap-[clamp(40px,5vw,84px)] lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <Kicker>Your Private Introduction</Kicker>
          <h2 className="text-ink mt-[18px] max-w-[16ch] font-serif text-[clamp(30px,3.6vw,48px)] leading-[1.07] font-semibold tracking-[-0.01em]">
            Let a concierge prepare your shortlist.
          </h2>
          <p className="text-ink-soft mt-5 max-w-[54ch] font-sans text-[clamp(18px,1.35vw,21px)] leading-[1.7]">
            Tell us a little about the life you are looking for. Your concierge will return with a
            curated set of residences, pricing, and current incentives, with no obligation and no
            sales floor.
          </p>
          <p className="border-line text-ink-soft mt-6 flex items-center gap-3 border-t pt-[22px] font-sans text-[15px]">
            <Waves className="text-accent-deep size-5 shrink-0" strokeWidth={1.7} />
            <span>
              Beachfront residences also available,{' '}
              <a
                href="#lead"
                className="border-cta text-primary hover:border-accent-deep border-b-[1.5px] pb-px font-bold transition-colors"
              >
                by request
              </a>
              .
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
                Your request is in.
              </h3>
              <p className="text-ink-soft mt-3 font-sans text-[16px] leading-[1.6]">
                Thank you. Your concierge will be in touch shortly with a shortlist prepared just
                for you — no sales floor, no obligation.
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
                Your name
              </label>
              <input
                id="lead-name"
                name="name"
                type="text"
                placeholder="Jane & Robert Ellison"
                autoComplete="name"
                className={inputClass}
              />

              <label
                htmlFor="lead-email"
                className="text-ink mt-5 mb-[9px] block font-sans text-[14px] font-bold"
              >
                Email address
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass}
              />

              <label
                htmlFor="lead-phone"
                className="text-ink mt-5 mb-[9px] block font-sans text-[14px] font-bold"
              >
                Phone (optional)
              </label>
              <input
                id="lead-phone"
                name="phone"
                type="tel"
                placeholder="(239) 555-0148"
                autoComplete="tel"
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
                Request My Shortlist <ArrowRight />
              </Button>
              <p className="text-muted mt-4 font-sans text-[13.5px] leading-[1.5]">
                A private introduction to MVP Realty. We never share your details, and you will only
                hear from your own concierge.
              </p>
            </form>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
