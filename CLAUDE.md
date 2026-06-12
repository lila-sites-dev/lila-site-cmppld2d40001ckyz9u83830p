# Lila site — build agent conventions

This repo is one client's marketing site, generated from `lila-site-template`. You
(Claude Code, headless) build pages here from `lila:build` GitHub issues. Read these
rules before editing — the PR-open path-allowlist enforces most of them.

## What you may edit
- `content/services/<slug>.md` — service / intent pages (your main job).
- `content/home.md` — the brand-grounded **home page** (filed as `[lila:build] Home page`). `app/page.tsx` reads this file when present and falls back to a generic auto-composer when absent — your build replaces the generic default.
- `content/*.md` — other prose pages.
- `brand/feed.json` — refresh from `feed_get` when verified contact facts change.
- `public/img/*` — image assets resolved from `design_resolve_image` (Phase C).

## What you must NOT edit (the substrate)
- `app/**` — routes, layout, page composers. The renderer's contract is fixed.
- `app/globals.css` and `app/theme.generated.css` — the **design pass** owns
  visual tokens (palette, typography, radii). Editing these will be rejected
  by the path-allowlist gate before the PR even opens.
- `components/**` — section variant library.
- `lib/**`, `scripts/**`, `next.config.mjs`, `package.json`, `postcss.config.mjs`,
  `tsconfig.json`, `*.gitignore` — template substrate.
- `brand/design.json` — owned by the design pass, mirrored as verified
  `design.*` brand facts. Don't touch.

## What you must NOT assert
- Do not invent facts. Assert only what `brand_get_verified_facts` returns.
- No superlatives ("#1", "best", "top-rated"), no guarantees ("guaranteed",
  "100%", "risk-free"). The forbidden-claims gate will block the PR.
- Only use the verified business phone/email/address. A different one fails the gate.

## How pages render (typed sections, with a markdown fallback)

Pages are composed of typed sections declared in the markdown frontmatter:

```yaml
---
title: Salon Software
description: One-line meta description.
sections:
  - type: hero
    variant: split-image-right
    title: Salon Software That Keeps Up
    subtitle: One calm dashboard for bookings, memberships, and reports.
    eyebrow: For modern salons
    ctaText: Call +1 415 555 0100
    ctaHref: tel:+14155550100
    image: { src: /img/source/hero-salon.jpg, alt: Salon team }
  - type: services-grid
    variant: feature-cards
    heading: What's inside
    items:
      - title: Online booking
        body: Branded link, instant confirmations, no double-bookings.
        icon: "01"
      - title: Memberships
        body: Renewals run themselves; revenue compounds.
        icon: "02"
  - type: prose            # keeps any markdown body below the frontmatter
  - type: cta
    variant: centered-band
    title: Try DINGG with your salon
    ctaText: Call +1 415 555 0100
    ctaHref: tel:+14155550100
---
<optional markdown body — rendered by the prose section if you include one>
```

If you omit `sections:` entirely, the page composes a sane default
(`hero` → `prose` body → `cta`) using the variants picked in
`brand/design.json` — so older pages keep working unchanged. Prefer typed
sections going forward; they let the design pass control rhythm and density.

### Section catalog

Pick from the closed catalog below. Calling
`design_list_section_variants` returns the same list at runtime; treat that
as the source of truth.

| type            | variants                                                                   | notes |
|-----------------|----------------------------------------------------------------------------|-------|
| `hero`          | `centered-stacked`, `split-image-right`, `split-image-left`, `gradient-canvas` | use `image` for split variants; `gradient-canvas` is image-free (uses primary→accent gradient) |
| `services-grid` | `icon-cards`, `feature-cards`                                              | items: `{ title, body?, href?, icon? }` |
| `cta`           | `centered-band`, `split-with-form`                                         | `split-with-form` adds inline lead capture (posts to `/api/lila/inbound`); `formFields?: { name, label?, required? }[]` |
| `testimonials`  | `card-grid`, `single-quote-large`                                          | items: `{ quote, author, attribution?, rating? }` — `single-quote-large` uses only the first item |
| `prose`         | (no variants)                                                              | pass-through for markdown body |

## Internal linking — the MUST-include block

Every build issue body now ends with a **Required internal links** table. It
specifies the EXACT links the page must include — destination paths and
keyword-rich anchor text. Treat each row as mandatory.

The convention follows the Avenue Unisex Salon SEO map: every internal anchor
combines `<service>` + `<city>` (e.g. "hair colour Kharadi Pune"), every
service page links UP to the services hub and sideways to 2-3 siblings,
every page links to the booking CTA. This isn't decoration — it's how a
local-SEO site distributes authority, and the difference between ranking
and not ranking on "salon in <city>" queries.

When writing the page:

- Embed every link from the table inside body prose (in a `prose` section
  OR inside a `services-grid` item's `href`, OR an inline `cta` link).
- Use the anchor text **verbatim** — lowercase + keyword phrasing matters.
- Don't replace the booking anchor ("book your appointment now") with
  generic phrasing like "click here" or "contact us".
- Feel free to add MORE relevant links; the listed ones are the floor.

If no table appears (older tickets), fall back to: hub-link up, 2 sibling
service mentions, and the booking CTA — that's the minimum baseline.

## How to build a page (per issue)

1. `brand_get_verified_facts` + `brand_get_voice` for grounded facts + tone.
2. `design_get_theme` to read the approved palette/typography/section picks.
   Use the picks to choose your variants — don't invent new ones.
3. For each section needing imagery, call `design_resolve_image({ key })` (or
   `{ query }` for an ad-hoc lookup) and use the returned `src` — do not invent
   image paths or use external URLs. Resolution priority is source-site
   (`/img/source/...`) → Unsplash → null. When `src` is `null`, omit the
   `image` field on the section spec; the renderer drops in a
   `<GradientPlaceholder/>` automatically.
4. Write `content/services/<slug>.md` with typed `sections:` frontmatter (see above).
5. Self-check before committing: call `brand_check_claims` on your body text +
   every section field that contains prose. Fix every block-severity finding.
6. If facts changed, refresh `brand/feed.json` from `feed_get`.
7. Commit. Push branch `lila/build-<issue-number>`. The backend opens the PR
   after running the **path-allowlist** + **claim gate** server-side.

## Rebuild tickets (owner feedback)

A `[lila:rebuild]` issue means the owner reviewed a prior PR and asked for
changes. The issue body links the parent PR and quotes the owner's request.
Treat the **owner request as the entire brief** — apply exactly what they
asked for, nothing else.

- Read the parent PR's diff (`git fetch origin <parent-head>` then
  `git diff main..origin/<parent-head> -- content/ public/img/`) to know
  what shipped. Your rebuild branches off `main`, not off the parent head.
- Apply the owner request and only the owner request. Do not refactor
  unrelated content, do not "improve" copy that wasn't called out. Scope
  discipline is what makes the rebuild loop trustworthy.
- Branch as `lila/rebuild-<issue-number>` (not `lila/build-…`) so the
  scheduler + post-deploy diff stays unambiguous.
- Reference the parent PR number in your commit message and (when the
  backend opens the PR) it will appear in the PR description automatically
  via the issue body's parent-PR link.
- Path-allowlist + claim gate still apply — same rules, same enforcement.

## Post-deploy
The live page is validated (reachable, JSON-LD, indexable, lead capture,
grounded — the 6 checks). If a check fails, a fix issue is auto-filed; pick
it up and re-build using the same process.
