import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import { getSpecialPage, type SpecialPageSlug } from '@/lib/content';
import { renderSection } from '@/components/sections/registry';
import { LeadCaptureForm } from '@/app/components/LeadCaptureForm';

/**
 * Shared composer for every single-instance landing page (pricing, about,
 * gallery, reviews, etc.). Each `app/<slug>/page.tsx` is a one-liner that
 * delegates here.
 *
 * The conversion form is appended at the bottom of EVERY special page so
 * visitors can convert without an extra hop — `appendForm={false}` opts out
 * for pages where the form would feel pushy (e.g. privacy / terms).
 */
export async function SpecialPage({
  slug,
  appendForm = true,
}: {
  slug: SpecialPageSlug;
  appendForm?: boolean;
}) {
  const page = await getSpecialPage(slug);
  if (!page || page.sections.length === 0) {
    notFound();
  }
  return (
    <>
      {page.sections.map((spec, i) => (
        <Fragment key={i}>{renderSection(spec)}</Fragment>
      ))}
      {appendForm && (
        <section id="book" className="bg-surface-alt">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <LeadCaptureForm source={`${slug}_form`} />
          </div>
        </section>
      )}
    </>
  );
}
