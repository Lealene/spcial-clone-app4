import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';

import { Container } from '@/components/container';
import type { CommunityDetail } from '@/data/community-detail';
import { HeaderActions } from './header-actions';
import { Stars } from './stars';

/** Detail header: breadcrumb + H1 + location blurb + star rating + Save/Share. */
export function DetailHeader({ community }: { community: CommunityDetail }) {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Communities', href: '/#communities' },
    { label: community.city, href: '/#communities' },
  ];

  return (
    <div className="bg-surface-soft border-line-soft border-b py-[clamp(22px,3vw,34px)] pb-[clamp(20px,2.6vw,28px)]">
      <Container>
        <nav
          aria-label="Breadcrumb"
          className="text-muted flex flex-wrap items-center gap-[9px] font-sans text-[13.5px] font-semibold"
        >
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-[9px]">
              <Link href={c.href} className="hover:text-primary transition-colors">
                {c.label}
              </Link>
              <ChevronRight className="text-line size-[13px]" strokeWidth={2.4} />
            </span>
          ))}
          <b className="text-ink font-bold">{community.name}</b>
        </nav>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-7">
          <div>
            <h1 className="text-primary font-serif text-[clamp(34px,4.6vw,56px)] leading-[1.04] font-semibold tracking-[-0.012em]">
              {community.name} — {community.city}, FL
            </h1>
            <div className="text-muted mt-[11px] flex items-center gap-2 font-sans text-[16px] font-medium">
              <MapPin className="text-accent-deep size-4 shrink-0" strokeWidth={1.8} />
              {community.blurb}
            </div>
            <div className="mt-3.5 flex flex-wrap items-center gap-4">
              <span className="text-ink inline-flex items-center gap-[9px] font-sans text-[15px] font-extrabold">
                <Stars />
                {community.rating.toFixed(1)}
                <em className="text-muted font-semibold not-italic">
                  · {community.reviews} resident reviews
                </em>
              </span>
            </div>
          </div>
          <HeaderActions name={community.name} />
        </div>
      </Container>
    </div>
  );
}
