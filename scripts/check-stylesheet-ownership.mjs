/**
 * Gate 1: this site's stylesheet does not compete with the design system's base rules.
 *
 * The layer is not the cause of these failures; the layer is the reason they are
 * invisible. Prism's base rules sit in `@layer base` and a consumer's sheet is
 * unlayered, so an unlayered declaration outranks a layered one at any specificity
 * regardless of import order, and a consumer that imported its sheet first would have
 * exactly the same outcome. What the layer buys is that nobody can tell, from a
 * screenshot, that the site won.
 *
 * So ownership is gated instead. The list of assertions below is deliberately short
 * and it grows one commit at a time: **the first assertion is the focus rule, and it
 * is the one this repository's own sheet got wrong today.** The other two - the seven
 * properties prism's base declares, and the dead-alias shape - arrive with the
 * change that deletes the rules they name, so a reader can see which commit removed
 * which declaration rather than finding a clean sheet and no memory of it.
 *
 * ## The focus rule, and what it hid
 *
 * This sheet carried
 *
 *     :focus-visible { outline: 2px solid var(--prism-color-primary); outline-offset: 2px; }
 *
 * which looks like a sitewide keyboard focus indicator and is not one. Three
 * measured facts, in a real browser, in both modes, on the deployed site:
 *
 *   1. The site believed it drew the ring on every link. It did not: prism's own
 *      `a:focus-visible` is more specific, so a link never saw this declaration at
 *      all. The sheet was carrying a rule it did not own over a rule that already
 *      existed, and nothing in the rendered page said so.
 *   2. On an element no more specific rule covers, the ring measured
 *      `solid 2px rgb(207,122,156)` in dark and `solid 2px rgb(188,58,108)` in
 *      light. Those are the pack's primary values, which are **fills**: DESIGN.md's
 *      Fill, Not The Ink Rule says a pastel brand value is a fill and never an
 *      outline. The site was drawing an indicator in a colour the design system
 *      reserves for a fill.
 *   3. The moment `--prism-color-primary` stops resolving - which is what moving
 *      off the retired line does to every `--prism-*` read in this file - the
 *      declaration is invalid at computed-value time. `outline-style` falls back to
 *      `none` while `outline-offset: 2px`, a separate longhand, survives. Measured,
 *      both modes: `outline: none 3px rgba(...)`, offset `2px`. **The ring is gone
 *      and the rule has become a suppression**: on anything the design system did
 *      not draw, there is now nothing where the browser's own indicator used to
 *      stand, because a site's rule is what removed it.
 *
 * That third fact is the one a screenshot cannot show and the one this gate exists
 * to make impossible. The fix is deletion, not a better value: the design system
 * draws its ring on its own Components, and a plain anchor keeps the browser's own,
 * which is the only indicator on an element no Prism Component drew. Neither of
 * those can die because a token the site does not own stopped resolving.
 *
 * **The honest limit, printed on every run.** This is a text scan over class strings
 * and selectors, not a cascade resolution. It does not see a class-scoped rule that
 * competes, it does not see an inline `style` prop, it does not see a stylesheet it
 * is not pointed at, and it does not see prism's base layer change. A gate that
 * appeared to resolve cascades and did not would be worse than no gate, because it
 * would retire the question.
 *
 * Run: node scripts/check-stylesheet-ownership.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const NAME = 'stylesheet-ownership';
const ROOT = process.cwd();

/** The two selector shapes that are always a competition when they carry a focus selector. */
const FOCUS_SELECTOR = /:focus(-visible)?\b/;

/** The stylesheets this gate reads. A list, so a new sheet is a decision a reader sees. */
const SHEETS = ['app/globals.css'];

/**
 * How many declarations the sheets below must hold, or this run read nothing.
 *
 * A floor on declarations *read*, not on declarations *found*: a clean sheet is
 * supposed to find zero, so a floor on findings would fail a correct repository and a
 * floor on nothing would pass an unread one.
 */
const MIN_DECLARATIONS = 20;

/* Split a stylesheet into `selector { declarations }` without a CSS parser, keeping
   line numbers so a finding names the line a reader has to edit. Comments are
   stripped first and blanked rather than removed, for the same line-number reason. */
function blankComments(source) {
  const out = source.split('');
  for (let i = 0; i < out.length; i += 1) {
    if (out[i] === '/' && out[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      const end = close === -1 ? out.length : close + 2;
      for (let k = i; k < end; k += 1) {
        if (out[k] !== '\n') out[k] = ' ';
      }
      i = end - 1;
    } else if (out[i] === '/' && out[i + 1] === '/') {
      let end = source.indexOf('\n', i);
      if (end === -1) end = source.length;
      for (let k = i; k < end; k += 1) out[k] = ' ';
      i = end - 1;
    }
  }
  return out.join('');
}

function blocks(css) {
  const found = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of css.matchAll(pattern)) {
    const startLine = css.slice(0, match.index).split('\n').length;
    found.push({
      selectors: match[1].split(',').map((part) => part.trim()).filter(Boolean),
      body: match[2],
      startLine,
    });
  }
  return found;
}

const findings = [];
let sheets = 0;
let declarations = 0;
let rules = 0;

const missing = SHEETS.filter((sheet) => {
  try {
    readFileSync(path.join(ROOT, sheet), 'utf8');
    return false;
  } catch {
    return true;
  }
});
if (missing.length > 0) {
  console.error(
    `\n${NAME}: ${missing.length} of ${SHEETS.length} configured stylesheets do not resolve: ${missing.join(', ')}.\n` +
      '  A gate that read nothing reports a clean sheet, so an unresolved root fails the run.',
  );
  process.exit(1);
}

for (const sheet of SHEETS) {
  sheets += 1;
  const source = blankComments(readFileSync(path.join(ROOT, sheet), 'utf8'));
  for (const block of blocks(source)) {
    rules += 1;
    /* Coverage: every declaration in the sheet is counted, whether or not it is one
       the assertions name. This is the number that distinguishes a pass from a scan
       of nothing. */
    for (const declaration of block.body.split(';')) {
      if (/^[a-z-]+\s*:/.test(declaration.trim())) declarations += 1;
    }
    for (const selector of block.selectors) {
      /* A focus rule is a finding whatever it declares. Prism draws its ring on the
         component, as a `box-shadow` on a class, so a site `outline` does not compete
         with it: it draws a second band over the real one, and on anything that is
         not a Prism Component it is the only thing standing between a reader and no
         indicator - until its colour token stops resolving, at which point it is the
         thing taking the indicator away. */
      if (FOCUS_SELECTOR.test(selector)) {
        findings.push(
          `${sheet}:${block.startLine}  [focus-indicator]  ${selector} draws a focus indicator in the site's\n` +
            '      own sheet. The design system draws its ring on the component, and a plain anchor keeps the\n' +
            "      browser's own. A site rule is a second band over the first or the suppression of the second," +
            '\n      and a shorthand whose colour token stops resolving suppresses it rather than failing to draw.',
        );
      }
    }
  }
}

if (declarations < MIN_DECLARATIONS) {
  console.error(
    `\n${NAME}: the sheets this run read hold ${declarations} declaration(s) and it needs at least\n` +
      `  ${MIN_DECLARATIONS} to be sure it is reading them. A renamed stylesheet path empties this run and an\n` +
      '  emptied run reports a clean sheet.',
  );
  process.exit(1);
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${sheets} sheet(s), ${rules} rule(s) and ${declarations} declaration(s) read`,
);
console.log(`${NAME}: sheets read: ${SHEETS.join(', ')}`);
console.log(
  `${NAME}: this is a text scan over selectors, not a cascade resolution. It cannot see a class-scoped rule\n` +
    '  that competes, an inline style prop, or a sheet it is not pointed at.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\nA site stylesheet must not own a surface the design system already owns. The cascade layer is not\n` +
      '  the cause of the failures this replaces; it is the reason they were invisible.',
  );
  process.exit(1);
}

console.log(`${NAME}: this sheet draws no focus indicator of its own.`);
