import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { MoreLink } from '@/components/more-link';
import { featuredCommunities } from '@/data/communities';

export function FeaturedCommunities() {
  return (
    <section id="communities" className="bg-surface-muted py-[clamp(78px,9vw,138px)]">
      <Container>
        <Reveal>
          <SectionHeader
            align="center"
            kicker="Featured Communities"
            heading="Three favorites to start your search."
            lede="A short, hand-picked set of the Southwest Florida communities our clients keep coming back to."
          />
        </Reveal>

        <Reveal
          delay={0.1}
          className="grid gap-[clamp(20px,2.2vw,30px)] sm:grid-cols-2 lg:grid-cols-3"
        >
          {featuredCommunities.map((c) => (
            <Link
              key={c.slug}
              href={`/communities/${c.slug}`}
              className="group border-line bg-surface shadow-card hover:shadow-lift flex flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[5px]"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <span className="border-accent/40 bg-primary-deep/75 shadow-card absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-[7px] rounded-md border px-3 py-[7px] font-sans text-[13px] font-extrabold text-white backdrop-blur-[7px]">
                  <Star className="fill-accent text-accent size-3.5" />
                  {c.rating.toFixed(1)}{' '}
                  <em className="font-semibold text-white/65 not-italic">({c.reviews} reviews)</em>
                </span>
                <Image
                  src={c.image.src}
                  alt={c.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex flex-1 flex-col p-[24px] pt-6 pb-[26px]">
                <h3 className="text-primary font-serif text-[25px] leading-[1.1] font-semibold">
                  {c.name}
                </h3>
                <div className="text-muted mt-1.5 flex items-center gap-[7px] font-sans text-[15px] font-medium">
                  <MapPin className="text-accent-deep size-[15px] shrink-0" strokeWidth={1.8} />
                  {c.locality}
                </div>
                <div className="text-ink mt-4 font-sans text-[19px] font-extrabold">
                  {c.priceRange}
                </div>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="border-line bg-surface-muted text-ink-soft rounded-full border px-[11px] py-[5px] font-sans text-[12px] font-bold tracking-[0.03em]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-[18px]">
                  <span className="text-muted font-sans text-[14px] font-semibold">
                    <b className="text-primary font-extrabold">{c.residences}</b> residences
                  </span>
                  <span className="text-accent-deep inline-flex items-center gap-[7px] font-sans text-[13px] font-extrabold whitespace-nowrap">
                    <span className="bg-accent size-[7px] rounded-full shadow-[0_0_0_3px_rgba(255,183,3,0.22)]" />
                    {c.nowSelling} now selling
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </Reveal>

        <Reveal className="mt-[clamp(38px,4vw,54px)] flex justify-center">
          {/* TODO: point at a `/communities` index once it exists. */}
          <MoreLink href="/listings">Explore all communities</MoreLink>
        </Reveal>
      </Container>
    </section>
  );
}
