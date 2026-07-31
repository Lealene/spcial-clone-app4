'use client';

import type { LeadFormType, LeadSurface } from '@mvp-realty/api-contracts';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { submitLead } from '@/lib/leads/submit';

/**
 * The one lead form. Every surface on the site renders this — five call sites
 * previously each carried their own copy of the fields, the `sent` flag, and the
 * confirmation block, and none of them had a pending or error state.
 *
 * Two variants, matching the two field sets Wise Agent needs:
 *  - `shortlist` — first, last, email, phone
 *  - `tour`      — the same plus a free-text message
 *
 * `tone` picks the input styling: `light` for cards on surface backgrounds,
 * `dark` for the navy bands. Layout and marketing copy stay with the caller.
 */

export type LeadFormFieldCopy = {
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export type LeadFormCopy = {
  submitLabel: string;
  successHeading: string;
  successBody: ReactNode;
  privacyText?: ReactNode;
  errorRequired?: string;
  errorInvalidEmail?: string;
};

export type LeadFormFields = {
  firstName?: LeadFormFieldCopy;
  lastName?: LeadFormFieldCopy;
  email?: LeadFormFieldCopy;
  phone?: LeadFormFieldCopy;
  message?: LeadFormFieldCopy;
};

export type LeadFormProps = {
  variant: LeadFormType;
  surface: LeadSurface;
  tone?: 'light' | 'dark';
  copy: LeadFormCopy;
  /** Per-field label/placeholder/required overrides — the CMS block needs these. */
  fields?: LeadFormFields;
  /** Community slug, resolved to an Areas relationship server-side. */
  areaSlug?: string;
  /** Listing slug, resolved to a Listings relationship server-side. */
  listingSlug?: string;
  /** Rendered above the submit button, inside the form (e.g. a secondary link). */
  footer?: ReactNode;
  /** Shown above the fields — the aside variants use this as a small heading. */
  heading?: ReactNode;
  className?: string;
  submitButtonVariant?: 'cta' | 'primary';
};

const DEFAULT_ERROR_REQUIRED = 'Please share your name and email so we can reach you.';
const DEFAULT_ERROR_INVALID_EMAIL = 'That email address looks incomplete.';
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const INPUT_BY_TONE = {
  light:
    'bg-surface-soft text-ink border-line focus:border-accent-deep focus:bg-surface placeholder:text-muted w-full rounded-md border px-[15px] py-[13px] font-sans text-[15px] font-medium transition-[border-color,background-color] outline-none disabled:opacity-60',
  dark: 'focus:border-accent w-full rounded-md border border-white/[0.22] bg-white/[0.06] px-[15px] py-3.5 font-sans text-[15px] font-medium text-white transition-[border-color,background-color] outline-none placeholder:text-white/55 focus:bg-white/10 disabled:opacity-60',
} as const;

const LABEL_BY_TONE = {
  light: 'text-ink mb-[7px] block font-sans text-[13px] font-bold',
  dark: 'mb-2 block font-sans text-[13px] font-bold text-white/90',
} as const;

const PRIVACY_BY_TONE = {
  light: 'text-muted mt-[14px] font-sans text-[12px] leading-[1.5]',
  dark: 'mt-3.5 font-sans text-[12.5px] leading-[1.5] text-white/60',
} as const;

const SUCCESS_HEADING_BY_TONE = {
  light: 'text-primary mt-4 font-serif text-[20px] font-semibold',
  dark: 'mt-4 font-serif text-[22px] font-semibold text-white',
} as const;

const SUCCESS_BODY_BY_TONE = {
  light: 'text-muted mt-2 font-sans text-[14px]',
  dark: 'mt-2 font-sans text-[14.5px] text-white/75',
} as const;

const ERROR_BY_TONE = {
  light: 'text-destructive mt-4 font-sans text-[14px] font-semibold',
  dark: 'mt-4 font-sans text-[14px] font-semibold text-white',
} as const;

type Status = 'idle' | 'submitting' | 'sent' | 'error';

const fieldCopy = (
  override: LeadFormFieldCopy | undefined,
  fallback: { label: string; placeholder: string; required: boolean },
) => ({
  label: override?.label ?? fallback.label,
  placeholder: override?.placeholder ?? fallback.placeholder,
  required: override?.required ?? fallback.required,
});

export function LeadForm({
  variant,
  surface,
  tone = 'light',
  copy,
  fields,
  areaSlug,
  listingSlug,
  footer,
  heading,
  className,
  submitButtonVariant = 'cta',
}: LeadFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const formId = useId();

  const input = INPUT_BY_TONE[tone];
  const labelClass = LABEL_BY_TONE[tone];

  const firstName = fieldCopy(fields?.firstName, {
    label: 'First name',
    placeholder: 'Jane',
    required: true,
  });
  const lastName = fieldCopy(fields?.lastName, {
    label: 'Last name',
    placeholder: 'Ellison',
    required: true,
  });
  const email = fieldCopy(fields?.email, {
    label: 'Email address',
    placeholder: 'you@example.com',
    required: true,
  });
  const phone = fieldCopy(fields?.phone, {
    label: 'Phone',
    placeholder: '(239) 555-0148',
    required: false,
  });
  const message = fieldCopy(fields?.message, {
    label: 'How can we help?',
    placeholder: "I'd love to arrange a tour this weekend.",
    required: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const data = new FormData(event.currentTarget);
    const read = (name: string) => String(data.get(name) ?? '').trim();

    const values = {
      firstName: read('firstName'),
      lastName: read('lastName'),
      email: read('email'),
      phone: read('phone'),
      message: read('message'),
      company: read('company'),
    };

    if (!values.firstName || !values.lastName || !values.email) {
      setStatus('error');
      setError(copy.errorRequired ?? DEFAULT_ERROR_REQUIRED);
      return;
    }
    if (!EMAIL_PATTERN.test(values.email)) {
      setStatus('error');
      setError(copy.errorInvalidEmail ?? DEFAULT_ERROR_INVALID_EMAIL);
      return;
    }

    setStatus('submitting');
    setError(null);

    const result = await submitLead({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      message: variant === 'tour' ? values.message || undefined : undefined,
      formType: variant,
      surface,
      pageUrl: typeof window === 'undefined' ? undefined : window.location.href,
      areaSlug,
      listingSlug,
      company: values.company || undefined,
    });

    if (result.ok) {
      setStatus('sent');
      return;
    }

    setStatus('error');
    setError(result.error);
  }

  if (status === 'sent') {
    return (
      <div className={className}>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="bg-cta text-on-cta grid size-12 place-items-center rounded-full">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
          <p className={SUCCESS_HEADING_BY_TONE[tone]}>{copy.successHeading}</p>
          <p className={SUCCESS_BODY_BY_TONE[tone]}>{copy.successBody}</p>
        </div>
      </div>
    );
  }

  const submitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      {heading}

      {/* Stacks below sm — side-by-side leaves ~100px per field inside the
          dark card surfaces, which truncates both placeholder and value. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label htmlFor={`${formId}-firstName`}>
          <span className={labelClass}>{firstName.label}</span>
          <input
            id={`${formId}-firstName`}
            name="firstName"
            type="text"
            required={firstName.required}
            disabled={submitting}
            placeholder={firstName.placeholder}
            autoComplete="given-name"
            className={input}
          />
        </label>
        <label htmlFor={`${formId}-lastName`}>
          <span className={labelClass}>{lastName.label}</span>
          <input
            id={`${formId}-lastName`}
            name="lastName"
            type="text"
            required={lastName.required}
            disabled={submitting}
            placeholder={lastName.placeholder}
            autoComplete="family-name"
            className={input}
          />
        </label>
      </div>

      <label htmlFor={`${formId}-email`} className="mt-[15px] block">
        <span className={labelClass}>{email.label}</span>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required={email.required}
          disabled={submitting}
          placeholder={email.placeholder}
          autoComplete="email"
          className={input}
        />
      </label>

      <label htmlFor={`${formId}-phone`} className="mt-[15px] block">
        <span className={labelClass}>{phone.label}</span>
        <input
          id={`${formId}-phone`}
          name="phone"
          type="tel"
          required={phone.required}
          disabled={submitting}
          placeholder={phone.placeholder}
          autoComplete="tel"
          className={input}
        />
      </label>

      {variant === 'tour' ? (
        <label htmlFor={`${formId}-message`} className="mt-[15px] block">
          <span className={labelClass}>{message.label}</span>
          <textarea
            id={`${formId}-message`}
            name="message"
            disabled={submitting}
            placeholder={message.placeholder}
            className={`${input} min-h-[78px] resize-y leading-[1.5]`}
          />
        </label>
      ) : null}

      {/*
        Honeypot. Hidden from sight and from assistive tech, but a real input a
        bot will happily fill. The backend drops any submission that sets it and
        still answers 200, so bots learn nothing.
      */}
      <div aria-hidden className="sr-only">
        <label htmlFor={`${formId}-company`}>Company</label>
        <input
          id={`${formId}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error ? (
        <p role="alert" className={ERROR_BY_TONE[tone]}>
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant={submitButtonVariant}
        size="full"
        className="mt-[18px]"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? (
          <>
            Sending
            <Loader2 className="animate-spin" />
          </>
        ) : (
          <>
            {copy.submitLabel}
            <ArrowRight />
          </>
        )}
      </Button>

      {footer}

      {copy.privacyText ? <p className={PRIVACY_BY_TONE[tone]}>{copy.privacyText}</p> : null}
    </form>
  );
}
