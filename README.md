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
Vercel (per-client project, custom domain). Set `NEXT_PUBLIC_LILA_INBOUND_URL` to the
platform inbound endpoint at build time.
