import {
  Banknote,
  CalendarDays,
  Home,
  type LucideIcon,
  MapPin,
  Ruler,
  ScrollText,
  Tag,
} from 'lucide-react';

import { Container } from '@/components/layout/container';
import { ShareAction } from '@/components/shared/share-action';
import type { KeyFact, PropertyView } from '@/data/property';

const FACT_ICON: Record<KeyFact['icon'], LucideIcon> = {
  home: Home,
  ruler: Ruler,
  price: Tag,
  tax: ScrollText,
  hoa: Banknote,
  year: CalendarDays,
};

/** PDP title bar — status, price + per-sqft, address, Save/Share — and the 6-fact ribbon. */
export function PropertyHeader({ view }: { view: PropertyView }) {
  const { listing } = view;
  return (
    <Container as="section">
      <div className="flex flex-wrap items-end justify-between gap-7 pt-[clamp(18px,2.2vw,28px)]">
        <div className="min-w-0">
          <span className="text-accent-deep inline-flex items-center gap-[9px] font-sans text-[12.5px] font-bold tracking-[0.16em] uppercase">
            <span
              className="bg-accent size-2 rounded-full ring-4 ring-[rgba(255,183,3,0.2)]"
              aria-hidden
            />
            {view.statusLabel} · {listing.communityName}
          </span>
          {/* leading-[1.05] rather than leading-none: at 320px the price wraps
              and the per-sqft span has no line box to sit in. */}
          <div className="text-primary mt-3 font-serif text-[clamp(34px,5.2vw,62px)] leading-[1.05] font-semibold tracking-[-0.01em]">
            {view.priceLabel}
            <span className="text-muted ml-3.5 font-sans text-[16px] font-semibold">
              {view.pricePerSqftLabel}
            </span>
          </div>
          <h1 className="text-ink mt-4 font-serif text-[clamp(21px,2vw,26px)] leading-[1.2] font-semibold">
            {view.addressLine}
          </h1>
          <p className="text-muted mt-1.5 flex items-center gap-2 font-sans text-[15.5px]">
            <MapPin className="text-accent-deep size-4 shrink-0" strokeWidth={1.8} />
            {view.cityLine} ·{' '}
            <a
              href="#community"
              className="text-primary border-accent-soft hover:border-accent-deep border-b-[1.5px] font-bold transition-colors"
            >
              {listing.communityName}
            </a>
          </p>
        </div>
        <ShareAction name={listing.name} />
      </div>

      {/* Key-facts ribbon */}
      {/* Six across only at xl — at lg it leaves ~116px per cell, which clips
          prices. Cells are min-w-0 so long values wrap instead of overflowing. */}
      <div className="border-line bg-line mt-[clamp(24px,3vw,34px)] grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-3 xl:grid-cols-6">
        {view.keyFacts.map((fact) => {
          const Icon = FACT_ICON[fact.icon];
          return (
            <div
              key={fact.label}
              className="bg-surface hover:bg-surface-soft flex min-w-0 flex-col gap-2 px-4 py-5 transition-colors sm:px-[22px]"
            >
              <span className="bg-surface-muted border-line grid size-9 shrink-0 place-items-center rounded-md shadow-[inset_0_0_0_1px_var(--line)]">
                <Icon className="text-primary size-[19px]" strokeWidth={1.7} />
              </span>
              <b className="text-primary mt-1 font-sans text-[18px] leading-[1.1] font-extrabold break-words">
                {fact.value}
              </b>
              <span className="text-muted font-sans text-[11.5px] font-bold tracking-[0.06em] uppercase">
                {fact.label}
              </span>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
