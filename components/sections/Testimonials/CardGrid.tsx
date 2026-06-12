import type { TestimonialsSpec } from '../types';

type Props = Omit<TestimonialsSpec, 'type' | 'variant'>;

const STAR = '★';
const EMPTY = '☆';

function stars(rating?: number): string {
  const r = rating && rating > 0 ? Math.min(5, rating) : 5;
  return STAR.repeat(r) + EMPTY.repeat(5 - r);
}

/** Three-up testimonial card grid. Each card is a quote + author + optional
 *  attribution line + star rating. Collapses to one column on small screens. */
export function TestimonialsCardGrid({ heading, subheading, items }: Props) {
  return (
    <section className="bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {(heading || subheading) && (
          <div className="text-center mb-10 max-w-2xl mx-auto">
            {heading && (
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-3 font-sans text-base sm:text-lg leading-relaxed text-muted">
                {subheading}
              </p>
            )}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <figure
              key={i}
              className="rounded-card border border-rule bg-surface-alt p-6 flex flex-col"
            >
              <div className="font-sans text-sm tracking-wide text-primary mb-2" aria-label={`${t.rating ?? 5} star rating`}>
                {stars(t.rating)}
              </div>
              <blockquote className="font-sans text-base leading-relaxed text-ink flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 font-sans text-sm">
                <div className="font-semibold text-ink">{t.author}</div>
                {t.attribution && (
                  <div className="text-muted">{t.attribution}</div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
