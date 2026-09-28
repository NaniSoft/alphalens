import type { PrismMode, PrismPackId } from '@nanisoft/prism-tokens';
import type { PrismProductId } from '@nanisoft/prism-ui';
// The root barrel's runtime-safe half: ./theming also exports the bake helper,
// which pulls the SSR extractor and must never enter the app graph.
import { prismThemeBootScript } from '@nanisoft/prism-ui';

/**
 * The site's fixed pack — identity is static and known at build time; the
 * chrome flips mode only (ADR-0006). AlphaLens researches the Indian market; rose is its pack across every surface.
 */
export const DEFAULT_PACK: PrismPackId = 'rose';

/** Standing site default: beam-dark (the platform's stack precedent). */
export const DEFAULT_MODE: PrismMode = 'dark';

/** This site's registry id — drives the chrome's switcher + footer grid. */
export const SITE_ID: PrismProductId = 'alphalens';

/** Blocking, pre-paint class application — the flash-free half of the class-swap recipe. */
export const themeBootScript = prismThemeBootScript({ pack: DEFAULT_PACK, defaultMode: DEFAULT_MODE });

/**
 * The arming half of the scroll-reveal pattern, inlined rather than shipped as a module.
 *
 * The design system's reveal law permits two shapes for a CSS-authored hidden state
 * and this is the second: a script-armed ancestor attribute. `app/globals.css` scopes
 * every `opacity: 0` under `html[data-reveal-armed]`, and this is the only thing that
 * writes it, before the landing has been parsed. So a reader whose scripting is off
 * never receives the attribute and the hidden state does not exist for them at all -
 * which is an exit rather than a wait, and is the only kind of exit that survives a
 * browser with no `IntersectionObserver`, a script that failed to parse, and a crawler.
 *
 * It is a string and not a component for a reason the sheet records: a media query is
 * the only complete guard for a CSS-authored hidden state, and a component cannot emit
 * one. Everything here is wrapped because the try is the whole cost of being wrong: a
 * throw in an inline script in the head is an unhandled error on every page, and
 * `scripts/check-hidden-state.mjs` fails the build if this is not the only writer.
 *
 * The `load` listener is the second half of the exit and it is the half that makes the
 * exit total. The reveal effect withdraws the attribute on mount, which covers every
 * reader whose JavaScript works; this covers the reader whose JavaScript *started* and
 * then did not finish, which is the case the media guard cannot see because scripting
 * is enabled for them. It is an event rather than a delay, deliberately: a timer here
 * would measure elapsed time rather than anything about the page, and a timer is the
 * shape this pattern is being repaired away from.
 */
export const revealArmScript = [
  "try{",
  "var d=document.documentElement;",
  "d.setAttribute('data-reveal-armed','');",
  // The exit is the removal, and it is armed against a document event rather than a
  // number of seconds. `load` fires when the document has arrived, whatever happened
  // to any individual script on the way, so a script that failed between here and
  // hydration still leaves the page readable. The reveal effect removes the attribute
  // earlier, on mount; this is the floor under it for the case where the effect never
  // ran. Neither path is a clock: one depends on the effect running, the other on
  // the document arriving, and a reader whose scripting is off needs neither because
  // the attribute above was never written.
  "if(d.hasAttribute('data-reveal-armed')){",
  "addEventListener('load',function(){d.removeAttribute('data-reveal-armed')});",
  "}",
  "}catch(e){}",
].join('');
