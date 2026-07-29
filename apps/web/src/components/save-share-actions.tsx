'use client';

import { useEffect, useState } from 'react';
import { Check, Heart, Share2 } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import {
  isCommunitySaved,
  isListingSaved,
  toggleSavedCommunity,
  toggleSavedListing,
} from '@/lib/saved-local';

export type SaveShareKind = 'community' | 'listing';

/**
 * Shared Save / Share controls for community + listing detail headers.
 * Save persists in localStorage until a real favorites API exists.
 */
export function SaveShareActions({
  kind,
  name,
  slug,
  className,
}: {
  kind: SaveShareKind;
  name: string;
  slug: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(kind === 'listing' ? isListingSaved(slug) : isCommunitySaved(slug));
  }, [kind, slug]);

  function handleSave() {
    setSaved(kind === 'listing' ? toggleSavedListing(slug) : toggleSavedCommunity(slug));
  }

  function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && url) {
      void navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const buttonClass =
    'border-line bg-surface text-primary hover:border-accent-deep inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3.5 font-sans text-[13px] font-bold transition-colors';

  return (
    <div className={cn('flex shrink-0 items-center gap-2', className)}>
      <button type="button" aria-pressed={saved} onClick={handleSave} className={buttonClass}>
        <Heart
          className={cn('text-accent-deep size-4', saved && 'fill-accent text-accent')}
          strokeWidth={1.8}
        />
        {saved ? 'Saved' : 'Save'}
        <span className="sr-only"> {name}</span>
      </button>
      <button
        type="button"
        onClick={handleShare}
        className={buttonClass}
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
