import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Container } from '@/components/layout/container';
import { getPrivacyPolicy } from '@/lib/cms/privacy-policy';
import { absoluteUrl } from '@/lib/seo/graph';

const PRIVACY_PATH = '/privacy-policy';

/**
 * Backstop only — the `privacy-policy` global purges its own tag on save, so edits
 * land immediately. A legal disclosure should never sit a day behind the CMS, but
 * the tag purge is what guarantees that; this only bounds a missed webhook.
 */
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const policy = await getPrivacyPolicy();
  if (!policy) return { title: 'Privacy Policy', robots: { index: false, follow: true } };

  return {
    title: policy.title,
    description: policy.intro,
    alternates: { canonical: absoluteUrl(PRIVACY_PATH) },
    openGraph: {
      title: policy.title,
      description: policy.intro,
      url: absoluteUrl(PRIVACY_PATH),
      type: 'article',
    },
  };
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function PrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();
  if (!policy) notFound();

  return (
    <Container className="py-[clamp(48px,6vw,88px)]">
      <article className="mx-auto max-w-[72ch]">
        <h1 className="text-primary font-serif text-[clamp(32px,4vw,48px)] font-semibold leading-[1.08]">
          {policy.title}
        </h1>
        {policy.lastUpdated && (
          <p className="text-muted mt-3 font-sans text-[14px] font-semibold tracking-[0.04em]">
            Last updated {formatDay(policy.lastUpdated)}
          </p>
        )}
        {policy.intro && (
          <p className="text-ink-soft mt-6 font-sans text-[17px] leading-[1.7]">{policy.intro}</p>
        )}
        {/*
          Server-rendered from Lexical by `getPrivacyPolicy`. The converter escapes
          text nodes and the field is writable only by authenticated staff.
        */}
        <div className="prose-legal mt-8" dangerouslySetInnerHTML={{ __html: policy.bodyHtml }} />
      </article>
    </Container>
  );
}
