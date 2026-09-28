'use client';

/**
 * The reveal root, and the only client component on the landing.
 *
 * It exists to do one thing and to be able to undo one thing. The thing is adding
 * `is-in` to a marked element when it scrolls into view; the undo is removing
 * `data-reveal-armed` from the document element, which is what makes the stylesheet's
 * hidden state escapable rather than merely hidden.
 *
 * **Why the state is armed rather than unconditional.** `app/globals.css` scopes every
 * `opacity: 0` under `html[data-reveal-armed]`, and that attribute is written by one
 * inlined script in the document head and by nothing else. A reader with scripting off
 * never receives it, so the state does not exist for them: a condition that is never
 * true is not a wait. The previous shape hid every marked element unconditionally and
 * revealed it with a class from an `IntersectionObserver`, which meant every reader
 * without scripting, without that API, or with a script that failed to parse received
 * the entire landing below the header at zero opacity, and a screenshot of the top of
 * the page could not tell.
 *
 * **Why it withdraws on every path.** A script that parses is not a script that works.
 * A browser with no `IntersectionObserver`, a reader whose script was blocked after the
 * head, a reader whose JavaScript threw before this effect ran: each of them has the
 * arming and cannot use it. So there are exactly two outcomes on mount, and revealing
 * the content is one of them. Reduced motion takes the same path, which is both faster
 * and independent of whether this effect ran at all.
 *
 * There is no timer anywhere in this file, and `test/no-scripting.test.tsx` asserts it.
 * A `setTimeout` that reveals content is a second exit with its own failure mode, and it
 * is the one shape this pattern is being repaired away from.
 */

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';

/** The document attribute the stylesheet's hidden state is scoped under. */
const ARMED = 'data-reveal-armed';

/** Takes the hidden state off the whole document. The exit, and it is not a clock. */
function disarm(): void {
  document.documentElement.removeAttribute(ARMED);
}

export function RevealRoot({ children }: { children: ReactNode }): ReactNode {
  const ref: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      disarm();
      return;
    }
    const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');

    // No observer to hand the classes out with, so nothing can ever add `is-in`.
    // Disarming is the only outcome that does not leave a reader with a blank page.
    if (typeof IntersectionObserver === 'undefined') {
      disarm();
      return;
    }

    // Reduced motion means the animation is not wanted at all, so the transition is
    // not wanted either. Adding the classes would say that; disarming says it without
    // depending on this effect having run.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      disarm();
      targets.forEach((target) => target.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}

/**
 * Spread onto an element to mark it as revealable, with an optional entrance stagger.
 *
 * A data attribute and an inline delay rather than a class, because a class would need
 * a rule in this repository's own stylesheet to mean anything, and the one rule it would
 * need is the hidden state this whole arrangement exists to make escapable. The delay is
 * a transition delay on a reveal that is already guaranteed, so it cannot hold content
 * back: if the class never lands, the `load` exit in `lib/reveal-arm.ts` disarms the
 * state and the element is visible from the start.
 */
export function reveal(delayMs = 0): { 'data-reveal': 'true'; style: CSSProperties } {
  return { 'data-reveal': 'true', style: { transitionDelay: `${delayMs}ms` } };
}
