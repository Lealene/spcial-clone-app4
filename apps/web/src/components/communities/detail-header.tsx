import { MapPin } from 'lucide-react';

import type { CommunityDetail } from '@mvp-realty/api-contracts';

import { Container } from '@/components/layout/container';
import { HeaderActions } from './header-actions';

/** Detail header: H1 + location blurb + Save/Share. */
export function DetailHeader({ community }: { community: CommunityDetail }) {
  return (
    <div className="bg-surface-soft border-line-soft border-b pb-[clamp(20px,2.6vw,28px)] pt-1">
      <Container>
        <h1 className="text-primary font-serif text-[clamp(34px,4.6vw,56px)] font-semibold leading-[1.04] tracking-[-0.012em]">
          {community.name} — {community.city}, FL
        </h1>
        <div className="text-muted mt-[11px] flex items-center gap-2 font-sans text-[16px] font-medium">
          <MapPin className="text-accent-deep size-4 shrink-0" strokeWidth={1.8} />
          {community.blurb}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <HeaderActions name={community.name} slug={community.slug} />
        </div>
      </Container>
    </div>
  );
}
