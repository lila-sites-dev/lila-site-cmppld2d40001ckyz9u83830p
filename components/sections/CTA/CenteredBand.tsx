import Link from 'next/link';
import type { CtaSpec } from '../types';

type Props = Omit<CtaSpec, 'type' | 'variant'>;

/** Full-width primary band — the page's last conversion surface before the
 *  lead form. Uses the brand primary as the band background; text uses the
 *  pre-computed `--brand-on-primary` so WCAG contrast holds at every palette. */
export function CtaCenteredBand({ title, body, ctaText, ctaHref }: Props) {
  return (
    <section className="bg-primary text-on-primary">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          {title}
        </h2>
        {body && (
          <p className="mt-4 font-sans text-base sm:text-lg opacity-90 leading-relaxed">
            {body}
          </p>
        )}
        {ctaText && ctaHref && (
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center bg-surface text-ink font-sans font-semibold text-base px-7 py-3.5 rounded-card hover:opacity-90 transition-opacity"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
