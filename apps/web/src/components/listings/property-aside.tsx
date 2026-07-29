import { Phone, Star } from 'lucide-react';

import type { Broker } from '@mvp-realty/api-contracts';

import { BrokerAvatar } from '../broker-avatar';
import { PropertyTourForm } from './property-tour-form';

/**
 * Sticky PDP aside: navy agent card + the "Tour this home" lead form + a
 * "prefer to call" link. Server component; the form inside is the only
 * client leaf. The agent card and call link only render when a broker resolves.
 */
export function PropertyAside({
  propertyName,
  listingSlug,
  communityName,
  broker,
  soldCount,
}: {
  propertyName: string;
  listingSlug?: string;
  communityName: string;
  broker: Broker | null;
  soldCount?: number;
}) {
  const title = broker ? [broker.title, broker.brokerage].filter(Boolean).join(' · ') : '';
  const conciergeLabel = broker
    ? broker.conciergeLabel.replaceAll('{community}', communityName)
    : '';

  const stats: Array<{ value: string; label: string }> = [];
  if (soldCount != null) {
    stats.push({ value: String(soldCount), label: 'Sold in this community' });
  }
  if (broker?.avgResponseMinutes != null) {
    stats.push({ value: `${broker.avgResponseMinutes} min`, label: 'Avg. response time' });
  }

  return (
    <aside
      id="tour"
      className="grid gap-[18px] self-start sm:grid-cols-2 lg:sticky lg:top-24 lg:grid-cols-1"
    >
      {broker ? (
        <div className="bg-primary shadow-lift overflow-hidden rounded-xl border border-[rgba(255,183,3,0.18)] text-white">
          <div className="flex items-center gap-4 px-6 pt-6">
            <BrokerAvatar
              name={broker.name}
              headshot={broker.headshot}
              className="size-[66px] shadow-[inset_0_0_0_2px_var(--accent)]"
            />
            <div>
              <b className="block font-serif text-[21px] leading-[1.1] font-semibold text-white">
                {broker.name}
              </b>
              <div className="text-accent-soft mt-1 font-sans text-[13px] font-semibold">
                {conciergeLabel}
              </div>
              {title ? (
                <div className="mt-[3px] font-sans text-[12px] text-white/55">{title}</div>
              ) : null}
            </div>
          </div>

          {broker.rating != null ? (
            <div className="mt-[18px] flex items-center gap-2 border-t border-white/10 px-6 py-[14px] font-sans text-[13.5px] text-white/80">
              <span className="inline-flex gap-[2px]" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="text-accent size-[15px] fill-current" />
                ))}
              </span>
              <b className="text-white">{broker.rating.toFixed(1)}</b>
              {broker.reviewCount != null ? <> · {broker.reviewCount} resident reviews</> : null}
            </div>
          ) : null}

          {stats.length > 0 ? (
            <div
              className={`grid gap-px border-t border-white/10 bg-white/10 ${
                stats.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="bg-primary px-6 py-[15px]">
                  <b className="text-accent block font-serif text-[22px] leading-none font-semibold">
                    {stat.value}
                  </b>
                  <span className="mt-1.5 block font-sans text-[12px] text-white/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <PropertyTourForm propertyName={propertyName} listingSlug={listingSlug} broker={broker} />

      {broker?.phone && broker.phoneHref ? (
        <a
          href={broker.phoneHref}
          className="border-line bg-surface-muted text-primary hover:border-accent-deep hover:bg-surface-soft flex items-center justify-center gap-2.5 rounded-xl border p-[15px] font-sans text-[15px] font-bold transition-[border-color,background-color] sm:col-span-2 lg:col-span-1"
        >
          <Phone className="text-accent-deep size-[18px]" strokeWidth={1.9} />
          Prefer to call? {broker.phone}
        </a>
      ) : null}
    </aside>
  );
}
