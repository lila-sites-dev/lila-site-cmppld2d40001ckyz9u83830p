import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { listServiceSlugs, getServicePage, type ServicePage } from '@/lib/content';
import { getDesignJson, pickVariant } from '@/lib/design';
import { renderSection } from '@/components/sections/registry';
import { getBrandFeed, businessName, businessPhone } from '@/lib/brand';
import type { SectionSpec, HeroSpec, CtaSpec } from '@/components/sections/types';
import { LeadCaptureForm } from '@/app/components/LeadCaptureForm';

export async function generateStaticParams() {
  return (await listServiceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const page = await getServicePage(slug);
  if (!page) return {};
  return { title: page.title, description: page.description || undefined };
}

export default async function ServicePageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, design, feed] = await Promise.all([
    getServicePage(slug),
    getDesignJson(),
    getBrandFeed(),
  ]);
  if (!page) notFound();

  const phone = businessPhone(feed);
  const name  = businessName(feed);
  const ctaText = phone ? `Call ${phone}` : `Get in touch with ${name}`;
  const ctaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#book';

  // If the markdown frontmatter declares its own sections, use them as-is.
  // Otherwise compose a default: hero + prose body + cta. This keeps the legacy
  // "just write markdown" workflow working while the typed-sections path lands.
  const sections: SectionSpec[] = page.sections.length > 0
    ? page.sections
    : defaultServiceSections(page, design, { ctaText, ctaHref, name });

  return (
    <article>
      {sections.map((spec, i) => (
        <Fragment key={i}>{renderSection(spec)}</Fragment>
      ))}
      <section id="book" className="bg-surface-alt">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <LeadCaptureForm source="website_form" />
        </div>
      </section>
    </article>
  );
}

function defaultServiceSections(
  page: ServicePage,
  design: Awaited<ReturnType<typeof getDesignJson>>,
  cta: { ctaText: string; ctaHref: string; name: string },
): SectionSpec[] {
  const heroVariant = (pickVariant(design, 'default', 'hero') as HeroSpec['variant']) ?? 'centered-stacked';
  const ctaVariant  = (pickVariant(design, 'default', 'cta')  as CtaSpec['variant'])  ?? 'centered-band';
  return [
    {
      type: 'hero',
      variant: heroVariant,
      title: page.title,
      subtitle: page.description || undefined,
      ctaText: cta.ctaText,
      ctaHref: cta.ctaHref,
    },
    { type: 'prose', html: page.html },
    {
      type: 'cta',
      variant: ctaVariant,
      title: `Book with ${cta.name}`,
      ctaText: cta.ctaText,
      ctaHref: cta.ctaHref,
    },
  ];
}
