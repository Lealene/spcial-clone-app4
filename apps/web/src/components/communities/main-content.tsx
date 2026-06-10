import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus } from 'lucide-react';

import { ListingCard } from '@/components/listings/listing-card';
import type { CommunityDetail } from '@/data/community-detail';
import type { Listing } from '@/data/types';
import { AmenityIcon } from './amenity-icon';
import { Floorplan } from './floorplan';
import { Stars } from './stars';

/** Section heading + optional "more" link, shared by every body block. */
function BlockHead({ title, more }: { title: string; more?: { label: string; href: string } }) {
  return (
    <div className="mb-[clamp(24px,3vw,34px)] flex flex-wrap items-end justify-between gap-6">
      <h2 className="text-primary font-serif text-[clamp(28px,3.2vw,40px)] leading-[1.08] font-semibold tracking-[-0.01em]">
        {title}
      </h2>
      {more && (
        <Link
          href={more.href}
          className="border-accent text-primary group inline-flex items-center gap-2.5 border-b-[1.5px] pb-[5px] font-sans text-[15px] font-bold whitespace-nowrap"
        >
          {more.label}
          <ArrowRight className="text-accent-deep size-[17px] transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

const BLOCK =
  'border-line-soft border-b pb-[clamp(44px,5vw,64px)] mb-[clamp(44px,5vw,64px)] last:border-b-0 last:mb-0 last:pb-0 scroll-mt-[150px]';

/** Renders `**bold**` spans inside a prose paragraph. */
function Prose({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="mb-[18px] last:mb-0">
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-ink font-bold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </p>
  );
}

export function MainContent({
  community,
  homes,
}: {
  community: CommunityDetail;
  homes: Listing[];
}) {
  return (
    <div className="min-w-0">
      {/* Overview */}
      <section id="overview" className={BLOCK}>
        <div className="border-line mb-[clamp(38px,4vw,52px)] grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-[var(--line)] md:grid-cols-3">
          {community.facts.map((fact) => (
            <div key={fact.label} className="bg-surface-soft px-6 py-[22px]">
              <span className="text-muted block font-sans text-[12px] font-bold tracking-[0.08em] uppercase">
                {fact.label}
              </span>
              <b className="text-primary mt-[7px] block font-sans text-[18px] leading-[1.3] font-extrabold">
                {fact.value}
              </b>
            </div>
          ))}
        </div>
        <BlockHead title={`About ${community.name}`} />
        <div className="text-ink-soft max-w-[64ch] font-sans text-[17px] leading-[1.75]">
          {community.about.map((p, i) => (
            <Prose key={i} text={p} />
          ))}
        </div>
      </section>

      {/* Homes for Sale */}
      <section id="homes" className={BLOCK}>
        <BlockHead
          title={`Homes for Sale in ${community.name}`}
          more={{ label: 'See all homes for sale', href: `/listings?community=${community.slug}` }}
        />
        {homes.length > 0 ? (
          <div className="-mx-1 flex snap-x snap-mandatory [scrollbar-width:none] gap-[clamp(16px,1.6vw,22px)] overflow-x-auto px-1 pb-2.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {homes.map((listing) => (
              <ListingCard
                key={listing.slug}
                listing={listing}
                sizes="(max-width: 680px) 80vw, 300px"
                className="w-[min(300px,80vw)] shrink-0 snap-start"
              />
            ))}
          </div>
        ) : (
          <p className="text-ink-soft font-sans text-[16px]">
            No homes are listed in {community.name} right now.{' '}
            <Link
              href={`/listings?community=${community.slug}`}
              className="text-primary font-bold underline-offset-4 hover:underline"
            >
              Browse the full collection
            </Link>{' '}
            or ask Eleanor to watch for the next release.
          </p>
        )}
      </section>

      {/* Models */}
      <section id="models" className={BLOCK}>
        <BlockHead
          title={`Models in ${community.name}`}
          more={{ label: 'See all models', href: '#tour' }}
        />
        <div className="grid gap-4">
          {community.models.map((model) => (
            <article
              key={model.name}
              className="border-line bg-surface shadow-card hover:shadow-lift group grid grid-cols-1 items-center gap-[clamp(20px,2.4vw,38px)] rounded-xl border p-[clamp(22px,2.4vw,30px)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[3px] sm:grid-cols-[1fr_230px]"
            >
              <div>
                <h3 className="text-primary font-serif text-[24px] font-semibold">{model.name}</h3>
                <p className="text-accent-deep mt-1.5 font-sans text-[13px] font-bold tracking-[0.06em] uppercase">
                  {model.type}
                </p>
                <div className="mt-[18px] flex flex-wrap">
                  {[
                    { value: model.beds, label: 'Beds' },
                    { value: model.baths, label: 'Baths' },
                    { value: model.sqft, label: 'Sq Ft' },
                    { value: model.garage, label: 'Car Garage' },
                  ].map((s, i, arr) => (
                    <div
                      key={s.label}
                      className={
                        i < arr.length - 1 ? 'border-line-soft mr-5 border-r pr-5' : 'pr-0'
                      }
                    >
                      <b className="text-primary block font-sans text-[19px] leading-none font-extrabold">
                        {s.value}
                      </b>
                      <span className="text-muted mt-1.5 block font-sans text-[12px] font-semibold tracking-[0.05em] uppercase">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-primary mt-5 inline-flex items-center gap-2 font-sans text-[14.5px] font-bold">
                  View floorplan
                  <ArrowRight className="text-accent-deep size-[15px] transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
              <Floorplan plan={model.plan} className="[order:-1] max-w-[240px] sm:order-none" />
            </article>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section id="amenities" className={BLOCK}>
        <BlockHead title="Amenities" more={{ label: 'See all amenities', href: '#tour' }} />
        <div className="border-line grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-[var(--line)] sm:grid-cols-2">
          {community.amenities.map((amenity) => (
            <div
              key={amenity.title}
              className="bg-surface hover:bg-surface-soft flex items-center gap-[15px] px-[22px] py-5 transition-colors"
            >
              <span className="bg-surface-muted border-line grid size-[42px] shrink-0 place-items-center rounded-md border">
                <AmenityIcon icon={amenity.icon} className="text-primary size-[22px]" />
              </span>
              <b className="text-ink font-sans text-[16px] font-bold">{amenity.title}</b>
            </div>
          ))}
        </div>
      </section>

      {/* Lifestyle & Clubs */}
      <section id="lifestyle" className={BLOCK}>
        <BlockHead title="Lifestyle & Clubs" />
        <ul className="m-0 list-none [column-gap:clamp(28px,3vw,48px)] p-0 sm:[columns:2]">
          {community.clubs.map((club) => (
            <li
              key={club}
              className="border-line-soft text-ink flex break-inside-avoid items-center gap-3 border-b py-[13px] font-sans text-[16px] font-medium"
            >
              <span
                className="bg-accent size-[7px] shrink-0 rounded-full shadow-[0_0_0_3px_rgba(255,183,3,0.22)]"
                aria-hidden
              />
              {club}
            </li>
          ))}
        </ul>
      </section>

      {/* Reviews */}
      <section id="reviews" className={BLOCK}>
        <BlockHead title="Resident Reviews" more={{ label: 'See all reviews', href: '#tour' }} />
        <div className="mb-[clamp(28px,3vw,40px)] grid grid-cols-1 items-center gap-[clamp(28px,4vw,56px)] sm:grid-cols-[auto_1fr]">
          <div className="text-center">
            <div className="text-primary font-serif text-[64px] leading-none font-semibold">
              {community.rating.toFixed(1)}
            </div>
            <Stars className="mt-2.5 [&_svg]:size-[18px]" />
            <div className="text-muted mt-[9px] font-sans text-[13.5px] font-semibold">
              Based on {community.reviews} reviews
            </div>
          </div>
          <div className="grid gap-[9px]">
            {community.reviewBars.map((bar) => (
              <div
                key={bar.label}
                className="text-muted flex items-center gap-[13px] font-sans text-[13px] font-semibold"
              >
                <span className="w-16 shrink-0">{bar.label}</span>
                <span className="bg-line h-[7px] flex-1 overflow-hidden rounded-full">
                  <span
                    className="bg-accent block h-full rounded-full"
                    style={{ width: `${bar.pct}%` }}
                  />
                </span>
                <span>{bar.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-[clamp(16px,2vw,22px)] sm:grid-cols-2">
          {community.reviewCards.map((review) => (
            <article
              key={review.who}
              className="border-line bg-surface-soft rounded-xl border px-[26px] py-6"
            >
              <Stars className="[&_svg]:size-[15px]" />
              <p className="text-ink my-[14px] mb-[18px] font-serif text-[19px] leading-[1.5] font-medium italic">
                {review.quote}
              </p>
              <div className="text-primary font-sans text-[14.5px] font-bold">
                {review.who}
                <span className="text-muted mt-[3px] block text-[13px] font-medium">
                  {review.meta}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className={BLOCK}>
        <BlockHead title={`${community.name} FAQs`} />
        <div className="grid gap-3">
          {community.faqs.map((faq, i) => (
            <details
              key={faq.q}
              open={i === 0}
              className="border-line group bg-surface open:border-accent-deep/40 open:shadow-card overflow-hidden rounded-lg border transition-[border-color,box-shadow]"
            >
              <summary className="text-primary flex cursor-pointer items-center justify-between gap-[18px] px-6 py-[21px] font-sans text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="relative size-6 shrink-0">
                  <Plus
                    className="text-accent-deep absolute inset-0 size-6 transition-opacity group-open:opacity-0"
                    strokeWidth={2.2}
                  />
                  <Minus
                    className="text-accent-deep absolute inset-0 size-6 opacity-0 transition-opacity group-open:opacity-100"
                    strokeWidth={2.2}
                  />
                </span>
              </summary>
              <div className="text-ink-soft max-w-[68ch] px-6 pb-[22px] font-sans text-[16px] leading-[1.7]">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
