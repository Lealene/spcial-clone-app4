import { MapPin } from 'lucide-react';

import type { CommunityDetail } from '@mvp-realty/api-contracts';

import { Container } from '@/components/container';
import { HeaderActions } from './header-actions';
import { Stars } from './stars';

/** Detail header: H1 + location blurb + star rating + Save/Share. */
export function DetailHeader({ community }: { community: CommunityDetail }) {
  return (
    <div className="bg-surface-soft border-line-soft border-b pt-1 pb-[clamp(20px,2.6vw,28px)]">
      <Container>
        <h1 className="text-primary font-serif text-[clamp(34px,4.6vw,56px)] leading-[1.04] font-semibold tracking-[-0.012em]">
          {community.name} — {community.city}, FL
        </h1>
        <div className="text-muted mt-[11px] flex items-center gap-2 font-sans text-[16px] font-medium">
          <MapPin className="text-accent-deep size-4 shrink-0" strokeWidth={1.8} />
          {community.blurb}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          {community.rating != null ? (
            <span className="text-ink inline-flex items-center gap-[9px] font-sans text-[15px] font-extrabold">
              <Stars />
              {community.rating.toFixed(1)}
              <em className="text-muted font-semibold not-italic">
                · {community.reviews} resident reviews
              </em>
            </span>
          ) : null}
          <HeaderActions name={community.name} slug={community.slug} />
        </div>
      </Container>
    </div>
  );
}
