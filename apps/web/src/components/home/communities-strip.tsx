import type { CommunitiesStripBlock } from '@mvp-realty/api-contracts';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { Container } from '@/components/container';

export function CommunitiesStrip({ block }: { block: CommunitiesStripBlock }) {
  const items = block.items.slice(0, block.maxItems ?? block.items.length);

  if (items.length === 0) return null;

  return (
    <div
      id={block.anchorId}
      className="bg-primary relative z-20 bg-[linear-gradient(180deg,rgba(255,255,255,.04),transparent_40%)] text-white/90"
    >
      <Container className="grid sm:grid-cols-3">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={c.link.href}
            aria-label={c.link.ariaLabel}
            className="group flex items-center gap-[19px] border-t border-white/10 px-[clamp(20px,3vw,44px)] py-[30px] transition-colors hover:bg-white/[0.035] sm:border-l sm:border-t-0 sm:first:border-l-0"
          >
            <span className="grid size-[58px] shrink-0 place-items-center rounded-full bg-[linear-gradient(155deg,rgba(255,255,255,.13),rgba(255,255,255,.03))] shadow-[inset_0_0_0_1.5px_var(--accent),inset_0_1px_0_rgba(255,255,255,.2),0_8px_20px_-12px_rgba(0,0,0,.7)] transition-transform duration-300 group-hover:-translate-y-0.5">
              <MapPin className="text-accent size-[27px]" strokeWidth={1.7} />
            </span>
            <span>
              <b className="block font-serif text-[18px] font-semibold tracking-[0.005em] text-white">
                {c.name}
              </b>
              <span className="mt-[5px] block text-[14px] leading-[1.45] text-white/65">
                {c.blurb}
              </span>
            </span>
          </Link>
        ))}
      </Container>
    </div>
  );
}
