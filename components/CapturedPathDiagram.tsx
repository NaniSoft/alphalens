import type { ReactElement } from 'react';
import { Diagram } from '@nanisoft/prism-ui/components/diagram';

import { HERO_STAGES } from '@/lib/content';

/**
 * The hero panel's instrument, and the reason it is not a canvas.
 *
 * The retired hero drew a curve of open interest from a sine hash under a bar labelled
 * as a live market feed, with the word "illustrative" in nine-point type underneath.
 * That was a fabricated market surface: a canvas reads computed colours from one
 * element, so it also painted the outgoing theme on a dark page until a re-read, and it
 * shipped a client runtime and a requestAnimationFrame loop to keep a decorative sweep
 * moving. The design system cuts both mechanisms: a decorative animation is deleted
 * rather than repaired, and a token-driven inline replacement paints in the HTML, holds
 * every pack, and ships no client code.
 *
 * So the panel holds a `Diagram` of the four stages the collector runs, which are
 * published facts rather than invented numbers, and every stroke and fill in it names a
 * semantic token so the cascade restyles it in both modes and under a pack boundary.
 *
 * **The honesty gate cannot see this class of defect, and the gate says so.** The old
 * one scanned prose for an overclaim, and the dishonesty here was arithmetic: not one
 * published word was false. So the gate now requires a *disclosure* beside any surface
 * shaped like market data, which is a check on the surface's existence rather than on
 * its wording, and the panel's footnote is that disclosure. A future chart may return
 * only with the footnote beside it, which is the state the old panel was in and the old
 * gate could not distinguish from a page that was simply quiet.
 */
export function CapturedPathDiagram(): ReactElement {
  const stages = HERO_STAGES;
  return (
    <>
      <Diagram
        label="The four stages the AlphaLens collector runs each market minute: capture, store, summarize, archive. Each stage is named and its role stated beneath it."
        nodes={stages.map((stage, index) => ({
          id: stage.name,
          name: stage.name,
          x: index,
          y: 0,
        }))}
        relations={stages.slice(1).map((stage, index) => ({
          from: stages[index]?.name ?? '',
          to: stage.name,
          label: stage.role,
        }))}
      />
    </>
  );
}
