// The honesty guard — the test form of the site's user-locked laws, and the one gate
// that had to be extended rather than copied.
//
//   1. The three-tier honesty model. Backtesting, strategy discovery and strategy
//      validation are RESEARCH DIRECTION, never shipped features. The TradingAgents
//      wiring and the k3s VPS endgame are DESIGNED, NOT BUILT. Only the collector, its
//      storage and operations, the .NET port Phase 1 and the approved contract are
//      claimable in the present tense.
//   2. The personal NSE frameworks NEVER appear in AlphaLens content.
//   3. A market-shaped surface carries a DISCLOSURE beside it. This is the third law and
//      it is new, and the reason is the failure the first two could not see.
//
// These are content laws, so they are tested against the content — scanning every
// markdown/MDX source and every landing copy module. A violation fails the build, which
// is the only place a law is actually enforced.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

/**
 * The roots the gate reads, and the directories it skips.
 *
 * The skip is a set of directories rather than a set of files, and that was a fix:
 * this test used to skip one generated stylesheet by name, the file was deleted with
 * the bake step that produced it, and a skip entry naming a file that no longer exists
 * is a rule that quietly stopped matching anything, which is indistinguishable from a
 * rule that never matched. A stale skip is only ever found by something reading the
 * scan, and the design system's own retired-line gate is what found this one: it
 * names the artefact, so a comment here recording why it is gone is a historical note
 * the gate discharges on the surface rather than a live reference.
 *
 * A directory stays true as a directory. This set is printed by the design system's
 * gate on every run, so an exclusion is arguable.
 */
const CONTENT_DIRS = [join(ROOT, 'content'), join(ROOT, 'lib'), join(ROOT, 'components'), join(ROOT, 'app')];

/** Generated trees, which are not this repository's source. A directory, so it stays true. */
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', '.git', '.wrangler', '.source', 'coverage']);

/** The source extensions the gate reads. `.css` is deliberately absent, and see below why. */
const SOURCE = /\.(mdx?|tsx?|ts)$/;

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (SOURCE.test(entry)) yield full;
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
 * the words "backtester", "discovery" and "validation" are fine in direction framing
 * ("a backtester would need…", "no backtesting engine exists") — what must never appear
 * is AlphaLens owning one, shipping one, or reporting one's results.
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

/**
 * The disclosure law, and the reason it is a check on existence rather than on wording.
 *
 * The retired hero drew a curve of open interest generated by `Math.sin(i * 12.9898 +
 * seed * 78.233) * 43758.5453` under a bar labelled "live view — nifty option chain, per
 * minute", with the word "illustrative" in nine-point type in the panel's footnote. Every
 * word the gate above reads was true: it *was* an illustrative rendering, and it *said*
 * so. The dishonesty was arithmetic — the shape was invented and the label read as a
 * feed — and a gate that scans prose for an overclaim cannot see arithmetic. A
 * contrast gate cannot see it either: the token is a perfectly good colour.
 *
 * So the law is now stated in the only direction a text scan can actually check: a
 * surface that is shaped like market data must carry a disclosure beside it, in the same
 * file, in a word a reader sees. That is a check on whether the surface exists and
 * whether it is honest about itself, not a check on whether the prose is flattering.
 *
 * Two halves, and they fail in different directions:
 *
 *   - **No fabricated data source.** No `Math.sin`, `Math.random`, `mulberry32` or any
 *     other generator dressed as a measurement. A data series on this site comes from the
 *     archive or it does not appear.
 *   - **A disclosure beside anything that is.** A canvas, an SVG chart, a `Diagram` whose
 *     nodes are prices, or a `<figure>` labelled with market vocabulary, must sit in a
 *     file that also says what it is. The one drawing left on the site is a diagram of
 *     four documented capture stages, and its panel's footnote is the disclosure.
 */
const DATA_GENERATORS: ReadonlyArray<{ term: RegExp; name: string }> = [
  { term: /Math\.(?:sin|random|cos|tan)\s*\(/, name: 'a synthetic data generator' },
  { term: /mulberry32|xorshift|seedrandom/, name: 'a seeded PRNG' },
];

/** A surface shaped like market data: a drawing, or a label that names a market. */
const MARKET_SURFACE: ReadonlyArray<{ term: RegExp; name: string }> = [
  { term: /<canvas|createElement\(\s*['"]canvas['"]|getContext\(\s*['"]2d['"]/, name: 'a canvas' },
  { term: /open interest|\bcall\b.*\bput\b|at-the-money|\bATM\b.*\bput\b/i, name: 'a market-data vocabulary' },
  { term: /nifty|banKNIFTY/i, name: 'a market index named by a surface' },
];

/** What a disclosure says, in the words this site uses. */
const DISCLOSURES: readonly RegExp[] = [
  /illustrative/i,
  /not a live quote/i,
  /no market values are drawn/i,
  /as this site documents them/i,
  /published (?:facts|figures|numbers)/i,
];

describe('the honesty guard', () => {
  it('scans a real corpus (guard is not vacuously passing)', () => {
    const files = sources();
    expect(files.length).toBeGreaterThan(40);
    expect(files.some((file) => file.path.includes('content'))).toBe(true);
    expect(files.some((file) => file.path.includes('lib'))).toBe(true);
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

  it('separates the blog index eyebrow with a middot', () => {
    // The baseline's blog index printed `nanisoft · alphalens · blog`, and this one prints
    // it too, which is the whole assertion. Two things are being held at once.
    //
    // The *value* is a published string, so changing the middot to a dash would be a copy
    // edit, and the parity tool would report it as an undeclared difference among 949
    // entries. Asserting the string here puts the failure next to the sentence that
    // explains it instead of in a list of 949.
    //
    // The *separator* is also a choice, and the law above is what chose it. An em dash here
    // would have been a fourth dash authored by this migration, in a file whose other three
    // are frozen, and it would have been the cheapest possible way to make the eyebrow look
    // like the About page's - which prints `nanisoft · alphalens — about` because that page
    // is frozen and has always said so. Matching a frozen neighbour is not a licence to
    // author a new dash, and the middot is what both the baseline and this site use.
    const blog = readFileSync(join(ROOT, 'app', 'blog', '[[...slug]]', 'page.tsx'), 'utf8');
    expect(blog).toContain('nanisoft · alphalens · blog');
    expect(blog).not.toContain('nanisoft · alphalens — blog');
  });

  it('adds no em dash, en dash or ??? to the copy this site authors', () => {
    // Reader-facing copy carries no em dash, no en dash and no `???`. The published copy on
    // this site is full of all three - 248 strings in the pre-migration baseline carry an
    // em dash - and it is frozen, so the law cannot be "no dashes anywhere": that would
    // demand 248 copy edits the migration is forbidden to make, and the demand would be met
    // by deleting the corpus.
    //
    // So the law is the one that can hold: **this site authors no new dashes, and the files
    // carrying frozen prose do not gain any.** Two halves, because either alone is weak.
    //
    // The first half is an exemption list, and it is small and arguable. Each entry names
    // the files whose prose is the pre-migration page's, byte for byte, and why: the
    // content-parity baseline was cut from the deployed site, so replacing a dash inside
    // one of those sentences is a copy edit this migration is not allowed to make. The fix
    // is a content change and belongs in its own commit with its own reason.
    //
    // The second half is what stops the list becoming a hole: each exempt file's dash count
    // is asserted against a number recorded here, so a new dash added to a frozen file fails
    // without anybody maintaining a list of sentences. A count is a blunt instrument - it
    // cannot tell a fixed sentence from a new one - and it is paired with the first half
    // for exactly that reason. What it can do is catch growth, and growth is the way a
    // frozen file starts quietly becoming an edited one.
    //
    // The paths are matched on a suffix with both separators spelled out, because the same
    // test runs on Windows and on Linux and a separator is the only thing that differs. A
    // path that matched on one platform and not the other is a gate that passes somewhere
    // and fails somewhere else, which is worse than no gate.
    const FROZEN: ReadonlyArray<{ path: string; dashes: number; why: string }> = [
      {
        path: 'app/about/page.tsx',
        dashes: 7,
        why: 'The About page\'s prose, carried verbatim from the pre-migration page.',
      },
      {
        path: 'lib/content.ts',
        dashes: 21,
        why: 'The landing\'s copy, which is published text and frozen by the same argument.',
      },
      {
        path: 'app/layout.tsx',
        dashes: 2,
        why: 'The site\'s default title and description, both published strings in the baseline.',
      },
      {
        path: 'app/blog',
        dashes: 3,
        why: 'The blog index\'s metadata and its empty-state sentence, both published strings.',
      },
      {
        path: 'components/DocsIndex.tsx',
        dashes: 2,
        why: 'The documentation index\'s description, published in the baseline at the same address.',
      },
      {
        path: 'components/Landing.tsx',
        dashes: 5,
        why:
          'The section descriptions, which are the retired page\'s paragraphs. The em dashes are inside\n' +
          '      those paragraphs, not in anything this migration wrote.',
      },
    ];

    const exempt = (path: string) =>
      FROZEN.find((entry) => path.includes(entry.path) || path.includes(entry.path.split('/').join('\\')));

    for (const { path, text } of sources()) {
      // The published corpus is frozen wholesale and is the largest exemption there is, so
      // it is stated once here rather than as 31 entries: every `.mdx` under `content/` is
      // published copy the migration is forbidden to edit, and the corpus predates this
      // rule. A new document in the corpus is a new published document and is out of scope
      // for the same reason, so a size-based floor on the corpus adds nothing.
      if (path.endsWith('.mdx')) continue;

      // Comments are not reader-facing copy, so the count is over the code alone.
      const found = dashCount(text);
      const frozen = exempt(path);
      if (!frozen) {
        expect(
          found,
          `${path} introduces ${found} em dash, en dash or ??? into copy this site authors. A sentence\n` +
            '    written here uses a semicolon, a colon or a full stop where it would otherwise reach for a dash.',
        ).toBe(0);
        continue;
      }
      expect(
        found,
        `${path} carries ${found} dash(es) and the frozen count is ${frozen.dashes}. ${frozen.why}\n` +
          '    A new dash in a file whose prose is frozen is a copy edit, and this migration does not make one:\n' +
          '    the parity baseline is cut from the deployed site. Fix the sentence and the count together, or\n' +
          '    decide the copy change deliberately and record it in the expectations file.',
      ).toBe(frozen.dashes);
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

describe('the disclosure law: a market-shaped surface says what it is', () => {
  /** The files that carry a surface, so the rest of the corpus is not asserted about it. */
  function marketShaped(): Array<{ path: string; text: string; surface: string }> {
    const found: Array<{ path: string; text: string; surface: string }> = [];
    for (const { path, text } of sources()) {
      for (const { term, name } of MARKET_SURFACE) {
        const match = term.exec(text);
        if (match) found.push({ path, text, surface: name });
      }
    }
    return found;
  }

  it('has a market-shaped surface to govern, so the law is not vacuously passing', () => {
    // The law is a check on a surface's existence, so a corpus with no surface would
    // satisfy it by having nothing to lie about. This asserts the opposite: there IS a
    // drawing, it is a documented diagram of the capture path, and it is disclosed.
    const shaped = marketShaped();
    expect(shaped.length).toBeGreaterThan(0);
    expect(shaped.some((entry) => /market-data vocabulary/.test(entry.surface))).toBe(true);
  });

  it('ships no fabricated data source at all', () => {
    for (const { path, text } of sources()) {
      for (const { term, name } of DATA_GENERATORS) {
        const match = term.exec(text);
        expect(
          match,
          `${name} in ${path}: "…${match?.[0] ?? ''}…"\n` +
            '    The retired hero drew open interest from Math.sin and labelled it a live view, and no gate that\n' +
            '    reads prose could see it. A series on this site comes from the archive or it does not appear.',
        ).toBeNull();
      }
    }
  });

  it('discloses every market-shaped surface in the same file that draws it', () => {
    for (const { path, text, surface } of marketShaped()) {
      // A document is allowed to *discuss* market vocabulary - it is a research site and
      // the corpus is about an option chain. What is not allowed is a file that draws
      // something market-shaped without saying what the drawing is.
      const draws = /<canvas|createElement\(\s*['"]canvas['"]|getContext\(\s*['"]2d['"]|<svg|<Diagram/.test(
        text,
      );
      if (!draws) continue;
      const disclosed = DISCLOSURES.some((term) => term.test(text));
      expect(
        disclosed,
        `${path} draws a market-shaped surface (${surface}) and does not disclose what it is.\n` +
          '    A disclosure is one of: an "illustrative" statement, "not a live quote", or a sentence saying\n' +
          '    that no market values are drawn. The retired hero had the disclosure in nine-point type in a\n' +
          '    footnote under a label reading as a live feed; a disclosure that small is a retraction, not a\n' +
          '    disclosure, so this gate requires the words in the same file.',
      ).toBe(true);
    }
  });

  it('puts the disclosure where a reader meets it, not only in a source file', () => {
    // The panel's footnote is the disclosure a reader sees. It is asserted here against
    // the content module rather than against the rendered page, because the rendered page
    // is checked by `check-both-modes` and a check that asserted the same thing in two
    // places would be one check that fails twice.
    const content = readFileSync(join(ROOT, 'lib', 'content.ts'), 'utf8');
    const panel = /footnote:\s*\n?\s*'([^']*)'/.exec(content)?.[1] ?? '';
    expect(panel, 'the hero panel must carry a footnote, or it has nothing to disclose').not.toBe('');
    expect(
      DISCLOSURES.some((term) => term.test(panel)),
      `the hero panel's footnote is not a disclosure: "${panel}"`,
    ).toBe(true);
    expect(panel).toMatch(/no market values are drawn/i);
  });

  it('draws no canvas anywhere, and ships no animation clock either', () => {
    // The canvas is cut for a structural reason rather than a size one: a canvas reads
    // computed colours from one element, so a pack boundary above it hands it the light
    // values on a dark page, and a resolved value does not move when the pack beneath it
    // does. The token-driven inline replacement that took its place resolves through the
    // cascade, holds every pack, and ships no client code.
    //
    // Comments are stripped before this one and not before the others, and the asymmetry
    // is the point. The files that *explain* the removal name the mechanisms they
    // removed, so a scan of raw text fails on the documentation of a fix - and a gate
    // that punishes a comment is a gate whose cheapest response is to delete the
    // comment. This file's own header is the reason that trade is a bad one.
    for (const { path, text } of sources()) {
      expect(text, `${path} draws a canvas`).not.toMatch(/<canvas|getContext\(\s*['"]2d['"]/);
      const code = stripComments(text);
      expect(code, `${path} ships an animation loop`).not.toMatch(/requestAnimationFrame/);
      expect(code, `${path} ships a keyframe animation`).not.toMatch(/@keyframes/);
    }
  });
});

/** The source with its comments removed, blanked rather than cut so lines still line up. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (line) => line.replace(/[^\n]/g, ' '));
}

/** How many em dashes, en dashes and `???` a file's *code* carries, comments excluded. */
function dashCount(text: string): number {
  return (stripComments(text).match(/—|–|\?\?\?/g) ?? []).length;
}
