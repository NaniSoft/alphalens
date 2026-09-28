'use client';

// Scroll-reveal plumbing: attach the returned ref to a root; every
// [data-reveal] descendant gets .is-in when it enters the viewport (once).
// Reduced motion short-circuits to visible. Motion law ADR-0001 — 280ms
// decelerating, transform + opacity only.
//
// This module is deliberately not the thing that decides whether content is
// hidden. The decision belongs to `data-reveal-armed` on the document element,
// which one inlined script writes before the page is parsed and which this module
// is able to *withdraw*. That is the whole exit: an unhidden state is reached by
// removing the condition, never by waiting for it to time out.
//
// Why withdrawal is here and not only the media guard: the arming script runs on a
// reader whose JavaScript parsed, and parsing is not the same thing as working. A
// browser with no `IntersectionObserver`, a reader whose script was blocked after
// the head, a reader on a locked-down environment - each of them receives the
// attribute and then cannot use it. An effect that can fail to arm is an exit with
// a hole in it, and the hole is a blank page. So every path through this hook
// either reveals the content or disarms the stylesheet, and there is no third
// outcome. A reader with scripting off is the easy case and needs none of this: the
// inlined script never ran, so the attribute was never written.

import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';

/** The document attribute the stylesheet's hidden state is scoped under. */
const ARMED = 'data-reveal-armed';

/** Takes the hidden state off the whole document. The exit, and it is not a clock. */
function disarm(): void {
  document.documentElement.removeAttribute(ARMED);
}

export function useRevealRoot(): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');

    // No observer to hand the classes out with, so nothing can ever add `is-in`.
    // Disarming is the only outcome that does not leave a reader with a blank page.
    if (typeof IntersectionObserver === 'undefined') {
      disarm();
      return;
    }

    // Reduced motion means the animation is not wanted at all, so the transition is
    // not wanted either. Adding the classes is one way to say that; disarming says
    // it without depending on this effect having run at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      disarm();
      targets.forEach((target) => target.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    targets.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, []);

  return ref;
}

/** Spread onto any element: <div {...reveal(60)}> — entrance stagger in ms. */
export function reveal(delayMs = 0): { 'data-reveal': 'true'; style: CSSProperties } {
  return { 'data-reveal': 'true', style: { transitionDelay: `${delayMs}ms` } };
}
