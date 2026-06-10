import Image from 'next/image';
import { Phone, Star } from 'lucide-react';

import { PropertyTourForm } from './property-tour-form';

/**
 * Sticky PDP aside: navy agent card (Eleanor Voss) + the stubbed "Tour this
 * home" form + a "prefer to call" link. Server component; the form inside is
 * the only client leaf.
 */
export function PropertyAside({
  propertyName,
  communityName,
}: {
  propertyName: string;
  communityName: string;
}) {
  return (
    <aside
      id="tour"
      className="grid gap-[18px] self-start sm:grid-cols-2 lg:sticky lg:top-24 lg:grid-cols-1"
    >
      {/* Agent card */}
      <div className="bg-primary shadow-lift overflow-hidden rounded-xl border border-[rgba(255,183,3,0.18)] text-white">
        <div className="flex items-center gap-4 px-6 pt-6">
          <span className="size-[66px] shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_2px_var(--accent)]">
            <Image
              src="/images/owner-eleanor-voss.jpg"
              alt="Portrait of Eleanor Voss, Broker and Owner of MVP Realty"
              width={66}
              height={66}
              className="size-full object-cover"
            />
          </span>
          <div>
            <b className="block font-serif text-[21px] leading-[1.1] font-semibold text-white">
              Eleanor Voss
            </b>
            <div className="text-accent-soft mt-1 font-sans text-[13px] font-semibold">
              Your {communityName} Concierge
            </div>
            <div className="mt-[3px] font-sans text-[12px] text-white/55">
              Broker &amp; Owner · MVP Realty
            </div>
          </div>
        </div>

        <div className="mt-[18px] flex items-center gap-2 border-t border-white/10 px-6 py-[14px] font-sans text-[13.5px] text-white/80">
          <span className="inline-flex gap-[2px]" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="text-accent size-[15px] fill-current" />
            ))}
          </span>
          <b className="text-white">5.0</b> · 63 resident reviews
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10">
          <div className="bg-primary px-6 py-[15px]">
            <b className="text-accent block font-serif text-[22px] leading-none font-semibold">
              90
            </b>
            <span className="mt-1.5 block font-sans text-[12px] text-white/60">
              Sold in this community
            </span>
          </div>
          <div className="bg-primary px-6 py-[15px]">
            <b className="text-accent block font-serif text-[22px] leading-none font-semibold">
              3 min
            </b>
            <span className="mt-1.5 block font-sans text-[12px] text-white/60">
              Avg. response time
            </span>
          </div>
        </div>
      </div>

      <PropertyTourForm propertyName={propertyName} />

      <a
        href="tel:+12395550148"
        className="border-line bg-surface-muted text-primary hover:border-accent-deep hover:bg-surface-soft flex items-center justify-center gap-2.5 rounded-xl border p-[15px] font-sans text-[15px] font-bold transition-[border-color,background-color] sm:col-span-2 lg:col-span-1"
      >
        <Phone className="text-accent-deep size-[18px]" strokeWidth={1.9} />
        Prefer to call? (239) 555-0148
      </a>
    </aside>
  );
}
