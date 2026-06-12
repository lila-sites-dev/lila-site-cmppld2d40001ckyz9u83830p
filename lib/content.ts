import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { SectionSpec } from '@/components/sections/types';

// Service pages are markdown files the build agent writes to content/services/<slug>.md.
// Frontmatter shape:
//   title: required
//   description: optional one-liner used in <meta description>
//   sections: optional SectionSpec[] — when present, the page renders these
//     instead of (or alongside) the markdown body. Backward-compat: pages
//     without `sections:` get a sensible default (hero + prose + cta) composed
//     at render time by the page composer using design.json.

const SERVICES_DIR  = join(process.cwd(), 'content', 'services');
const BLOG_DIR      = join(process.cwd(), 'content', 'blog');
const HOME_FILE     = join(process.cwd(), 'content', 'home.md');

// Single-instance landing pages live as `content/<slug>.md`. Each has a
// dedicated route (`app/<slug>/page.tsx`) that calls `getSpecialPage(slug)`
// here; the build agent writes the file when a `[lila:build] <Title>`
// ticket fires. Order matters — header/footer iterate this in declaration
// order for nav slots.
export const SPECIAL_PAGE_SLUGS = [
  'pricing',      // industry-aware: salon menu | SaaS tiers | general rates
  'about',        // about / team
  'gallery',      // before/after work shots
  'reviews',      // dedicated reviews / testimonials page
  'memberships',  // recurring revenue plans
  'offers',       // time-limited promos
  'gift-cards',   // purchase gift cards
  'contact',      // industry-aware: book appointment | demo | get in touch
  'privacy',      // privacy policy (required-by-law)
  'terms',        // terms / cancellation policy (required-by-law)
] as const;

export type SpecialPageSlug = (typeof SPECIAL_PAGE_SLUGS)[number];

export interface ServicePage {
  slug: string;
  title: string;
  description: string;
  /** Pre-parsed HTML for backward-compat markdown rendering via Prose. */
  html: string;
  markdown: string;
  /** Typed section specs from frontmatter. Empty when the page uses
   *  plain-markdown legacy format; the composer fills in defaults. */
  sections: SectionSpec[];
}

export async function listServiceSlugs(): Promise<string[]> {
  try {
    const files = await readdir(SERVICES_DIR);
    return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

/**
 * Optional home-page override. When `content/home.md` exists, its frontmatter
 * `sections:` array replaces the hard-coded auto-composition in `app/page.tsx`.
 * This is how Lila ships a personalized, brand-grounded home page instead of
 * the generic "name + tagline + service grid" default — the build agent writes
 * this file from a `[lila:build]` home-page ticket.
 *
 * Returns null when the file isn't present; callers fall back to auto-compose.
 */
export interface HomePage {
  title: string;
  description: string;
  html: string;
  markdown: string;
  sections: SectionSpec[];
}

export async function getHomePage(): Promise<HomePage | null> {
  return readSpecialPageFile(HOME_FILE);
}

/**
 * Read any single-instance landing page by slug. Returns null when the file
 * hasn't been built yet — callers (route components) should 404 in that
 * case, which is the explicit signal that the owner needs to file a build
 * ticket from the admin.
 *
 * The shape mirrors `getHomePage`: typed `sections:` frontmatter drives
 * rendering; markdown body is preserved for backwards-compat readers.
 */
export async function getSpecialPage(slug: SpecialPageSlug): Promise<HomePage | null> {
  return readSpecialPageFile(join(process.cwd(), 'content', `${slug}.md`));
}

/** Backwards-compat alias for callers that still use the old name. */
export const getPricingPage = () => getSpecialPage('pricing');
export const getContactPage = () => getSpecialPage('contact');

/** Existence probe — used by SiteHeader/SiteFooter to conditionally show
 *  nav links only when the corresponding page has actually been built. */
export async function specialPageExistsBySlug(slug: SpecialPageSlug): Promise<boolean> {
  try {
    await readFile(join(process.cwd(), 'content', `${slug}.md`), 'utf8');
    return true;
  } catch { return false; }
}

async function readSpecialPageFile(path: string): Promise<HomePage | null> {
  try {
    const raw = await readFile(path, 'utf8');
    const { data, content } = matter(raw);
    const html = await marked.parse(content);
    return {
      title:       typeof data.title       === 'string' ? data.title       : '',
      description: typeof data.description === 'string' ? data.description : '',
      html,
      markdown: content,
      sections: Array.isArray(data.sections) ? (data.sections as SectionSpec[]) : [],
    };
  } catch {
    return null;
  }
}

// ─── Blog posts ───────────────────────────────────────────────────────────
//
// Blog content lives at `content/blog/<slug>.md`. Each post has frontmatter
// title/description/publishedAt/targetService — the last drives the
// blog→service internal-link funnel (Avenue map's "Blog → Service" link
// type). The agent ships posts via `[lila:build] Blog: <title>` tickets.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO timestamp from frontmatter — used for sort order on the index. */
  publishedAt: string | null;
  /** Target service slug — the post's conversion funnel destination. */
  targetService: string | null;
  /** Pre-parsed HTML body for the prose section. */
  html: string;
  markdown: string;
  /** Typed sections from frontmatter (if the agent emits them). Empty when
   *  the post is plain prose. */
  sections: SectionSpec[];
}

export async function listBlogSlugs(): Promise<string[]> {
  try {
    const files = await readdir(BLOG_DIR);
    return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const raw = await readFile(join(BLOG_DIR, `${slug}.md`), 'utf8');
    const { data, content } = matter(raw);
    const html = await marked.parse(content);
    return {
      slug,
      title:         typeof data.title         === 'string' ? data.title         : slug,
      description:   typeof data.description   === 'string' ? data.description   : '',
      publishedAt:   typeof data.publishedAt   === 'string' ? data.publishedAt   : null,
      targetService: typeof data.targetService === 'string' ? data.targetService : null,
      html,
      markdown: content,
      sections: Array.isArray(data.sections) ? (data.sections as SectionSpec[]) : [],
    };
  } catch {
    return null;
  }
}

export async function getServicePage(slug: string): Promise<ServicePage | null> {
  try {
    const raw = await readFile(join(SERVICES_DIR, `${slug}.md`), 'utf8');
    const { data, content } = matter(raw);
    const html = await marked.parse(content);
    return {
      slug,
      title: typeof data.title === 'string' ? data.title : slug,
      description: typeof data.description === 'string' ? data.description : '',
      html,
      markdown: content,
      sections: Array.isArray(data.sections) ? (data.sections as SectionSpec[]) : [],
    };
  } catch {
    return null;
  }
}
