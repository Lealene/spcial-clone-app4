import type { CmsLink, CommunitiesStripBlock } from '@mvp-realty/api-contracts';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { Container } from '@/components/container';
import { getCommunityAreaStripItems } from '@/lib/cms/areas';
import { getLinkRenderProps } from '@/lib/cms/links';

type StripItemView = {
  slug: string;
  name: string;
  blurb: string;
  href: string;
  link?: CmsLink;
};

export async function CommunitiesStrip({ block }: { block: CommunitiesStripBlock }) {
  const maxItems = block.maxItems ?? 3;

  let items: StripItemView[];

  if (block.sourceMode === 'manual' && block.items.length > 0) {
    items = block.items.slice(0, maxItems).map((item) => ({
      slug: item.slug,
      name: item.name,
      blurb: item.blurb,
      href: item.link.href,
      link: item.link,
    }));
  } else {
    items = await getCommunityAreaStripItems(maxItems);
  }

  if (items.length === 0) return null;

  return (
    <div
      id={block.anchorId}
      className="bg-primary relative z-20 bg-[linear-gradient(180deg,rgba(255,255,255,.04),transparent_40%)] text-white/90"
    >
      <Container className="grid sm:grid-cols-3">
        {items.map((c) => {
          const linkProps = c.link ? getLinkRenderProps(c.link) : { href: c.href };

          return (
            /* No inline padding below sm: Container already supplies the rail,
               and doubling it left only ~160px for the copy at 320px. */
            <Link
              key={c.slug}
              {...linkProps}
              className="group flex items-center gap-[19px] border-t border-white/10 py-[30px] transition-colors hover:bg-white/[0.035] sm:border-t-0 sm:border-l sm:px-[clamp(20px,3vw,44px)] sm:first:border-l-0"
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
          );
        })}
      </Container>
    </div>
  );
}
