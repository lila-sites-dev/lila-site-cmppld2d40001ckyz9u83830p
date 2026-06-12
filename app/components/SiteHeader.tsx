import Link from 'next/link';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { getBrandFeed, businessName, businessPhone } from '@/lib/brand';
import { listServiceSlugs, getServicePage, specialPageExistsBySlug, type SpecialPageSlug } from '@/lib/content';

/**
 * Which special pages the HEADER advertises and in what order. Pricing
 * + About are visible; Reviews / Gallery / Memberships / Offers / Gift
 * cards / Contact get the footer slot since the header would overflow on
 * mobile if we listed everything.
 *
 * Legal pages (privacy, terms) are footer-only by convention.
 */
const HEADER_NAV: { slug: SpecialPageSlug; label: string }[] = [
  { slug: 'pricing',     label: 'Pricing' },
  { slug: 'about',       label: 'About' },
  { slug: 'gallery',     label: 'Gallery' },
  { slug: 'reviews',     label: 'Reviews' },
];

/** Does `/public/logo.<ext>` exist on disk? Cheap server-side check, run
 *  once per render. The owner uploads via the admin's BrandImagesPanel; the
 *  backend commits the file and writes the `brand.logoPath` fact. */
async function findLogoPath(): Promise<string | null> {
  for (const ext of ['png', 'jpg', 'webp', 'svg']) {
    try {
      await access(join(process.cwd(), 'public', `logo.${ext}`));
      return `/logo.${ext}`;
    } catch { /* try next ext */ }
  }
  return null;
}

/** Has a given single-instance landing page been built? Drives conditional
 *  nav: we only show the /pricing link in the header when content/pricing.md
 *  has actually been committed. Avoids broken-link footguns. */
async function specialPageExists(file: string): Promise<boolean> {
  try {
    await access(join(process.cwd(), 'content', file));
    return true;
  } catch {
    return false;
  }
}

/**
 * Sticky site header — logo + brand name + nav + primary CTA.
 *
 * What it shows:
 *   - Brand mark (logo image when `public/logo.png` is uploaded by the owner,
 *     otherwise a styled monogram of the business initials so the spot
 *     doesn't feel empty on day one)
 *   - Business name in the display font
 *   - Inline nav of up to 5 built service pages (auto-discovered from
 *     `content/services/`) so the chrome reflects whatever Lila has actually
 *     built — no hand-maintained menu
 *   - A primary CTA (`Call <phone>` when verified, falls back to "Book a demo")
 *
 * The header is intentionally Server Component-only (no `'use client'`):
 * everything it needs is read from disk at build time, no interactivity.
 */
export async function SiteHeader() {
  const [feed, slugs, logoPath, headerNavPresence, hasContact] = await Promise.all([
    getBrandFeed(),
    listServiceSlugs(),
    findLogoPath(),
    Promise.all(HEADER_NAV.map(async (n) => ({ ...n, exists: await specialPageExistsBySlug(n.slug) }))),
    specialPageExistsBySlug('contact'),
  ]);
  const name  = businessName(feed);
  const phone = businessPhone(feed);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L';

  // The header has limited width — cap services + special-page links combined
  // to ~5 items total. Services win when there are few special pages; we
  // reduce service count as more special pages exist.
  const specialLinks = headerNavPresence.filter((n) => n.exists);
  const serviceCap = Math.max(1, 5 - specialLinks.length);
  const navItems = (
    await Promise.all(slugs.slice(0, serviceCap).map(async (slug) => {
      const page = await getServicePage(slug);
      return page ? { slug, title: page.title } : null;
    }))
  ).filter((p): p is { slug: string; title: string } => !!p);

  // CTA priority: phone (universal, works for salons + B2B) > /contact page >
  // home-form anchor. The /contact page itself frames the form per industry
  // (salon = "Book an appointment", SaaS = "Book a demo", etc.), so we keep
  // the HEADER copy neutral.
  const ctaText = phone ? `Call ${phone}` : 'Get in touch';
  const ctaHref = phone
    ? `tel:${phone.replace(/\s/g, '')}`
    : hasContact ? '/contact' : '/#book';

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur bg-surface/85 border-b"
      style={{ borderColor: 'var(--brand-border)' }}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* Brand mark — uses the uploaded logo when present (the admin's
              BrandImagesPanel + backend commitOwnerImage path commits one to
              /public/logo.<ext>); falls back to a gradient monogram so the
              header never looks unfinished on a fresh site. */}
          {logoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPath}
              alt={`${name} logo`}
              width={32}
              height={32}
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
            />
          ) : (
            <span
              aria-hidden
              className="grid place-items-center font-display font-semibold text-on-primary"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                fontSize: 14, letterSpacing: '-0.02em',
              }}
            >
              {initials}
            </span>
          )}
          <span className="font-display font-semibold text-ink tracking-tight">{name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 ml-2">
          {navItems.map((n) => (
            <Link
              key={n.slug}
              href={`/services/${n.slug}`}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {n.title}
            </Link>
          ))}
          {specialLinks.map((n) => (
            <Link
              key={n.slug}
              href={`/${n.slug}`}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href={ctaHref}
          className="ml-auto inline-flex items-center justify-center font-sans font-semibold text-sm bg-primary text-on-primary px-4 h-10 rounded-lg hover:opacity-90 transition-opacity"
        >
          {ctaText}
        </Link>
      </div>
    </header>
  );
}
