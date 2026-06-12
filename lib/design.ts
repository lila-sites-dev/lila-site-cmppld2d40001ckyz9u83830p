import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SectionSpec } from '@/components/sections/types';

// Persisted at brand/design.json by the design pass (backend `lilaDesignPass`).
// The CSS-vars side (palette + typography) is read at build-time by
// scripts/applyDesign.mjs; this loader exposes the rest (section variant picks,
// image cues, rationale) to the page composers at runtime.
export interface DesignJson {
  version?: number;
  source?: 'logo' | 'color-picker' | 'crawled-site';
  /** Section-variant picks per page kind. Phase A only consumes the type+variant
   *  shape; Phase C will extend with seed props (eyebrow, default ctaText, etc.). */
  sections?: {
    home?:    Array<{ type: SectionSpec['type']; variant?: string }>;
    default?: Array<{ type: SectionSpec['type']; variant?: string }>;
  };
  /** Free-form image cues consumed by Phase C's image resolver. */
  imageCues?: Record<string, { query?: string; source?: string; key?: string }>;
  /** LLM-generated explanation shown in the admin preview UI. */
  rationale?: string;
}

const EMPTY: DesignJson = {};

export async function getDesignJson(): Promise<DesignJson> {
  try {
    const raw = await readFile(join(process.cwd(), 'brand', 'design.json'), 'utf8');
    return JSON.parse(raw) as DesignJson;
  } catch {
    return EMPTY;
  }
}

/** Looks up the chosen variant for a given page kind + section type. Returns
 *  undefined when no design.json is present (caller picks a safe default). */
export function pickVariant(
  design: DesignJson,
  pageKind: 'home' | 'default',
  sectionType: SectionSpec['type'],
): string | undefined {
  const list = design.sections?.[pageKind];
  return list?.find((s) => s.type === sectionType)?.variant;
}
