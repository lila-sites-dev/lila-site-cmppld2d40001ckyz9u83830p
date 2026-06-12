import type { ProseSpec } from '../types';

type Props = Omit<ProseSpec, 'type'>;

/** Backwards-compat wrapper that renders pre-built markdown HTML inside the
 *  themed prose styles. Used as the default body section when a page declares
 *  no `sections:` frontmatter array — preserves the old single-blob markdown UX
 *  while the build agent migrates to typed sections. */
export function Prose({ html }: Props) {
  return (
    <section className="bg-surface text-ink">
      <article
        className="mx-auto max-w-3xl px-6 py-14 prose-base font-sans text-ink prose-body"
        // Markdown body is already gated by brand_check_claims before commit.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
