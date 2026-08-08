import type { FooterGlobal } from '@mvp-realty/api-contracts';
import Link from 'next/link';

import { BrandLockup } from '@/components/layout/brand-mark';
import { Container } from '@/components/layout/container';
import { getLinkRenderProps } from '@/lib/cms/links';

export function SiteFooter({ footer }: { footer: FooterGlobal }) {
  return (
    <footer className="bg-primary-deep text-white/65">
      <Container>
        <div className="grid gap-12 py-[78px] pb-[50px] md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div>
            {/*
              The brand PNG bakes ~11.9% transparent clear-space into each side,
              which pushes the mark right of the blurb below it. translate-x
              resolves percentages against the element's own box, so this cancels
              the left bleed exactly at any rendered size — a percentage margin
              would resolve against the footer column instead. The text brand has
              no bleed, hence the mode guard. Remove this if a tightly-cropped
              logo is ever uploaded.
            */}
            <BrandLockup
              mode={footer.brandDisplayMode}
              logo={footer.brandLogo}
              label={footer.brandName}
              accentText={footer.brandAccentText}
              variant="footer"
              className={footer.brandDisplayMode === 'logo' ? '-translate-x-[11.9%]' : undefined}
            />
            <p className="mt-4 max-w-[36ch] font-sans text-[15.5px] leading-relaxed">
              {footer.brandBlurb}
            </p>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-5 font-sans text-[13px] font-semibold tracking-[0.14em] text-white uppercase">
                {col.title}
              </h4>
              <ul className="grid gap-[13px] font-sans text-[15.5px]">
                {col.links.map((item) => (
                  <li key={`${item.label}-${item.link.href}`}>
                    <Link
                      {...getLinkRenderProps(item.link, item.ariaLabel)}
                      className="hover:text-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="flex flex-wrap justify-between gap-[22px] pt-6 pb-1.5 font-sans text-[13.5px]">
            <span>{footer.bottomLeftText}</span>
            {footer.bottomRightLinks.length > 0 ? (
              <span className="flex flex-wrap gap-3">
                {footer.bottomRightLinks.map((link) => (
                  <Link
                    key={`${link.label}-${link.href}`}
                    {...getLinkRenderProps(link)}
                    className="hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </span>
            ) : (
              <span>{footer.bottomRightTextFallback}</span>
            )}
          </div>

          {/*
            Agency attribution — deliberately hardcoded rather than a Footer global
            field: it is ours, not client-editable content, and `normalizeFooter`
            throws on missing required fields.
          */}
          <p className="pb-6 text-right font-sans text-[13.5px] text-white/45">
            <a
              href="https://medianeth.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent no-underline transition-colors"
            >
              Made with{' '}
              <span aria-hidden="true" className="not-italic">
                ❤️
              </span>
              <span className="sr-only">love</span> by Medianeth
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
