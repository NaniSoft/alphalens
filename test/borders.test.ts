import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The border token, and the fifteen boxes whose edges depend on it.
 *
 * The retired sheet declared one alias and read it from fifteen border declarations:
 *
 *     --al-hairline: color-mix(in srgb, var(--prism-color-primary) 16%, transparent);
 *     .al-panel     { border: 1px solid var(--al-hairline); }
 *     … fourteen more, the same shape
 *
 * A shorthand with one dead operand is invalid at computed-value time, so the whole
 * `border` value falls back to its initial: `border-style: none`. The box loses its
 * **geometry**, not its colour, which is why a screenshot shows nothing wrong - a border
 * that is absent reads as a deliberate absence. Measured in a real browser on the
 * deployed site, in both modes, all fifteen read `1px solid` while the alias resolved and
 * `0px / none` the instant it did not, and the hero's entire right column became an empty
 * rounded box.
 *
 * The restoration is one purpose-built token that carries the width, the style and the
 * colour together, so there is no mix to invalidate and the only operand is the design
 * system's own `--border`, which is defined for every pack and in both modes. The width
 * is the measured one the boxes already had: one pixel, read off the computed value
 * before the migration rather than chosen here.
 *
 * This file asserts the two halves a text scan can reach. The third half - that the
 * computed width is one pixel on the built page, in both modes - is measured in a browser
 * by `pnpm check:both-modes`, and neither file is sufficient alone: a token nobody reads
 * restores nothing, and a token nobody checks is a token that dies quietly.
 */
const ROOT = path.resolve(__dirname, '..');
const sheet = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');

/** The design system's own border token, as the token build emits it for every pack. */
const DESIGN_SYSTEM_BORDER = /--border:\s*#[0-9a-f]{3,8}/i;

describe('the border token', () => {
  it('carries the width, the style and the colour, so there is no mix to invalidate', () => {
    expect(sheet).toMatch(/--site-border:\s*1px solid var\(--border\)/);
  });

  it('takes its one operand from the design system, which is defined for every pack', () => {
    // A local alias over another local alias is the shape that produced the defect: the
    // second one is a dead operand the moment the first stops resolving, and nothing in
    // the CSS says so.
    expect(sheet).not.toMatch(/--site-border:[^;]*var\(--al-/);
    expect(sheet).not.toMatch(/--site-border:[^;]*color-mix/);
  });

  it('is read by every box that used to lose its edge', () => {
    // The count is a floor rather than an equality, and the reason is worth stating: the
    // migration moved most of those boxes into catalogue Blocks, which carry the design
    // system's own `border-border` utility rather than a site class. So the *site
    // declarations* fell from fifteen to three, and the edges they drew are now drawn by
    // the design system on the same elements.
    //
    // That makes a text count of site declarations the wrong assertion on its own: it
    // would pass a sheet that declared the token and read it nowhere. So the floor here
    // is on the token existing, the token being read at all, and the token resolving - and
    // the *rendered* edge count is measured in a browser by `scripts/check-both-modes.mjs`,
    // which is the only thing that can see whether a box came out with an edge.
    const readers = sheet.match(/border[a-z-]*:\s*var\(--site-border\)/g) ?? [];
    expect(readers.length).toBeGreaterThanOrEqual(3);
    expect(sheet, 'the token is declared and read by nothing').toMatch(/--site-border:/);
  });

  it('is read by a declared device on each of the three surfaces that draw boxes', () => {
    // The three site devices that draw a box are the documentation card, the status note
    // above the index, and the corpus's status panel. Each was one of the fifteen, and a
    // migration that dropped one would leave a card with no edge, which reads as a
    // deliberate absence rather than as a bug.
    for (const device of ['.site-docs-index__card', '.site-status-note', '.site-note']) {
      const rule = new RegExp(`${device.replace('.', '\\.')}\\s*\\{[^}]*border[a-z-]*:\\s*var\\(--site-border\\)`);
      expect(rule.test(sheet), `${device} draws a box with no edge from the site's own token`).toBe(true);
    }
  });

  it('never mixes a var() into a colour, which erases a declaration rather than repainting it', () => {
    // The sheet with its comments blanked: the header comment quotes the old alias and
    // names the failure, and a raw scan would fail on the documentation of the fix.
    const code = sheet
      .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
      .replace(/(^|[^:])\/\/[^\n]*/g, (line) => line.replace(/[^\n]/g, ' '));
    expect(code).not.toMatch(/color-mix\([^)]*var\(/);
  });
});

describe('the design system publishes the token the fifteen read', () => {
  it('declares --border on every pack root, in both modes', () => {
    // Read from the installed package rather than from this repository, because the claim
    // is about the design system's own emitted stylesheet and a copy of it here would be
    // a second source of truth that stops being true the moment a pack is added.
    //
    // Resolved through the component package's own manifest, because the token package is the
    // component package's dependency and this repository does not declare it. A hard path under
    // `node_modules` is a claim about this repository's hoisting layout, which is not a thing
    // this repository decides any more.
    const tokens = createRequire(require.resolve('@nanisoft/prism-ui/package.json'));
    const themes = readFileSync(tokens.resolve('@nanisoft/prism-tokens/dist/themes/blush/light.css'), 'utf8');
    const dark = readFileSync(tokens.resolve('@nanisoft/prism-tokens/dist/themes/blush/dark.css'), 'utf8');
    for (const [mode, source] of [
      ['light', themes],
      ['dark', dark],
    ] as const) {
      const block = /\[data-pack="blush"\]\s*\{([\s\S]*?)\}/.exec(source)?.[1] ?? '';
      expect(block, `no pack block for blush ${mode}`).toBeTruthy();
      expect(block, `--border is not declared for blush ${mode}`).toMatch(DESIGN_SYSTEM_BORDER);
      expect(block, `--ring is not declared for blush ${mode}`).toMatch(/--ring:\s*#[0-9a-f]{3,8}/i);
    }
  });
});
