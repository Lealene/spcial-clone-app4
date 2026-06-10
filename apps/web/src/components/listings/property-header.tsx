import Link from 'next/link';
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

import { Container } from '@/components/container';
import type { KeyFact, PropertyView } from '@/data/property';
import { PropertyActions } from './property-actions';

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
      <div className="flex flex-wrap items-end justify-between gap-7 pt-[clamp(26px,3vw,38px)]">
        <div className="min-w-0">
          <span className="text-accent-deep inline-flex items-center gap-[9px] font-sans text-[12.5px] font-bold tracking-[0.16em] uppercase">
            <span
              className="bg-accent size-2 rounded-full ring-4 ring-[rgba(255,183,3,0.2)]"
              aria-hidden
            />
            {view.statusLabel} · {listing.communityName}
          </span>
          <div className="text-primary mt-3 font-serif text-[clamp(40px,5.2vw,62px)] leading-none font-semibold tracking-[-0.01em]">
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
        <PropertyActions title={`${listing.name} — MVP Realty`} />
      </div>

      {/* Key-facts ribbon */}
      <div className="border-line bg-line mt-[clamp(24px,3vw,34px)] grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-3 lg:grid-cols-6">
        {view.keyFacts.map((fact) => {
          const Icon = FACT_ICON[fact.icon];
          return (
            <div
              key={fact.label}
              className="bg-surface hover:bg-surface-soft flex flex-col gap-2 px-[22px] py-5 transition-colors"
            >
              <span className="bg-surface-muted border-line grid size-9 place-items-center rounded-md shadow-[inset_0_0_0_1px_var(--line)]">
                <Icon className="text-primary size-[19px]" strokeWidth={1.7} />
              </span>
              <b className="text-primary mt-1 font-sans text-[18px] leading-none font-extrabold">
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

/** Breadcrumb strip: Home / Residences / {community} / {name}. */
export function PropertyBreadcrumb({ view }: { view: PropertyView }) {
  const { listing } = view;
  return (
    <nav aria-label="Breadcrumb" className="bg-surface-soft border-line-soft border-b">
      <Container className="text-muted flex flex-wrap items-center gap-[9px] py-[14px] font-sans text-[13.5px] font-semibold">
        <Link href="/" className="text-ink-soft hover:text-accent-deep transition-colors">
          Home
        </Link>
        <span className="text-line">/</span>
        <Link href="/listings" className="text-ink-soft hover:text-accent-deep transition-colors">
          Residences
        </Link>
        <span className="text-line">/</span>
        <Link
          href={`/communities/${listing.community}`}
          className="text-ink-soft hover:text-accent-deep transition-colors"
        >
          {listing.communityName}
        </Link>
        <span className="text-line">/</span>
        <span className="text-primary">{listing.name}</span>
      </Container>
    </nav>
  );
}
