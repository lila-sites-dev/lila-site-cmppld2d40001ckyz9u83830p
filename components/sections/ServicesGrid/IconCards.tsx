import Link from 'next/link';
import type { ServicesGridSpec } from '../types';

type Props = Omit<ServicesGridSpec, 'type' | 'variant'>;

/** Compact icon-card grid — best for 4-9 services where each is briefly
 *  describable. Each card optionally links to its `/services/<slug>` page. */
export function ServicesGridIconCards({ heading, subheading, items }: Props) {
  return (
    <section className="bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {heading && (
          <header className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-3 font-sans text-base sm:text-lg text-muted">{subheading}</p>
            )}
          </header>
        )}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
          {items.map((it, i) => {
            const card = (
              <div className="h-full bg-surface border border-line rounded-card p-6 transition-shadow hover:shadow-md">
                {it.icon && (
                  <div
                    className="inline-flex items-center justify-center w-10 h-10 rounded-card bg-primary text-on-primary font-display font-semibold mb-4 text-lg"
                    aria-hidden="true"
                  >
                    {it.icon}
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold text-ink mb-2">{it.title}</h3>
                {it.body && <p className="font-sans text-sm text-muted leading-relaxed">{it.body}</p>}
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
