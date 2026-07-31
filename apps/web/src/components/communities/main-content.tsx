import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus } from 'lucide-react';

import type { CommunityDetail } from '@mvp-realty/api-contracts';
import { ListingSlider } from '@/components/listings/listing-slider';
import type { Listing } from '@/data/types';
import { AmenityIcon } from './amenity-icon';

/** Section heading + optional "more" link, shared by every body block. */
function BlockHead({ title, more }: { title: string; more?: { label: string; href: string } }) {
  return (
    <div className="mb-[clamp(24px,3vw,34px)] flex flex-wrap items-end justify-between gap-6">
      <h2 className="text-primary font-serif text-[clamp(28px,3.2vw,40px)] font-semibold leading-[1.08] tracking-[-0.01em]">
        {title}
      </h2>
      {more && (
        <Link
          href={more.href}
          className="border-accent text-primary group inline-flex items-center gap-2.5 whitespace-nowrap border-b-[1.5px] pb-[5px] font-sans text-[15px] font-bold"
        >
          {more.label}
          <ArrowRight className="text-accent-deep size-[17px] transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

const BLOCK =
  'border-line-soft border-b pb-[clamp(44px,5vw,64px)] mb-[clamp(44px,5vw,64px)] last:border-b-0 last:mb-0 last:pb-0 scroll-mt-[var(--chrome-h,154px)]';

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
  brokerFirstName,
}: {
  community: CommunityDetail;
  homes: Listing[];
  brokerFirstName?: string;
}) {
  const concierge = brokerFirstName ?? 'our concierge';
  const hasFacts = community.facts.length > 0;
  const hasAbout = community.about.length > 0;
  const hasOverview = hasFacts || hasAbout;
  const hasAmenities = community.amenities.length > 0;
  const hasClubs = community.clubs.length > 0;
  const hasFaqs = community.faqs.length > 0;

  return (
    <div className="min-w-0">
      {/* Overview */}
      {hasOverview ? (
        <section id="overview" className={BLOCK}>
          {hasFacts ? (
            <div className="border-line mb-[clamp(38px,4vw,52px)] grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-[var(--line)] sm:grid-cols-2 md:grid-cols-3">
              {community.facts.map((fact) => (
                <div key={fact.label} className="bg-surface-soft min-w-0 px-4 py-[22px] sm:px-6">
                  <span className="text-muted block font-sans text-[12px] font-bold uppercase tracking-[0.08em]">
                    {fact.label}
                  </span>
                  <b className="text-primary mt-[7px] block break-words font-sans text-[18px] font-extrabold leading-[1.3]">
                    {fact.value}
                  </b>
                </div>
              ))}
            </div>
          ) : null}
          {hasAbout ? (
            <>
              <BlockHead title={`About ${community.name}`} />
              <div className="text-ink-soft max-w-[64ch] font-sans text-[17px] leading-[1.75]">
                {community.about.map((p, i) => (
                  <Prose key={i} text={p} />
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {/* Homes for Sale */}
      <section id="homes" className={BLOCK}>
        <BlockHead
          title={`Homes for Sale in ${community.name}`}
          more={{ label: 'See all homes for sale', href: `/listings?community=${community.slug}` }}
        />
        {homes.length > 0 ? (
          <ListingSlider listings={homes} limit={24} />
        ) : (
          <p className="text-ink-soft font-sans text-[16px]">
            No homes are listed in {community.name} right now.{' '}
            <Link
              href={`/listings?community=${community.slug}`}
              className="text-primary font-bold underline-offset-4 hover:underline"
            >
              Browse the full collection
            </Link>{' '}
            or ask {concierge} to watch for the next release.
          </p>
        )}
      </section>

      {/* Amenities */}
      {hasAmenities ? (
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
      ) : null}

      {/* Lifestyle & Clubs */}
      {hasClubs ? (
        <section id="lifestyle" className={BLOCK}>
          <BlockHead title="Lifestyle & Clubs" />
          <ul className="m-0 list-none p-0 [column-gap:clamp(28px,3vw,48px)] sm:[columns:2]">
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
      ) : null}

      {/* FAQs */}
      {hasFaqs ? (
        <section id="faqs" className={BLOCK}>
          <BlockHead title={`${community.name} FAQs`} />
          <div className="grid gap-3">
            {community.faqs.map((faq, i) => (
              <details
                key={faq.q}
                open={i === 0}
                className="border-line bg-surface open:border-accent-deep/40 open:shadow-card group overflow-hidden rounded-lg border transition-[border-color,box-shadow]"
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
      ) : null}
    </div>
  );
}
