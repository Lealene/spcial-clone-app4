import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@mvp-realty/ui/components/ui/breadcrumb';
import { cn } from '@mvp-realty/ui/lib/utils';

import { Container } from '@/components/layout/container';

export type PageBreadcrumbItem = {
  label: string;
  /** Omit on the current page (last crumb). */
  href?: string;
};

/**
 * Shared page breadcrumb strip — same bar, spacing, and chevron separators
 * on community detail and listing PDP.
 *
 * `flush` drops the bottom border so a following same-tone header (community
 * title band) can sit under the crumbs as one continuous block.
 */
export function PageBreadcrumb({
  items,
  flush = false,
}: {
  items: PageBreadcrumbItem[];
  flush?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className={cn('bg-surface-soft', !flush && 'border-line-soft border-b')}>
      <Container>
        <BreadcrumbList className="text-muted gap-[9px] py-[14px] font-sans text-[13.5px] font-semibold sm:gap-[9px]">
          {items.flatMap((item, index) => {
            const isLast = index === items.length - 1;
            const crumb = (
              <BreadcrumbItem key={`item-${item.label}-${index}`} className="gap-[9px]">
                {isLast || !item.href ? (
                  <BreadcrumbPage className="text-ink font-bold">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="text-muted hover:text-primary font-semibold transition-colors"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );

            if (isLast) return [crumb];

            return [
              crumb,
              <BreadcrumbSeparator
                key={`sep-${item.label}-${index}`}
                className="text-line [&>svg]:size-[13px]"
              />,
            ];
          })}
        </BreadcrumbList>
      </Container>
    </Breadcrumb>
  );
}
