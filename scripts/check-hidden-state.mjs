/**
 * Gate 2: a CSS-authored hidden state can dismiss itself, and its exit is not a clock.
 *
 * The defect this replaces is not a bug report; it is a page nobody can read. The
 * sheet carried
 *
 *     .al [data-reveal]     { opacity: 0; transform: translateY(12px); transition: ... }
 *     .al [data-reveal].is-in { opacity: 1; transform: none; }
 *
 * and `is-in` is added by an IntersectionObserver in a client effect. That is the
 * only exit. There is no timeout, so there is nothing to wait for and nothing to
 * give up on: a reader with scripting disabled, a reader whose browser has no
 * IntersectionObserver, a reader whose JavaScript failed to parse, and a crawler
 * that never executes any of it all receive `opacity: 0` and nothing else. The
 * landing's entire body, below the header, is invisible. The `prefers-reduced-motion`
 * block is a second exit and it helps only the one reader the animation was for.
 *
 * The redesign law allows exactly two shapes for this: an escapable condition, or a
 * script-armed ancestor attribute. The arming is the one this site takes, and it is
 * the one that needs no clock, because **a condition that is never true is not a
 * wait**:
 *
 *     html[data-reveal-armed] [data-reveal] { opacity: 0; ... }
 *     html[data-reveal-armed] [data-reveal].is-in { opacity: 1; ... }
 *     @media (scripting: none) { html[data-reveal-armed] [data-reveal] { opacity: 1; ... } }
 *
 * The attribute is written by one inlined script in the document head and by nothing
 * else. A reader whose scripting is off never receives it, so the hidden state does
 * not exist for them. A reader whose scripting fails midway might, and the
 * `(scripting: none)` block is the guard for that case: it is a statement about
 * capability rather than about health, and it does not care why the script did not
 * finish. The two are complementary and neither is a timeout.
 *
 * **The clock is banned rather than shortened.** The family's own description of
 * this pattern used to be `animation: <fallback> 1ms linear 3s forwards` plus the
 * same media guard, and it is wrong in the way this gate is written to catch: a
 * fallback animation's clock starts at first style resolution rather than at scroll,
 * so by the time the class lands there is nothing left to cancel, and a reader on a
 * slow connection is looking at a blank page for three seconds of a timer that
 * measures the wrong interval. A timer that reveals content is a second mechanism
 * with its own failure mode, and the only one this site needed removed was the one
 * that could not fail open.
 *
 * `test/no-scripting.test.tsx` renders the landing with scripting disabled and
 * asserts the content is present and no `data-reveal-armed` attribute is in the
 * document, so the rendered-output half of the claim is tested as well as the
 * stylesheet half. A gate that only read the stylesheet would be satisfied by a
 * sheet that hides nothing and a page that hides everything.
 *
 * Run: node scripts/check-hidden-state.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const NAME = 'hidden-state';
const ROOT = process.cwd();

/** The stylesheets this gate reads. A list, so a new sheet is a decision. */
const SHEETS = ['app/globals.css'];

/**
 * How many rules the sheet must hold, or this run read nothing.
 *
 * Lower than the sibling gate's floor on purpose, and for a reason worth naming: this
 * repository's sheet is a third of the length the retired one was, so a floor written
 * for the old size would fail a correct sheet. A floor on *declarations* would be
 * better still, but the number that matters here is rules, because a rule is the unit a
 * hiding declaration can hide in.
 */
const MIN_RULES = 25;

/** A declaration that makes an element not painted. */
const HIDES = /^\s*(?:opacity\s*:\s*(?:0|0%)\b|visibility\s*:\s*hidden\b|display\s*:\s*none\b)/;

/** The marker an element carries when a stylesheet may hide it. */
const MARKER = /\[data-reveal\b/;

/** The ancestor attribute that arms the hidden state. Written by exactly one script. */
const ARMED = /\[data-reveal-armed\]/;

const findings = [];
let rules = 0;
let hiddenRules = 0;
let declarations = 0;

function blankComments(source) {
  const out = source.split('');
  for (let i = 0; i < out.length; i += 1) {
    if (out[i] === '/' && out[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      const end = close === -1 ? out.length : close + 2;
      for (let k = i; k < end; k += 1) if (out[k] !== '\n') out[k] = ' ';
      i = end - 1;
    }
  }
  return out.join('');
}

function blocks(css) {
  const found = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    found.push({
      selector: (match[1] ?? '').replace(/\s+/g, ' ').trim(),
      body: match[2] ?? '',
      line: css.slice(0, match.index).split('\n').length,
    });
  }
  return found;
}

/** Every source file the repository owns that could author a hidden state. */
function sourceFiles(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', 'out', '.git', '.wrangler', '.source'].includes(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, found);
    else if (/\.(tsx?|mjs|css)$/.test(entry)) found.push(full);
  }
  return found;
}

const missing = SHEETS.filter((sheet) => !(() => {
  try {
    readFileSync(path.join(ROOT, sheet), 'utf8');
    return true;
  } catch {
    return false;
  }
})());
if (missing.length > 0) {
  console.error(
    `\n${NAME}: ${missing.length} of ${SHEETS.length} configured stylesheets do not resolve: ${missing.join(', ')}.\n` +
      '  A gate that read nothing reports a clean sheet, so an unresolved root fails the run.',
  );
  process.exit(1);
}

for (const sheet of SHEETS) {
  const css = blankComments(readFileSync(path.join(ROOT, sheet), 'utf8'));
  const sheetHasScriptingNone = /@media[^{]*\(scripting\s*:\s*none\)/.test(css);

  for (const block of blocks(css)) {
    rules += 1;
    for (const declaration of block.body.split(';')) {
      if (/^[a-z-]+\s*:/.test(declaration.trim())) declarations += 1;
    }
    const hides = block.body
      .split(';')
      .some((declaration) => HIDES.test(declaration));
    if (!hides || !MARKER.test(block.selector)) continue;

    hiddenRules += 1;
    const where = `${sheet}:${block.line}`;

    /* 1. The exit may not be a clock, armed or not.
     *
     * An `animation` in a rule that hides content is the family's own retired shape,
     * `animation: <fallback> 1ms linear 3s forwards`, and it is wrong in a specific
     * way rather than a general one: that clock starts at first style resolution, not
     * at scroll, so by the time the class that would cancel it lands there is nothing
     * left to cancel. The result is a reader watching a blank page for the length of
     * a timer that measures the wrong interval, and a reader whose scripting is off
     * waiting out a timer they will never be given.
     *
     * A `transition` is not a clock and is not a finding: it says how long a reveal
     * takes once the class has landed, and it holds no content hostage until it does.
     * The distinction is the whole point, so it is spelled rather than left to a
     * reader of the sheet. */
    if (/(?:^|[;{\s])animation(?:-name|-duration|-delay|-iteration-count|-fill-mode|-play-state)?\s*:/.test(block.body)) {
      findings.push(
        `${where}  [clock-exit]  ${block.selector} reveals itself on an animation clock.\n` +
          '      A timer that reveals content is a second exit with its own failure mode, and this one starts at\n' +
          '      first style resolution rather than at scroll, so the class that would cancel it arrives too late.\n' +
          '      A transition is fine and is not what this names: scope the hidden state under a script-armed\n' +
          '      ancestor and remove the attribute to reveal it.',
      );
    }

    /* 2. The hidden state must be unreachable unless something armed it. */
    if (!ARMED.test(block.selector)) {
      findings.push(
        `${where}  [unarmed-hidden-state]  ${block.selector} hides content with no script-armed ancestor.\n` +
          '      A condition that is never true is not a wait, so an armed ancestor is the exit; without one the\n' +
          '      only way out is a script that may never run.',
      );
    }

    /* 3. And the guard, for the reader whose scripting is off. */
    if (!sheetHasScriptingNone) {
      findings.push(
        `${where}  [no-scripting-guard]  the sheet hides content and carries no (scripting: none) guard.\n` +
          '      The guard is a statement about capability rather than about health: it does not care whether the\n' +
          '      script was absent, blocked, or half-way through parsing.',
      );
    }
  }
}

/* The arming attribute has exactly one writer, and it is a script. A second writer is
   a second mechanism, which is what this gate exists to prevent.
 *
   Removing the attribute is the opposite and is not a finding: the exit is a removal,
   so code that can fail to arm is expected to be able to disarm. Only a *set* counts,
   and the arming script's own `try` is the shape the pattern requires. */
/* Exactly one writer, and it is the inlined string. So the finding is on the second
   and later, not on the first, and the count is printed on every run either way -
   a rule that finds nothing and a rule that found the thing it was written to find
   must not print the same line. */
const ARM_SET = /setAttribute\(\s*['"`]data-reveal-armed['"`]/;
/* A module is an exit: the reveal hook withdraws the arming on mount, which covers
   every reader whose JavaScript works, before the document has finished loading. */
const MODULE_DISARM = /removeAttribute\(\s*(?:['"`]data-reveal-armed['"`]|ARMED\b)/;
/* The inlined script is the floor, and it has to key off an event rather than a delay.
   `load` fires when the document arrives whatever happened to any individual script,
   which is the reader whose JavaScript started and then stopped. A delay would
   measure elapsed time instead of anything about the page, and would still fail on a
   slow connection, so it is the mechanism this pattern is being repaired away from. */
const INLINE_DISARM =
  /addEventListener\(\s*['"]load['"][\s\S]{0,240}removeAttribute\(\s*['"`]data-reveal-armed['"`]/;
let armingWriters = 0;
let moduleDisarmers = 0;
let inlineDisarmers = 0;
/* The arming string can live anywhere the document pulls it from, so the scan covers
   the three source roots rather than guessing: `app/` renders the document, `lib/`
   holds the theme module that owns both inlined strings, and `components/` holds the
   module that withdraws the arming. A new root is a decision a reader makes here. */
const SOURCE_ROOTS = ['app', 'lib', 'components'];
for (const file of SOURCE_ROOTS.flatMap((root) => sourceFiles(path.join(ROOT, root)))) {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.css')) continue;
  if (ARM_SET.test(text)) {
    armingWriters += 1;
    if (armingWriters > 1) {
      findings.push(
        `${path.relative(ROOT, file)}  [arming-writer]  a second source file sets data-reveal-armed.\n` +
          '      The arming is one inlined string in the document head. A second writer is a second exit, and the\n' +
          '      gate above can no longer reason about which one a reader gets.',
      );
    }
  }
  if (INLINE_DISARM.test(text)) inlineDisarmers += 1;
  else if (MODULE_DISARM.test(text)) moduleDisarmers += 1;
}
if (hiddenRules > 0 && armingWriters === 0) {
  findings.push(
    'the sheet hides content and no inlined script sets data-reveal-armed, so the hidden state is unreachable\n' +
      '      rather than escapable. An arming that is never written is not an exit.',
  );
}
if (hiddenRules > 0 && moduleDisarmers === 0) {
  findings.push(
    'the sheet hides content and no module withdraws data-reveal-armed on mount.\n' +
      '      A script that parses is not a script that works: a browser with no IntersectionObserver, or a reader\n' +
      '      whose script was blocked after the head, receives the arming and can never use it. Something has to\n' +
      '      be able to remove the attribute, and the path that removes it is the exit.',
  );
}
if (hiddenRules > 0 && inlineDisarmers === 0) {
  findings.push(
    'the sheet hides content and the inlined arming script has no exit of its own.\n' +
      '      The module covers a reader whose JavaScript works. This one covers the reader whose JavaScript\n' +
      "      started and stopped, and it has to key off an event: `load` fires when the document arrives whatever\n" +
      '      happened to any individual script, where a delay would measure elapsed time instead of anything\n' +
      '      about the page and would still fail on a slow connection.',
  );
}

if (rules < MIN_RULES) {
  console.error(
    `\n${NAME}: the sheets this run read hold ${rules} rule(s) and it needs at least ${MIN_RULES}. A renamed\n` +
      '  stylesheet path empties this run and an emptied run reports a clean sheet.',
  );
  process.exit(1);
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${SHEETS.length} sheet(s), ${rules} rule(s) and ${declarations} declaration(s) read`,
);
console.log(`${NAME}: sheets read: ${SHEETS.join(', ')}`);
console.log(
  `${NAME}: ${hiddenRules} rule(s) hide a marked element. Each one must be unreachable until a script arms it,\n` +
    '  and no exit may be a clock.',
);
console.log(`${NAME}: source roots read: ${SOURCE_ROOTS.join(', ')}`);
console.log(
  `${NAME}: arming writer(s): ${armingWriters}, module(s) that withdraw on mount: ${moduleDisarmers},` +
    ` inlined exit(s) on load: ${inlineDisarmers}`,
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\nA stylesheet may hide content only behind something that turns it off. A reader with scripting off has\n` +
      '  no timeout, no observer and no class, so a state that only a script can leave is a state they never leave.',
  );
  process.exit(1);
}

console.log(`${NAME}: every hidden state is armed, guarded, and has no clock for an exit.`);
