import type { Metadata } from 'next';
import { getBrandFeed, businessName } from '@/lib/brand';
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
        {/* schema.org JSON-LD generated from VERIFIED Brand Memory (feed_get). */}
        {hasJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(feed.jsonLd) }}
          />
        )}
      </head>
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
