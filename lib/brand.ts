import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// The AI Feed produced from VERIFIED Brand Memory (feed_get on the lila-context MCP).
// The build agent refreshes brand/feed.json; pages render JSON-LD + contact from it.
export interface BrandFeed {
  llmsTxt: string;
  jsonLd: Record<string, unknown>;
}

const EMPTY: BrandFeed = { llmsTxt: '', jsonLd: {} };

export async function getBrandFeed(): Promise<BrandFeed> {
  try {
    const raw = await readFile(join(process.cwd(), 'brand', 'feed.json'), 'utf8');
    const parsed = JSON.parse(raw) as Partial<BrandFeed>;
    return { llmsTxt: parsed.llmsTxt ?? '', jsonLd: parsed.jsonLd ?? {} };
  } catch {
    return EMPTY;
  }
}

/** Best-effort business name from the JSON-LD (used for titles / headers). */
export function businessName(feed: BrandFeed): string {
  const n = (feed.jsonLd as { name?: unknown }).name;
  return typeof n === 'string' && n.length > 0 ? n : 'Our Business';
}

/** Best-effort phone for tel: links (lead capture). */
export function businessPhone(feed: BrandFeed): string | null {
  const p = (feed.jsonLd as { telephone?: unknown }).telephone;
  return typeof p === 'string' && p.length > 0 ? p : null;
}
