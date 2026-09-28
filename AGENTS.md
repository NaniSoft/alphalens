# AGENTS.md — AlphaLens

## Project

**alphalens.nanisoft.com** — AlphaLens, quantitative trading research for the Indian market. Landing + full docs + blog, in the blush pack.

Part of the five-site Nanisoft web platform (www + nexus + atlas + alphalens + prism), one design language: [Prism](https://prism.nanisoft.com).

## How to build here

- Items come from their own subpath, never the root barrel: `@nanisoft/prism-ui/blocks/<item>`, `/components/<item>`, `/pages/<page>`, and `/theming` for the pack and mode vocabulary.
- `@nanisoft/prism-ui/styles.css` is imported once, in the root layout, before this site's own sheet. It carries every token, every utility and every base rule.
- A Block takes data and content as props.
- A consumer cannot write a Prism utility class: the consumer does not run Tailwind, so a utility exists in the emitted sheet only if a Prism component already uses it. Anything this site needs for itself goes in `app/globals.css` as a site class.
- Two attributes on `<html>`, from `lib/site.ts`: `data-pack` for the ground and `class="dark"` for the mode. A blocking `PrismThemeScript` in `<head>` applies a stored choice before first paint.
- A pack boundary is an attribute on an element: it repoints that pack's colour **and** its corner radius beneath it, and it wears the mode of the nearest ancestor carrying `.dark`. On this site that is `ProductMark`, and the only regions that carry one are the header's switcher and the platform product rows.

## This site's one client component

`components/RevealRoot.tsx` is the only `'use client'` line in the tree, and it
exists because this site authors the one CSS-authored hidden state in the family: a
marked element is hidden until a class is added when it scrolls into view, and the
class is withdrawn on every path including `load`. `test/no-scripting.test.tsx`
renders the landing with scripting off and asserts the content is there, because the
stylesheet half alone would be satisfied by a sheet that hides nothing and a page that
hides everything.

The other three sites ship no hidden state, so they have nothing to exit and no
runtime to exit it with, which is why the sentence "no client runtime" appears in
their instructions and not in this one.

## What is enforced, and where the words live

The laws are not in this file. They are the failure messages of the gates in
`@nanisoft/prism-ui/gates`, run by `pnpm check`, so a fix to one reaches this site
in one release and cannot be declined here. The four repositories that run them
share the programs and hold none of the wording.

This site's own halves are in `prism-gates.json`: its sheets, its coverage floors,
the one destination its corpus gets wrong with the reason, and the attribute and
module names the hidden-state law works in. When a build fails, the law's text is in
the failing message: read that rather than looking for a rule here.

`check:routes` is this repository's own, not the kit's: it exists because one
published document here is deliberately unreachable, and the reason has to live where
the route inventory is read rather than in a comment somebody deletes.

## Wayfinding

This file is this repository's own instructions. `README.md` is what the site is
and how it is built and deployed. `prism-gates.json` is this site's half of the
cross-repository contract, and it holds only what this site knows.

## Stack

- Next 16 static export (`output: 'export'`) at the repo root — flat single-app, no workspace.
- pnpm + TypeScript strict + oxlint + Vitest (jsdom + Testing Library).
- Deploys: push to main → GitHub Actions runs the checks and then the deploy (`wrangler deploy`) with the org-level Cloudflare secrets. The deploy is a job that needs the checks, so a push that fails cannot deploy.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — static export to `out/`
- `pnpm lint` / `pnpm typecheck` / `pnpm test`
- `pnpm check` — the routes gate and the consumer gate kit (see README); run it after `pnpm build`, because the kit reads the built export
- `pnpm deploy` — build + wrangler deploy (local wrangler auth)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
