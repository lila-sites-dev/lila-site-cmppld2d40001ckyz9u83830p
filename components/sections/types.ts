// Discriminated-union shapes for everything the page composer can render.
//
// `SectionSpec` is the on-page contract: pages declare a `sections:` array in
// frontmatter (or default to `design.json.sections.default`), and the composer
// dispatches each entry by `{type, variant}` through `renderSection`. The build
// agent picks variants from a closed catalog (see `design_list_section_variants`
// MCP tool) — no free-form CSS. The Prose type is the backward-compat escape
// hatch for plain markdown bodies.

export interface ImageRef {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ServiceItem {
  title: string;
  body?: string;
  href?: string;
  /** Optional icon hint for icon-card variants (Lucide icon name or emoji). */
  icon?: string;
}

export interface HeroSpec {
  type: 'hero';
  variant: 'centered-stacked' | 'split-image-right' | 'split-image-left' | 'gradient-canvas';
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  image?: ImageRef;
  eyebrow?: string;
}

export interface ServicesGridSpec {
  type: 'services-grid';
  variant: 'icon-cards' | 'feature-cards';
  heading?: string;
  subheading?: string;
  items: ServiceItem[];
}

export interface CtaSpec {
  type: 'cta';
  variant: 'centered-band' | 'split-with-form';
  title: string;
  body?: string;
  ctaText?: string;
  ctaHref?: string;
  /** Lead-capture form fields shown alongside the body for the split-with-form
   *  variant. Submissions POST to /api/lila/inbound by default (siteId comes
   *  from a hidden field the template injects at build time). */
  formFields?: Array<{
    name: 'name' | 'phone' | 'email' | 'message';
    label?: string;
    required?: boolean;
  }>;
}

export interface ProseSpec {
  type: 'prose';
  html: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  /** Reviewer's title / business / city — shown as the muted second line. */
  attribution?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface TestimonialsSpec {
  type: 'testimonials';
  variant: 'card-grid' | 'single-quote-large';
  heading?: string;
  subheading?: string;
  items: TestimonialItem[];
}

export type SectionSpec = HeroSpec | ServicesGridSpec | CtaSpec | ProseSpec | TestimonialsSpec;
