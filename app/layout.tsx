import type { Metadata } from 'next';
import { getBrandFeed, businessName } from '@/lib/brand';
import { googleFontsHref } from '@/lib/themeFonts.generated';
import { SiteHeader } from '@/app/components/SiteHeader';
import { SiteFooter } from '@/app/components/SiteFooter';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const feed = await getBrandFeed();
  return {
    title: businessName(feed),
    description: `${businessName(feed)} — services, hours, and booking.`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const feed = await getBrandFeed();
  const hasJsonLd = Object.keys(feed.jsonLd).length > 0;
  return (
    <html lang="en">
      <head>
        {googleFontsHref && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={googleFontsHref} />
          </>
        )}
        {hasJsonLd && (
          /* schema.org JSON-LD generated from VERIFIED Brand Memory (feed_get). */
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(feed.jsonLd) }}
          />
        )}
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
