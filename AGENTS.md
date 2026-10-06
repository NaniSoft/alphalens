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
- A pack boundary is an attribute on an element: it repoints that pack's colour **and** its corner radius beneath it, and it wears the mode of the nearest ancestor carrying `.dark`. On this site that is `ProductMark`, and the only region of a page that carries one is the platform product rows. The family's five marks are in the bar's menu, and a closed menu paints no mark, so the built export has none of them.
- The bar is `@nanisoft/prism-ui/blocks/site-navbar` and this site supplies it data and copy only: `lib/bar.ts` holds the destinations, the family and every sentence the controls can say. Every `href` in `lib/site.json` is absolute, including this site's own, because the menu opens each row in a new tab.

## This site draws no client boundary

There is no `'use client'` line in this repository's source, and `test/no-hidden-state.test.ts`
asserts it. It used to have exactly one, `components/RevealRoot.tsx`, and it existed for
the scroll reveal: a marked element hidden until a class was added when it scrolled into
view. Measured on the built export of all thirty-six pages, `data-reveal` appears as an
attribute **zero** times, so the family's only hydration boundary, an inlined arming script
with a `load` listener, four rules in this site's own sheet including a scoped `opacity: 0`,
and `test/no-scripting.test.tsx` were all observing an empty `NodeList`. All of it is gone,
with the reasoning that was worth keeping recorded at the top of `test/no-hidden-state.test.ts`
rather than in a component that no longer exists.

The bar's own controls are a client island, and it is inside `@nanisoft/prism-ui` rather
than in this tree: the family menu, the search dialog, the light and dark control and the
panel below the bar's threshold. So the JavaScript a reader downloads is the design
system's, and nothing in this repository adds to it. `test/site-chrome.test.tsx` renders the
landing, the About page and the 404 and asserts the bar is on all three.

The `hidden-state` gate still runs and now reports that it passed **vacuously**, which is
a real answer rather than a scan of nothing: the run prints the rule count it read, so the
difference between "there is no hidden state" and "nothing was read" is visible on every run.
If Prism ever ships a Block-level entrance, the argument about escapable states and about
why a `load` listener beats a `setTimeout` belongs there, in the design system, where the
gate can see every consumer at once.

## The chrome

`components/SiteChrome.tsx` composes the bar, the `<main>` and the footer, and every
page renders it with the route it is serving, because a root layout is not told its own
pathname and a bar that cannot be told cannot mark the reader's place. That is a server
render reading its own route, not a client boundary, and it is why the layout's own
comment claiming the mark was impossible is gone rather than contradicted.

## What is enforced, and where the words live

The laws are not in this file. They are the failure messages of the gates in
`@nanisoft/prism-ui/gates`, run by `pnpm check`, so a fix to one reaches this site
in one release and cannot be declined here. The four repositories that run them
share the programs and hold none of the wording.

This site's own halves are in `prism-gates.json`: its sheets and its coverage floors, and
nothing else. It names no destination its own corpus gets wrong, because it no longer gets
one wrong, and it names no arming attribute, because this site ships no hidden state. A
line there that stated a rule would be the defect the file exists to end. When a build
fails, the law's text is in the failing message: read that rather than looking for a rule
here.

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
