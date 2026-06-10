import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

import { Container } from '@/components/container';
import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { MoreLink } from '@/components/more-link';
import { featuredResidences } from '@/data/residences';

export function FeaturedResidences() {
  return (
    <section id="listings" className="bg-surface-soft py-[clamp(78px,9vw,138px)]">
      <Container>
        <Reveal>
          <SectionHeader
            align="center"
            kicker="Curated Residences"
            heading="Homes chosen for you, not a search bar."
            lede="A sample of what is selling now, with starting prices, so you can see where you fit before we ever talk."
          />
        </Reveal>

        <div className="grid gap-[clamp(20px,2.2vw,30px)] sm:grid-cols-2 lg:grid-cols-3">
          {featuredResidences.map((r, i) => {
            const stats = [
              { value: r.beds, label: 'Beds' },
              { value: r.baths, label: 'Baths' },
              { value: r.sqft.toLocaleString(), label: 'Sq Ft' },
            ];
            return (
              <Reveal key={r.slug} delay={i * 0.1}>
                <Link
                  href={`/listings/${r.slug}`}
                  className="group border-line bg-surface shadow-card hover:shadow-lift flex h-full flex-col overflow-hidden rounded-xl border transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[5px]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <span className="border-accent-deep/40 bg-surface-soft/95 text-primary shadow-card absolute top-3.5 left-3.5 z-10 rounded-md border px-[13px] py-[7px] font-sans text-[11.5px] font-extrabold tracking-[0.1em] uppercase">
                      {r.badge}
                    </span>
                    <Image
                      src={r.image.src}
                      alt={r.image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-[26px] pt-6">
                    <h3 className="text-primary font-serif text-[25px] leading-[1.1] font-semibold">
                      {r.name}
                    </h3>
                    <div className="text-muted mt-1.5 flex items-center gap-[7px] font-sans text-[15px] font-medium">
                      <MapPin className="text-accent-deep size-[15px] shrink-0" strokeWidth={1.8} />
                      {r.locality}
                    </div>
                    <div className="text-ink mt-[18px] font-sans text-[21px] font-extrabold">
                      {r.priceLabel}
                    </div>
                    <div className="border-line-soft mt-4 flex border-t pt-4">
                      {stats.map((s, si) => (
                        <div
                          key={s.label}
                          className={
                            si === 0
                              ? 'flex-1 text-left'
                              : 'border-line-soft flex-1 border-l pl-3.5 text-left'
                          }
                        >
                          <b className="text-primary block font-sans text-[18px] leading-none font-extrabold">
                            {s.value}
                          </b>
                          <span className="text-muted mt-1.5 block font-sans text-[12px] font-semibold tracking-[0.06em] uppercase">
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span className="text-primary mt-[22px] inline-flex items-center gap-[9px] font-sans text-[15px] font-bold">
                      View residence
                      <ArrowRight className="text-accent-deep size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-[clamp(38px,4vw,54px)] flex justify-center">
          <MoreLink href="/listings">View the full collection</MoreLink>
        </Reveal>
      </Container>
    </section>
  );
}
