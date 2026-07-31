import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import './globals.css';

import { SiteNav } from '@/components/layout/site-nav';
import { SiteFooter } from '@/components/layout/site-footer';
import { env } from '@/env';
import { getFooterContent, getHeaderContent } from '@/lib/cms/site-chrome';
import { getSiteSettings } from '@/lib/cms/site-settings';
import { JsonLd } from '@/lib/seo/json-ld';
import { buildOrganizationNode, buildWebSiteNode } from '@/lib/seo/organization';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

/** Used until Site Settings carries its own copy. */
const DEFAULT_TITLE = 'MVP Realty — Gulf-Coast Concierge for Luxury Gated Communities';
const DEFAULT_DESCRIPTION =
  'A prestigious Gulf-Coast address with resort amenities and a personal concierge. Private gated communities minutes from the Naples beaches.';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = settings.description ?? DEFAULT_DESCRIPTION;
  const ogImage = settings.defaultOgImage;

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: DEFAULT_TITLE,
      // Pages that set an absolute title opt out; everything else is suffixed.
      template: `%s | ${settings.name}`,
    },
    description,
    applicationName: settings.name,
    openGraph: {
      type: 'website',
      siteName: settings.name,
      locale: 'en_US',
      images: ogImage ? [{ url: ogImage.src, alt: ogImage.alt }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      images: ogImage ? [{ url: ogImage.src, alt: ogImage.alt }] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [header, footer, settings] = await Promise.all([
    getHeaderContent(),
    getFooterContent(),
    getSiteSettings(),
  ]);

  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      {env.NEXT_PUBLIC_GTM_ID ? <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID} /> : null}
      <body className="flex min-h-full flex-col overflow-x-clip">
        {/* Site-wide entity graph. Page graphs reference these nodes by @id. */}
        <JsonLd nodes={[buildOrganizationNode(settings), buildWebSiteNode(settings)]} />
        <SiteNav header={header} />
        <main className="flex-1">{children}</main>
        <SiteFooter footer={footer} />
      </body>
    </html>
  );
}
