# Site asset manifest

Centrally owned assets are consumed from `@nanisoft/prism-ui/assets` (`manifest.json`, 11 variants, budgets, 2× min-source rule, `validateRasterSize`). This file registers **application-owned content assets** only.

| Asset id | File | Category / Role | Variant | Intrinsic | Format | Budget | Status |
|---|---|---|---|---|---|---|---|
| `favicon-alphalens` | `app/icon.svg` | logo / brand-logo | `logo` (intrinsic) | 32×32 viewBox | svg | 50 KiB | **Exception** — fixed brand hex for browser chrome, per DS `favicon-icon-*` precedent (`themeRestrictions: fixed-brand-colors`). OG bitmap below uses the same mark. |
| `og-card` | generated PNG (1200×630) | image / content | `banner` ratio 3:1 (1200×630 ≈ 1.9:1 OG standard) | 1200×630 | png | 300 KiB | **Exception** — `next/og` `ImageResponse` bitmap; no cascade, tokens cannot resolve. Hex literals + inline styles are the renderer. |
| `mark-alphalens` | DS `AlphaLensMark` component | logo / brand-logo | `logo` | viewBox 32 | svg-component | 50 KiB | Central (DS manifest `mark-alphalens`). Replaces local `components/logo.tsx`. |
| `diagram-analyst-loop` | `components/AnalystLoop.tsx` | illustration / complex-diagram | `illustration` (asset-defined) | 1200×420 viewBox | svg-component | 50 KiB | Pending migration to `Diagram`/`DSIllustration` pipeline (GAP-08). Inline `style` (transform origin) removed in migration. |
| `figure-capture-path` | DS `PulseGraph` via `lib/content.ts` `HERO_FIGURE` | illustration / complex-diagram | `illustration` | 640×360 canvas (DS-owned) | svg-component | 50 KiB | Central (DS component). |

**No raster content images** are shipped (`public/` is empty except `.gitkeep`). Future product images must be registered here with intrinsic size, aspect ratio, format and min-source check (`ASSET001`–`ASSET014`), and consumed through `DSImage variant="…"`. User-uploaded/external images use `validateRasterSize` at runtime.

## Approved exceptions (mission §13)

| ID | Scope | Justification | Owner | Review |
|---|---|---|---|---|
| EX-OG-01 | `app/opengraph-image.tsx` inline `style` + hex literals + `<img src={MARK_URI}>` | `next/og` paints a bitmap; the token cascade does not run inside `ImageResponse`, so tokens would resolve to the neutral base and contradict the page. | Design System Governance | Next OG API change; review with Playwright visual baselines |
| EX-FAV-01 | `app/icon.svg` fixed hex | Browser chrome paints the favicon outside the cascade; DS marks the same shape `fixed-brand-colors`. | Design System Governance | Next icon convention change |
