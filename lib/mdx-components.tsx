// Headless MDX component mapping (fumadocs-core headless: the app owns the
// HTML). Every prose element is a plain HTML tag and is styled by the design
// system's own `Prose`, which sits inside the documentation Page, so this file
// carries exactly one custom mapping and one reason.
//
// Before the migration this file also owned a `.site-prose` block, and the sheet
// beside it restated what `Prose` already draws: the measure, the block rhythm, the
// code treatment, the table's borders and the blockquote's rule. That was
// twenty-eight rules in this repository restating rules the design system already
// owns, and an unlayered bare-element declaration among them wins the cascade
// whatever the cascade then does with it.
//
// The one mapping is `<Note>`, the status device the corpus marks every claim
// with. It is a site component rather than a catalogue item because the
// catalogue's `Alert` takes a `variant` from a closed set and a title prop, and
// neither has any notion of a status word in a product's own vocabulary - and the
// word is the whole of this device. The corpus writes `<Note status="Live">` and
// `<Note status="Approved, not yet implemented">`, and the second is in no closed set
// a catalogue would ship.

import type { ComponentType, ReactNode } from 'react';

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

/**
 * `<Note status="Live">…</Note>` — a labelled status panel. The label is the
 * point: AlphaLens marks every claim live / approved / designed / direction,
 * and the docs say which in the same voice everywhere.
 */
function Note(props: { status?: string; children?: ReactNode }) {
  return (
    <aside className="site-note">
      {props.status ? <strong className="site-note__label">{props.status}</strong> : null}
      <div className="site-note__body">{props.children}</div>
    </aside>
  );
}

/** Merge the page scope into a per-page component map. */
export function getMdxComponents(): MdxComponentMap {
  return { Note };
}
