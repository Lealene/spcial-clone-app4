'use client';

import { useState } from 'react';
import { Bookmark, Share2 } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';

/**
 * Save / Share buttons for the PDP title bar. Local-only toggles — Save flips a
 * "Saved" state, Share uses the Web Share API when available and otherwise
 * flashes a confirmation. No backend.
 * TODO: wire backend (saved listings) when Payload is ready.
 */
export function PropertyActions({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  function onShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({ title, url: typeof location !== 'undefined' ? location.href : '' })
        .catch(() => {});
      return;
    }
    setShared(true);
    setTimeout(() => setShared(false), 900);
  }

  const base =
    'inline-flex items-center gap-[9px] rounded-md border px-[18px] py-3 font-sans text-[14px] font-bold transition-[border-color,color,background-color] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="flex flex-wrap gap-[11px]">
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-pressed={saved}
        className={cn(
          base,
          saved
            ? 'border-accent bg-surface-muted text-accent-deep'
            : 'border-line bg-surface text-ink-soft hover:border-accent-deep hover:text-primary',
        )}
      >
        <Bookmark
          className={cn('size-[17px]', saved && 'fill-accent text-accent-deep')}
          strokeWidth={1.9}
        />
        {saved ? 'Saved' : 'Save'}
      </button>
      <button
        type="button"
        onClick={onShare}
        className={cn(
          base,
          shared
            ? 'border-accent bg-surface-muted text-accent-deep'
            : 'border-line bg-surface text-ink-soft hover:border-accent-deep hover:text-primary',
        )}
      >
        <Share2 className="size-[17px]" strokeWidth={1.9} />
        {shared ? 'Copied' : 'Share'}
      </button>
    </div>
  );
}
