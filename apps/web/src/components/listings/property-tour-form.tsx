'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * "Tour this home" form for the PDP aside. Stub — fakes success and shows a
 * confirmation state, mirroring ConciergeCta. No backend.
 * TODO: wire backend (lead capture) when Payload is ready.
 */
export function PropertyTourForm({ propertyName }: { propertyName: string }) {
  const [sent, setSent] = useState(false);

  const fieldClass =
    'bg-surface-soft text-ink border-line focus:border-accent-deep focus:bg-surface w-full rounded-md border px-[15px] py-[13px] font-sans text-[15px] font-medium transition-[border-color,background-color] outline-none placeholder:text-muted';

  return (
    <div className="bg-surface border-line shadow-card rounded-xl border p-[clamp(22px,2.4vw,28px)]">
      <p className="text-primary font-serif text-[22px] font-semibold">Tour this home</p>
      <p className="text-muted mt-1 mb-[18px] font-sans text-[14px]">
        No obligation. Your concierge replies within minutes, not days.
      </p>

      {sent ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="bg-cta text-on-cta grid size-12 place-items-center rounded-full">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
          <p className="text-primary mt-4 font-serif text-[20px] font-semibold">
            Your request is in.
          </p>
          <p className="text-muted mt-2 font-sans text-[14px]">
            Eleanor will reach out shortly about {propertyName}.
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
            {
              id: 'pt-name',
              label: 'Name',
              type: 'text',
              placeholder: 'Jane & Robert Ellison',
              autoComplete: 'name',
            },
            {
              id: 'pt-email',
              label: 'Email',
              type: 'email',
              placeholder: 'you@example.com',
              autoComplete: 'email',
            },
            {
              id: 'pt-phone',
              label: 'Phone',
              type: 'tel',
              placeholder: '(239) 555-0148',
              autoComplete: 'tel',
            },
          ].map((field) => (
            <label key={field.id} htmlFor={field.id} className="mt-[15px] block first:mt-0">
              <span className="text-ink mb-[7px] block font-sans text-[13px] font-bold">
                {field.label}
              </span>
              <input
                id={field.id}
                type={field.type}
                required
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                className={fieldClass}
              />
            </label>
          ))}
          <label htmlFor="pt-msg" className="mt-[15px] block">
            <span className="text-ink mb-[7px] block font-sans text-[13px] font-bold">
              How can we help?
            </span>
            <textarea
              id="pt-msg"
              placeholder={`I'd love to tour ${propertyName} this weekend.`}
              className={`${fieldClass} min-h-[78px] resize-y`}
            />
          </label>

          <Button type="submit" variant="cta" size="full" className="mt-[18px]">
            Request a Tour
            <ArrowRight />
          </Button>
          <Button type="submit" variant="outline" size="full" className="mt-[10px]">
            Message the Concierge
          </Button>
          <p className="text-muted mt-[14px] font-sans text-[12px] leading-[1.5]">
            By requesting information you agree MVP Realty may call, text, or email you about this
            property. Consent is not a condition of purchase.
          </p>
        </form>
      )}
    </div>
  );
}
