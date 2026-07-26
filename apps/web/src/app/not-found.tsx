import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="bg-surface flex min-h-[65vh] items-center justify-center px-6 py-24 text-center">
      <div className="max-w-xl">
        <p className="text-accent-deep text-sm font-bold uppercase tracking-[0.18em]">404</p>
        <h1 className="text-primary mt-4 font-serif text-4xl font-bold sm:text-5xl">
          This page could not be found.
        </h1>
        <p className="text-muted mt-5 text-base leading-7">
          The address may have changed, or the page may no longer be available.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex rounded-md px-6 py-3 text-sm font-bold transition-colors"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
