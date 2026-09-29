# AlphaLens

> Quantitative trading research for the Indian market. The data layer first, the research design above it, and every claim labelled.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://alphalens.nanisoft.com (Custom Domain, auto-created on deploy)
- **Pack**: `blush` is the ground, on the document element, and it does not change. Two regions carry a pack that is not the ground: the header's product switcher, which sits in the bar's right-hand slot, and the platform product rows, and in both the boundary lands on a `ProductMark`, which is a fully rounded disc, so it moves nothing about the mark's shape
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest (jsdom + Testing Library) · Cloudflare Workers
- **Chrome and every section**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui), pinned exactly. It brings [@nanisoft/prism-tokens](https://www.npmjs.com/package/@nanisoft/prism-tokens) at the exact version it was released against, so this repository declares one first-party dependency and cannot be handed a mismatched pair. There is no local component and no local override path: a section this site needs and the catalogue does not have is a finding to report, not a component to write

## What ships

- **Landing** (`/`) — "See the whole market, minute by minute": the thesis with two real links and the instrument panel carrying the one figure on the page, the product's status, the four key figures as a band (`Stats01`, every number a documented fact), the honesty model as a strip, then six numbered sections, each in the shape its own idea wants: **01 what it captures** (live, three capture points) · **02 the data path** (live, the four-stage rail) · **03 one feed for research** (approved, the eight external sources as a survey of tiles) · **04 the research pipeline** (designed, six agent rows in a ledger) · **05 where it's going** (research direction, three rows in a ledger) · **06 built on Nexus**. It closes on a call to action.
  - **No section repeats another section's layout family**, which is the one rule the composition is built around and the reason the two grids of short points that used to sit under 02 and 03 are gone: the operations they summarised are documented in full under data platform and data contract, and a summary of a document next to the document is a second thing to keep in step.
  - **`FeatureGrid01` is the one Block the landing does not use.** It renders its heading with `SectionHeading`'s default alignment, which is centred, while every other section here sets `align="left"`, so on this page it put a centred title above a left-aligned two-column grid with the third card alone on the second row. Filed against the design system rather than worked around; the catalogue gap is a feature grid whose heading alignment the caller can choose.
- **Docs** (`/docs`) — a section index over `content/docs/` — 27 pages in six sections separated by rules, each section named for subject matter and four of the six describing a pipeline rather than a topic.
- **Blog** (`/blog`) — the four launch posts over `content/blog/` (folder-per-post, required date, drafts excluded). The index is this site's own composition and CSS, because the four blog lists in this family are four deliberate designs and the design system deliberately ships none. Each post is the design system's blog post Page.
- **About** (`/about`) — the product's story: why the data layer leads, the three honesty tiers, and a dated fact list.
- **Not found** — the design system's not-found Page: the code as the page's heading, the sentence under it, and three ways out.

## How it is put together

```
app/layout.tsx        the document: two theme attributes, two blocking scripts, the chrome
app/page.tsx          the landing
app/about/page.tsx    a section heading, the prose at the measure, the fact list
app/blog/…            the blog index (site's own) and the blog post (the catalogue's)
app/docs/…            the section index (site's own grid) and the doc page (the catalogue's)
app/globals.css       the site's own sheet: the docs index, the blog index, the status
                      device, the honesty strip's alignment, the hero's narrow-screen
                      rule, the reveal
components/           RevealRoot (the only client component) and the two docs templates
lib/site.json         the ground, the default mode, the product directory
lib/site.ts           those facts, typed by the design system's pack vocabulary
lib/content.ts        every word of the landing, as data
scripts/              the gates, the routes check, the both-modes browser check
```

Four things are worth knowing before changing anything here.

**A consumer cannot write a design-system utility class.** The emitted stylesheet is
compiled from the design system's own source, so a utility exists in it only if a Prism
component uses it. `mb-12` is safe; a utility Prism happens not to use would do nothing
and say nothing. Anything this site needs for itself goes in `app/globals.css` as a site
class.

**The one stylesheet rule a site class may break is a Prism-owned visual property, and
`className` is the one slot that is not layout.** The hero's band, the section rhythm and
the strip's centring are the design system's, so this repository takes them as they come
and spends its two overrides on the two things the catalogue cannot know: that the
honesty strip is scanned from the left, and that the hero's figure is dropped on a screen
where its type would be seven pixels tall.

**The site stylesheet owns almost nothing.** It must not declare the page ground, the
body ink, a focus outline or a hairline colour on a selector with no class in it, and
it must not carry a `:focus` rule at all: the design system's base layer is layered
and this sheet is not, so a bare-element rule here wins the cascade whatever the
cascade then does with it. The focus case is not hypothetical and it was live here:
the sheet's own `:focus-visible` rule was outranked on every link and would have become
a *suppression* the moment its token stopped resolving. That sentence is the reason the
gate exists rather than the gate's rule; the rule is the failure message, and when
`pnpm check` is red the message says which of these it was and why it matters. The
measurement is in the gate kit's own header.

**The border token carries the whole border, not a colour.** The old sheet declared one
alias and read it from fifteen border declarations, and an alias is a shorthand: with one
dead operand, `border` is invalid at computed-value time, so `border-style` becomes
`none` and the box loses its geometry rather than its colour. Measured on the deployed
site in both modes, all fifteen read `1px solid` while the alias resolved and `0px none`
the instant it did not, which is fifteen boxes losing their edges and the hero's right
column becoming an empty rounded box. A screenshot sees none of it, because unstyled body
text is a plausible design. So `--site-border` is `1px solid var(--border)`: the width is
the measured one the boxes already had, and the only operand is the design system's own
token, which is defined for every pack and both modes.

## Develop

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # static export to out/
pnpm lint         # oxlint
pnpm typecheck    # next typegen && tsc --noEmit
pnpm test         # vitest
pnpm check        # the routes gate and the consumer gate kit; run after pnpm build
```

`pnpm check` runs `prism-gates`, the gate kit in `@nanisoft/prism-ui/gates`, plus
this site's own routes gate. The laws themselves are not in this repository: they
are the failure messages of those gates, so a fix to one reaches this site in one
release and cannot be declined here. The four repositories of the family run the
same programs and hold none of the wording. What this site holds is its own half,
in `prism-gates.json`: its sheets, its coverage floors, the one destination its
corpus gets wrong with the reason, and the attribute and module names the
hidden-state law works in.

What the kit enforces here, by name, so a failure message is findable:

| gate | law |
| --- | --- |
| `pin` | The design system is an exact version, and the token package is the component package's dependency rather than this site's. |
| `retired-line` | No trace of the retired component library. The lockfile is read as a graph. |
| `stylesheet-ownership` | This site's sheet owns no surface the design system owns, carries no `:focus` rule, and takes no `var()` as a `color-mix()` operand. |
| `token-read` | Every custom property this sheet reads is declared. A read that resolves to nothing is not a wrong colour; it is no declaration at all. |
| `links` | Every internal destination and every in-page fragment resolves to something this site emits. |
| `hidden-state` | Every CSS-authored hidden state is armed, guarded by `(scripting: none)`, and has no clock for an exit. The arming has one writer, the module withdraws it, and an inlined `load` listener covers the reader whose scripting started and stopped. |
| `runtime-token-read` | No token is read at runtime, because a read resolves once and a resolved value does not follow the cascade. |

`pack-boundary` is in the kit and not in this site's list: this site publishes no
pack map, so there is nothing for it to check.

`check:routes` is this repository's own rather than the kit's: every published
document has a route, and the one that does not is written down with its reason.

The kit's limits, which it prints on every run: it reads text rather than resolving
a cascade, it reads the emitted export rather than a browser, and a stylesheet half
is not a rendered half, which is why `test/no-scripting.test.tsx` exists here.

The content-parity comparison was a one-time instrument for the migration sweep and
is gone with its baseline, which lived outside the repository and was destroyed at
the close of that sweep. What it did is worth recording, because it is the reason
`links` is the gate that survived: it read the built export through a document parser
rather than a digest of `content/`, so it saw the copy in `lib/content.ts` and in JSX,
which a content-tree digest would have been blind to. Every difference had to be
declared in `scripts/content-parity-expectations.json` with the reason it was a
rendering change and not a copy change, and a declaration that matched nothing was
itself a finding. The permanent successor asks a question that is true of every
future build rather than of one migration: does a reader who follows a link on this
site arrive somewhere.

## The three things this site was wrong about

All three were live before the migration and all three are now gates, so none can come
back unnoticed.

**The focus indicator was the site's, and the site was outranked on every link.** The
sheet declared a two-pixel outline in the retired line's `primary` token, and prism's own
`a:focus-visible` is more specific, so no link ever saw it; where nothing more
specific applied it drew a 2px outline in the pack's `primary`, which the design system
reserves for a fill. And with that token no longer resolving, `outline-style` falls back to
`none` while `outline-offset` survives, so the rule goes from drawing an indicator to
suppressing one. The design system draws its ring on its own components and a plain anchor
keeps the browser's own, and neither can die with a token. The gate kit's
`stylesheet-ownership` gate and `test/focus-indicator.test.ts` hold that, and the
measurement is in the gate's own header.

**The landing's content had no exit.** Every `[data-reveal]` element was hidden at
`opacity: 0` and revealed by an `IntersectionObserver` in a client effect, so a reader
without scripting, without that API, or with a script that failed to parse received the
whole page below the header and no way out of it. The state is now scoped under an
attribute one inlined script writes and two things can remove, there is no timer anywhere
in it, and `test/no-scripting.test.tsx` renders the landing with scripting off and asserts
the content is present.

**The copy was frozen by an instrument that had been destroyed.** The dash law in
`test/honesty.test.ts` held reader-facing copy to no em dash, no en dash and no ellipsis,
and it could not hold that here, so it held something else instead: six files were
exempt, and each exemption carried a count, because the copy in them was the
pre-migration page's byte for byte and the content-parity baseline that said so was cut
from the deployed site when the migration closed. Forty dashes sat in those six files
under a rule whose stated reason no longer existed, and the cheapest way to satisfy the
rule later would have been to author a seventh exemption. The six files were rewritten in
one pass, the words kept and the punctuation carrying the pause with a comma, a colon, a
full stop or parentheses, the list is gone, and the law is the absolute one it was trying
to be. The published corpus is still exempt, wholesale and by extension, because
rewriting the punctuation of thirty-one published documents is a content change with its
own commit and its own reader.

## Deploy

Push to `main` → GitHub Actions builds and deploys the Worker (`alphalens-site`), an
assets-only Worker serving `out/` behind the Custom Domain. The deploy is a job that needs
the checks, so a push that fails cannot deploy. `pnpm deploy` is the local lane, and needs
wrangler auth.

## Status

Live at https://alphalens.nanisoft.com, serving a static export from the `alphalens-site`
Worker. The data platform is the live part: the collector has captured the full NIFTY and
BANKNIFTY option chain every market minute since 26 August 2026 and has run on Kubernetes
since 8 September. The unified data contract is approved but not yet implemented; the
TradingAgents wiring and the k3s endgame are designed, not built; backtesting, discovery and
validation are research directions. The site is in active development and the labels move
before the claims do.

The hero's panel used to draw a curve of open interest generated by a sine hash under a
label reading as a live market feed, with the word "illustrative" in nine-point type
underneath. That surface is cut, not relabelled: it now holds a diagram of the four
documented capture stages, which are published facts. The honesty gate could not see the
old shape because it read prose and the dishonesty was arithmetic, so the gate now
**requires a disclosure** beside anything shaped like market data rather than looking for
an overclaim in the words — which is a check on the surface's existence rather than on its
wording, and the only kind that reaches this class of defect.

## One published document is unreachable, on purpose

`content/docs/index.mdx` is published nowhere. `/docs` renders the section index this site
composes, because the optional catch-all's own root arm claims that address and the
optional root is required under `output: export` for the route to be satisfiable at all.
The three available fixes were all rejected: rendering the document at `/docs` is a
content and information-architecture change, giving it a second address is a routing
change, and deleting it is an edit to published copy. So it stays as a file, and the
reason is in `scripts/check-routes.mjs` where the route inventory is read — a later reader
who finds the file will find the decision next to it, and a verifier that fixes things is
not a verifier.
