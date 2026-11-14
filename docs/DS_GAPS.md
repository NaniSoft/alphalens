# Design-system enhancement requests (no local workarounds)

When a visual requirement cannot be fulfilled with the published `@nanisoft/prism-ui` package (1.8.0 since the Prism 1.8 adoption; the ledger was opened against 1.7.0), the capability is requested centrally. Local styling workarounds are not introduced.

| # | Capability | Where needed | Request |
|---|---|---|---|
| GAP-01 | Document column / sticky footer (`body flex column; main flex 1`) | `SiteChrome` — short pages (`/404`) | Ship a document-layout contract (e.g. `site-main` flex growth, or a `PageLayout`/`ApplicationShell` light variant for marketing chrome). Consumers cannot express body flex without a site sheet. Still open at Prism 1.8: measured on the built export at 1920x1080, the 404 page's footer stops 306px above the viewport bottom because the footer's own height, not the document column, carries the short page. |
| GAP-02 | Left-aligned `LogoStrip01` variant | Landing honesty strip (5 sentence-length items) | Add `align` prop to `LogoStrip01` (`center` default). Centred ragged wrap is a layout accident for status sentences. |
| GAP-03 | `DSGrid` beyond 4 columns (7 weekday, 12 tick) | `CaptureCalendar`, `MarketSurface` | Add `columns` 7/12 or a domain-grid escape hatch. Count-bounded grids cannot express calendars/schedules. |
| GAP-04 | Horizontal stack primitive for CTA rows | `/about` closing pair, hero actions | `DSStack` is column-only. Ship a row variant or document `CtaLink` row composition. |
| GAP-05 | Survey tile with per-item state (live vs approved dashed border) | Landing §03 eight sources | `StackGrid01` has name/role only. A state-carrying survey grid (status word + shape state) is the catalogue gap already filed in `Landing.tsx`. |
| GAP-06 | Instrument withdrawal on narrow screens | ~~Landing hero panel~~ **Resolved by replacement, not by withdrawal.** | The illegible drawing this gap was filed against (the retired open-interest profile, 7px stage names at 390px) was replaced by the capture-path rail in `InstrumentPanel01`, which is measured in the design system's own type scale. Measured on the built export at 390px: stage names 13px, field rows 14px, panel header labels 12px. Nothing needs to withdraw, so the `hideInstrumentBelow` request is withdrawn with the drawing. |
| GAP-07 | Blog/docs index as catalogue Block | `/blog`, `/docs` indexes | `ContentGrid01` covers dated entries; a grouped documentation index (sections + cards) may need a dedicated Block if `DSGrid`+`Card` composition is insufficient. |
| GAP-08 | Complex diagram asset pipeline | `AnalystLoop`, hero `PulseGraph` | Register `complex-diagram` role assets through `DSIllustration`/`Diagram` with SVG sanitisation, per DS `assets` manifest contract. |

Each gap has no local workaround in this migration: the site renders the DS default and names the gap here.
