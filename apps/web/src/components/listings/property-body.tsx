import { Check } from 'lucide-react';

import { ListingMap } from '@/components/listings/listing-map';
import { Kicker } from '@/components/section-header';
// Restore alongside AskAboutAreaButton below when the map CTA comes back.
// import { Button } from '@/components/ui/button';
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
                  <span className="text-muted min-w-0">{item.label}</span>
                  <span className="text-primary min-w-0 text-right font-bold break-words">
                    {item.value}
                  </span>
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
  // Spans are md-gated: at the 1- and 2-column tiers a `col-span-2` would
  // exceed the track count and blow the schematic out.
  const areaClass: Record<string, string> = {
    great: 'md:col-span-2 md:row-span-2',
    kit: '',
    nook: '',
    primary: 'md:row-span-2',
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
        className="grid grid-cols-1 gap-[9px] sm:grid-cols-2 md:grid-cols-3"
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
              <b className="text-primary font-sans text-[13px] leading-[1.15] font-bold break-words hyphens-auto">
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

/**
 * Caption for the pin, shared by the real map and the fallback. Leads with the street
 * address because the community and city are already the section heading above; the
 * accent line carries the community only as context for the address.
 */
function LocationCard({ view, className }: { view: PropertyView; className?: string }) {
  return (
    <div
      className={cn(
        'bg-primary shadow-card pointer-events-none absolute top-[18px] left-[18px] z-[3] max-w-[calc(100%-36px)] rounded-md px-3.5 py-[9px] font-sans text-[13px] font-semibold text-white sm:max-w-[62%]',
        className,
      )}
    >
      <b className="text-accent block text-[12px] tracking-[0.04em]">{view.addressLine}</b>
      {view.cityLine}
    </div>
  );
}

// Hidden for now — kept so the map CTA can come back without rebuilding it.
// function AskAboutAreaButton({ className }: { className?: string }) {
//   return (
//     <Button
//       asChild
//       variant="primary"
//       size="sm"
//       className={cn('absolute right-4 bottom-4 z-[3]', className)}
//     >
//       <a href="#tour">Ask about the area</a>
//     </Button>
//   );
// }

/** Real OpenStreetMap view, centered on the listing's MLS coordinates. */
function LocationMap({
  view,
  coordinates,
}: {
  view: PropertyView;
  coordinates: { lat: number; lon: number };
}) {
  return (
    <div className="border-line shadow-card relative mt-7 h-[clamp(260px,38vw,420px)] overflow-hidden rounded-xl border">
      <ListingMap lat={coordinates.lat} lon={coordinates.lon} label={view.addressLine} />
      {/* Leaflet's panes and controls climb to z-index 800+, so overlays must sit above that. */}
      <LocationCard view={view} className="z-[1000]" />
      {/* <AskAboutAreaButton className="bottom-9 z-[1000]" /> */}
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
        {view.highlights.length > 0 && (
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
        )}
      </Section>

      {view.interior.length > 0 && (
        <Section kicker="Interior" heading="Inside the home.">
          <SpecGroups groups={view.interior} />
        </Section>
      )}

      {view.floorPlan.length > 0 && (
        <Section kicker="Floor Plan" heading="How it lives.">
          <FloorPlan rooms={view.floorPlan} />
        </Section>
      )}

      {view.exterior.length > 0 && (
        <Section kicker="Exterior & Construction" heading="The lot and the build.">
          <SpecGroups groups={view.exterior} />
        </Section>
      )}

      <Section kicker="Location" heading={`${view.listing.communityName}, ${view.listing.city}.`}>
        <p className="text-ink-soft mt-5 font-sans text-[17px] leading-[1.75]">
          {view.locationBlurb}
        </p>
        {/* No map at all when the MLS feed has no coordinates — a decorative stand-in
            would imply a location we don't have. The blurb above still carries the area. */}
        {view.coordinates && <LocationMap view={view} coordinates={view.coordinates} />}
      </Section>

      <section className="border-line border-t py-[clamp(34px,4vw,52px)]">
        <div className="bg-surface-muted border-line rounded-lg border px-6 py-[22px]">
          <div className="text-ink-soft flex flex-wrap items-center gap-3 font-sans text-[14px]">
            <b className="text-primary font-bold">Listing courtesy of</b> {view.courtesyAgent},{' '}
            {view.courtesyBrokerage} · <b className="text-primary font-bold">MLS ID</b> {view.mlsId}
          </div>
          <p className="text-muted mt-2.5 font-sans text-[12.5px] leading-[1.6]">
            Listing information is supplied by the MLS and is deemed reliable but not guaranteed.
            Buyers should independently verify all figures, dimensions, and availability.
          </p>
        </div>
      </section>
    </div>
  );
}
