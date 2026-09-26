// The landing's content, fixed once and read by the landing's presentation.
// Everything here traces to the AlphaLens material and is labelled by the
   // three-tier honesty model — live /
// approved / designed / research direction. Nothing on this page claims a
// backtester, a discovery engine, a validation harness, or any product UI,
// because none of those exist.

export const HERO = {
  eyebrow: 'nanisoft · alphalens',
  h1Leading: 'See the ',
  h1Em: 'whole',
  h1Trailing: ' market, minute by minute.',
  sub: 'AlphaLens captures the full NSE option chain — every strike, every minute — and conforms it into one research-ready feed agents can query. Multi-agent strategy research is the layer above it.',
  status: 'In active development.',
  primaryCta: { label: 'Read the docs', href: '/docs' },
  secondaryCta: { label: 'Read the blog', href: '/blog' },
} as const;

/** The hero panel's instrument bar — the live view the panel pretends to be. */
export const HERO_PANEL = {
  label: 'live view — nifty option chain, per minute',
  mode: 'beam-dark · rose',
  footnote:
    'Illustrative rendering of the captured shape: strikes across the axis, call open interest above, put open interest below, the reticle on ATM. Not a live quote.',
} as const;

/** The status ticker — the honesty model, as a strip under the hero. */
export const TICKER = [
  'data collector → live since 2026-08-26',
  'kubernetes / helm → live since 2026-09-08',
  'unified data contract → approved 2026-09-19',
  'tradingagents wiring → designed, not built',
  'backtesting · discovery · validation → research direction',
] as const;

export interface CaptureCard {
  title: string;
  body: string;
}

/** 01 — what the collector captures (live). Straight from the collector facts. */
export const CAPTURE_CARDS: ReadonlyArray<CaptureCard> = [
  {
    title: 'The full option chain',
    body: 'Every selected strike, CE and PE, across seven NIFTY and four BANKNIFTY expiries — each leg with open interest, OI change, volume, bid/ask, IV and the four Greeks, captured raw rather than re-priced.',
  },
  {
    title: 'Futures, spot and India VIX',
    body: 'Current- and next-month index futures, the index spot, and India VIX with full OHLC — one batched quotes call, in the same minute as the chain.',
  },
  {
    title: 'Candles, summaries and overnight cues',
    body: 'True 1-minute OHLCV backfilled post-close into the same day’s file. An EOD summary at 15:31 for PCR and max-OI strikes. yfinance global cues before the open.',
  },
];

/** 02 — the live data path, as a conveyor rail. */
export const DATA_PATH = [
  {
    step: '01',
    title: 'Capture',
    body: '11 option-chain calls + 1 batched quotes call per index, ~2.5 s. 12 calls/min against a 200/min cap.',
  },
  {
    step: '02',
    title: 'Store',
    body: 'One SQLite transaction per minute into that day’s database. A partial minute rolls back, never half-written.',
  },
  {
    step: '03',
    title: 'Summarize',
    body: 'EOD at 15:31 computes PCR and max-OI strikes from the rows already captured. Candles backfill at 17:00.',
  },
  {
    step: '04',
    title: 'Archive',
    body: '~4.5 MB a day, xz-compressed and swept on retention, pushed to Drive and verified before the local copy goes.',
  },
] as const;

/** 02 — the path's properties, as hairline rows. */
export const PATH_FEATURES = [
  {
    title: 'A strict minute grid',
    body: 'Snapshots land on :00, :01, :02. A minute that cannot be captured in time is logged as missing, never shifted into the next slot.',
  },
  {
    title: 'Kubernetes and Helm',
    body: 'Two always-on containers — collector and token service — over one shared volume, live since 2026-09-08.',
  },
  {
    title: 'One login a morning',
    body: 'Fyers tokens are daily. A local callback captures the code; the scheduler stops and asks when a token expires rather than spinning.',
  },
  {
    title: 'Alerts and backups',
    body: 'Telegram carries the auth prompt, hourly rollup, errors and EOD. Drive backups run every 30 minutes through the session.',
  },
  {
    title: 'A second implementation',
    body: 'The .NET 10 port writes the same DDL into the same per-day files, so the two are interchangeable against one history.',
  },
  {
    title: 'The Nifty 500 universe',
    body: 'Cash level-1 for all 500 constituents plus member futures — live in the .NET port, ~140 calls/min against the 190 cap.',
  },
] as const;

/** 03 — the approved contract's external sources. Dashed = approved, not yet collecting. */
export type FeedSourceStatus = 'live' | 'approved';

export const FEED_SOURCES: ReadonlyArray<{
  name: string;
  role: string;
  note: string;
  status: FeedSourceStatus;
}> = [
  {
    name: 'Fyers v3',
    role: 'Price · chain · candles',
    note: 'The primary pipe — every stream the exchange API actually exposes.',
    status: 'live',
  },
  {
    name: 'yfinance',
    role: 'Overnight global cues',
    note: 'Ten global tickers before the open, 08:45 and 10:00 IST.',
    status: 'live',
  },
  {
    name: 'nselib / nse-xbrl',
    role: 'Fundamentals',
    note: 'NSE filings with XBRL parsing — authoritative, free, no key.',
    status: 'approved',
  },
  {
    name: 'Economic Times RSS',
    role: 'News',
    note: 'Dedicated markets and stocks feeds. MoneyControl held as fallback.',
    status: 'approved',
  },
  {
    name: 'StockTwits',
    role: 'Sentiment',
    note: 'Native bullish/bearish tags. Large-cap watchlist only — that is the real coverage.',
    status: 'approved',
  },
  {
    name: 'RBI DBIE + eSankhyiki',
    role: 'Indian macro',
    note: 'FRED has no Indian series at all. These do.',
    status: 'approved',
  },
  {
    name: 'NSE deal CSV',
    role: 'Insider & bulk deals',
    note: 'The official download, not a scraper — NSE terms govern reuse.',
    status: 'approved',
  },
  {
    name: 'NSE actions CSV',
    role: 'Corporate actions',
    note: 'Dividends, splits, bonuses, buybacks, record and ex dates.',
    status: 'approved',
  },
];

export const FEED_NOTE =
  'Solid tiles are running. Dashed tiles are approved source picks — decided and costed, with the collectors themselves deferred to the implementation plan. Nothing here is implied to be collecting before it collects.';

/** 03 — what makes the rows joinable, as hairline rows. */
export const CONTRACT_FEATURES = [
  {
    title: 'One canonical ts_utc',
    body: 'IST is converted at ingest and no IST column survives. A quote at 09:15 and a headline at 09:15 are both 03:45Z and land in the same slice.',
  },
  {
    title: 'One symbol form',
    body: 'Fyers token form everywhere — NSE:RELIANCE. Every other spelling is normalized on the way in, and unmatched names are logged rather than dropped.',
  },
  {
    title: 'Never fail closed',
    body: 'An external outage degrades to silence, never to a stale value or a zero, and it never blocks the Fyers minute.',
  },
  {
    title: 'Known gaps, stated',
    body: 'No L2 depth for the indices, no futures OI from the quotes batch, no native higher timeframes, and expired F&O history at all.',
  },
] as const;

/** 04 — the designed research pipeline, as hairline rows. Every row is design. */
export const PIPELINE_ROWS: ReadonlyArray<{
  agent: string;
  reads: string;
  note: string;
}> = [
  {
    agent: 'Market analyst',
    reads: 'OHLCV and derived indicators',
    note: 'The reference framework leans on yfinance’s international coverage, and .NS symbols work.',
  },
  {
    agent: 'Sentiment analyst',
    reads: 'Social posts with a sentiment signal',
    note: 'US-centric chatter today. StockTwits’ large-cap watchlist is the Indian answer, and it is thinner.',
  },
  {
    agent: 'News analyst',
    reads: 'Company news, global news, insider transactions',
    note: 'FRED is US-only and Polymarket has no India contracts — both accepted gaps, not oversights.',
  },
  {
    agent: 'Fundamentals analyst',
    reads: 'Balance sheet, cash flow, income statement',
    note: 'Alpha Vantage is sparse for NSE. NSE’s own filings via nselib and nse-xbrl fill it.',
  },
  {
    agent: 'Trader → Risk',
    reads: 'The analysts’ refined context',
    note: 'Debate then oversight. One debate round and one risk round by default.',
  },
  {
    agent: 'Reflector',
    reads: 'Realized return against a benchmark',
    note: 'Writes outcomes to a memory log the next run reads — the part that makes a rerun reproducible.',
  },
];

export const PIPELINE_NOTE =
  'Every row above is a design. Wiring the agents is later effort: no agent runs today, and no research output exists.';

/** 05 — where it goes, as a status ledger. */
export type DirectionStatus = 'direction';

export const DIRECTIONS: ReadonlyArray<{
  title: string;
  status: DirectionStatus;
  bullets: ReadonlyArray<string>;
}> = [
  {
    title: 'Strategy backtesting',
    status: 'direction',
    bullets: [
      'Replay the full chain through a strategy’s rules and measure the result honestly.',
      'The per-minute archive the replay needs is being captured today; the replay engine does not exist.',
      'Expired F&O history is unavailable without a paid vendor — the hard gap for long horizons.',
    ],
  },
  {
    title: 'Strategy discovery',
    status: 'direction',
    bullets: [
      'Search candidate strategies rather than hand-craft one, with the analyst team pointed at many names.',
      'A single run is roughly 4–6 LLM calls per ticker; a 500-name universe is ~2,000–3,000 calls a day before any search multiplies it.',
      'That budget is unanswered, which is why discovery is a direction and not a plan.',
    ],
  },
  {
    title: 'Strategy validation',
    status: 'direction',
    bullets: [
      'Decide whether a survivor deserves capital — out of sample, across regimes, with costs modelled.',
      'Needs archive depth the platform has not accumulated and execution modelling it does not do.',
      'The Reflector’s benchmark-keyed memory log is the piece that would make a rerun mean something.',
    ],
  },
];

export const STATUS_LABEL: Record<DirectionStatus, string> = {
  direction: 'Research direction · not built',
};

export const DIRECTIONS_MORE =
  '“Discover and validate market opportunities” names where this goes. It is not a shipped capability, and this site does not publish backtests, performance figures, or strategy recommendations.';

/** 06 — the platform story. Nexus is the engine; it is in active development. */
export const BUILT_ON_NEXUS = {
  lede: 'AlphaLens is one of three Nanisoft products on one platform — and the platform has a factory behind it.',
  body: 'Nexus is Nanisoft’s agent factory: it turns an issue into a reviewed, merged change, so building each product becomes repeatable. It is in active development and building in the open — the same honesty this page applies to the option chain.',
  products: [
    { id: 'nexus', name: 'Nexus', tagline: 'The Agent Factory', pack: 'lavender', url: 'https://nexus.nanisoft.com' },
    { id: 'atlas', name: 'Atlas', tagline: 'The Digital Twin Platform', pack: 'green', url: 'https://atlas.nanisoft.com' },
    { id: 'prism', name: 'Prism', tagline: 'The design system this site wears', pack: 'blue', url: 'https://prism.nanisoft.com' },
  ],
} as const;

export const FINAL_CTA = {
  h2: 'Read the market the way an agent would.',
  body: 'Start with what the collector captures, then the contract that conforms it. The research design is there too, labelled as design.',
  primary: { label: 'Read the docs', href: '/docs' },
  secondary: { label: 'About AlphaLens', href: '/about' },
  footnote: 'In active development. Live, approved, and research-direction claims are labelled throughout.',
} as const;
