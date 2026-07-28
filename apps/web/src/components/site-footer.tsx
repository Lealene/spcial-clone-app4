import type { FooterGlobal } from '@mvp-realty/api-contracts';
import Link from 'next/link';

import { getLinkRenderProps } from '@/lib/cms/links';

export function SiteFooter({ footer }: { footer: FooterGlobal }) {
  return (
    <footer className="bg-primary-deep text-white/65">
      <div className="mx-auto max-w-[1440px] px-[clamp(22px,4vw,64px)]">
        <div className="grid gap-12 py-[78px] pb-[50px] md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div>
            <b className="font-serif text-2xl font-bold text-white">
              {footer.brandName}{' '}
              {footer.brandAccentText && (
                <i className="text-accent not-italic">{footer.brandAccentText}</i>
              )}
            </b>
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
          <div className="flex flex-wrap justify-between gap-[22px] py-6 font-sans text-[13.5px]">
            <span>{footer.bottomLeftText}</span>
            {footer.bottomRightLinks.length > 0 ? (
              <span className="flex flex-wrap gap-3">
                {footer.bottomRightLinks.map((link) => (
                  <Link key={`${link.label}-${link.href}`} {...getLinkRenderProps(link)}>
                    {link.label}
                  </Link>
                ))}
              </span>
            ) : (
              <span>{footer.bottomRightTextFallback}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
