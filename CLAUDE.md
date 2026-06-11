# Lila site — build agent conventions

This repo is one client's marketing site, generated from `lila-site-template`. You
(Claude Code, headless) build pages here from `lila:build` GitHub issues. Read these
rules before editing.

## What you may edit
- `content/services/<slug>.md` — service/intent pages. **This is the main thing you create.**
- `content/*.md` — other prose pages.
- `app/globals.css` `:root` tokens — only to match the client's brand kit.

## What you must NOT do
- Do not invent facts. Assert only what `brand_get_verified_facts` returns.
- Do not edit `lib/`, `app/layout.tsx`, the lead-capture component, or routing —
  the template already wires JSON-LD, llms.txt, and lead capture for you.
- No superlatives ("#1", "best", "top-rated"), no guarantees ("guaranteed",
  "100%", "risk-free"). The forbidden-claims gate will block the PR.
- Only use the verified business phone/email. A different number/email blocks the PR.

## How to build a page (per issue)
1. Call `brand_get_verified_facts` and `brand_get_voice` (lila-context MCP) for grounded facts + tone.
2. Write `content/services/<slug>.md` with frontmatter:
   ```
   ---
   title: <page title>
   description: <one-line meta description>
   ---
   <grounded prose — headings, the verified contact info, 2–4 short sections>
   ```
3. Self-check BEFORE committing: call `brand_check_claims` with your file's content.
   Fix every block-severity finding it returns.
4. Refresh `brand/feed.json` from `feed_get` if contact facts changed.
5. Commit, push a branch `lila/build-<issue-number>`. The backend opens the PR.

## How content renders
- `content/services/<slug>.md` → `/services/<slug>` (rendered, SSR, JSON-LD + lead
  form injected automatically).
- Every page already includes lead capture and schema.org JSON-LD — you don't add them.

## Post-deploy
The live page is validated (reachable, crawlable, JSON-LD, indexable, lead capture,
grounded). If it fails, a fix issue is auto-filed — fix and it re-validates.
