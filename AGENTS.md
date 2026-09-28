# AGENTS.md — AlphaLens

## Project

**alphalens.nanisoft.com** — AlphaLens, quantitative trading research for the Indian market. Landing + full docs + blog, in the blush pack.

Part of the five-site Nanisoft web platform (www + nexus + atlas + alphalens + prism), one design language: [Prism](https://prism.nanisoft.com).

## The one rule

Compose from the design system's catalogue. There is no local component and no local override path: a section this site needs and the catalogue does not have is a finding to report, not a component to write.

- Items come from their own subpath, never the root barrel: `@nanisoft/prism-ui/blocks/<item>`, `/components/<item>`, `/pages/<page>`, and `/theming` for the pack and mode vocabulary.
- `@nanisoft/prism-ui/styles.css` is imported once, in the root layout, before this site's own sheet. It carries every token, every utility and every base rule.
- A Block takes data and content as props. If one cannot express something, the answer is upstream.
- A consumer cannot write a Prism utility class: the consumer does not run Tailwind, so a utility exists in the emitted sheet only if a Prism component already uses it. Anything this site needs for itself goes in `app/globals.css` as a site class.

## Theming

Two attributes on `<html>`, and nothing else: `data-pack` for the ground and `class="dark"` for the mode, both from `lib/site.ts`. A blocking `PrismThemeScript` in `<head>` applies a stored choice to them before first paint. There is no provider, no baked stylesheet and no pack class. A page is correct with scripting disabled.

**This site has one client component, and the other three sites have none.** `components/RevealRoot.tsx` exists because gate 3 below is a law here and not elsewhere: a CSS-authored hidden state needs an exit, and the exit is a class added when a marked element scrolls into view and withdrawn on every path including `load`. The other three sites ship no hidden state, so they have nothing to exit and no runtime to exit it with. The sentence "no client runtime" is true of the company site, Atlas and Nexus and **false here**, which is why it does not appear in this file. A shared instruction block that states a law is the defect, and a shared block that claims a runtime this site has is a law stated wrongly.

The reveal root is the only `'use client'` line in the tree, and `check:hidden-state` fails if a second one appears, because a second one is a second writer of a state the first one owns.

A pack boundary is an attribute on an element: it repoints that pack's colour **and** its corner radius beneath it, and it wears the mode of the nearest ancestor carrying `.dark`. So a boundary belongs on a fully rounded mark and nowhere else. On this site that is `ProductMark`, and the only regions that carry one are the header's switcher and the platform product rows.

## The three laws this repository enforces rather than describes

Each is a program in `scripts/`, and each is run by `pnpm check` in CI.

1. **No trace of the retired line.** `check:antd` reads the manifest, the lockfile as a dependency graph, every import, and every document, and fails on a dependency, an import, the generated variablesheet, its generator, the old theming symbols or a living instruction.
2. **The site's stylesheet competes with nothing the design system declares.** `check:stylesheet` fails on a bare-element declaration of one of seven properties, on any `:focus` rule, and on a `color-mix()` that takes a `var()` as an operand. The reason each is a failure is in the script's own header, and the failures it prevents are real and measured.
3. **A CSS-authored hidden state is escapable, and its exit is not a clock.** `check:hidden-state` fails on an unarmed hidden state, on an animation clock, on a missing `(scripting: none)` guard, on a second writer of the arming attribute, and on a missing `load` exit. `test/no-scripting.test.tsx` renders the landing with scripting off and asserts the content is there.

A fourth gate, `check:routes`, exists because this repository has one published document that is deliberately unreachable, and the reason has to live where the route inventory is read rather than in a comment somebody deletes.

## Wayfinding

This file is this repository's own instructions. `README.md` is what the site is and how it is built and deployed. `CONSISTENCY.md` is the cross-repository law, and the pinned package version is its version.

## Stack

- Next 16 static export (`output: 'export'`) at the repo root — flat single-app, no workspace.
- pnpm + TypeScript strict + oxlint + Vitest (jsdom + Testing Library).
- Deploys: push to main → GitHub Actions runs the checks and then the deploy (`wrangler deploy`) with the org-level Cloudflare secrets. The deploy is a job that needs the checks, so a push that fails cannot deploy.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — static export to `out/`
- `pnpm lint` / `pnpm typecheck` / `pnpm test`
- `pnpm check` — the five gates (see README); run it after `pnpm build`
- `pnpm deploy` — build + wrangler deploy (local wrangler auth)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
