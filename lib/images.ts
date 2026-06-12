// Image resolver — build-time-safe lookup over a single design.json `imageCue`.
//
// The runner pre-resolves cues via the `design_resolve_image` MCP tool and
// writes `src`/`attribution` into the cue itself, so this resolver is a thin
// projection: cue → ImageRef (or null when nothing is resolvable yet).
//
// Priority order in the cue (canonical, mirrored by the MCP tool):
//   1. `src` already committed (source-site path under `/img/source/...` OR
//      a pre-resolved Unsplash CDN URL).
//   2. `source = 'unsplash'` AND a `query` — the runner is expected to have
//      hit `design_resolve_image` and persisted `src`, so this branch is
//      effectively "resolution pending" and we return null → placeholder.
//   3. Anything else → null → placeholder.
//
// Returning null is the caller's signal to render <GradientPlaceholder/> from
// _shared. The composer never throws on a missing cue.

import type { ImageRef } from '@/components/sections/types';

export interface ResolvedCue {
  /** Pre-resolved URL — relative path under /img/source/ OR external CDN URL. */
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Where the resolver looked. Auto = take whatever was committed. */
  source?: 'auto' | 'source-site' | 'unsplash' | 'placeholder';
  query?: string;
  attribution?: { text?: string; href?: string };
}

/** Reads a single committed cue. Pure: never network-fetches. */
export function resolveImage(cue: ResolvedCue | undefined): ImageRef | null {
  if (!cue) return null;
  if (cue.source === 'placeholder') return null;
  if (cue.src) {
    return {
      src: cue.src,
      alt: cue.alt ?? '',
      ...(cue.width  !== undefined ? { width:  cue.width  } : {}),
      ...(cue.height !== undefined ? { height: cue.height } : {}),
    };
  }
  return null;
}

/** Picks the cue for a section by its key (`hero`, `about`, etc.) from the
 *  design.json `imageCues` map. Tolerant of missing maps / keys. */
export function pickCue(
  imageCues: Record<string, ResolvedCue> | undefined | null,
  key: string,
): ResolvedCue | undefined {
  if (!imageCues) return undefined;
  return imageCues[key];
}

/** Convenience: cue lookup + resolve in one call. Returns `null` when the
 *  cue is missing or resolution is pending — caller falls back to placeholder. */
export function resolveByKey(
  imageCues: Record<string, ResolvedCue> | undefined | null,
  key: string,
): ImageRef | null {
  return resolveImage(pickCue(imageCues, key));
}
