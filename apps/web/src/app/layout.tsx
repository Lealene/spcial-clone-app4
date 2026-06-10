import type { Metadata } from 'next';
import {
  Playfair_Display,
  Manrope,
  Montserrat,
  Roboto,
  Poppins,
  Plus_Jakarta_Sans,
  Outfit,
} from 'next/font/google';
import './globals.css';

import { DEFAULT_FONT, DEFAULT_RADIUS, DEFAULT_THEME, designFoucScript } from '@/lib/themes';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ThemeSwitcher } from '@/components/theme-switcher';

// Default pairing (Concierge).
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

// Candidate premium-sans pairings for the design-exploration font switcher.
// Remove the unused ones once the client picks a typeface.
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const fontVars = [playfair, manrope, montserrat, roboto, poppins, jakarta, outfit]
  .map((f) => f.variable)
  .join(' ');

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
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      data-font={DEFAULT_FONT}
      data-radius={DEFAULT_RADIUS}
      suppressHydrationWarning
      className={`${fontVars} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: designFoucScript }} />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ThemeSwitcher />
      </body>
    </html>
  );
}
