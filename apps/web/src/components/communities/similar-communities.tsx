import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';

import type { SimilarCommunity } from '@mvp-realty/api-contracts';
import { Container } from '@/components/layout/container';
import { Kicker } from '@/components/layout/section-header';

/** "Similar communities" rail — up to four nearby-community cards, mirroring the
 * home's featured-community card (`l-cfeat`). Links to each detail page. */
export function SimilarCommunities({ communities }: { communities: SimilarCommunity[] }) {
  if (communities.length === 0) return null;
  const cards = communities.slice(0, 4);

  return (
    <section className="bg-surface-muted py-[clamp(64px,7vw,104px)]">
      <Container>
        <div className="mb-[clamp(34px,4vw,52px)] flex flex-wrap items-end justify-between gap-7">
          <div>
            <Kicker>Nearby on the Gulf Coast</Kicker>
            <h2 className="text-primary mt-4 font-serif text-[clamp(30px,3.8vw,48px)] leading-[1.05] font-semibold tracking-[-0.01em]">
              Similar communities to explore.
            </h2>
          </div>
          <Link
            href="/#communities"
            className="border-accent text-primary group inline-flex items-center gap-2.5 border-b-[1.5px] pb-[5px] font-sans text-[15px] font-bold whitespace-nowrap"
          >
            Explore all communities
            <ArrowRight className="text-accent-deep size-[17px] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[clamp(16px,1.8vw,24px)] sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.slug}
              href={`/communities/${c.slug}`}
              className="border-line bg-surface shadow-card hover:shadow-lift group flex flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[5px]"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                {c.rating != null ? (
                  <span className="border-accent/40 absolute top-3.5 left-3.5 z-[2] inline-flex items-center gap-1.5 rounded-md border bg-[rgba(8,26,48,0.74)] px-[11px] py-1.5 font-sans text-[12.5px] font-extrabold text-white shadow-[var(--shadow-card)] backdrop-blur-[7px]">
                    <Star className="fill-accent text-accent size-[13px]" strokeWidth={0} />
                    {c.rating.toFixed(1)}
                    {c.reviews > 0 ? (
                      <em className="font-semibold text-white/65 not-italic">({c.reviews})</em>
                    ) : null}
                  </span>
                ) : null}
                <Image
                  src={c.image.src}
                  alt={c.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 pt-5">
                <h3 className="text-primary font-serif text-[22px] leading-[1.1] font-semibold">
                  {c.name}
                </h3>
                <div className="text-muted mt-1.5 flex items-center gap-[7px] font-sans text-[14px] font-medium">
                  <MapPin className="text-accent-deep size-[14px] shrink-0" strokeWidth={1.8} />
                  {c.locality}
                </div>
                <div className="text-ink mt-3.5 font-sans text-[17px] font-extrabold">
                  {c.priceRange}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  {c.residences != null ? (
                    <span className="text-muted font-sans text-[13px] font-semibold">
                      <b className="text-primary font-extrabold">{c.residences}</b> residences
                    </span>
                  ) : (
                    <span />
                  )}
                  <ArrowRight className="text-accent-deep size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
