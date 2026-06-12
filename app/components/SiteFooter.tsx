import Link from 'next/link';
import { getBrandFeed, businessName, businessPhone } from '@/lib/brand';
import {
  listServiceSlugs,
  getServicePage,
  specialPageExistsBySlug,
  type SpecialPageSlug,
} from '@/lib/content';

/**
 * Site-wide footer — four columns: brand identity, explore (services +
 * special pages), contact, legal. Each section is conditional on whether
 * the underlying content exists. No hand-maintained sitemap; we read disk.
 */

// Explore column — special pages that aren't already in the contact-info
// column. Order is the menu order a visitor would expect.
const EXPLORE_LINKS: { slug: SpecialPageSlug; label: string }[] = [
  { slug: 'pricing',     label: 'Pricing' },
  { slug: 'about',       label: 'About' },
  { slug: 'gallery',     label: 'Gallery' },
  { slug: 'reviews',     label: 'Reviews' },
  { slug: 'memberships', label: 'Memberships' },
  { slug: 'offers',      label: 'Offers' },
  { slug: 'gift-cards',  label: 'Gift cards' },
  { slug: 'contact',     label: 'Contact' },
];

const LEGAL_LINKS: { slug: SpecialPageSlug; label: string }[] = [
  { slug: 'privacy', label: 'Privacy policy' },
  { slug: 'terms',   label: 'Terms' },
];

export async function SiteFooter() {
  const [feed, slugs, explorePresence, legalPresence] = await Promise.all([
    getBrandFeed(),
    listServiceSlugs(),
    Promise.all(EXPLORE_LINKS.map(async (n) => ({ ...n, exists: await specialPageExistsBySlug(n.slug) }))),
    Promise.all(LEGAL_LINKS.map(async   (n) => ({ ...n, exists: await specialPageExistsBySlug(n.slug) }))),
  ]);
  const name  = businessName(feed);
  const phone = businessPhone(feed);
  const email = (feed.jsonLd as { email?: string }).email ?? null;
  const address = (feed.jsonLd as { address?: { streetAddress?: string; addressLocality?: string; addressRegion?: string; postalCode?: string } }).address ?? null;
  const year = new Date().getFullYear();

  const services = (
    await Promise.all(slugs.map(async (slug) => {
      const page = await getServicePage(slug);
      return page ? { slug, title: page.title } : null;
    }))
  ).filter((p): p is { slug: string; title: string } => !!p);

  const exploreLinks = explorePresence.filter((n) => n.exists);
  const legalLinks   = legalPresence.filter((n) => n.exists);

  return (
    <footer
      className="border-t mt-24 bg-surface-alt"
      style={{ borderColor: 'var(--brand-border)' }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="font-display font-semibold text-ink text-lg tracking-tight">{name}</div>
          {feed.llmsTxt && (
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-sm">
              {firstSentence(feed.llmsTxt)}
            </p>
          )}
        </div>

        <div>
          <div className="font-sans text-xs uppercase tracking-[0.16em] text-muted mb-4">
            Explore
          </div>
          <ul className="space-y-2.5">
            <li>
              <Link href="/" className="text-sm text-ink hover:text-primary transition-colors">Home</Link>
            </li>
            {exploreLinks.map((n) => (
              <li key={n.slug}>
                <Link href={`/${n.slug}`} className="text-sm text-ink hover:text-primary transition-colors">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {services.length > 0 && (
          <div>
            <div className="font-sans text-xs uppercase tracking-[0.16em] text-muted mb-4">
              Services
            </div>
            <ul className="space-y-2.5">
              {services.slice(0, 10).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-sm text-ink hover:text-primary transition-colors"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="font-sans text-xs uppercase tracking-[0.16em] text-muted mb-4">
            Contact
          </div>
          <ul className="space-y-2.5 text-sm text-ink">
            {phone && (
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                  {email}
                </a>
              </li>
            )}
            {address && (address.streetAddress || address.addressLocality) && (
              <li className="text-muted">
                {[address.streetAddress, address.addressLocality, address.addressRegion, address.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </li>
            )}
          </ul>

          {legalLinks.length > 0 && (
            <>
              <div className="font-sans text-xs uppercase tracking-[0.16em] text-muted mt-8 mb-4">
                Legal
              </div>
              <ul className="space-y-2.5">
                {legalLinks.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/${n.slug}`} className="text-sm text-muted hover:text-primary transition-colors">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div
        className="border-t"
        style={{ borderColor: 'var(--brand-border)' }}
      >
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-muted">© {year} {name}. All rights reserved.</div>
          <div className="text-xs text-muted">Built with Lila</div>
        </div>
      </div>
    </footer>
  );
}

/** Trims llms.txt to its first sentence (or 160 chars) for the footer blurb. */
function firstSentence(llmsTxt: string): string | null {
  const line = llmsTxt
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('-'));
  if (!line) return null;
  const stop = line.search(/[.!?]\s/);
  const out = stop > 40 ? line.slice(0, stop + 1) : line;
  return out.length > 200 ? out.slice(0, 197) + '…' : out;
}
