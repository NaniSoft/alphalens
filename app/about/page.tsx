import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link';
import { FactList } from '@nanisoft/prism-ui/components/fact-list';
import { Prose } from '@nanisoft/prism-ui/components/prose';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';

import { SiteChrome } from '@/components/SiteChrome';

/**
 * The page's one-line description, stated once.
 *
 * It is a published string in two places: the `<meta name="description">` a crawler and a
 * link preview read, and the lede under the `h1` that a reader reads. Those were two
 * literals of the same sentence, and two literals have to be kept in step by hand, which
 * is how this page came to print a comma under the heading where the published page has
 * a dash. One constant feeds both, so they cannot drift.
 */
const DESCRIPTION =
  'AlphaLens in plain terms: a live Indian-market data layer, an approved contract, and a research design above them, labelled honestly at every step.';

export const metadata: Metadata = {
  title: 'About',
  description: DESCRIPTION,
};

/** The six dated facts, as the pairs a reader scans down the left edge. */
const FACTS = [
  { label: 'Collector live since', value: '2026-08-26' },
  { label: 'On Kubernetes / Helm since', value: '2026-09-08' },
  { label: 'Contract approved', value: '2026-09-19' },
  { label: '.NET port Phase 1 live', value: '2026-09-15' },
  { label: 'Capture', value: 'NIFTY + BANKNIFTY, every minute' },
  { label: 'Archive', value: '~4.5 MB / day, xz daily' },
] as const;

/**
 * About, composed from the catalogue: a section heading, the prose at the reading
 * measure, and the fact list.
 *
 * The words are the words. Every paragraph, the six facts and the pair of calls to action
 * are unchanged; what changed is who owns the measure, the rhythm and the link treatment.
 * `Prose` owns the first two, which is why `app/globals.css` no longer has a rule for
 * this page at all. The pair appears once rather than twice, and the copy beside it says
 * why.
 *
 * **A heading and a pair of links, not a `PageHeader01`.** That Block's `actions` render
 * a `Button` and its `PageHeaderAction` type has no `href` at all, so a page composed
 * from it cannot have a call to action that goes anywhere - the same defect the landing's
 * hero has, and filed against `Hero01` as the catalogue gap it is. So this page composes
 * `SectionHeading` and `CtaLink` directly, which is the arrangement the design system's
 * own guidance names: a section this site needs and the catalogue does not have is a
 * finding to report, not a component to work around by passing a destination to a
 * control that ignores it.
 *
 * **The page dropped its eyebrow.** It read `nanisoft · alphalens · about` above the
 * `h1`: the header's wordmark, a separator, the site name and the page's own name, three
 * elements of one fact, above a heading that already says what the page is. The bar
 * directly above carries the wordmark, so the page was saying it again on arrival. The
 * blog index said the same thing over its own `h1` and lost it for the same reason, and
 * `test/honesty.test.ts` asserts neither page prints one.
 *
 * **The facts are a `FactList`, which is a `dl`.** The retired page drew the same six
 * pairs as flex rows with a `border-bottom` on each, and the last row's rule read as a
 * boundary between the facts and the paragraph below - a claim about where one thing
 * ends that nothing supports. `FactList` drops the last row's rule and says "these are
 * terms and their answers" to a screen reader, which a grid of two `div`s per row does
 * not.
 */
export default function AboutPage(): ReactElement {
  return (
    <SiteChrome current="/about">
      <Section>
        <SectionHeading
          as="h1"
          align="left"
          className="site-display"
          title="The market, as one feed."
          description={DESCRIPTION}
        />

        <Prose size="lg">
          <p>
            AlphaLens is Nanisoft&rsquo;s quantitative research platform for the Indian (NSE/BSE)
            market. Its starting point is unglamorous and decisive: an agent cannot reason about a
            market it cannot read. Before any strategy work means anything, someone has to capture
            the whole surface (every strike, every minute, with the volatility and the Greeks
            attached) and hand it over in a shape that does not shift underneath the reader.
          </p>
          <p>
            That is what AlphaLens is today. A production collector has been capturing the full
            NIFTY and BANKNIFTY option chain every market minute since August 2026, running on
            Kubernetes since September, writing one atomic transaction per minute into a per-day
            SQLite file that is archived and backed up without anyone watching. An approved data
            contract defines how that capture merges with the sources the exchange API
            structurally cannot provide. A multi-agent research pipeline is designed on top of
            both.
          </p>

          <h2>What is true, and what is not yet</h2>
          <p>
            AlphaLens is the only Nanisoft product with live infrastructure, so status here is per
            claim rather than per site. Three tiers, used everywhere on this site:
          </p>
          <ul>
            <li>
              <strong>Live.</strong> The collector, its storage and archives, its operations, and
              the .NET 10 port&rsquo;s first phase. Present tense, and provable.
            </li>
            <li>
              <strong>Designed, not built.</strong> The unified data contract is approved; the
              TradingAgents agent wiring and the k3s VPS endgame are not running.
            </li>
            <li>
              <strong>Research direction.</strong> Strategy backtesting, discovery and validation.
              These are where the infrastructure points, never presented as features, because
              they are not features.
            </li>
          </ul>
          <p>
            There is no backtesting engine here, no strategy discovery machinery, no validation
            harness, and no product UI. This site publishes no backtests, no performance figures,
            and no recommendations. When that changes, the labels change first.
          </p>

          <h2>Why the data layer leads</h2>
          <p>
              Because it is the part that took the engineering. A full option chain at index scale,
              every sixty seconds, inside a retail API&rsquo;s rate budget, turned out to be a
              measurement problem before it was a code problem. The answer, from a live spike in
            August 2026, was that the REST option-chain endpoint returns the entire per-minute
            snapshot in about two calls, and the WebSocket that looked mandatory carries none of
            the fields that matter.
          </p>
          <p>
            Everything since has followed the same instinct: prove it small, then make it boring.
            A strict minute grid with skip-on-overrun. One transaction per minute. Fail loud on a
            dead token instead of spinning. Verify a backup before deleting the original. Keep the
            second implementation schema-identical so the first can stand down safely. Pin the
            feed&rsquo;s column list with a test so a &ldquo;contract&rdquo; means something.
          </p>

          <h2>Built on Nexus</h2>
          <p>
            AlphaLens is one of three Nanisoft products on one platform, and the platform has a
            factory behind it: Nexus turns an issue into a reviewed, merged change, so building
            each product becomes repeatable. Nexus is in active development and building in the
            open under the same labels as the option chain. Prism is the design
            language every Nanisoft site wears, including this one.
          </p>
        </Prose>

        <FactsTable />

        {/* The one pair of calls to action this page carries, and it is the closing one.
            There used to be a second, identical pair forty pixels under the heading and
            again about 1400px later, and the page's own bar carries both destinations
            directly above the top one: three controls for two facts, the two nearest
            together saying the same thing twice. At the foot the pair follows the argument
            it concludes, which is the only place a reader who came to `/about` deliberately
            is ready to act on it. */}
        <div className="site-cta-row">
          <CtaLink href="/docs" size="lg">
            Read the docs
          </CtaLink>
          <CtaLink href="/blog" size="lg" variant="outline">
            Read the blog
          </CtaLink>
        </div>
      </Section>
    </SiteChrome>
  );
}

/**
 * The six facts, as the design system's own fact list.
 *
 * `FactList` is used rather than a hand-drawn grid because a definition list is what says
 * "these are terms and their values" to a screen reader, and a grid of two `div`s per row
 * is a table with the relationship removed. It also drops the last row's hairline, which
 * is the one the retired page drew: six rules under six rows left a rule under the
 * bottom one too, and a rule under the last row of a list reads as a boundary between the
 * facts and whatever comes after them, which is a claim about where one thing ends that
 * nothing supports.
 */
function FactsTable(): ReactElement {
  return (
    <FactList
      facts={FACTS.map((fact) => ({ label: fact.label, value: fact.value }))}
      label="Status by date"
    />
  );
}
