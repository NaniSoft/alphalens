---
name: AlphaLens (alphalens.nanisoft.com)
description: Quantitative trading research for the Indian market, drawn as instruments on a gold ground: the whole market bent to one focal point.
colors:
  beam: "#edc47d"
  on-beam: "#231600"
  beam-day: "#d2a24b"
  ground: "#1a1815"
  ground-day: "#efece9"
  ink: "#efece9"
  ink-day: "#302d29"
  muted-ink: "#cecac4"
  muted-ink-day: "#5e5a54"
  wash: "#583d00"
  wash-day: "#ffeac7"
  focal: "#ffeac7"
  hairline: "#45423c"
  hairline-day: "#e1ddd9"
  glass-card: "rgba(239, 236, 233, 0.07)"
  rail-glass: "rgba(69, 66, 60, 0.88)"
  brand-ink: "#f9d9a4"
  brand-ink-day: "#775300"
  ray-cyan: "#7fdaf0"
  ray-mint: "#9ddcad"
  ray-gold: "#edc47d"
  ray-sky: "#9bd1ff"
typography:
  display:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
  heading:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.625rem"
    letterSpacing: "0.1em"
rounded:
  xs: "0.125rem"
  sm: "0.6rem"
  base: "1rem"
  xl: "1.4rem"
  4xl: "2.6rem"
spacing:
  unit: "0.25rem"
  section: "4rem"
  section-wide: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.beam}"
    textColor: "{colors.on-beam}"
    rounded: "{rounded.base}"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
  card:
    backgroundColor: "{colors.glass-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
---

# Design System: AlphaLens (alphalens.nanisoft.com)

## Overview

**Creative North Star: "The Focusing Lens"**

The whole market arrives in parallel; the lens bends it; everything the research is for lands at one point. That is the mark, and it is also the layout grammar: parallel rails of information (a capture pipeline, a fact list, a status ledger) pass through framed instrument panels and come out as one honest statement. The gold pack warms the dark ground to near-black amber, and the beam is a candle gold, used the way an instrument maker uses brass: on the moving parts.

AlphaLens is the measurement site of the family. Its visual ethic is diagrammatic and anti-fabricated: figures are drawn in token strokes so both modes repaint them, animations are priced on ambient tokens and stay true when stopped, and nothing that looks like market data is ever drawn without a disclosure saying there is no live feed behind it. Honesty is a visual system here, not a paragraph: three status words (live, designed not built, research direction) structure the whole page, and they are words first, color second.

The site ships zero CSS of its own. Every value below arrives through the pinned `@nanisoft/prism-ui@1.13.0` stylesheet (`data-pack="gold"`), which is normative; these figures are a snapshot of that pin. Dark is the default rendering and the `-day` siblings are the light mode. `lib/site.json` and the lockfile are authoritative when prose and pin disagree: the ground is gold at prism-ui 1.13.0.

**Key Characteristics:**
- One warm gold beam on a near-black amber ground, dark first
- Framed instrument panels with state words, fact lists and captions
- The three-tier honesty ledger (live / designed, not built / research direction) as page structure
- Diagrams instead of charts; no market values drawn without a disclosure
- The roundest corners in the family: 1rem base radius
- Zero site-authored CSS; glass and hairlines all priced on design system tokens

## Colors

Candle gold on near-black amber, with the sibling packs held to product marks. The palette reads as lamplight on a dark bench: warm, quiet, precise, with one focal brightness reserved for points that matter.

### Primary
- **Focal Gold** (#edc47d dark, #d2a24b light): the pack beam. Primary buttons, focus rings, the lens rays of the mark, the traveling marker on the capture rail. Its text is always deep umber (#231600).
- **Brand Ink** (#f9d9a4 dark, #775300 light): mark and wordmark ink, one step quieter than the beam.
- **Focal Point** (#ffeac7): the single brightest value in the system, reserved for the lens's focal dot in the favicon and its equivalents: the one thing a figure converges on.

### Secondary
- **Ray Cyan** (#7fdaf0): Nexus, inside its mark only.
- **Ray Mint** (#9ddcad): Atlas, inside its mark only.
- **Ray Sky** (#9bd1ff): NaniSoft, inside its mark only.
- **The Prism Spectrum** (#ec88a0, #bc97e7, #73bf88, #6cb2eb, #e4965e): the Prism mark, drawn as the full fan; the same stops power spectrum-ink heading tails.
- **Chart Runners** (#d2a24b, #2dd4bf, #fbbf24, #afaaa3, #f87171 dark): the five chart colors; on this site they appear in PulseGraph and Diagram, never as decorative charts.

### Neutral
- **Ground** (#1a1815 dark, #efece9 light): the page, one continuous warm ground.
- **Ink** (#efece9 dark, #302d29 light): text at rest.
- **Muted Ink** (#cecac4 dark, #5e5a54 light): descriptions, meta, disclosures.
- **Wash** (#583d00 dark, #ffeac7 light): accent fills; in dark it is a deep amber shadow of the beam, in light a pale gold cream.
- **Hairline** (#45423c dark, #e1ddd9 light): all 1px structure.
- **Glass Card** (rgba(239, 236, 233, 0.07) dark, rgba(255, 255, 255, 0.72) light): card fills on the veil ladder.
- **Status**: alarm #f87171, grow #4ade80, hold #fcd34d in dark; #dc2626, #15803d, #f59e0b in light. Status is always a Status word; color is never the only carrier.

### Named Rules
**The Honest Figure Rule.** Anything shaped like market data carries a disclosure that no live feed is behind it. A figure that cannot be honest is cut, not relabeled.
**The Word-First Status Rule.** The three tiers (live, designed not built, research direction) are words in the section title and ledger rows; color and dash style may support them but never replace them.
**The Focal Point Rule.** The brightest warm value is spent on one point per figure: the place the lens converges.

## Typography

**Display Font:** Inter (shipped inside the design system stylesheet; the site loads no font)
**Body Font:** Inter
**Label Font:** the system mono stack

**Character:** an engineering voice at reading size. Headings state claims, body text states facts with dates, and mono labels read like instrument engraving: small, uppercase, evenly tracked.

### Hierarchy
- **Display** (600, design system display scale): the hero claim, "See the whole market, minute by minute," with the emphasized word in spectrum ink.
- **Heading** (600, scale to 2.25rem): section headings that carry their honesty status inside the title text, as "(status)".
- **Title** (600, 1rem): card titles, panel headers, ledger row labels.
- **Body** (400, 1rem): reading text at the 42rem measure; docs prose runs through the design system Prose.
- **Label** (mono, 0.625rem, 0.1em tracking, uppercase): eyebrows, fact-list keys, dates, figure captions.

### Named Rules
**The Section-Carries-Its-Status Rule.** Honesty status lives inside the section title text. It is never a badge, count or collapsible floating beside the title.

## Layout

One 72rem page column with reading text at the 42rem measure; sections breathe at 4rem (6rem at wider breakpoints). The landing is a sequence of differently-shaped bands: hero with instrument, status line, four documented figures, honesty ticker, note grid, process rail with a "verified" end label, capture calendar, feed-source survey, pipeline ledger, research-loop diagram, directions ledger, product grid, closing call. Scrolled-to bands wrap in Reveal; the hero, stats, ticker and closing call stay still. The landing never repeats another section's shape, and the design system gap list records the blocks it declined.

Docs run in the design system shell: a left rail of the section tree, the article at the measure, a right rail with the full h2/h3 outline or none of it, and a derived Previous/Next pager the site never passes by hand. Blog is a rows-variant content grid with an empty state; posts use the design system post page with display and machine dates kept as separate facts. Breakpoints are the design system's (40, 48, 64, 90rem); the site's own code holds none.

## Elevation & Depth

Layered glass on one warm ground. Cards are translucent at the token price (7% in dark, 72% in light), popovers sit heavier at 88%, the glass navbar turns on at veil-glass with a 12px blur, and shadows are composed light: a top rim highlight, an optional inner ring, a tight contact shadow and a wide ambient shade, in three strengths. Edges are solid 1px hairlines. A dashed edge survives only as semantics: the Diagram's reflector "memory" edge is drawn dashed because it is an indirect relation, and the site says so in words too.

### Shadow Vocabulary (design system components only)
- **shadow-xs** (rim + contact): resting cards, inputs, the instrument panel at rest.
- **shadow-sm** (rim + inner ring + contact + ambient shade): raised panels, the scrolled navbar.
- **shadow-md** (rim + inner ring + contact + wide shade): popovers, the search dialog, menus.

### Named Rules
**The Light-Behavior Rule.** Shadows are rim, ring, contact and shade from the elevation tokens, never gray blobs and never site-authored.
**The Glass Price Rule.** Translucency quotes the veil ladder (faint through cover); cards do not invent their own alpha.

## Shapes

The gold pack is the roundest ground in the family: 1rem base radius, with derived steps at 0.6rem, 1.4rem and 2.6rem. Panels read as instruments because of this: soft-cornered frames with hairline borders, a header row carrying a state dot and a title, and a captioned body. The product marks that carry sibling packs are fully rounded discs, so a pack boundary re-points both color and radius without moving a single pixel. Diagram form language is rails and nodes: horizontal stage rails with a traveling marker, box nodes with hairline borders, solid edges for direct relations and a single dashed edge reserved for indirect memory.

## Components

### Buttons
- **Shape:** the 1rem pack radius.
- **Primary:** focal gold background, deep umber text; the hero's first action and one honest door per section.
- **Outline:** hairline border, ink text, transparent fill.
- **Hover / Focus:** token-priced; focus takes the gold ring.

### Cards / Containers
- **Corner Style:** 1rem.
- **Background:** glass card; accent washes appear in panels that state something.
- **Shadow Strategy:** token shadows from the design system; nothing site-authored.
- **Border:** 1px hairline, solid; dashed is a semantic event.
- **Internal Padding:** the design system spacing scale.

### Instrument Panel (signature)
The framed panel the whole ethic hangs on: a header row with a state word, a FactList of dated contract fields, a PulseGraph rail with a traveling marker, and a footnote disclosure. The hero's instrument states the capture path stage by stage and carries the standing line that no market values are drawn. Every figure on the site would be a smaller version of this panel.

### Status and Ledgers
Status is a word, tone-supported: info, success, warning. Ledgers are rows of label plus status plus description; section titles carry their own status in parentheses. The ticker band states five dated facts. Numbers that appear anywhere on the page are documented figures (7 plus 4 expiries, 11 plus 1 calls a minute, 4.5 MB a day, 2 writers of one schema).

### Diagram (signature)
The research loop as a Diagram: four analysts into a trader, into risk, into a reflector, with one dashed memory edge back. Token-stroked, mode-repainting, and true with animation stopped.

### Navigation
The design system navbar: sticky, transparent over the ground, glass on scroll. AlphaLens lockup left; Docs, Blog, About center with the current page marked; family menu, search dialog over a static index, and the mode toggle right. No pack chooser: the reader controls brightness, not brand.

### Docs Shell
Left rail tree, measured article, right rail outline, derived pager. MDX maps to design system components with one exception: a Note becomes an Alert. Landmark labels are declared ("Documentation", "On this page", "Adjacent pages").

### Named Rules
**The One View System Rule.** Prism is the only view system: every component renders through design system Components, Blocks and Pages, styled entirely by the pinned stylesheet. The site authors no CSS, no inline styles, no styling dependency and no class system of its own; a catalogue gap is filed in docs/DS_GAPS.md and requested upstream, never worked around.

## Do's and Don'ts

### Do:
- **Do** carry status as words in titles and ledger rows, tone-supported by color.
- **Do** disclose beside every figure that looks like market data.
- **Do** keep every number on the page a documented figure with a date.
- **Do** frame figures as instruments: state word, facts, caption.
- **Do** use the 1rem radius family and glass at token prices.
- **Do** let Docs and Blog stay in the design system's shells; compose the interiors.

### Don't:
- **Don't** author any site CSS, inline style, hex value or custom variable; the pinned stylesheet owns everything.
- **Don't** publish backtests, performance figures or recommendations, and never draw a market value.
- **Don't** use an em dash, en dash or ellipsis in landing copy; pauses are commas, colons, periods and parentheses.
- **Don't** repeat another section's layout shape, and don't reach for a block the catalogue lacks without filing the gap.
- **Don't** let status be color alone, and don't let a dashed line carry meaning the words don't also carry.
- **Don't** wrap the hero in Reveal; only scrolled-to bands animate in.
