# AlphaLens

> Quantitative trading research for the Indian market. The data layer first, the research design above it, and every claim labelled.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://alphalens.nanisoft.com (Custom Domain, auto-created on deploy)
- **Pack**: `blush` is the ground, on the document element, and it does not change. Two regions carry a pack that is not the ground: the header's product switcher and the platform product rows, and in both the boundary lands on a `ProductMark`, which is a fully rounded disc, so it moves nothing about the mark's shape
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest (jsdom + Testing Library) · Cloudflare Workers
- **Chrome and every section**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) 0.7.0 and [@nanisoft/prism-tokens](https://www.npmjs.com/package/@nanisoft/prism-tokens) 0.6.0, both pinned exactly. The two pins are deliberately different numbers: `prism-ui` requires `prism-tokens` at an exact version, so the pair states two facts. There is no local component and no local override path: a section this site needs and the catalogue does not have is a finding to report, not a component to write

## What ships

- **Landing** (`/`) — "See the whole market, minute by minute": the thesis with two real links, the instrument panel carrying the one diagram on the page, the status strip, then six numbered sections: **01 what it captures** (live, three capture points) · **02 the data path** (live, the four-stage rail and the six properties of it) · **03 one feed for research** (approved, the eight external sources and the four contract properties) · **04 the research pipeline** (designed, six agent rows) · **05 where it's going** (research direction, three directions with their bullets) · **06 built on Nexus**. It closes on a call to action.
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
app/globals.css       420 lines: the docs index, the blog index, the status device, the reveal
components/           RevealRoot (the only client component), CapturedPathDiagram, the two docs templates
lib/site.json         the ground, the default mode, the product directory
lib/site.ts           those facts, typed by the design system's pack vocabulary
lib/content.ts        every word of the landing, as data
scripts/              the five gates, the parity expectations
```

Three things are worth knowing before changing anything here.

**A consumer cannot write a design-system utility class.** The emitted stylesheet is
compiled from the design system's own source, so a utility exists in it only if a Prism
component uses it. `mb-12` is safe; a utility Prism happens not to use would do nothing
and say nothing. Anything this site needs for itself goes in `app/globals.css` as a site
class.

**The site stylesheet owns almost nothing, and that is a rule.** It must not declare the
page ground, the body ink, a focus outline or a hairline colour on a selector with no
class in it, and it must not carry a `:focus` rule at all: the design system's base layer
is layered and this sheet is not, so a bare-element rule here wins the cascade whatever
the cascade then does with it. `scripts/check-stylesheet-ownership.mjs` is why that is
enforced rather than remembered. The focus case is not hypothetical and it was live here
— the sheet's own `:focus-visible` rule was outranked on every link and would have become
a *suppression* the moment its token stopped resolving. The script's header has the
measurement.

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
pnpm check        # the five gates; run after pnpm build
```

The five gates, and what each holds:

| gate | what it holds |
| --- | --- |
| `check:antd` | No trace of the retired line: no dependency, no import, no generated stylesheet, no build step, no living instruction. The lockfile is read as a dependency graph, and both design-system pins must be exact. |
| `check:stylesheet` | The site's own sheet competes with nothing the design system declares, carries no `:focus` rule, and takes no `var()` as a `color-mix()` operand. |
| `check:hidden-state` | Every CSS-authored hidden state is armed, guarded by `(scripting: none)`, and has no clock for an exit. The arming has one writer, the module withdraws it, and an inlined `load` listener covers the reader whose scripting started and stopped. |
| `check:links` | Every internal destination and every in-page fragment resolves to something this site emits. |
| `check:routes` | Every published document has a route, and the one that does not is written down with its reason. |

The content-parity comparison is a sixth tool and is not in `pnpm check`, because its
baseline lives outside the repository and is destroyed at the close of the sweep:

```bash
node scripts/check-content-parity.mjs --record <file>            # cut a baseline
node scripts/check-content-parity.mjs --baseline <file> \
  --expect scripts/content-parity-expectations.json              # compare
```

It reads the built export through a document parser, so it sees the copy in `lib/content.ts`
and in JSX as well as the copy in `content/`, which a digest of the content tree would have
been blind to. Every difference must be declared in
`scripts/content-parity-expectations.json` with the reason it is a rendering change and not
a copy change, and a declaration that matches nothing is itself a finding.

## The two things this site was wrong about

Both were live before the migration and both are now gates, so neither can come back
unnoticed.

**The focus indicator was the site's, and the site was outranked on every link.** The
sheet declared `:focus-visible { outline: 2px solid var(--prism-color-primary) }` and
prism's own `a:focus-visible` is more specific, so no link ever saw it; where nothing more
specific applied it drew a 2px outline in the pack's `primary`, which the design system
reserves for a fill. And with that token no longer resolving, `outline-style` falls back to
`none` while `outline-offset` survives, so the rule goes from drawing an indicator to
suppressing one. The design system draws its ring on its own components and a plain anchor
keeps the browser's own, and neither can die with a token. `check:stylesheet` and
`test/focus-indicator.test.ts` hold that.

**The landing's content had no exit.** Every `[data-reveal]` element was hidden at
`opacity: 0` and revealed by an `IntersectionObserver` in a client effect, so a reader
without scripting, without that API, or with a script that failed to parse received the
whole page below the header and no way out of it. The state is now scoped under an
attribute one inlined script writes and two things can remove, there is no timer anywhere
in it, and `test/no-scripting.test.tsx` renders the landing with scripting off and asserts
the content is present.

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
