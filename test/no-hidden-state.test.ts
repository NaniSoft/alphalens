import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * This repository ships no hidden state and draws no client boundary of its own.
 *
 * It used to ship one of each, for one arrangement: a scroll reveal. A marked element was
 * hidden at `opacity: 0` until a class was added when it scrolled into view, the arming
 * was an inlined script in the document head, and the whole of the family's only
 * `'use client'` line existed to drive it. The measurement is the reason it is gone: over
 * the built export of all thirty-six pages, `data-reveal` appears as an *attribute* zero
 * times. All 216 textual matches were the mechanism's own comment and script strings, and
 * `document.querySelectorAll('[data-reveal]').length === 0` on the landing. So the site
 * carried a hydration boundary, an inline script with a `load` listener, four stylesheet
 * rules including a scoped `opacity: 0`, and a test that rendered the landing with
 * scripting off - all to observe an empty `NodeList`.
 *
 * **Why the gate never noticed.** The `hidden-state` gate verifies the *mechanism*: that a
 * rule which hides through the marker is armed, that exactly one module writes the
 * arming attribute, that the module withdraws it and that there is no clock. Every one of
 * those was true and none of them is the question. The question is whether anything uses
 * the mechanism, and a gate that reads a stylesheet and a module cannot see it. This file
 * is the half that answers it, and it is written as the negative rather than as a check
 * on one mechanism's shape, because a repository with no hidden state has nothing to shape
 * to check.
 *
 * **What a future entrance mechanism must inherit, stated once so it is not re-derived.**
 * Two things, both of which cost this site a reader once and neither of which is about
 * animation:
 *
 *   1. **A hidden state must be escapable, not escapable after a delay.** The condition
 *      has to be one a reader's own capability satisfies - a media query, or a
 *      script-armed ancestor attribute a reader without scripting never receives - because
 *      a condition that is never true is not a wait. An `IntersectionObserver` as the only
 *      exit is not an exit at all: a reader with scripting off, a browser without the API,
 *      and a script that failed to parse all received the whole page at zero opacity and
 *      nothing warned.
 *   2. **The floor under the mechanism is an event, not a clock.** A `setTimeout` that
 *      reveals content measures elapsed time from first style resolution rather than from
 *      the moment the class would have landed, so by the time anything can cancel it there
 *      is nothing left to cancel, and a reader on a slow connection watches a blank page
 *      for the length of a timer measuring the wrong interval. `load` fires when the
 *      document arrives, whatever happened to any individual script on the way, and it is
 *      the only one of the two that also covers a reader whose scripting started and
 *      stopped.
 *
 * Neither belongs in this repository, which has no hidden state. If Prism ships a
 * Block-level entrance, that is the right home for the argument, and `DESIGN.md` under
 * Motion already carries it; duplicating it here would be a second copy of a law that is
 * meant to live in one place.
 */
const ROOT = path.resolve(__dirname, '..');
const ROOTS = ['app', 'components', 'lib'] as const;

/** Every source file under the roots this repository owns, as absolute paths. */
function sources(): string[] {
  const found: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) visit(full);
      else if (/\.tsx?$/.test(entry)) found.push(full);
    }
  };
  for (const root of ROOTS) visit(path.join(ROOT, root));
  return found.sort();
}

/** A file with its comments blanked, so a scan cannot read the documentation of a rule. */
function codeOf(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (line) => line.replace(/[^\n]/g, ' '));
}

const files = sources();

describe('this repository draws no client boundary of its own', () => {
  it('reads a real corpus, so the assertion below is not vacuous', () => {
    expect(files.length).toBeGreaterThan(8);
    expect(files.some((file) => file.includes(`${path.sep}components${path.sep}`))).toBe(true);
  });

  it("carries no 'use client' directive anywhere", () => {
    // The bar's own controls - the family menu, the search dialog, the light and dark
    // control and the panel below the bar's threshold - are four pieces of reader state
    // and they are one client island inside `@nanisoft/prism-ui`, not lines here. So the
    // JavaScript a reader downloads is unchanged by this being zero, and the claim "no
    // client runtime" is now true of this repository's source rather than true of three
    // siblings and not of this one.
    const client = files.filter((file) => /^\s*['"]use client['"]/m.test(readFileSync(file, 'utf8')));
    expect(
      client.map((file) => path.relative(ROOT, file).split(path.sep).join('/')),
      'a client boundary in this repository',
    ).toEqual([]);
  });

  it('reads no token at runtime, because a resolved value does not follow the cascade', () => {
    // The design system's `runtime-token-read` law, restated as a source assertion rather
    // than only as a gate. It is a law this site has never broken and one that is invisible
    // in a screenshot, so the gate is the enforcement and this is the cheap tripwire that
    // says which half is which.
    for (const file of files) {
      expect(codeOf(file), `${path.relative(ROOT, file)} reads a token in client code`).not.toMatch(
        /getComputedStyle\([^)]*\)\.getPropertyValue\(/,
      );
    }
  });
});

describe('this repository ships no hidden state', () => {
  it('has no module that writes or withdraws a reveal arming attribute', () => {
    const armed = files.filter((file) =>
      /(?:set|remove)Attribute\(\s*['"`]data-reveal-armed/.test(codeOf(file)),
    );
    expect(
      armed.map((file) => path.relative(ROOT, file).split(path.sep).join('/')),
      'something still arms a hidden state',
    ).toEqual([]);
  });

  it('has no component that marks an element as revealable', () => {
    // The helper that used to be exported - `reveal()`, which spread `data-reveal` onto an
    // element - had no call sites, and neither did the wrapper it belonged to. This is the
    // assertion that would have caught it: not "the mechanism is well formed" but "is
    // anything marked at all", which is the question the stylesheet half of a gate cannot
    // ask.
    const marked = files.filter((file) => /['"`]data-reveal['"`]/.test(codeOf(file)));
    expect(
      marked.map((file) => path.relative(ROOT, file).split(path.sep).join('/')),
      'something still marks an element for an entrance',
    ).toEqual([]);
  });

  it('runs no clock of its own on any page', () => {
    // `prefers-reduced-motion` is a media query and needs no clock; an `IntersectionObserver`
    // is not a clock either. What cannot come back is a `setTimeout` that reveals content.
    for (const file of files) {
      expect(
        codeOf(file),
        `${path.relative(ROOT, file)} schedules a timer in reader-visible code`,
      ).not.toMatch(/\b(?:setTimeout|setInterval)\s*\(/);
    }
  });
});