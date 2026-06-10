'use client';

import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';

/**
 * Save / Share actions for the detail header. Both are stubs — Save toggles a
 * local "saved" state; Share fakes a "Link copied" flash. TODO: wire backend
 * (favorites) + real share intent when Payload is ready.
 */
export function HeaderActions({ name }: { name: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    // TODO: wire backend / native share — fake confirmation for now.
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
        className="border-line bg-surface text-primary hover:border-accent-deep hover:shadow-card inline-flex items-center gap-[9px] rounded-md border px-[18px] py-3 font-sans text-[14px] font-bold transition-[border-color,transform,box-shadow] hover:-translate-y-0.5"
      >
        <Heart
          className={cn('text-accent-deep size-[17px]', saved && 'fill-accent text-accent')}
          strokeWidth={1.8}
        />
        {saved ? 'Saved' : 'Save'}
        <span className="sr-only"> {name}</span>
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="border-line bg-surface text-primary hover:border-accent-deep hover:shadow-card inline-flex items-center gap-[9px] rounded-md border px-[18px] py-3 font-sans text-[14px] font-bold transition-[border-color,transform,box-shadow] hover:-translate-y-0.5"
      >
        <Share2 className="text-accent-deep size-[17px]" strokeWidth={1.8} />
        {copied ? 'Link copied' : 'Share'}
      </button>
    </div>
  );
}
