import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The sitewide keyboard focus indicator belongs to the design system, and this file
 * is the assertion that it no longer belongs to the site.
 *
 * The failure it prevents is measured rather than argued. On the deployed site the sheet
 * carried `:focus-visible { outline: 2px solid var(--prism-color-primary);
 * outline-offset: 2px }`, and in a real browser, in both modes:
 *
 *   - a link never saw it, because prism's own `a:focus-visible` is more specific, so
 *     the sheet was carrying a rule it did not own over one that already existed;
 *   - where nothing more specific applied, it drew a 2px outline in the pack's
 *     `primary`, which the design system reserves for a fill and never for a ring;
 *   - and with `--prism-color-primary` no longer resolving, `outline-style` fell back to
 *     `none` while `outline-offset: 2px` survived, so the rule went from drawing an
 *     indicator to suppressing one. Both modes, measured.
 *
 * The repair is the absence of the rule, and absence is what a test can assert. A
 * screenshot cannot see any of the three facts above, which is the reason the check is
 * here rather than in a review. The half that needs a cascade is measured by
 * `scripts/check-both-modes.mjs`, which presses Tab over the built export in both modes;
 * a text scan and a browser answer different questions and neither is sufficient alone.
 */
const ROOT = path.resolve(__dirname, '..');
const SHEET = path.join(ROOT, 'app', 'globals.css');

/**
 * The sheet with its comments blanked rather than removed, so line numbers survive and a
 * rule named in prose is not a rule.
 */
function sheetBody(): string {
  return readFileSync(SHEET, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (line) => line.replace(/[^\n]/g, ' '));
}

/** Every `selector { declarations }` in the sheet, flattened across commas. */
function rules(css: string): Array<{ selector: string; body: string; line: number }> {
  const found: Array<{ selector: string; body: string; line: number }> = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const line = css.slice(0, match.index).split('\n').length;
    for (const selector of (match[1] ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)) {
      found.push({ selector, body: match[2] ?? '', line });
    }
  }
  return found;
}

const sheet = sheetBody();
const all = rules(sheet);

describe('the sitewide focus indicator', () => {
  it('reads a real stylesheet, so this is not a pass over nothing', () => {
    // A floor, not a description. The sheet is a quarter of the length it was, so the
    // number is the migration's own and a reader can see it fall in the diff.
    expect(all.length).toBeGreaterThan(25);
    expect(sheet).toContain('.site-docs-index__card');
  });

  it('carries no focus rule of its own', () => {
    const offenders = all
      .filter((rule) => /:focus(-visible)?\b/.test(rule.selector))
      .map((rule) => `${rule.selector} at line ${rule.line}`);
    expect(
      offenders,
      "a focus rule in an unlayered sheet is a second band over the design system's own ring, and a\n" +
        "    shorthand whose colour token stops resolving is the suppression of the browser default rather than\n" +
        '    a failure to draw. Delete the rule; do not give it a better colour.',
    ).toEqual([]);
  });

  it('declares no outline at all, so no rule of ours can suppress a ring', () => {
    const offenders = all
      .filter((rule) => /(?:^|[;{\s])(?:outline|outline-style|outline-width|outline-color)\s*:/.test(rule.body))
      .map((rule) => `${rule.selector} at line ${rule.line}`);
    expect(
      offenders,
      "the outline properties are the design system's surface. A site declaration of any of the four is\n" +
        "    either a competing ring or a suppression of one, and there is no third thing it can be.",
    ).toEqual([]);
  });
});
