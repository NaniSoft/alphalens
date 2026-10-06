# AlphaLens

> Quantitative trading research for the Indian market. The data layer first, the research design above it, and every claim labelled.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://alphalens.nanisoft.com (Custom Domain, auto-created on deploy)
- **Pack**: `blush` is the ground, on the document element, and it does not change. The platform product rows are the only region of a page carrying a pack that is not the ground, and in it the boundary lands on a `ProductMark`, which is a fully rounded disc, so it moves nothing about the mark's shape. The family's five marks live in the bar's menu now, and a closed menu paints nothing: a reader at first paint sees one pack, and the second packs reach them when they ask to leave
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest (jsdom + Testing Library) · Cloudflare Workers
- **Chrome and every section**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) 0.15.0, pinned exactly. It brings [@nanisoft/prism-tokens](https://www.npmjs.com/package/@nanisoft/prism-tokens) at the exact version it was released against, so this repository declares one first-party dependency and cannot be handed a mismatched pair. There is no local component and no local override path: a section this site needs and the catalogue does not have is a finding to report, not a component to write. This repository draws **no** client boundary of its own: the bar's own controls are client components inside the pinned package, and `test/no-hidden-state.test.ts` holds the count at zero
- **Typeface**: none of this site's own. Prism ships Inter as three static woff2 files under the OFL and declares the `@font-face` rules in its own emitted sheet, so `--font-sans` resolves as published and nothing here loads, re-declares or repoints a family. This site used to download Inter through `next/font/google` and override the token, on the fair ground that prism 0.7.0 shipped no face at all; that stopped being true at 0.10.2 and the workaround had been declaring the same family twice ever since

## What ships

- **Landing** (`/`) — "See the whole market, minute by minute": the thesis with two real links and the instrument panel carrying the one figure on the page, the product's status, the four key figures as a band (`Stats01`, every number a documented fact), the honesty model as a strip, then six numbered sections, each in the shape its own idea wants: **01 what it captures** (live, three capture points) · **02 the data path** (live, the four-stage rail) · **03 one feed for research** (approved, the eight external sources as a survey of tiles) · **04 the research pipeline** (designed, six agent rows in a ledger) · **05 where it's going** (research direction, three rows in a ledger) · **06 built on Nexus**. It closes on a call to action.
  - **No section repeats another section's layout family**, which is the one rule the composition is built around and the reason the two grids of short points that used to sit under 02 and 03 are gone: the operations they summarised are documented in full under data platform and data contract, and a summary of a document next to the document is a second thing to keep in step.
  - **`FeatureGrid01` is the one Block the landing does not use.** It renders its heading with `SectionHeading`'s default alignment, which is centred, while every other section here sets `align="left"`, so on this page it put a centred title above a left-aligned two-column grid with the third card alone on the second row. Filed against the design system rather than worked around; the catalogue gap is a feature grid whose heading alignment the caller can choose.
- **Docs** (`/docs`) — a section index over `content/docs/` — 27 documents in six sections separated by rules, each section named for subject matter and four of the six describing a pipeline rather than a topic. The index draws 20 cards: every document except the six that *are* a section, because a section's own page is the section and a card restating it as a page is a link to the heading above it. The section names, the section order and the documents inside each one are all read from the content pipeline's page tree, which is also what the rail on every documentation page is rendered from, so the two cannot disagree
- **Blog** (`/blog`) — the four launch posts over `content/blog/` (folder-per-post, required date, drafts excluded). The index is this site's own composition and CSS, because the four blog lists in this family are four deliberate designs and the design system deliberately ships none. Each post is the design system's blog post Page.
- **About** (`/about`) — the product's story: why the data layer leads, the three honesty tiers, and a dated fact list.
- **Not found** — the design system's not-found Page: the code as the page's heading, the sentence under it, and three ways out.
- **Search** (`/api/search`) — thirty-four entries as one JSON array, prerendered because the export has no server: the thirty-one documents with their section's declared title as a breadcrumb, and the three pages this site writes as React. `/docs` is one of the documents rather than a fourth hand-written entry, because `content/docs/index.mdx` is the Introduction and claiming `/docs` twice produced two results for one address. The bar's search control fetches it when it opens and filters in the browser, which is a static file of about 71 KB and no request per keystroke. It is not in the route inventory, because a search index is not a page a reader navigates to.

## The bar is the design system's, and this site composes it

The bar is `@nanisoft/prism-ui/blocks/site-navbar`, and `components/SiteChrome.tsx`
holds it, the `<main>` and the footer, with each page rendering that chrome against the
page it is serving. Three decisions belong to this site and the rest belong to the Block,
so they are worth separating rather than describing as one thing.

**The chrome is composed per page, and it cost this site nothing.** It used to live in the
root layout, which is rendered once per route and is handed no pathname, so the bar could
never mark the page a reader was on. Moving it down one level is the whole of that fix, and
it is a server render reading its own route rather than a client boundary. The interesting
question was whether the bar needed a client island of its own. It does not: the Block's
controls are one island inside the package, and this repository draws none —
`test/site-chrome.test.tsx` renders the landing, the About page and the 404 to hold the bar,
and `test/no-hidden-state.test.ts` holds the count of client directives at zero.

**The family is a menu, and it carries all five sites including this one.** The old
switcher sat in the header's `actions` slot and drew only the siblings, because the brand
lockup had already drawn this site's mark and drawing it twice read as a mistake. The fix
at the time was to filter this site's own mark out of the set, which removed the duplicate
by hiding a member of the family from the one control that exists to say what the family
is. The menu is better on both counts: nothing is adjacent to the lockup while it is
closed, and the member the reader is on is marked `aria-current="page"` when it opens.

**That is what exposed the relative href.** This site's own entry in `lib/site.json` was
`/`, and nothing had read it since the old switcher started filtering it out. A menu of
destinations that leave this site opens every row in a new tab, and `/` in a new tab is a
new tab on the page the reader is already on. All five `href`s are absolute now, and the
test reads the rendered set rather than the JSON so the file and the page cannot disagree.

**Search is a static index, because this site is a static export.** There is no server to
ask, so `app/api/search/route.ts` prerenders an index of thirty-four entries and the dialog
filters it in the browser. The mode control is the one other piece of theme state, and it
is the design system's: a stored choice applied by the same `PrismThemeScript` that was
already in `<head>` before this change.

## How it is put together

```
app/layout.tsx        the document: two theme attributes, two blocking scripts, the page
app/page.tsx          the landing
app/about/page.tsx    a section heading, the prose at the measure, the fact list
app/blog/…            the blog index (site's own) and the blog post (the catalogue's)
app/docs/…            the section index (site's own grid) and the doc page (the catalogue's)
app/api/search/route.ts  the search index, prerendered because the export has no server
app/globals.css       the site's own sheet: the document column that keeps the footer on a
                      short page, the docs index, the blog index, the status device, the
                      eight-source survey, the honesty strip's alignment, the hero's
                      narrow-screen rule
components/           SiteChrome, Landing, and the two docs templates
lib/site.json         the ground, the default mode, the site directory
lib/site.ts           those facts, typed by the design system's pack vocabulary
lib/bar.ts            the bar's own data and every word it prints
lib/content.ts        every word of the landing, as data
lib/to-prism-tree.ts  the content pipeline's page tree, read for the rail and the index
lib/post-date.ts      a post's date as a reading and as a machine value
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
in `prism-gates.json`: its sheets and its coverage floors, and nothing else. It names
no destination its own corpus gets wrong and no arming attribute, because this site
has neither a wrong destination nor a hidden state.

What the kit enforces here, by name, so a failure message is findable:

| gate | law |
| --- | --- |
| `pin` | The design system is an exact version, and the token package is the component package's dependency rather than this site's. |
| `retired-line` | No trace of the retired component library. The lockfile is read as a graph. |
| `stylesheet-ownership` | This site's sheet owns no surface the design system owns, carries no `:focus` rule, and takes no `var()` as a `color-mix()` operand. |
| `token-read` | Every custom property this sheet reads is declared. A read that resolves to nothing is not a wrong colour; it is no declaration at all. |
| `links` | Every internal destination and every in-page fragment resolves to something this site emits. |
| `hidden-state` | Every CSS-authored hidden state is armed, guarded by `(scripting: none)`, and has no clock for an exit. This site ships none, so the run reports that it passed vacuously and prints the rule count it read; that is a real answer and the count is how a reader tells it from a scan of nothing. |
| `runtime-token-read` | No token is read at runtime, because a read resolves once and a resolved value does not follow the cascade. |

`pack-boundary` is in the kit and not in this site's list: this site publishes no
pack map, so there is nothing for it to check, and the gate says so itself rather than
reporting a clean page — `scripts/pack-map.json does not resolve`. `runtime-token-read`
**is** in this site's list, and it was documented here while not being configured, which is
the same defect as a documented gate that does not run: it is enabled in `prism-gates.json`
and reports zero findings across `app`, `components` and `lib`.

`check:routes` is this repository's own rather than the kit's: every published
document has a route, and the one that does not is written down with its reason.

The kit's limits, which it prints on every run: it reads text rather than resolving
a cascade, it reads the emitted export rather than a browser, and a stylesheet half
is not a rendered half. That last one is why `test/site-sheet.test.ts` and
`test/no-hidden-state.test.ts` exist here: they ask the two questions no text scan of
a stylesheet can ask, which are whether anything is marked for an entrance at all and
whether the sheet hides anything.

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

The first and third were live before the migration and both are now gates, so neither can
come back unnoticed. The second was repaired once and then left behind, and it is written
here because the repair is the thing worth having and the leftover was the defect.

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

**The landing's content had no exit, and then the exit had nothing to be an exit for.**
Every `[data-reveal]` element was hidden at `opacity: 0` and revealed by an
`IntersectionObserver` in a client effect, so a reader without scripting, without that API,
or with a script that failed to parse received the whole page below the header and no way
out of it. That was repaired properly: the state was scoped under an attribute one inlined
script wrote and two things could remove, the exit was an event rather than a clock, and
`test/no-scripting.test.tsx` rendered the landing with scripting off and asserted the
content was present. The repair was then found to be guarding nothing at all. Measured on
the built export of all thirty-six pages, `data-reveal` appears as an attribute **zero**
times: every textual match was the mechanism's own comment and script strings, and
`document.querySelectorAll('[data-reveal]').length === 0` on the landing. So the family was
carrying a hydration boundary, an inline script, four rules in this site's own sheet and a
test, all to observe an empty `NodeList`, and the `hidden-state` gate reported nothing
because it verifies the mechanism rather than asking whether anything uses it. All of it
is deleted. The reasoning is not lost: `test/no-hidden-state.test.ts` carries it, and if
Prism ships a Block-level entrance that is the right home for it, because the gate can then
see every consumer of it at once.

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
to be. Two regions are still exempt and the reasons are different from one another, so they
are named separately rather than folded into one list. **`content/docs/**` is exempt in
full**, frontmatter included: twenty-seven pages of published documentation, and twenty of
the `description:` lines in it carry an em dash that stays there, because rewriting a
published document's own punctuation is a content change with its own commit and its own
reader. **A post's body is exempt** for the same reason. What is *not* exempt is a post's
**frontmatter**: `title` and `description` are two lines this repository reads and composes
into three surfaces it owns — the card on `/blog`, the `<meta name="description">` a
crawler reads, and the `description` of a search result — so that is site UI copy wearing a
document's frontmatter. Three of the four posts' descriptions carried an em dash and the
rule caught none of them, because the exemption was on the file extension rather than on the
prose; those three are rewritten and the rule now reaches the next one.

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
