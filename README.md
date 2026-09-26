# AlphaLens

> Quantitative trading research for the Indian market. The data layer first, the research design above it, and every claim labelled.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://alphalens.nanisoft.com (Custom Domain, auto-created on deploy)
- **Pack**: rose mode-switchable, beam-dark by default
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest · Cloudflare Workers
- **Chrome**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) 0.4.0 (SiteHeader / SiteFooter) — npm dependency, pinned exact, never copied into this repo

## What ships

- **Landing** (`/`) — "See the whole market, minute by minute": split hero with the option chain in an instrument panel, a status ticker beneath it, then six hairline-topped sections numbered 01–06 (what it captures · the data path as a conveyor rail · one feed for research · the research pipeline as a designed ledger · where it's going as a status ledger · Built on Nexus) and a closing CTA.
- **Docs** (`/docs`) — a section index of every page, then Introduction, Data platform (live), Unified data contract (approved), Research pipeline (designed), Research directions, Engineering story, Reference over `content/docs/` — 27 pages.
- **Blog** (`/blog`) — the four launch posts over `content/blog/` (folder-per-post, required date, drafts excluded).
- **About** (`/about`) — the product's story: why the data layer leads, and a dated fact list (collector live, Kubernetes, contract approval, .NET port phase 1).

Honesty devices are content, not chrome: every numbered landing section and every docs section carries its own tier, and the hero's canvas is labelled an illustrative rendering, not a live quote. The tiers are load-bearing — **live** (the collector, its storage, operations, the .NET 10 port Phase 1), **approved / designed** (the `data_feed_view` contract, the TradingAgents wiring, the k3s endgame), **research direction** (backtesting, discovery, validation). There is no backtester, discovery engine, validation harness, or product UI behind this site, and it publishes no results.

## Develop

```bash
pnpm install
pnpm bake      # pre-bake the Prism variable rulesets into app/antd-vars.css
pnpm dev       # bake + dev server
pnpm build     # bake + static export to out/
pnpm test
pnpm lint
```

Content lives under `content/docs` and `content/blog`; `lib/source.ts` is the only place the fumadocs collections are declared, the blog is folder-per-post with a required ISO `date`, optional `tags`, and `draft` (drafts never export), and each docs section's title and page order come from its own `meta.json`. `test/honesty.test.ts` is the guard — it walks `content/`, `lib/`, `components/` and `app/` from disk and fails the build on an overclaim, a personal-trading-framework term, a performance figure, or a link off the Nanisoft surfaces. fumadocs' loaders are compile-time macros and cannot run under vitest, so every content contract here reads files off disk.

## Deploy

Push to `main` → GitHub Actions builds and deploys the Worker (`alphalens-site`), an assets-only Worker serving `out/` behind the Custom Domain. Pull requests run CI (lint → test → build). `pnpm deploy` is the local lane, and needs wrangler auth.

## Status

Live at https://alphalens.nanisoft.com, serving a static export from the `alphalens-site` Worker. The data platform is the live part: the collector has captured the full NIFTY and BANKNIFTY option chain every market minute since 26 August 2026 and has run on Kubernetes since 8 September. The unified data contract is approved but not yet implemented; the TradingAgents wiring and the k3s endgame are designed, not built; backtesting, discovery and validation are research directions. The site is in active development and the labels move before the claims do.

The wayfinder map these sites were built from is retired and is no longer cited in this repo's documentation. The standing references are `CONSISTENCY.md` (the five-repo consistency contract) and `AGENTS.md` (this repo's scope, stack, and commands); the published docs are `content/docs/`.
