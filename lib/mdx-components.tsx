// Headless MDX component mapping (fumadocs-core headless: the app owns the
// HTML). Prose elements are plain HTML styled by `.site-prose`; the one custom
// mapping is <Note> — the status device the design language marks with (a
// washed hairline panel + a mono ink label), used across the corpus for the
// three-tier honesty labels.

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
