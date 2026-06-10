import { Check, MapPin } from 'lucide-react';

import { Kicker } from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { cn } from '@mvp-realty/ui/lib/utils';
import type { FloorRoom, PropertyView, SpecGroup } from '@/data/property';

/** A titled PDP content section with the kicker + serif heading rhythm. */
function Section({
  kicker,
  heading,
  children,
  first = false,
}: {
  kicker: string;
  heading: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section
      className={cn('border-line border-t py-[clamp(34px,4vw,52px)]', first && 'border-t-0 pt-0')}
    >
      <Kicker>{kicker}</Kicker>
      <h2 className="text-primary mt-3.5 font-serif text-[clamp(27px,3vw,38px)] leading-[1.1] font-semibold tracking-[-0.01em]">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function SpecGroups({ groups }: { groups: SpecGroup[] }) {
  return (
    <div className="mt-7 grid gap-x-[clamp(34px,4vw,64px)] gap-y-[clamp(26px,3vw,44px)] sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.heading}>
          <h4 className="text-accent-deep border-line mb-3.5 border-b pb-[11px] font-sans text-[12px] font-extrabold tracking-[0.14em] uppercase">
            {group.heading}
          </h4>
          <ul className="grid gap-[11px]">
            {group.items.map((item, i) =>
              group.layout === 'kv' ? (
                <li
                  key={i}
                  className="flex items-start justify-between gap-[18px] font-sans text-[15px]"
                >
                  <span className="text-muted">{item.label}</span>
                  <span className="text-primary text-right font-bold">{item.value}</span>
                </li>
              ) : (
                <li
                  key={i}
                  className="text-ink-soft flex items-start gap-[11px] font-sans text-[15px] leading-[1.4]"
                >
                  <Check className="text-accent-deep mt-0.5 size-4 shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Stylized, schematic floor plan grid — tasteful, not to scale. */
function FloorPlan({ rooms }: { rooms: FloorRoom[] }) {
  const areaClass: Record<string, string> = {
    great: 'col-span-2 row-span-2',
    kit: '',
    nook: '',
    primary: 'row-span-2',
    office: '',
    bed2: '',
    lanai: '',
    bed3: '',
  };
  // Render order matches a tidy 3-col schematic: great (2x2), kit, nook,
  // primary (1x2), office, bed2, lanai, bed3.
  const order = ['great', 'kit', 'nook', 'primary', 'office', 'bed2', 'lanai', 'bed3'];
  const byArea = new Map(rooms.map((r) => [r.area, r]));

  return (
    <div className="bg-surface-soft border-line mt-7 rounded-xl border p-[clamp(22px,2.6vw,32px)]">
      <div
        className="grid grid-cols-3 gap-[9px]"
        style={{ gridAutoRows: 'minmax(56px, auto)' }}
        role="img"
        aria-label="Single-level floor plan schematic showing the great room, kitchen, owner's suite, secondary bedrooms, den, and lanai."
      >
        {order.map((area) => {
          const room = byArea.get(area);
          if (!room) return null;
          return (
            <div
              key={area}
              className={cn(
                'border-line bg-surface hover:border-accent flex flex-col items-center justify-center gap-0.5 rounded-md border-[1.5px] p-1 text-center transition-colors',
                room.tone === 'primary' && 'bg-accent-soft border-accent-deep/35',
                room.tone === 'common' && 'bg-surface-muted',
                areaClass[area],
              )}
            >
              <b className="text-primary font-sans text-[13px] leading-[1.15] font-bold">
                {room.name}
              </b>
              {room.note && <span className="text-muted font-sans text-[11px]">{room.note}</span>}
            </div>
          );
        })}
      </div>
      <div className="text-muted mt-[18px] flex flex-wrap gap-[22px] font-sans text-[13px]">
        <span className="inline-flex items-center gap-2">
          <span className="bg-accent-soft border-accent-deep/35 size-[13px] rounded border-[1.5px]" />
          Owner&rsquo;s suite
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="bg-surface-muted border-line size-[13px] rounded border-[1.5px]" />
          Common living
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="bg-surface border-line size-[13px] rounded border-[1.5px]" />
          Bedrooms &amp; flex
        </span>
        <span>Schematic — not to scale</span>
      </div>
    </div>
  );
}

/** Stylized "map" block — no real map; navy pin + abstract terrain. */
function LocationMap({ view }: { view: PropertyView }) {
  return (
    <div
      className="border-line shadow-card relative mt-7 h-[340px] overflow-hidden rounded-xl"
      role="img"
      aria-label={`Stylized map showing the home's location within ${view.listing.communityName}.`}
      style={{
        background:
          'radial-gradient(130% 90% at 100% 0%, var(--surface), var(--surface-muted) 64%)',
      }}
    >
      <span
        className="absolute top-[14%] left-[8%] h-[54%] w-[46%] -rotate-[8deg] rounded-[48%_52%_46%_54%]"
        style={{ background: 'rgba(95,211,208,.14)' }}
      />
      <span
        className="absolute right-[6%] bottom-[8%] h-[44%] w-[38%] rotate-[10deg] rounded-[48%_52%_46%_54%]"
        style={{ background: 'rgba(255,183,3,.10)' }}
      />
      <span
        className="bg-accent-deep/40 absolute top-[48%] left-[14%] h-0.5 w-[60%] rotate-[8deg]"
        aria-hidden
      />
      <span
        className="bg-accent-deep/40 absolute top-[30%] left-[40%] h-0.5 w-[36%] -rotate-[58deg]"
        aria-hidden
      />
      <div className="bg-primary shadow-card absolute top-[18px] left-[18px] z-[3] rounded-md px-3.5 py-[9px] font-sans text-[13px] font-semibold text-white">
        <b className="text-accent block text-[12px] tracking-[0.04em]">{view.neighborhood}</b>
        {view.listing.communityName} · {view.listing.city}
      </div>
      <div className="absolute top-[46%] left-[46%] z-[2] -translate-x-1/2 -translate-y-full">
        <span className="bg-primary grid size-[34px] -rotate-45 place-items-center rounded-[50%_50%_50%_0] shadow-[0_10px_22px_-8px_rgba(8,26,48,.7),inset_0_0_0_2px_var(--accent)]">
          <MapPin className="text-accent size-[15px] rotate-45" strokeWidth={2.4} />
        </span>
      </div>
      <Button asChild variant="primary" size="sm" className="absolute right-4 bottom-4 z-[3]">
        <a href="#tour">Ask about the area</a>
      </Button>
    </div>
  );
}

/** The main (left) PDP column: overview, interior, floor plan, exterior, location, courtesy. */
export function PropertyBody({ view }: { view: PropertyView }) {
  return (
    <div className="min-w-0">
      <Section kicker="Overview" heading={`Inside ${view.listing.name}.`} first>
        <div className="text-ink-soft mt-5 font-sans text-[17px] leading-[1.75]">
          <p className="mb-4">{view.overviewLede}</p>
          {view.overview.map((para, i) => (
            <p key={i} className="mb-4 last:mb-0">
              {para}
            </p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {view.highlights.map((h) => (
            <span
              key={h}
              className="text-ink-soft bg-surface-muted border-line inline-flex items-center gap-[9px] rounded-full border px-[15px] py-[9px] font-sans text-[13.5px] font-bold"
            >
              <Check className="text-accent-deep size-[15px]" strokeWidth={2} />
              {h}
            </span>
          ))}
        </div>
      </Section>

      <Section kicker="Interior" heading="Inside the home.">
        <SpecGroups groups={view.interior} />
      </Section>

      <Section kicker="Floor Plan" heading="How it lives.">
        <FloorPlan rooms={view.floorPlan} />
      </Section>

      <Section kicker="Exterior & Construction" heading="The lot and the build.">
        <SpecGroups groups={view.exterior} />
      </Section>

      <Section kicker="Location" heading={`${view.listing.communityName}, ${view.listing.city}.`}>
        <p className="text-ink-soft mt-5 font-sans text-[17px] leading-[1.75]">
          {view.locationBlurb}
        </p>
        <LocationMap view={view} />
      </Section>

      <section className="border-line border-t py-[clamp(34px,4vw,52px)]">
        <div className="bg-surface-muted border-line rounded-lg border px-6 py-[22px]">
          <div className="text-ink-soft flex flex-wrap items-center gap-3 font-sans text-[14px]">
            <b className="text-primary font-bold">Listing courtesy of</b> {view.courtesyAgent},{' '}
            {view.courtesyBrokerage} · <b className="text-primary font-bold">MLS ID</b> {view.mlsId}
          </div>
          <p className="text-muted mt-2.5 font-sans text-[12.5px] leading-[1.6]">
            Listing data is provided for design-preview purposes. All figures, dimensions, and
            availability are illustrative and should be independently reviewed and verified for
            accuracy. Information is deemed reliable but not guaranteed.
          </p>
        </div>
      </section>
    </div>
  );
}
