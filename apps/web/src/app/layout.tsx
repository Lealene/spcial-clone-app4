import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { env } from '@/env';
import { getFooterContent, getHeaderContent } from '@/lib/cms/homepage';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'MVP Realty — Gulf-Coast Concierge for Luxury Gated Communities',
    template: '%s | MVP Realty',
  },
  description:
    'A prestigious Gulf-Coast address with resort amenities and a personal concierge. Private gated communities minutes from the Naples beaches.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [header, footer] = await Promise.all([getHeaderContent(), getFooterContent()]);

  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <SiteNav header={header} />
        <main className="flex-1">{children}</main>
        <SiteFooter footer={footer} />
      </body>
    </html>
  );
}
