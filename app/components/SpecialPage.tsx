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
 * Rendering rules:
 *   - Page missing on disk → 404 (the canonical "owner hasn't built this yet"
 *     signal — the admin's my-site surface picks it up as 'missing').
 *   - Page present + `sections:` typed frontmatter → render the typed
 *     section composition via renderSection.
 *   - Page present but NO sections (agent wrote inline `<style>` + HTML
 *     body, or a simple markdown body) → render a sensible default: title
 *     hero + the page's HTML body. This honours the template's CLAUDE.md
 *     contract ("if you omit sections, the page composes a sane default")
 *     which was previously unimplemented — every body-only page 404'd, even
 *     though the file existed on disk and had real content.
 *
 * The conversion form is appended at the bottom of EVERY rendered page so
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
  if (!page) notFound();

  return (
    <>
      {page.sections.length > 0 ? (
        page.sections.map((spec, i) => (
          <Fragment key={i}>{renderSection(spec)}</Fragment>
        ))
      ) : (
        <>
          <section className="bg-surface">
            <div className="mx-auto max-w-3xl px-6 pt-16 pb-8 text-center">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-ink">
                {page.title}
              </h1>
              {page.description && (
                <p className="mt-4 text-lg text-ink-soft">{page.description}</p>
              )}
            </div>
          </section>
          {page.html && (
            <section className="bg-surface">
              <div
                className="mx-auto max-w-3xl px-6 pb-16"
                dangerouslySetInnerHTML={{ __html: page.html }}
              />
            </section>
          )}
        </>
      )}
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
