import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MVP Realty — Gulf-Coast Concierge for Luxury Gated Communities',
  description:
    'A prestigious Gulf-Coast address with resort amenities and a personal concierge. Private gated communities minutes from the Naples beaches.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
