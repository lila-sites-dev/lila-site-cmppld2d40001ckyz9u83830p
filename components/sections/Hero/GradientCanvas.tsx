import Link from 'next/link';
import type { HeroSpec } from '../types';

type Props = Omit<HeroSpec, 'type' | 'variant'>;

/** Image-free hero — uses an angular gradient of brand-primary into brand-accent
 *  as the canvas. Use when no source-site imagery is available and the
 *  Unsplash fallback would look generic. Text floats over the gradient using
 *  the pre-computed `--brand-on-primary` so contrast always holds.
 *
 *  Layered subtle radial highlight + grain keeps the canvas from feeling flat
 *  without committing to a custom background image. */
export function HeroGradientCanvas({ title, subtitle, eyebrow, ctaText, ctaHref }: Props) {
  return (
    <section
      className="relative overflow-hidden text-on-primary"
      style={{
        background:
          'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(60% 80% at 25% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6 py-24 sm:py-32 text-center">
        {eyebrow && (
          <p className="font-sans text-sm font-medium uppercase tracking-[0.18em] opacity-80 mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 font-sans text-lg sm:text-xl leading-relaxed opacity-90 max-w-2xl mx-auto">
            {subtitle}
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
