import { readFileSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomePage from '@/app/page';
import { revealArmScript } from '@/lib/theme';

/**
 * The landing with scripting disabled, which is the reader the previous shape of this
 * pattern failed.
 *
 * `.al [data-reveal] { opacity: 0 }` with an `IntersectionObserver` as its only exit
 * means every reader without scripting, without that API, or with a script that failed
 * to parse received the whole landing below the header at zero opacity and no way out.
 * Nothing threw. Nothing warned. The build was green and a screenshot of the top of
 * the page looked exactly as intended, because the invisible part is below the fold.
 *
 * A stylesheet gate can prove the shape of the rule. It cannot prove the page is
 * readable, because the page is not the stylesheet. So this file renders the landing
 * with the arming script never executed, and asserts two things a reader would notice
 * if they were false: the content is in the document, and nothing has armed the state
 * that would hide it.
 *
 * `scripts/check-hidden-state.mjs` is the other half, and neither file is sufficient
 * alone: this one would pass against a sheet that hid nothing, and that one would pass
 * against a page that hid everything.
 */
const ROOT = path.resolve(__dirname, '..');

/** With scripting off, nothing arms the hidden state and the observer never exists. */
function disableScripting(): void {
  Reflect.deleteProperty(globalThis, 'IntersectionObserver');
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
  });
  // The landing's reveal effect takes the observer path, so with no observer it
  // throws inside the effect. A reader in that state gets no `.is-in` and no
  // `data-reveal-armed`, which is precisely the case under test.
  vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('the landing with scripting disabled', () => {
  let original: PropertyDescriptor | undefined;

  beforeEach(() => {
    original = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver');
    disableScripting();
    document.documentElement.removeAttribute('data-reveal-armed');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-reveal-armed');
    if (original) Object.defineProperty(globalThis, 'IntersectionObserver', original);
  });

  it('never arms the state, so no rule of ours can hide a marked element', () => {
    // The arming is an inlined string in the document head and this test does not run
    // it, so the attribute is absent. A rule scoped under it cannot match, which is the
    // whole of the exit for a reader whose scripting never started.
    expect(revealArmScript).toContain('data-reveal-armed');
    expect(document.documentElement.hasAttribute('data-reveal-armed')).toBe(false);
  });

  it('still renders the content the hidden state was covering', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('minute by minute');

    // Every marked element is in the document and carries text, so the reader has
    // something to read and it is the same something they had before the effect ran.
    const marked = document.querySelectorAll('[data-reveal]');
    expect(marked.length).toBeGreaterThan(20);
    for (const element of marked) {
      expect(element.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    }

    // And the sections below the fold, which is where the blank page lived.
    for (const id of ['capture', 'path', 'feed', 'pipeline', 'directions', 'platform']) {
      expect(document.getElementById(id), `section ${id} is missing`).toBeTruthy();
    }
  });

  it('leaves the document unarmed after the effect has run and failed', () => {
    // The harder reader: scripting started, so the inlined script armed the attribute,
    // and then the browser turned out to have no IntersectionObserver. The old shape
    // had no answer and the whole landing stayed at zero opacity. Disarming is the
    // answer, and it is the reason `components/reveal.ts` knows the attribute's name.
    document.documentElement.setAttribute('data-reveal-armed', '');
    expect(document.documentElement.hasAttribute('data-reveal-armed')).toBe(true);

    render(<HomePage />);

    expect(
      document.documentElement.hasAttribute('data-reveal-armed'),
      'a reader whose scripting started and could not finish is left with a hidden page',
    ).toBe(false);
  });
});

describe('the arming has exactly one writer, and the exit removes it', () => {
  it('is written by the inlined script alone, in the head', () => {
    expect(revealArmScript).toMatch(/setAttribute\('data-reveal-armed'/);
    expect(revealArmScript).toMatch(/^try\{[\s\S]*\}catch\(e\)\{\}$/);

    const layout = readFileSync(path.join(ROOT, 'app', 'layout.tsx'), 'utf8');
    expect(layout).toContain('revealArmScript');
  });

  it('is withdrawn by the observer module rather than awaited', () => {
    const reveal = readFileSync(path.join(ROOT, 'components', 'reveal.ts'), 'utf8');
    expect(reveal).toContain('removeAttribute(ARMED)');
    // No timer anywhere: a setTimeout that reveals content is a second exit, and the
    // second exit is the one a reader with no scripting never receives.
    expect(reveal).not.toMatch(/setTimeout|setInterval|requestAnimationFrame/);
  });

  it('has an exit for the reader whose scripting started and never finished', () => {
    // The `load` listener is the floor under the effect, and it is an event rather
    // than a delay on purpose. A delay would measure elapsed time instead of anything
    // about the page, which is the shape of mechanism this pattern is repaired away
    // from, and it would still fail for a reader on a slow connection.
    expect(revealArmScript).toContain("addEventListener('load'");
    expect(revealArmScript).toContain("removeAttribute('data-reveal-armed')");
    expect(revealArmScript).not.toMatch(/setTimeout|setInterval|requestAnimationFrame/);
  });
});
