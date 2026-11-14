# Zero-Custom-UI / Zero-Custom-Styling — Inventory (Phase 1)

This document is the initial repository assessment required by the mission §1, written against `@nanisoft/prism-ui` **1.7.0**. The pin moved to **1.8.0** with the Prism 1.8 adoption (Ground01, the positioner z layer, the `site-main` slot contract, gate kit generation 2); the facts below were assessed at 1.7.0 and the version rows carry the move. The application owns business logic, data, routing and domain composition; all visual presentation is owned by the design system.

> **Scope decision (user):** delete all application CSS and use DS primitives exclusively. The previously governed `app/globals.css` site sheet is removed in Phase 7. Layout-only `className` on DS components (e.g. `size-full`, `mb-12`) remains the DS API and is not custom CSS.

## 1.1 Design-system dependency (§2)

| Fact | Evidence |
|---|---|
| Package | `@nanisoft/prism-ui` (components/blocks/pages/theming/assets/gates) |
| Version | `1.8.0` exact pin in `package.json` (moved from the assessed `1.7.0` with the Prism 1.8 adoption); `pnpm-lock.yaml` resolves `1.8.0`; `@nanisoft/prism-tokens` `1.8.0` via `prism-ui` dependency (not a direct dep) |
| Entry points | `app/layout.tsx`: `import '@nanisoft/prism-ui/styles.css'` (only permitted stylesheet entry) |
| Import rule | Subpath imports only (`/blocks/*`, `/components/*`, `/pages/*`, `/theming`). No private `dist/` or `src/` paths. Verified in `app/`, `components/`, `lib/` |
| Competing UI deps | None. Direct deps: `next`, `react`, `react-dom`, `fumadocs-core`, `fumadocs-mdx`, `zod`. No Bootstrap, no styled-components/emotion/jss, no Tailwind config in this repo (Tailwind is inside the DS build) |

**Upgrade:** at assessment, already at latest `1.7.0`; the Prism 1.8 adoption moved the pin to `1.8.0` in one change with the surface moves it enabled. `pnpm install --frozen-lockfile` verifies. No `^` range; pin exact per DS policy.

## 1.2 Current violations inventory (before migration)

### Stylesheet files (§3, UI001)
- `app/globals.css` (711 lines) — the only app stylesheet. Contains:
  - `:root` custom props `--site-mono`, `--site-border`, `--site-hairline-strong`
  - `body` document-column rule (DS base is layered; this sheet is unlayered so it wins)
  - ~30 site classes: `site-main`, `site-mono`, `site-caption`, `site-logo*`, `site-panel-logo`, `site-product-mark`, `site-footer-about`, `site-status*`, `site-display`, `site-sources/site-source*`, `site-tiers`, `site-hero`, `site-cta-row`, `site-docs-*`, `site-status-note*`, `site-catalog*`, `site-blog-list*`, `site-empty`, `site-note*`
  - `@media` at `40rem`, `64rem`, `640px` (custom breakpoints; `640px` duplicates `40rem`)
- `app/layout.tsx` imports both DS stylesheet and the site sheet.

### JSX styling (§3, UI002–UI004, UI006–UI012)
| Location | Finding | Gate |
|---|---|---|
| `components/AnalystLoop.tsx:66` | `style={{ transformOrigin: '1070px 300px' }}` on pulsing circle | UI002 UI010 ASSET010 |
| `app/opengraph-image.tsx` (11 style props) | `ImageResponse` bitmap renderer: hex literals + inline flex/font styles. **Not page UI** — `next/og` paints a bitmap with no cascade. Approved exception, see §1.5 | UI002 exception |
| `components/MarketSurface.tsx` | Raw utilities: `flex`, `grid grid-cols-12`, `text-[11px]`, `bg-primary`, `font-mono text-mono` | UI004 UI011 |
| `components/CaptureCalendar.tsx` | Raw utilities: `grid gap-6 sm:grid-cols-2 lg:grid-cols-4`, `grid-cols-7`, `size-6`, `ring-*`, `text-[10px]`, `border-primary/30` transparencies | UI004 UI011 UI012 |
| `components/AnalystLoop.tsx` | `hidden h-auto w-full sm:block`, `fill-*`, `text-border`, `fill-muted-foreground`, mobile `sm:hidden` list | UI004 UI011 |
| `components/Landing.tsx` | `border-border mt-3 border-t pt-3`, `w-full min-w-0` on `PulseGraph`, `mb-12` on `SectionHeading`, `prism-text-spectrum` | UI004 UI008 |
| `app/about/page.tsx` | `site-display` + `site-cta-row` | UI012 |
| `components/logo.tsx` | Custom SVG component (`AlphaLensLogo`) duplicating DS `AlphaLensMark` | UI012 ASSET008 |
| `components/AnalystLoop.tsx` SVG | Inline `<svg viewBox 1200x420>` diagram (nodes/edges/reflector pulse) | ASSET007 ASSET008 |
| `app/icon.svg`, `components/logo.tsx` svg, `opengraph-image.tsx` `MARK_SVG` | SVG sources; favicon hardcodes gold-pack hex for chrome | ASSET007 ASSET008 ASSET009 |
| `lib/mdx-components.tsx` (`Note`), `components/DocsIndex.tsx`, `app/blog` index | Site components with site classes instead of DS `Alert` / `ContentGrid01` / `DSGrid`+`Card` | UI012 UI005 |

### Colours / typography / fonts (§5, §9)
- No hardcoded hex in page UI (all `var(--*)` tokens in `globals.css`; components use token utilities like `text-muted-foreground`, `bg-primary`).
- Hardcoded hex only in `app/opengraph-image.tsx` (`#1a1815` etc.) and `app/icon.svg` (`#F0EBEC`, `#EDC47D`, `#FFEAC7`) — both bitmap/chrome surfaces with no cascade. Governed as exceptions.
- No custom font declarations, no `next/font`, no external font imports. Typeface is DS Inter (`@font-face` in `styles.css`, `--font-sans`/`--font-mono` tokens). `globals.css` aliases `--site-mono: var(--font-mono)` (UI006).
- Theme: `data-pack="gold"` ground on `<html>` via `lib/site.ts` `themeAttributes`, `dark` default mode, `PrismThemeScript` before paint. Light/dark both supported. No local theme variables beyond the three `--site-*` aliases.

### Layout / responsive (§10, UI011)
- Custom grids: `site-sources` 4→2→1, `site-docs-index__grid` 2→1, `site-blog-list` single column, hero split.
- Custom widths/padding: `site-catalog` `max-width: 72rem`, `site-footer-about` `max-width: 46ch`, `site-status-band` padding, `site-cta-row` margin.
- Breakpoints: `40rem` (= Tailwind `sm`), `64rem` (= Tailwind `lg`), `640px` (= `40rem` duplicate).

### Images / assets (§6–§8, ASSET*)
- No raster images in `public/` (only `.gitkeep`). No `<img>` in page code except `opengraph-image.tsx` `<img src={MARK_URI}>` (bitmap renderer).
- `@nanisoft/prism-ui/assets` manifest defines 11 variants (`hero`, `wide-hero`, `banner`, `card`, `landscape-thumb`, `square-thumb`, `avatar`, `product`, `logo`, `illustration`, `icon`), budgets, aspect ratios, min-source rules. No app assets are currently registered; `app/icon.svg` and the OG `MARK_SVG` are unregistered.
- No `DSImage`/`DSLogo`/`DSAvatar`/`DSIllustration`/`DSVideo`/`DSMediaCard` usage yet — no media surfaces need them except OG/favicons (bitmap/chrome exceptions).

### Tests / CI (§12, §14)
- Vitest + jsdom + Testing Library (13 test files). Tests assert the site sheet (borders, focus, hidden-state, honesty) — they will be migrated with the sheet.
- `scripts/check-both-modes.mjs` (Chrome CDP, both modes, borders+focus) — not in CI, no browser on runner.
- `.github/workflows/ci.yml`: `verify` (lint, test, build, `pnpm check`) → `deploy` needs `verify`. No Playwright, no visual regression, no `ui:check`.

## 1.3 Migration map (Phase 2)

| Site construct | DS equivalent | Notes |
|---|---|---|
| `AlphaLensLogo` (local) | `AlphaLensMark` from `@nanisoft/prism-ui/components/product-marks` (+ `ProductMark` slot) | Identical geometry; DS version uses `prism-mark__*` token classes |
| `site-product-mark` sizing | DS layout `className="block size-full"` on the mark (layout-only, emitted utility) | Same surgery as DS itself applies to `product-mark-drawn` |
| `site-main` flex growth | DS gap: no document-layout primitive ships body flex. **File DS enhancement** (see `docs/DS_GAPS.md`). Short pages lose sticky footer until DS ships it | DS `styles.css` already ships `.site-main` stacking context |
| `site-footer-about` / tagline | `Text`/`Heading` (typography) inside `SiteFooter about` slot; `.site-footer-tagline` already ships in DS | Keep tagline string; drop width rule |
| `site-status-*` band | `Section size="compact"` + `Status` (`tone="info"`) | Status carries words, never colour alone |
| `site-display` | `SectionHeading as="h1"` (DS heading scale `text-5xl sm:text-6xl`) | Identical step to the deleted site rule |
| `site-sources` survey | `DSGrid columns={4}` + `Card`/`CardHeader`/`CardTitle`/`CardDescription` + `Status` (`success`/`neutral`) | Dashed-border state becomes the status words; shape redundancy retained in prose |
| `site-tiers` left-align | DS gap: `LogoStrip01` centres. Drop override, accept centre. **File DS enhancement** for left-aligned variant | Behaviour change documented |
| `site-hero` panel withdrawal | Drop override. `Hero01` splits/stacks via DS breakpoint; instrument stays visible and stacks under copy on phone | DS owns responsive; legibility gap filed |
| `site-cta-row` | `DSStack` horizontal? DSStack is column-only → use `DSGrid columns={2}`? Cta row is 2 links in a row with wrap. DS gap: no horizontal stack. Compose with `DSGrid`? See Phase 4 | File DS gap if needed |
| `site-docs-index__*` + `site-status-note` | `Section` + `Heading` + `DSGrid columns={2}` + `Card` (link-wrapped) + `Alert` for status note | Grouped sections preserved |
| `site-note` (MDX) | `Alert` + `AlertTitle` (status word) + `AlertDescription` | Corpus `<Note status>` vocabulary preserved as words |
| `site-catalog*` / `site-blog-list*` | `ContentGrid01` `variant="rows"` (or `cards`) + `EmptyState01` for empty | Post frontmatter (title/desc/tags/date) maps to entry fields; tags as `category` |
| `site-caption`, `site-mono`, `site-empty` | `Text tone="muted"` / `Text` mono semantics via DS type scale | No machine-type override |
| `MarketSurface` | `DSStack` + `DSGrid` + `Card`/`Text`; tick strip uses DS `PulseSeries`/`Sparkline` concept → replace 12-span strip with DS `PulseSeries` or keep as `DSGrid columns={4}`? Market ticks are domain geometry (12) → file DS gap or use `DSGrid` capped at 4 by grouping | Content words unchanged |
| `CaptureCalendar` | `DSStack` + `DSGrid`; 7-col weekday grid exceeds `DSGrid` (1–4) → DS gap. Use `DSGrid columns={2}` for months, month grid as domain list with DS `Text`/`Card` | Dates are published facts, unchanged |
| `AnalystLoop` SVG diagram | `Diagram` component (DS) if API fits, else registered complex asset via `DSIllustration` pipeline | Remove inline `style` (pulse origin); use DS ambient pulse without transform hack |
| `PulseGraph` wrapper div | `DSStack` + `Separator` | `w-full min-w-0` is DS layout class, retained as `className` |
| OG card (`opengraph-image.tsx`) | **Exception** — bitmap renderer, inline styles + hex are the only way to paint. Registered as approved exception with owner/expiry | UI002/ASSET001 exemption, not page UI |
| `app/icon.svg` | **Exception** — fixed-colour chrome favicon per DS manifest `favicon-icon-*` precedent (`themeRestrictions: fixed-brand-colors`) | Registered in site asset manifest |

## 1.4 Phase tracker

- [x] Phase 1 inventory (this file)
- [x] Phase 2 mapping (§1.3 above)
- [x] Phase 3 replace custom components with DS equivalents (`AlphaLensMark`, `Alert`, `Diagram`, `ContentGrid01`, `FactList`, `Status`)
- [x] Phase 4 migrate layouts/responsive to DS primitives (`DSStack`, `DSGrid`, `Card`, `Section`, `Separator`)
- [x] Phase 5 migrate theme/typography to tokens & `Text`/`Heading`/`Prose` (gold ground, dark default; no local vars)
- [x] Phase 6 migrate images/icons/SVG/fonts to DS asset components + manifest (`lib/assets.json`, `docs/ASSET_MANIFEST.md`, `DSImage`/`Diagram` contracts)
- [x] Phase 7 remove `app/globals.css` and the import in `app/layout.tsx` (0 stylesheets; `prism-gates.json` sheets `[]`)
- [x] Phase 8 static analysis + asset validation (`pnpm ui:check`, fixtures, 0 findings + 2 waivers EX-OG-01/EX-FAV-01)
- [x] Phase 9 runtime + visual regression (Playwright 8 projects = 4 viewports × 2 modes, 40 tests passing, baselines in `e2e/visual-baselines/`)
- [x] Phase 10 mandatory CI (`.github/workflows/ci.yml` verify: lint, typecheck, `ui:check`+fixtures, test, build, `check`, Playwright; `deploy` needs `verify`; branch protection: make `verify` required)

## Definition of done (mission §18) — verified

1. No custom UI stylesheets — 0 `.css` in `app/components/lib`; only `@nanisoft/prism-ui/styles.css`.
2. No inline styles — `ui:check` UI002 zero (OG bitmap waived EX-OG-01).
3. All visual components from the DS — `DSStack/DSGrid/Card/Alert/Status/Diagram/ContentGrid01/AlphaLensMark/*01` Blocks; no `components/logo.tsx` svg left.
4. Colours/typography from DS themes/tokens — `Text/Heading/Prose`, `Status`, brand-ink/muted via DS; no hex outside waivers.
5. Icons from the DS registry — `DSIcon`/`AlphaLensMark` via DS; no `lucide-react` import, no local icon.
6. Images via DS asset components — no raw `<img>` in page code; `DSImage` contract enforced (ASSET001/002/012); OG/favicon waived per manifest.
7. App assets pass manifest — `lib/assets.json` + DS manifest (11 variants, budgets, 2× resolution).
8. Responsive from DS — `DSGrid`/`DSStack` breakpoints (`sm`/`lg`); custom `@media` deleted.
9. No competing styling deps — `package.json` has no tailwind/bootstrap/styled/emotion (tonly DS).
10. All automated checks pass — `lint`, `typecheck`, `test` (83), `build` (41 routes), `check` (prism + routes + `ui:check`), `ui:runtime` (40).
11. Negative fixtures prove rejection — `test/fixtures/ui-violations/` (UI001/UI002/UI003/UI004/UI005/ASSET001) + positive control.
12. Production build works independently of DS source — `pnpm install --frozen-lockfile` + `next build` against the published pin only (`1.8.0` since the Prism 1.8 adoption).

After every phase verify functionality: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm check` (routes + prism gates).
