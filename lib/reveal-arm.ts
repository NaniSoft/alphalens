/**
 * The arming half of the scroll-reveal pattern, inlined rather than shipped as a module.
 *
 * `app/globals.css` scopes every `opacity: 0` under `html[data-reveal-armed]`, and
 * this is the only thing that writes that attribute. A reader whose scripting is off
 * never receives it, so the hidden state does not exist for them at all - which is an
 * exit rather than a wait, and is the only kind of exit that survives a browser with
 * no `IntersectionObserver`, a script that failed to parse, and a crawler.
 *
 * The exit is the removal, and it is armed from two directions:
 *
 *   - `components/reveal.ts` removes the attribute on mount, and on every path rather
 *     than only the happy one, which covers every reader whose JavaScript works.
 *   - The `load` listener below removes it if it is still there, which covers the
 *     reader whose JavaScript *started* and then stopped. That reader has scripting
 *     enabled, so the `@media (scripting: none)` guard cannot see them, and the sheet's
 *     only other exit is a rule that would wait on a class nothing adds.
 *
 * `load` is an event and not a delay, deliberately. The retired family shape for this
 * pattern was `animation: <fallback> 1ms linear 3s forwards` plus the same media guard,
 * and a timer is the wrong mechanism for a specific reason rather than a general one:
 * that clock starts at first style resolution rather than at scroll, so by the time the
 * class that would cancel it lands there is nothing left to cancel, and a reader on a
 * slow connection watches a blank page for the length of a timer measuring the wrong
 * interval. `load` fires when the document arrives, whatever happened to any individual
 * script on the way.
 *
 * It is a string and not a component because a media query is the only complete guard
 * for a CSS-authored hidden state and a component cannot emit one. Everything is
 * wrapped because the try is the whole cost of being wrong: a throw in an inline script
 * in the head is an unhandled error on every page.
 *
 * `scripts/check-hidden-state.mjs` fails the build if this is not the only writer, if
 * the module cannot withdraw the attribute, or if the `load` exit is removed.
 */
export const revealArmScript = [
  'try{',
  'var d=document.documentElement;',
  "d.setAttribute('data-reveal-armed','');",
  "if(d.hasAttribute('data-reveal-armed')){",
  "addEventListener('load',function(){d.removeAttribute('data-reveal-armed')});",
  '}',
  '}catch(e){}',
].join('');
