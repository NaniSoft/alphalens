import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { Button } from '@nanisoft/prism-ui/components/button';

export const metadata: Metadata = {
  title: 'About',
  description:
    'AlphaLens in plain terms: a live Indian-market data layer, an approved contract, and a research design above them — labelled honestly at every step.',
};

const FACTS = [
  { label: 'Collector live since', value: '2026-08-26' },
  { label: 'On Kubernetes / Helm since', value: '2026-09-08' },
  { label: 'Contract approved', value: '2026-09-19' },
  { label: '.NET port Phase 1 live', value: '2026-09-15' },
  { label: 'Capture', value: 'NIFTY + BANKNIFTY, every minute' },
  { label: 'Archive', value: '~4.5 MB / day, xz daily' },
] as const;

export default function AboutPage(): ReactElement {
  return (
    <div className="al-about">
      <p className="al-eyebrow">nanisoft · alphalens — about</p>
      <h1 className="al-about__title">The market, as one feed.</h1>

      <p>
        AlphaLens is Nanisoft&rsquo;s quantitative research platform for the Indian (NSE/BSE) market.
        Its starting point is unglamorous and decisive: an agent cannot reason about a market it
        cannot read. Before any strategy work means anything, someone has to capture the whole
        surface — every strike, every minute, with the volatility and the Greeks attached — and hand
        it over in a shape that does not shift underneath the reader.
      </p>
      <p>
        That is what AlphaLens is today. A production collector has been capturing the full NIFTY and
        BANKNIFTY option chain every market minute since August 2026, running on Kubernetes since
        September, writing one atomic transaction per minute into a per-day SQLite file that is
        archived and backed up without anyone watching. An approved data contract defines how that
        capture merges with the sources the exchange API structurally cannot provide. A multi-agent
        research pipeline is designed on top of both.
      </p>

      <h2>What is true, and what is not yet</h2>
      <p>
        AlphaLens is the only Nanisoft product with live infrastructure, so status here is per claim
        rather than per site. Three tiers, used everywhere on this site:
      </p>
      <ul>
        <li>
          <strong>Live.</strong> The collector, its storage and archives, its operations, and the
          .NET 10 port&rsquo;s first phase. Present tense, and provable.
        </li>
        <li>
          <strong>Designed, not built.</strong> The unified data contract is approved; the
          TradingAgents agent wiring and the k3s VPS endgame are not running.
        </li>
        <li>
          <strong>Research direction.</strong> Strategy backtesting, discovery and validation. These
          are where the infrastructure points — never presented as features, because they are not
          features.
        </li>
      </ul>
      <p>
        There is no backtesting engine here, no strategy discovery machinery, no validation harness,
        and no product UI. This site publishes no backtests, no performance figures, and no
        recommendations. When that changes, the labels change first.
      </p>

      <h2>Why the data layer leads</h2>
      <p>
        Because it is the part that took the engineering. A full option chain at index scale, every
        sixty seconds, inside a retail API&rsquo;s rate budget — that turned out to be a
        measurement problem before it was a code problem. The answer, from a live spike in August
        2026, was that the REST option-chain endpoint returns the entire per-minute snapshot in about
        two calls, and the WebSocket that looked mandatory carries none of the fields that matter.
      </p>
      <p>
        Everything since has followed the same instinct: prove it small, then make it boring. A
        strict minute grid with skip-on-overrun. One transaction per minute. Fail loud on a dead
        token instead of spinning. Verify a backup before deleting the original. Keep the second
        implementation schema-identical so the first can stand down safely. Pin the feed&rsquo;s
        column list with a test so a &ldquo;contract&rdquo; means something.
      </p>

      <h2>Built on Nexus</h2>
      <p>
        AlphaLens is one of three Nanisoft products on one platform, and the platform has a factory
        behind it: Nexus turns an issue into a reviewed, merged change, so building each product
        becomes repeatable. Nexus is in active development and building in the open — the same
        honesty this page applies to the option chain. Prism is the design language every Nanisoft
        site wears, including this one.
      </p>

      <dl className="al-about__facts">
        {FACTS.map((fact) => (
          <div className="al-about__fact" key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="al-cta-row al-about__links">
        <Button type="primary" size="large" href="/docs">
          Read the docs
        </Button>
        <Button size="large" href="/blog">
          Read the blog
        </Button>
      </div>
    </div>
  );
}
