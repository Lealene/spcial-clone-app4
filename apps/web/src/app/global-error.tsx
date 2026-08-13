'use client';

import { useEffect } from 'react';

import './globals.css';
import { BrandMark, BrandWordmark } from '@/components/layout/brand-mark';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('55 Living Team global error', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-surface text-ink min-h-screen">
        <main className="flex min-h-screen items-center justify-center px-6 py-24 text-center">
          <div className="max-w-xl">
            <div className="flex items-center justify-center gap-3" aria-label="55 Living Team">
              <BrandMark />
              <BrandWordmark />
            </div>
            <p className="text-accent-deep mt-10 text-sm font-bold uppercase tracking-[0.18em]">
              Temporarily unavailable
            </p>
            <h1 className="text-primary mt-4 font-serif text-4xl font-bold sm:text-5xl">
              We could not load the site.
            </h1>
            <p className="text-muted mt-5 text-base leading-7">
              Our content service may be temporarily unavailable. Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 rounded-md px-6 py-3 text-sm font-bold transition-colors"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
