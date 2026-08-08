'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';

/**
 * Shared Share control for community + listing detail headers.
 * Copies the current URL and flips to a check mark for ~1.6s.
 */
export function ShareAction({ name, className }: { name: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && url) {
      void navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={cn('flex shrink-0 items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleShare}
        className="border-line bg-surface text-primary hover:border-accent-deep inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3.5 font-sans text-[13px] font-bold transition-colors"
        aria-label={copied ? 'Link copied' : `Share ${name}`}
      >
        {copied ? (
          <Check className="text-accent-deep size-4" strokeWidth={2.2} />
        ) : (
          <Share2 className="text-accent-deep size-4" strokeWidth={1.8} />
        )}
        Share
        <span className="sr-only" aria-live="polite">
          {copied ? 'Link copied' : ''}
        </span>
      </button>
    </div>
  );
}
