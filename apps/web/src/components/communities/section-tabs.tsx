'use client';

import { useEffect, useRef, useState } from 'react';

import { Container } from '@/components/container';
import { cn } from '@mvp-realty/ui/lib/utils';

type Tab = { id: string; label: string };

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'homes', label: 'Homes for Sale' },
  { id: 'models', label: 'Models' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faqs', label: 'FAQs' },
];

/**
 * Sticky section tabs with scrollspy. Anchor links jump to each `#section`;
 * an IntersectionObserver highlights the section currently in the viewport
 * band. Smooth scroll honors reduced-motion. Mirrors the source design's
 * `c-tabs` strip — sits just under the global nav (top-[74px]).
 */
export function SectionTabs() {
  const [active, setActive] = useState('overview');
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    for (const s of sections) observer.observe(s);
    return () => observer.disconnect();
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setActive(id);
  }

  return (
    <div className="border-line-soft bg-surface/90 sticky top-[74px] z-50 mt-[clamp(26px,3vw,38px)] border-t border-b backdrop-blur-[14px] backdrop-saturate-150">
      <Container>
        <nav
          ref={railRef}
          aria-label="Community sections"
          className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((tab) => {
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
