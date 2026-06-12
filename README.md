# lila-site-template

Next.js (App Router) template for Lila-hosted client sites. Each client's
`lila-site-<id>` repo is generated from this template by the backend's GitHub App
(`createRepoFromTemplate`).

What's baked in:
- **Lead capture** on every page (`app/components/LeadCaptureForm.tsx`) → posts to
  `NEXT_PUBLIC_LILA_INBOUND_URL` with `source: lila:website_form`.
- **schema.org JSON-LD** + **/llms.txt** generated from verified Brand Memory
  (`brand/feed.json`, produced by the lila-context MCP `feed_get`).
- **Markdown service pages** at `content/services/<slug>.md` → `/services/<slug>`.

The autonomous build agent only edits `content/**` and `brand/feed.json` — see
`CLAUDE.md`.

## Local dev
```bash
npm install
NEXT_PUBLIC_LILA_INBOUND_URL=http://localhost:5001/api/lila/inbound npm run dev
```

## Deploy
Vercel (per-client project, custom domain). Set at build time:
- `NEXT_PUBLIC_LILA_INBOUND_URL` — the platform lead-inbound endpoint (`…/api/lila/inbound`).
- `NEXT_PUBLIC_LILA_SITE_ID` — this site's `Site.id` (so the lead form is attributed).

## Loop-close: post-deploy validation
`.github/workflows/lila-deploy-validate.yml` closes the build loop. On a successful
**production** deploy (Vercel emits a GitHub `deployment_status`), it POSTs the changed
service page URL(s) to the backend's `POST /api/mcp/deploy-callback`, which runs the live
checks (reachable, SSR, JSON-LD, indexable, lead capture, grounded). If a page fails, the
backend auto-files a `lila:build` fix issue that re-enters the build loop.

Setup (once, org-wide on the `lila-sites` org, or per repo) — add Actions **secrets**:
- `LILA_BACKEND_URL` — public backend base URL (must be reachable from GitHub-hosted
  runners; `localhost` won't work — validate locally with a manual `curl` instead).
- `RUNNER_MASTER_KEY` — the same value the backend uses (authes the callback).

Also connect the org to Vercel so `lila-site-*` repos auto-deploy on merge. If your Vercel
production deploys use an environment label other than `Production`, adjust the `if:` filter
in the workflow.
