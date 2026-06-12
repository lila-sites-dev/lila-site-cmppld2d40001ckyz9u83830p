import { Fragment } from 'react';
import { getBrandFeed, businessName, businessPhone } from '@/lib/brand';
import { listServiceSlugs, getServicePage, getHomePage } from '@/lib/content';
import { getDesignJson, pickVariant } from '@/lib/design';
import { renderSection } from '@/components/sections/registry';
import type { SectionSpec, HeroSpec, ServicesGridSpec, CtaSpec } from '@/components/sections/types';
import { LeadCaptureForm } from '@/app/components/LeadCaptureForm';

export default async function HomePage() {
  const [feed, design, slugs, homeOverride] = await Promise.all([
    getBrandFeed(),
    getDesignJson(),
    listServiceSlugs(),
    getHomePage(),
  ]);
  const services = (await Promise.all(slugs.map(getServicePage))).filter(
    (s): s is NonNullable<typeof s> => !!s,
  );

  // If the build agent has shipped a personalized `content/home.md` with a
  // `sections:` frontmatter array, use it verbatim — that's the Lila-built
  // home page. Otherwise fall back to the auto-composed generic default so
  // a freshly-provisioned repo still renders something sensible day one.
  if (homeOverride && homeOverride.sections.length > 0) {
    // A `prose` section without its own `html` field means "use the page's
    // markdown body here" (per template CLAUDE.md). renderProse reads
    // spec.html directly, so substitute the body html before rendering —
    // otherwise React's static export crashes with `dangerouslySetInnerHTML
    // must be in the form {__html: ...}` because __html is undefined.
    const sectionsResolved = homeOverride.sections.map((s) =>
      s.type === 'prose' && !s.html ? { ...s, html: homeOverride.html } : s,
    );
    return (
      <>
        {sectionsResolved.map((spec, i) => (
          <Fragment key={i}>{renderSection(spec)}</Fragment>
        ))}
        <section id="book" className="bg-surface-alt">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <LeadCaptureForm source="website_form" />
          </div>
        </section>
      </>
    );
  }

  const name  = businessName(feed);
  const phone = businessPhone(feed);
  const tagline = pickTagline(feed.llmsTxt);
  const ctaText = phone ? `Call ${phone}` : 'Get in touch';
  const ctaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#book';

  const heroVariant     = (pickVariant(design, 'home', 'hero')          as HeroSpec['variant'])         ?? 'split-image-right';
  const servicesVariant = (pickVariant(design, 'home', 'services-grid') as ServicesGridSpec['variant']) ?? 'icon-cards';
  const ctaVariant      = (pickVariant(design, 'home', 'cta')           as CtaSpec['variant'])          ?? 'centered-band';

  const sections: SectionSpec[] = [
    {
      type: 'hero',
      variant: heroVariant,
      eyebrow: tagline ? undefined : 'Local · trusted',
      title: name,
      subtitle: tagline ?? `Welcome to ${name}.`,
      ctaText,
      ctaHref,
    },
    services.length > 0 && {
      type: 'services-grid',
      variant: servicesVariant,
      heading: 'What we do',
      items: services.map((s, i) => ({
        title: s.title,
        body:  s.description,
        href:  `/services/${s.slug}`,
        icon:  String(i + 1).padStart(2, '0'),
      })),
    },
    {
      type: 'cta',
      variant: ctaVariant,
      title: `Book with ${name}`,
      body: phone ? `Call us directly or send a message below.` : 'Send a message and we’ll get back to you.',
      ctaText,
      ctaHref,
    },
  ].filter(Boolean) as SectionSpec[];

  return (
    <>
      {sections.map((spec, i) => (
        <Fragment key={i}>{renderSection(spec)}</Fragment>
      ))}
      <section id="book" className="bg-surface-alt">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <LeadCaptureForm source="website_form" />
        </div>
      </section>
    </>
  );
}

/** Pull the first non-heading line of llms.txt as a short tagline, if any. */
function pickTagline(llmsTxt: string): string | undefined {
  const line = llmsTxt
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('-'));
  return line && line.length <= 160 ? line : undefined;
}
