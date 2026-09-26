// The honesty guard — the test form of two user-locked laws:
//
//   1. The three-tier honesty model. Backtesting, strategy discovery and
//      strategy validation are RESEARCH DIRECTION, never shipped features. The
//      TradingAgents wiring and the k3s VPS endgame are DESIGNED, NOT BUILT.
//      Only the collector, its storage/operations, the .NET port Phase 1 and
//      the approved contract are claimable in the present tense.
//   2. The personal NSE frameworks NEVER appear in AlphaLens content.
//
// These are content laws, so they are tested against the content — scanning
// every markdown/MDX source and every landing copy module. A violation fails
// the build, which is the only place a law is actually enforced.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

const CONTENT_DIRS = [join(ROOT, 'content'), join(ROOT, 'lib'), join(ROOT, 'components'), join(ROOT, 'app')];

const SKIP = [/node_modules/, /\.next/, [/^out$/], /antd-vars\.css/].flat();

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (SKIP.some((pattern) => pattern.test(entry))) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (/\.(mdx?|tsx?|ts)$/.test(entry)) yield full;
  }
}

function sources(): Array<{ path: string; text: string }> {
  const files = new Set<string>();
  for (const dir of CONTENT_DIRS) {
    for (const file of walk(dir)) files.add(file);
  }
  return [...files].sort().map((path) => ({ path, text: readFileSync(path, 'utf8') }));
}

/** The human's personal NSE frameworks — they never appear, in any form. */
const FORBIDDEN_FRAMEWORK_TERMS: ReadonlyArray<{ term: RegExp; name: string }> = [
  { term: /multi[- ]timeframe/i, name: 'multi-timeframe analysis' },
  { term: /\brsi\b/i, name: 'RSI (divergence)' },
  { term: /divergence/i, name: 'RSI divergence' },
  { term: /fibonacci|\bfib\b/i, name: 'Fibonacci confluence' },
  { term: /position sizing|kelly criterion/i, name: 'position sizing' },
  { term: /stop[- ]loss/i, name: 'stop-loss placement' },
  { term: /risk[- ]reward (?:ratio|table)|\br:r\b/i, name: 'risk-reward tables' },
  { term: /trade setup|entry zone|profit target/i, name: 'setup/entry/target methodology' },
];

/**
 * Capability claims the material does not support. The pattern is *ownership*:
 * the words "backtester", "discovery" and "validation" are fine in direction
 * framing ("a backtester would need…", "no backtesting engine exists") — what
 * must never appear is AlphaLens owning one, shipping one, or reporting one's
 * results.
 */
const OVERCLAIM_PATTERNS: ReadonlyArray<{ term: RegExp; name: string }> = [
  { term: /\b(?:our|alpha(?:lens)?(?:’s|'s)?) (?:own |new |strategy )?backtest(?:er|ing engine)\b/i, name: 'an AlphaLens-owned backtester' },
  { term: /\b(?:our|alpha(?:lens)?(?:’s|'s)?) (?:strategy )?discovery (?:engine|machinery|module)\b/i, name: 'an AlphaLens discovery engine' },
  { term: /\b(?:our|alpha(?:lens)?(?:’s|'s)?) validation harness\b/i, name: 'an AlphaLens validation harness' },
  { term: /\bwe ship\b/i, name: '"we ship" (capability claim)' },
  { term: /\bis now (?:available|live)\b/i, name: 'a launch claim' },
  { term: /\bget started (?:with|in) (?:\d+ )?minutes?\b/i, name: 'a quickstart claim' },
  { term: /\binstall alphalens\b/i, name: 'an install instruction (no product ships)' },
  // Signals / advice / results — none exist.
  { term: /\b(?:buy|sell|strong buy|strong sell) (?:signal|rating)\b/i, name: 'a trading signal' },
  { term: /\b(?:backtest(?:ed)?|historical) (?:returns?|performance) (?:of|show|indicate)\b/i, name: 'a performance result' },
  { term: /\bprofitable strategy\b|\bwin rate of\b/i, name: 'a strategy performance claim' },
];

/** Outbound links must point at Nanisoft surfaces or the material's cited sources. */
const ALLOWED_LINK_HOSTS =
  /^(?:www\.nanisoft\.com|(?:nexus|atlas|alphalens|prism|playground)\.nanisoft\.com|github\.com|economictimes\.indiatimes\.com|moneycontrol\.com|nseindia\.com|bseindia\.com|data\.rbi\.org\.in|esankhyiki\.mospi\.gov\.in|api\.stocktwits\.com|api-docs\.stocktwits\.com|trendlyne\.com|tigzig\.com|polymarket\.com|docs\.polymarket\.com|support\.fyers\.in|fyers\.in|public\.fyers\.in|127\.0\.0\.1|localhost)$/;

describe('the honesty guard', () => {
  it('scans a real corpus (guard is not vacuously passing)', () => {
    const files = sources();
    expect(files.length).toBeGreaterThan(40);
    expect(files.some((file) => file.path.includes("content"))).toBe(true);
    expect(files.some((file) => file.path.includes("lib"))).toBe(true);
  });

  it('never mentions the personal NSE frameworks', () => {
    for (const { path, text } of sources()) {
      for (const { term, name } of FORBIDDEN_FRAMEWORK_TERMS) {
        const match = term.exec(text);
        expect(match, `${name} appears in ${path}: "…${match?.[0] ?? ''}…"`).toBeNull();
      }
    }
  });

  it('never claims a shipped backtester, discovery engine, validation harness, or result', () => {
    for (const { path, text } of sources()) {
      for (const { term, name } of OVERCLAIM_PATTERNS) {
        const match = term.exec(text);
        expect(match, `${name} claimed in ${path}: "…${match?.[0] ?? ''}…"`).toBeNull();
      }
    }
  });

  it('states the three tiers somewhere on the site', () => {
    const introduction = readFileSync(join(ROOT, 'content', 'docs', 'index.mdx'), 'utf8');
    expect(introduction).toMatch(/\*\*Live\*\*/);
    expect(introduction).toMatch(/\*\*Approved \/ designed\*\*/);
    expect(introduction).toMatch(/\*\*Research direction\*\*/);
  });

  it('marks the tradingagents wiring as designed, not built, in the docs', () => {
    const pipeline = readFileSync(join(ROOT, 'content', 'docs', 'research-pipeline', 'index.mdx'), 'utf8');
    expect(pipeline).toMatch(/Designed, not built/);
    expect(pipeline).toMatch(/not yet built|not built|does not exist/i);
  });

  it('marks the k3s VPS endgame as designed, not built', () => {
    const operations = readFileSync(join(ROOT, 'content', 'docs', 'data-platform', 'operations.mdx'), 'utf8');
    expect(operations).toMatch(/Designed, not built/);
    expect(operations).toMatch(/does not exist\s*yet/);
  });

  it('marks the data contract as approved but not yet implemented', () => {
    const contract = readFileSync(join(ROOT, 'content', 'docs', 'data-contract', 'index.mdx'), 'utf8');
    expect(contract).toMatch(/Approved, not yet implemented/);
  });

  it('labels the research directions as research direction on every page', () => {
    const dir = join(ROOT, 'content', 'docs', 'research-directions');
    for (const entry of readdirSync(dir)) {
      if (!entry.endsWith('.mdx')) continue;
      const text = readFileSync(join(dir, entry), 'utf8');
      expect(text, `${entry} must carry the research-direction note`).toMatch(/Research direction/);
    }
  });

  it('never publishes a backtest result, equity curve, or performance figure', () => {
    for (const { path, text } of sources()) {
      expect(text, path).not.toMatch(/\bCAGR\b/i);
      expect(text, path).not.toMatch(/\bsharpe ratio\s*[:=]\s*[\d.]/i);
    }
  });

  it('links only to Nanisoft surfaces or the material’s cited sources', () => {
    const urlPattern = /https?:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+/g;
    for (const { path, text } of sources()) {
      for (const match of text.matchAll(urlPattern)) {
        // Source files quote URLs in string literals — strip the trailing quote
        // before parsing, or it lands in the hostname.
        const candidate = match[0].replace(/['"),;]+$/, '');
        const host = new URL(candidate).hostname;
        expect(ALLOWED_LINK_HOSTS.test(host), `${path} links to ${host}`).toBe(true);
      }
    }
  });
});


