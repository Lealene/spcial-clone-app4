'use client';

import type { HeaderGlobal } from '@mvp-realty/api-contracts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import { BrandMark, BrandWordmark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { getLinkRenderProps } from '@/lib/cms/links';

export function SiteNavInteractive({ header }: { header: HeaderGlobal }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'border-line-soft bg-surface-soft/80 z-60 sticky top-0 border-b backdrop-blur-[16px] backdrop-saturate-150 transition-shadow duration-300',
        scrolled && 'shadow-[0_1px_0_var(--line-soft),0_16px_34px_-28px_rgba(8,26,48,0.4)]',
      )}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-[clamp(22px,5vw,76px)] py-4">
        <Link
          {...getLinkRenderProps(header.brandHomeLink, header.brandMarkAlt ?? header.brandLabel)}
          className="flex items-center gap-[13px]"
        >
          <BrandMark />
          <BrandWordmark label={header.brandLabel} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {header.navItems.map((item) => (
            <Link
              key={`${item.label}-${item.link.href}`}
              {...getLinkRenderProps(item.link, item.ariaLabel)}
              className="text-ink-soft hover:text-primary group relative py-1.5 font-sans text-[15px] font-semibold tracking-[0.01em] transition-colors"
            >
              {item.label}
              <span className="bg-accent-deep absolute inset-x-0 bottom-0 h-[1.5px] origin-left scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="primary" size="sm" className="hidden lg:inline-flex">
            <Link {...getLinkRenderProps(header.primaryCta)}>{header.primaryCta.label}</Link>
          </Button>
          <button
            type="button"
            className="text-primary lg:hidden"
            aria-label={menuOpen ? header.mobileMenuCloseLabel : header.mobileMenuLabel}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-line-soft bg-surface-soft border-t lg:hidden">
          <nav className="mx-auto flex max-w-[1240px] flex-col px-[clamp(22px,5vw,76px)] py-2">
            {header.navItems.map((item) => (
              <Link
                key={`${item.label}-${item.link.href}`}
                {...getLinkRenderProps(item.link, item.ariaLabel)}
                onClick={() => setMenuOpen(false)}
                className="border-line-soft text-ink-soft border-b py-3.5 font-sans text-base font-semibold last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="primary" size="full" className="mb-2 mt-4">
              <Link {...getLinkRenderProps(header.primaryCta)} onClick={() => setMenuOpen(false)}>
                {header.primaryCta.label}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
