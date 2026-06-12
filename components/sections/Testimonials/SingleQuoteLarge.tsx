import type { TestimonialsSpec } from '../types';

type Props = Omit<TestimonialsSpec, 'type' | 'variant'>;

/** Hero-sized single quote. Uses the first item from `items` (others ignored).
 *  Good for landing pages where one anchor testimonial carries more weight than
 *  a grid of three. Falls back gracefully when `items` is empty (renders nothing). */
export function TestimonialsSingleQuoteLarge({ heading, items }: Props) {
  const t = items[0];
  if (!t) return null;
  return (
    <section className="bg-surface-alt text-ink">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24 text-center">
        {heading && (
          <p className="font-sans text-sm font-medium uppercase tracking-[0.18em] text-muted mb-6">
            {heading}
          </p>
        )}
        <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-8 font-sans text-base">
          <div className="font-semibold text-ink">{t.author}</div>
          {t.attribution && <div className="text-muted">{t.attribution}</div>}
        </figcaption>
      </div>
    </section>
  );
}
