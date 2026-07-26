'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('MVP Realty route error', error);
  }, [error]);

  return (
    <section className="bg-surface flex min-h-[65vh] items-center justify-center px-6 py-24 text-center">
      <div className="max-w-xl">
        <p className="text-accent-deep text-sm font-bold uppercase tracking-[0.18em]">
          Temporarily unavailable
        </p>
        <h1 className="text-primary mt-4 font-serif text-4xl font-bold sm:text-5xl">
          We could not load this page.
        </h1>
        <p className="text-muted mt-5 text-base leading-7">
          The content service may be temporarily unavailable. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 rounded-md px-6 py-3 text-sm font-bold transition-colors"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
