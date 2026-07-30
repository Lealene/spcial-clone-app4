'use client';

import { useEffect, useRef, useState } from 'react';

import { Container } from '@/components/container';
import { cn } from '@mvp-realty/ui/lib/utils';

export type Tab = { id: string; label: string };

/**
 * Sticky section tabs with scrollspy. Anchor links jump to each `#section`;
 * an IntersectionObserver highlights the section currently in the viewport
 * band. Smooth scroll honors reduced-motion. Mirrors the source design's
 * `c-tabs` strip — sits just under the global nav (top-[74px]). `sections`
 * is caller-supplied so it reflects only the blocks a given community
 * actually renders.
 */
export function SectionTabs({ sections }: { sections: Tab[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observedSections = sections
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (observedSections.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    for (const s of observedSections) observer.observe(s);
    return () => observer.disconnect();
  }, [sections]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setActive(id);
  }

  if (sections.length === 0) return null;

  return (
    <div className="border-line-soft bg-surface/90 sticky top-[var(--nav-h,77px)] z-50 mt-[clamp(26px,3vw,38px)] border-t border-b backdrop-blur-[14px] backdrop-saturate-150">
      {/* Only ~2 of 6 tabs fit at 360px; the fade signals the rest exist. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-[var(--surface)] to-transparent lg:hidden" />
      <Container>
        <nav
          ref={railRef}
          aria-label="Community sections"
          className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto [-ms-overflow-style:none] after:block after:w-[clamp(2px,1vw,8px)] after:shrink-0 after:content-[''] [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((tab) => {
            const isActive = active === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => handleClick(e, tab.id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'border-b-2 px-[18px] pt-[18px] pb-4 font-sans text-[14.5px] font-bold tracking-[0.01em] whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-accent text-primary'
                    : 'text-ink-soft hover:text-primary border-transparent',
                )}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}
