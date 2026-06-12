// Renders a SectionSpec by dispatching {type, variant}. Pages compose by
// iterating frontmatter.sections (or the design.json default order) and calling
// renderSection on each entry. Unknown variants fall through to a safe fallback
// (the first variant for the type) so a stale design.json never breaks a build.

import type { ReactNode } from 'react';
import type { SectionSpec, HeroSpec, ServicesGridSpec, CtaSpec, ProseSpec, TestimonialsSpec } from './types';
import { HeroCenteredStacked } from './Hero/CenteredStacked';
import { HeroSplitImageRight } from './Hero/SplitImageRight';
import { HeroSplitImageLeft } from './Hero/SplitImageLeft';
import { HeroGradientCanvas } from './Hero/GradientCanvas';
import { ServicesGridIconCards } from './ServicesGrid/IconCards';
import { ServicesGridFeatureCards } from './ServicesGrid/FeatureCards';
import { CtaCenteredBand } from './CTA/CenteredBand';
import { CtaSplitWithForm } from './CTA/SplitWithForm';
import { TestimonialsCardGrid } from './Testimonials/CardGrid';
import { TestimonialsSingleQuoteLarge } from './Testimonials/SingleQuoteLarge';
import { Prose } from './Prose/Prose';

function renderHero(spec: HeroSpec): ReactNode {
  const { type: _t, variant, ...rest } = spec;
  switch (variant) {
    case 'split-image-right': return <HeroSplitImageRight {...rest} />;
    case 'split-image-left':  return <HeroSplitImageLeft  {...rest} />;
    case 'gradient-canvas':   return <HeroGradientCanvas  {...rest} />;
    case 'centered-stacked':
    default:                  return <HeroCenteredStacked {...rest} />;
  }
}

function renderServicesGrid(spec: ServicesGridSpec): ReactNode {
  const { type: _t, variant, ...rest } = spec;
  switch (variant) {
    case 'feature-cards': return <ServicesGridFeatureCards {...rest} />;
    case 'icon-cards':
    default:              return <ServicesGridIconCards   {...rest} />;
  }
}

function renderCta(spec: CtaSpec): ReactNode {
  const { type: _t, variant, ...rest } = spec;
  switch (variant) {
    case 'split-with-form': return <CtaSplitWithForm {...rest} />;
    case 'centered-band':
    default:                return <CtaCenteredBand  {...rest} />;
  }
}

function renderTestimonials(spec: TestimonialsSpec): ReactNode {
  const { type: _t, variant, ...rest } = spec;
  switch (variant) {
    case 'single-quote-large': return <TestimonialsSingleQuoteLarge {...rest} />;
    case 'card-grid':
    default:                   return <TestimonialsCardGrid        {...rest} />;
  }
}

function renderProse(spec: ProseSpec): ReactNode {
  return <Prose html={spec.html} />;
}

export function renderSection(spec: SectionSpec): ReactNode {
  switch (spec.type) {
    case 'hero':          return renderHero(spec);
    case 'services-grid': return renderServicesGrid(spec);
    case 'cta':           return renderCta(spec);
    case 'testimonials':  return renderTestimonials(spec);
    case 'prose':         return renderProse(spec);
  }
}

/** Catalog used by the design pass + the design_list_section_variants
 *  MCP tool. Edits here flow through to both the LLM picker and the admin
 *  "Regenerate variants" UI — keep the strings stable. */
export const SECTION_CATALOG = {
  hero: [
    { variant: 'centered-stacked',  label: 'Centered, message-first',    notes: 'calm, copy-led; works without an image' },
    { variant: 'split-image-right', label: 'Split, image right',          notes: 'classic SaaS; product or storefront photo' },
    { variant: 'split-image-left',  label: 'Split, image left',           notes: 'mirror of above; gives a different rhythm' },
    { variant: 'gradient-canvas',   label: 'Brand-gradient canvas',       notes: 'image-free; uses primary→accent gradient' },
  ],
  'services-grid': [
    { variant: 'icon-cards',    label: 'Compact icon cards',  notes: '4–9 services, short body' },
    { variant: 'feature-cards', label: 'Larger feature cards', notes: '3–6 flagship services, longer body' },
  ],
  cta: [
    { variant: 'centered-band',   label: 'Full-width primary band', notes: 'standard end-of-page conversion' },
    { variant: 'split-with-form', label: 'Split copy + lead form',  notes: 'inline lead capture; posts to /api/lila/inbound' },
  ],
  testimonials: [
    { variant: 'card-grid',          label: '3-up card grid',  notes: 'social proof from multiple voices' },
    { variant: 'single-quote-large', label: 'Single hero quote', notes: 'one anchor testimonial; uses first item' },
  ],
} as const;
