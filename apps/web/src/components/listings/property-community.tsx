import Link from 'next/link';
import { ArrowRight, Building2, Landmark, type LucideIcon, ShieldCheck, Users } from 'lucide-react';

import { Container } from '@/components/container';
import { Kicker } from '@/components/section-header';
import { Button } from '@/components/ui/button';
import type { CommunityFact } from '@/data/property';

const COMMUNITY_ICON: Record<CommunityFact['icon'], LucideIcon> = {
  age: Users,
  gate: ShieldCheck,
  homes: Building2,
  since: Landmark,
};

/** Navy "Community Key Facts" band — 4 cells + 2 actions, linking to the community page. */
export function PropertyCommunity({
  communitySlug,
  communityName,
  blurb,
  facts,
  hasDetailPage,
}: {
  communitySlug: string;
  communityName: string;
  blurb: string;
  facts: CommunityFact[];
  hasDetailPage: boolean;
}) {
  const exploreHref = hasDetailPage
    ? `/communities/${communitySlug}`
    : `/listings?community=${communitySlug}`;

  return (
    <section id="community" className="bg-primary-deep relative overflow-hidden text-white">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(120% 90% at 88% 6%, rgba(255,183,3,.10), transparent 55%)',
        }}
      />
      <Container className="relative z-[1] py-[clamp(56px,6vw,86px)]">
        <Kicker tone="dark">The Community</Kicker>
        <h2 className="mt-3.5 font-serif text-[clamp(28px,3.4vw,44px)] leading-[1.08] font-semibold text-white">
          Life inside <em className="text-accent-soft italic">{communityName}.</em>
        </h2>
        <p className="mt-[18px] max-w-[54ch] font-sans text-[17px] leading-[1.7] text-white/85">
          {blurb}
        </p>

        <div className="mt-[clamp(34px,4vw,52px)] grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => {
            const Icon = COMMUNITY_ICON[fact.icon];
            return (
              <div key={fact.label} className="bg-primary-deep px-6 py-[26px]">
                <span
                  className="mb-4 grid size-[42px] place-items-center rounded-full shadow-[inset_0_0_0_1.5px_rgba(255,183,3,.6)]"
                  style={{
                    background:
                      'linear-gradient(155deg, rgba(255,255,255,.13), rgba(255,255,255,.03))',
                  }}
                >
                  <Icon className="text-accent size-[21px]" strokeWidth={1.7} />
                </span>
                <b className="block font-serif text-[21px] leading-[1.1] font-semibold text-white">
                  {fact.value}
                </b>
                <span className="mt-[7px] block font-sans text-[14px] leading-[1.5] text-white/65">
                  {fact.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-[clamp(30px,3.4vw,42px)] flex flex-wrap gap-3.5">
          <Button asChild variant="cta">
            <Link href={exploreHref}>
              {hasDetailPage ? 'Explore the community' : 'Browse homes in this area'}
              <ArrowRight />
            </Link>
          </Button>
          {hasDetailPage && (
            <Button asChild variant="glass">
              <Link href={exploreHref}>Amenities &amp; clubs</Link>
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
