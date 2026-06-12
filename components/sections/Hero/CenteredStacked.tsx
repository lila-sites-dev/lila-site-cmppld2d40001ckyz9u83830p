import Link from 'next/link';
import type { HeroSpec } from '../types';

type Props = Omit<HeroSpec, 'type' | 'variant'>;

/** Calm centered hero — title, optional subtitle, single CTA. Tuned for
 *  service / category landing pages where copy is the message. */
export function HeroCenteredStacked({ title, subtitle, eyebrow, ctaText, ctaHref }: Props) {
  return (
    <section className="bg-surface text-ink">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28 text-center">
        {eyebrow && (
          <p className="font-sans text-sm font-medium uppercase tracking-[0.18em] text-muted mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 font-sans text-lg sm:text-xl leading-relaxed text-muted max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && ctaHref && (
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center bg-primary text-on-primary font-sans font-semibold text-base px-7 py-3.5 rounded-card hover:opacity-90 transition-opacity"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
