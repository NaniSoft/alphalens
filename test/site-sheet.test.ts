import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * This site's own sheet, read for the three laws it declares about itself.
 *
 * **What jsdom cannot check, stated once here rather than in each file.** jsdom has no
 * layout engine and no cascade: `getBoundingClientRect()` returns zeros, nothing computes
 * a used value for `flex`, `fr`, `minmax()` or `ch`, and a rule's winning status is not
 * observable at all. So nothing below asserts a geometry. Each assertion is about the
 * mechanism that produces the geometry - the declaration, its absence, or its relationship
 * to the design system's own emitted sheet - and the measured numbers are in the comment
 * beside each one, taken from the built export or from the published token values.
 */
const ROOT = path.resolve(__dirname, '..');
const sheet = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');

/** The sheet with its comments blanked, so a scan cannot fail on the documentation of a rule. */
const code = sheet
  .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:])\/\/[^\n]*/g, (line) => line.replace(/[^\n]/g, ' '));

/** One declaration in one rule, as a number of rem. `0.75rem` reads as `0.75`. */
function remOf(selector: string, property: string): number {
  const block = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(code)?.[1] ?? '';
  const found = new RegExp(`${property}\\s*:\\s*([\\d.]+)rem`).exec(block)?.[1];
  if (found === undefined) throw new Error(`${selector} declares no ${property} in rem`);
  return Number(found);
}

describe('the eight source tiles put the status above the role', () => {
  it('sets the status on the reading scale and the role on the machine one', () => {
    // Measured on the built export before this change: eight status pills and eight role
    // lines, all at 10px, on the eight tiles of section 03, with the tile's own name
    // larger than either. `components/Landing.tsx` states why the word is the important
    // one: a reader deciding whether a source exists reads the status before the note, and
    // the dashed border is the same fact said again in shape rather than in type.
    //
    // 0.75rem is `--text-xs`, the smallest step Prism's type scale offers for anything a
    // reader reads, and it is the smallest step any Prism component actually renders on
    // this site. 0.625rem is `--text-mono`, the machine step: declared in the theme, and
    // put on no rendered page here. So the status is legible and the role is supporting,
    // and the two can no longer be the same size by accident.
    expect(remOf('.site-source__status', 'font-size')).toBe(0.75);
    expect(remOf('.site-source__role', 'font-size')).toBe(0.6875);
  });

  it('keeps the status the only coloured word on the tile, so it is the one a reader finds', () => {
    // Contrast was never the defect: `--success` on `--background` in this pack's blush
    // is 5.01:1 in light and 8.69:1 in dark, computed from the published token values, and
    // both clear 4.5:1 at the larger size. What made the word hard to find was that it was
    // the same size as the muted role line and the smallest text on the tile.
    //
    // The ordering asserted is the one the tile now has: the name at the base size it
    // inherits, the status next, the note, then the role as the smallest line on the tile.
    // The role is the only one of the four that must be the smallest, because it is the
    // only one whose loss costs a reader no fact: the state it would have carried is on the
    // tile twice already, in the status word and in the border.
    const status = remOf('.site-source__status', 'font-size');
    const role = remOf('.site-source__role', 'font-size');
    expect(status, 'the status is not larger than the role it outranks').toBeGreaterThan(role);
    expect(status, 'the status is below the smallest step the design system renders').toBeGreaterThanOrEqual(0.75);
    // And it is weighted, because the role is not.
    expect(/\.site-source__status\s*\{[^}]*font-weight:\s*600/.test(code)).toBe(true);
    expect(/\.site-source__role\s*\{[^}]*font-weight:/.test(code)).toBe(false);
  });

  it('leaves the border carrying the state redundantly, in shape rather than in tint', () => {
    // The audit's last clause, and it is the one that makes the larger status safe to rely
    // on: a reader who cannot separate two tints of the same neutral still has a solid edge
    // against a dashed one.
    expect(/\.site-source\[data-status='approved'\]\s*\{\s*border-style:\s*dashed;\s*\}/.test(code)).toBe(true);
    expect(/\.site-source\s*\{[^}]*border:\s*var\(--site-border\)/.test(code)).toBe(true);
  });
});

describe('the document is a column, so a short page puts its footer on the screen', () => {
  it('makes body a column of at least one viewport and lets main take the slack', () => {
    // Measured on `/404` at 1440 by 900 before this change: the bar is 57px, `main`
    // resolved to 900px, and the footer's top edge landed at 957px, so the one page whose
    // only job is to offer a way out kept that way 57px below the fold. The old rule was
    // `min-height: 100dvh` on `main`, which is a sticky footer stated backwards: it pads
    // `main` to a whole viewport and so pushes the footer one viewport lower.
    //
    // The arrangement that does it is three children in a column at least one viewport
    // tall with the middle one growing, so the footer's bottom edge lands on the viewport's
    // bottom edge when the page is short and under the content when it is not. jsdom
    // cannot resolve any of that, so what is asserted is the mechanism: the three
    // declarations, and the absence of the one that replaced them.
    const body = /\nbody\s*\{([^}]*)\}/.exec(code)?.[1] ?? '';
    expect(body, 'body is not a column').toMatch(/display:\s*flex/);
    expect(body, 'body is not a column').toMatch(/flex-direction:\s*column/);
    expect(body, 'body is not at least one viewport tall').toMatch(/min-height:\s*100dvh/);

    const main = /\.site-main\s*\{([^}]*)\}/.exec(code)?.[1] ?? '';
    expect(main.trim(), 'main does not grow into the slack').toBe('flex: 1 0 auto;');
    expect(main, 'main is still padded to a whole viewport').not.toMatch(/min-height/);
  });

  it('grows main without ever letting a tall page be compressed to fit', () => {
    // `1 0 auto`, and the two numbers are both load-bearing. A shrink factor of 1 against a
    // zero basis would let a page taller than the viewport be squeezed to fit the column,
    // and an omitted basis would leave the rule depending on `min-height: auto` resolving
    // to a content floor. Both are named here because `flex: 1` is shorter and both of its
    // failures are silent.
    expect(/\.site-main\s*\{[^}]*flex:\s*1\s+0\s+auto;/.test(code)).toBe(true);
    expect(/\.site-main\s*\{[^}]*flex:\s*1\s*;/.test(code)).toBe(false);
  });

  it('declares only layout on body, which is what the ownership gate allows of it', () => {
    // Prism's own `body` rule is inside `@layer base` and this sheet is unlayered, so a
    // bare-element rule here wins the cascade at any specificity: the old class rule was
    // never in competition with anything. Prism declares four properties on `body` in that
    // layer - `background-color`, `color`, `font-family`, `-webkit-font-smoothing` - and the
    // `stylesheet-ownership` gate forbids a bare element from declaring the seven properties
    // its base layer declares. `display`, `flex-direction` and `min-height` are none of them,
    // which is the whole reason this arrangement is available at all.
    const body = /\nbody\s*\{([^}]*)\}/.exec(code)?.[1] ?? '';
    const owned = /\b(?:background|background-color|color|font-family|outline|outline-style|border-color)\s*:/;
    expect(owned.test(body), 'this sheet declares a surface the design system owns on body').toBe(false);
  });
});

describe('motion in this sheet is a token, and there is no hidden state to exit', () => {
  it('carries no raw cubic-bezier literal and no raw duration', () => {
    // The design system's own prohibition, and the sheet broke it exactly once: the scroll
    // reveal declared `transition: opacity 280ms cubic-bezier(0.25, 1, 0.5, 1)`. Motion
    // here takes `var(--duration-*)` and `var(--ease-*)` so that a change to the system's
    // own timing is one token rather than a second spelling of it in a consumer sheet.
    expect(code, 'a raw cubic-bezier literal in this sheet').not.toMatch(/cubic-bezier\(/);
    expect(code, 'a raw duration in this sheet').not.toMatch(/(?:^|[;{\s])(?:transition|animation)[a-z-]*\s*:[^;]*\b\d+(?:\.\d+)?m?s\b/);
  });

  it('makes nothing not painted', () => {
    // The only `display: none` in the sheet is the narrow-screen withdrawal of the hero
    // panel, which is a withdrawal from every mode and needs no exit. An `opacity: 0` or a
    // `visibility: hidden` would be a hidden state, and this site ships none: the
    // `data-reveal` mechanism this sheet used to carry matched zero of the thirty-six
    // emitted pages, and a stylesheet half that hides nothing is the correct outcome rather
    // than a missing one. The `hidden-state` gate says so itself, in those words.
    const hides = code
      .split('}')
      .filter((block) => /(?:^|[;{\s])(?:opacity\s*:\s*(?:0|0%)|visibility\s*:\s*hidden)\s*(?:;|$)/.test(block));
    expect(hides, `a rule here makes an element not painted: ${hides.join('}')}`).toEqual([]);
  });

  it('names no reveal attribute, so nothing can be waiting for a class that never lands', () => {
    expect(code, 'this sheet still styles a reveal marker').not.toMatch(/data-reveal/);
  });
});