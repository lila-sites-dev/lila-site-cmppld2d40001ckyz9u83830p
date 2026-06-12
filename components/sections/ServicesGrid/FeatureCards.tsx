import Link from 'next/link';
import type { ServicesGridSpec } from '../types';

type Props = Omit<ServicesGridSpec, 'type' | 'variant'>;

/** Larger feature-card grid — wider cards, more breathing room, accent-bordered
 *  on hover. Best for 3-6 flagship services where each deserves a fuller pitch. */
export function ServicesGridFeatureCards({ heading, subheading, items }: Props) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        {heading && (
          <header className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-3 font-sans text-base sm:text-lg text-muted">{subheading}</p>
            )}
          </header>
        )}
        <ul className="grid gap-6 md:grid-cols-2 list-none p-0 m-0">
          {items.map((it, i) => {
            const card = (
              <div className="h-full bg-surface-alt border border-line rounded-card p-8 transition-colors hover:border-primary">
                {it.icon && (
                  <div
                    className="font-display font-bold text-2xl mb-5 text-primary"
                    aria-hidden="true"
                  >
                    {it.icon}
                  </div>
                )}
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-3 tracking-tight">
                  {it.title}
                </h3>
                {it.body && (
                  <p className="font-sans text-base text-muted leading-relaxed">{it.body}</p>
                )}
                {it.href && (
                  <p className="mt-5 font-sans text-sm font-semibold text-primary">
                    Learn more →
                  </p>
                )}
              </div>
            );
            return (
              <li key={`${it.title}-${i}`}>
                {it.href ? (
                  <Link href={it.href} className="block h-full no-underline">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
