import Link from 'next/link';
import { Fragment } from 'react';
import type { Metadata } from 'next';
import { listServiceSlugs, getServicePage } from '@/lib/content';
import { getBrandFeed, businessName, businessPhone } from '@/lib/brand';
import { renderSection } from '@/components/sections/registry';
import { LeadCaptureForm } from '@/app/components/LeadCaptureForm';

export async function generateMetadata(): Promise<Metadata> {
  const feed = await getBrandFeed();
  const name = businessName(feed);
  return {
    title: `Services — ${name}`,
    description: `Browse every service ${name} offers.`,
  };
}

/**
 * Services hub — the root of the 3-tier SEO authority graph (hub →
 * category → specific service). Auto-composed from whatever exists in
 * `content/services/`: shows every category and every specific service in
 * an inline grid. Categories typically have their own composition (the
 * agent writes `content/services/hair.md` with a hub-down services-grid);
 * specific services live at sibling paths like `content/services/haircut.md`.
 *
 * The hub itself doesn't need a `[lila:build] Services hub` ticket — it
 * composes deterministically from disk. Adding/removing service pages
 * updates this hub automatically on the next deploy.
 */
export default async function ServicesHubPage() {
  const [feed, slugs] = await Promise.all([
    getBrandFeed(),
    listServiceSlugs(),
  ]);
  const name = businessName(feed);
  const phone = businessPhone(feed);
  const pages = (await Promise.all(slugs.map((slug) => getServicePage(slug))))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const items = pages.map((p, i) => ({
    title: p.title,
    body: p.description || '',
    href: `/services/${p.slug}`,
    icon: String(i + 1).padStart(2, '0'),
  }));

  const ctaText = phone ? `Call ${phone}` : 'Get in touch';
  const ctaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '/contact';

  return (
    <>
      <Fragment>{renderSection({
        type: 'hero',
        variant: 'gradient-canvas',
        eyebrow: 'Services',
        title: `What ${name} offers`,
        subtitle: 'Pick a service to learn more — or book directly.',
        ctaText,
        ctaHref,
      })}</Fragment>

      {items.length > 0 ? (
        <Fragment>{renderSection({
          type: 'services-grid',
          variant: 'feature-cards',
          heading: 'All services',
          items,
        })}</Fragment>
      ) : (
        <section className="bg-surface">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <p className="text-muted">
              Lila is still building the service pages. Check back in a few minutes.
            </p>
            <Link href="/" className="text-primary mt-4 inline-block">← Back to home</Link>
          </div>
        </section>
      )}

      <Fragment>{renderSection({
        type: 'cta',
        variant: 'centered-band',
        title: `Book with ${name}`,
        body: 'Quick booking — pick a service and a time that works for you.',
        ctaText: 'Book your appointment now',
        ctaHref,
      })}</Fragment>

      <section id="book" className="bg-surface-alt">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <LeadCaptureForm source="services_hub_form" />
        </div>
      </section>
    </>
  );
}
