import Link from 'next/link';
import type { HeroSpec } from '../types';
import { GradientPlaceholder } from '../_shared/GradientPlaceholder';

type Props = Omit<HeroSpec, 'type' | 'variant'>;

/** Split hero — image on the left, text on the right. Mirror of SplitImageRight;
 *  the variant choice gives the design pass a layout cue (photo-first vs.
 *  message-first) without changing typography or rhythm. */
export function HeroSplitImageLeft({ title, subtitle, eyebrow, ctaText, ctaHref, image }: Props) {
  return (
    <section className="bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid gap-10 md:gap-12 md:grid-cols-2 items-center">
        <div>
          <HeroImage image={image} />
        </div>
        <div>
          {eyebrow && (
            <p className="font-sans text-sm font-medium uppercase tracking-[0.18em] text-muted mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 font-sans text-lg leading-relaxed text-muted">
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
      </div>
    </section>
  );
}

function HeroImage({ image }: { image?: HeroSpec['image'] }) {
  if (image?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.src}
        alt={image.alt ?? ''}
        width={image.width ?? 720}
        height={image.height ?? 540}
        className="w-full h-auto rounded-card object-cover"
      />
    );
  }
  return <GradientPlaceholder aspect="wide" className="w-full" />;
}
