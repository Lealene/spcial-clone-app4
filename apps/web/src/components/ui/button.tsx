import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@mvp-realty/ui/lib/utils';

/**
 * Tailored "Elegant Concierge" button. Variants are bound to semantic role
 * tokens (cta / primary / accent surfaces) so they re-theme automatically —
 * never reference palette scales or hex here. The icon nudge on hover is the
 * signature motion across the design.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2.5 rounded-md font-sans font-bold whitespace-nowrap tracking-[0.02em] outline-none transition-[transform,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1',
  {
    variants: {
      variant: {
        cta: 'bg-cta text-on-cta hover:bg-accent-deep hover:text-on-primary hover:-translate-y-0.5 hover:shadow-card',
        primary:
          'bg-primary text-on-primary hover:bg-primary-deep hover:-translate-y-0.5 hover:shadow-card',
        outline:
          'bg-transparent text-ink shadow-[inset_0_0_0_1.5px_var(--line)] hover:shadow-[inset_0_0_0_1.5px_var(--accent-deep)] hover:-translate-y-0.5',
        glass:
          'bg-white/10 text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.55)] backdrop-blur-md hover:bg-white/20 hover:-translate-y-0.5',
      },
      size: {
        default: 'px-[30px] py-[17px] text-[15.5px]',
        sm: 'px-5 py-3 text-sm',
        full: 'w-full px-[30px] py-[17px] text-[15.5px]',
      },
    },
    defaultVariants: {
      variant: 'cta',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
