import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Service pages are markdown files the build agent writes to content/services/<slug>.md.
// Frontmatter: `title`, optional `description`. Body is grounded prose (gated by the
// forbidden-claims scanner before the PR opens).
const SERVICES_DIR = join(process.cwd(), 'content', 'services');

export interface ServicePage {
  slug: string;
  title: string;
  description: string;
  html: string;
  markdown: string;
}

export async function listServiceSlugs(): Promise<string[]> {
  try {
    const files = await readdir(SERVICES_DIR);
    return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
  } catch {
    return [];
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
    };
  } catch {
    return null;
  }
}
