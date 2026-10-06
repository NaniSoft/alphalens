import type { ReactElement } from 'react';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01';
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01';
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01';
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01';
import { NoteGrid01 } from '@nanisoft/prism-ui/blocks/note-grid-01';
import { ProcessRail01 } from '@nanisoft/prism-ui/blocks/process-rail-01';
import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01';
import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01';
import { StatusLedger01 } from '@nanisoft/prism-ui/blocks/status-ledger-01';
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph';

import {
  BUILT_ON_NEXUS,
  CAPTURE_CARDS,
  CAPTURE_DESCRIPTION,
  DATA_PATH,
  DIRECTIONS,
  DIRECTIONS_DESCRIPTION,
  DIRECTIONS_MORE,
  FEED_DESCRIPTION,
  FEED_NOTE,
  FEED_SOURCES,
  FIGURES,
  FINAL_CTA,
  HERO,
  HERO_FIGURE,
  HERO_PANEL,
  PATH_DESCRIPTION,
  PIPELINE_DESCRIPTION,
  PIPELINE_NOTE,
  PIPELINE_ROWS,
  SECTIONS,
  STATUS_LABEL,
  TICKER,
  sectionTitle,
} from '@/lib/content';
import { GROUND_PACK, PRODUCTS } from '@/lib/site';

/**
 * The landing, composed from the design system's catalogue.
 *
 * **One layout family per section, and that is the whole of the visual argument.** The
 * page used to be six sections of the same shape: an index, a title with its status in
 * parentheses, a paragraph of two to four lines, then a grid of short points. Read as a
 * page it was one section repeated six times, which is what "bland" is when a
 * stylesheet is not at fault. So each section now carries exactly one idea in the shape
 * that idea wants: the capture points are cards, the data path is a rail, the eight
 * sources are a survey of tiles, the pipeline is a ledger, the three directions are
 * terms and their answers, the platform is rows. Two grids of hairline notes used to sit
 * under sections 02 and 03 as well, which made the sixth section the first one a reader
 * had already seen three times.
 *
 * **The two lists that came off the page went to the documents they were summarising.**
 * Six properties of the data path and four properties of the contract were on the
 * landing as well as in `/docs/data-platform` and `/docs/data-contract`, in shorter
 * form, and a reader who wanted the detail had to guess which page had it. The landing
 * now states what each one is and links the section that holds the working; the two
 * lists live in one place each.
 *
 * **The honesty status is a word inside the section's own title, not a badge beside it.**
 * That is the constraint worth restating, because it is easy to undo by accident: a
 * section whose title carries a status is a stage of the work and not an independent
 * topic, so a badge, a count or a collapse control beside it would each say the opposite
 * - that a reader may treat the six sections as a set to visit in any order. The status
 * therefore stays inside the title string, nothing is drawn next to it, and the emitted
 * `<h2>` carries the words, so the page's outline and a screen reader both meet them.
 * The same rule is why the documentation rail renders a section as a label.
 *
 * **The section indices are copy and the ordering is the site's.** Every Block takes its
 * index as its `eyebrow`, because that is the one slot a Block offers for a machine
 * annotation above a title. Where a section needed both an index and a status, the
 * title carries both and the eyebrow carries the index alone, so no Block is asked for
 * two eyebrows and the number is never doubled.
 *
 * **The hero dropped its eyebrow and its panel is dropped on a phone.** The eyebrow read
 * `nanisoft · alphalens` over a headline that already says what this is, and the
 * catalogue draws an eyebrow as a quiet pill, so the page opened on a badge. And the
 * panel's drawing is sized in its own user units, so at 390px its stage names render at
 * seven pixels: a picture too small to read is a picture that should not be on the page,
 * and the four stages are stated in words one section down. See `app/globals.css` for
 * the two site classes that do this.
 *
 * It is a server component, and it is a plain function: no hook, no context, no mode,
 * nothing read at runtime and no `'use client'` line anywhere in this repository's own
 * source. Every colour resolves through the cascade rather than by being read once at
 * mount, which is the class of defect the old page had, where a light-mode reader was
 * served dark-mode ink on a light ground until hydration.
 */

/** The pack a product row's mark is drawn in, from the site's own directory. */
function markPack(productId: string) {
  return PRODUCTS.find((entry) => entry.id === productId)?.pack ?? GROUND_PACK;
}

/**
 * 03, the approved contract's eight external sources, as a survey.
 *
 * This is a site component rather than the catalogue's `StackGrid01`, and the reason is a
 * shape the catalogue does not have: **a survey whose tiles each carry a status.** The
 * retired page drew exactly that, and the status is the whole of it - a tile is solid
 * because it is running and dashed because it is approved and not yet collecting, and a
 * reader deciding whether a source exists reads the status before the note. `StackGrid01`
 * takes a name and a role per part and has nowhere to put a third, and `FeatureGrid01`'s
 * bare variant takes a title and a body, which would say the status in prose and turn a
 * per-tile state back into a per-tile sentence.
 *
 * Rather than pass a destination to a control that ignores it, or render a status in nine
 * point type under a label that reads as settled, the tile is drawn here: a bordered card
 * whose status is its own word, whose border is dashed while the source is approved and
 * not collecting, and whose note says what the source is for. Every word is the word the
 * content module published.
 *
 * **The status word is set larger than the role line, and it used to be the same size as
 * it.** Measured on the built export before this change: eight status pills and eight role
 * lines, all at 10px, with the tile's own name larger than either. The status is the one
 * word this section is for, so it is on the design system's reading scale at 12px and
 * weighted, and the role is at 11px and supporting. The dashed edge says the same state in
 * shape, so a reader who cannot separate two tints of the same neutral still has it twice.
 * `app/globals.css` owns the two sizes; `test/site-sheet.test.ts` holds the ordering.
 *
 * The catalogue gap is filed rather than worked around silently: a survey grid that can
 * carry a per-item state. `StackGrid01` is the right block for a set of parts and it is
 * one field short of this one.
 */
function FeedSources(): ReactElement {
  return (
    <Section>
      <SectionHeading
        as="h2"
        align="left"
        className="mb-12"
        eyebrow={SECTIONS[2].index}
        title={sectionTitle(2)}
        description={FEED_DESCRIPTION}
      />
      <ul className="site-sources">
        {FEED_SOURCES.map((source) => (
          <li className="site-source" key={source.name} data-status={source.status}>
            <span className="site-source__status">{source.status === 'live' ? 'live' : 'approved'}</span>
            <span className="site-source__name">{source.name}</span>
            <span className="site-source__role">{source.role}</span>
            <span className="site-source__note">{source.note}</span>
          </li>
        ))}
      </ul>
      <p className="site-caption">{FEED_NOTE}</p>
    </Section>
  );
}

/**
 * The four rail steps, as the tuple the Block's own type demands.
 *
 * `ProcessRail01` declares `steps` as a union of two-, three- and four-element tuples, so
 * the four-stage rail is written out rather than mapped. That is the point of the type: a
 * fifth stage would be a compile error and not a fifth column, because a rail that
 * quietly dropped a stage to fit a width would be a diagram of a process that is not the
 * process. A `map` over a four-element array is `T[]`, which is assignable to no arm of
 * the union, so the array cannot quietly become a five-element one either.
 *
 * The `step` field the content module carries is not passed: the Block renders the
 * ordinal from the position, because a list carrying its own numbers is a list whose
 * numbers can disagree with their order. `01` to `04` are what it renders.
 */
const DATA_PATH_STEPS = [
  { name: DATA_PATH[0].title, description: DATA_PATH[0].body },
  { name: DATA_PATH[1].title, description: DATA_PATH[1].body },
  { name: DATA_PATH[2].title, description: DATA_PATH[2].body },
  { name: DATA_PATH[3].title, description: DATA_PATH[3].body },
] as const;

export function Landing(): ReactElement {
  return (
    <>
      {/* Hero: the thesis as the page's h1, then the panel carrying the one figure on
          the page.

          The figure is the four documented stages on a rail with a marker travelling
          it, which is the capture this site actually performs, once per market minute.
          It replaced an instrument that drew an open-interest profile from a sine
          hash under a label reading as a live feed, and the trade is deliberate in
          both directions: the rail is less spectacular than a profile, and it is true,
          and it is still true with every animation stopped.

          The band around it is the catalogue's, so the column split and the width at
          which the columns stack are one decision made in the place that owns the
          container contract rather than four sites' four grids. The panel is the
          catalogue's too, so the bar, the state dot, the frame's edge and the
          footnote are its rules rather than this site's, and that frame's edge is one
          of the fifteen that used to vanish. `site-hero` is the one class on it, and it
          carries no visual property: it is the hook the narrow-screen rule in
          `app/globals.css` needs to take the panel away. */}
      <Hero01
        className="site-hero"
        headingLevel="h1"
        title={
          <>
            {HERO.h1Leading}
            <em>{HERO.h1Em}</em>
            {HERO.h1Trailing}
          </>
        }
        description={HERO.sub}
        actions={[
          { ...HERO.primaryCta },
          { ...HERO.secondaryCta, variant: 'outline' as const },
        ]}
        instrument={
          <InstrumentPanel01
            label={HERO_PANEL.label}
            state="neutral"
            stateLabel={HERO_PANEL.mode}
            footnote={HERO_PANEL.footnote}
            caption={HERO_FIGURE.aria}
          >
            <PulseGraph
              nodes={HERO_FIGURE.nodes}
              relations={HERO_FIGURE.relations}
              label={HERO_FIGURE.aria}
            />
          </InstrumentPanel01>
        }
      />

      {/* The product's own status, as a footnote to the thesis rather than a section.
          The section's worth of padding it used to carry gave a one-line claim the
          weight of a claim it is not making, and 4rem of it was followed by the strip's
          own padding, so a reader scrolled through two empty bands to reach the first
          sentence of the page. */}
      <Section className="site-status-band">
        <p className="site-status">
          <span className="site-live-dot" aria-hidden />
          {HERO.status}
        </p>
      </Section>

      {/* The figures, as a band under the hero rather than a section. Four counts, each
          one a documented fact and each label saying what it counts, because a research
          page that shows no numbers asks for trust and a research page that invents them
          is the failure this site was rebuilt to remove. `Stats01` is the catalogue's own
          KPI block and it ships no numbers of its own. */}
      <Stats01 stats={FIGURES.map((figure) => ({ label: figure.label, value: figure.value }))} />

      {/* The honesty model as a strip, which is the transition band between the hero
          and the first numbered section. Left aligned by one site class: centred, five
          items of different lengths wrap into two ragged centred lines that read as a
          mistake, and a status band is a thing a reader scans from the left. */}
      <LogoStrip01 className="site-tiers" items={[...TICKER]} label="What is running and what is design" />

      {/* 01, what it captures. Live, and the only part of this page that is simply
          true. Three capture points, each a title and a sentence, which is what a
          definition list is for.

          **It was a `FeatureGrid01` and it is not any more.** That Block renders its
          heading with `SectionHeading`'s default alignment, which is centred, while
          every other section on this page sets `align="left"`; a centred title above a
          left-aligned two-column grid is two unrelated pieces, which is the reason
          `SectionHeading` documents the default as being right for a band that is only
          a heading. It also put three cards in a two-column grid, so the third sat alone
          on the second row. The gap is filed against the design system rather than
          worked around: a feature grid whose heading can be aligned. */}
      <NoteGrid01
        eyebrow={SECTIONS[0].index}
        title={sectionTitle(0)}
        description={CAPTURE_DESCRIPTION}
        notes={CAPTURE_CARDS.map((card) => ({ title: card.title, body: card.body }))}
      />

      {/* 02, the live data path. Four stages, which is exactly what the catalogue's
          process rail admits: `steps` is a tuple of two, three or four and a fifth is a
          compile error rather than a fifth column, because a rail that quietly dropped a
          stage to fit a width would be a diagram of a process that is not the process.
          The travelling packet that used to cross this rail is gone, and so is the grid
          of six notes that used to follow it: the operations are documented in full under
          data platform, and a summary of a document next to the document is one more thing
          to keep in step. */}
      <ProcessRail01
        eyebrow={SECTIONS[1].index}
        title={sectionTitle(1)}
        description={PATH_DESCRIPTION}
        steps={DATA_PATH_STEPS}
        finalLabel="verified"
      />

      {/* 03, the approved contract. Eight sources, each a name and a role, which is
          what the survey is for: a survey is a claim that a set of parts is sufficient,
          and both halves of that claim are the caller's. The grid's `own` arm is not
          passed, because this site asserts nothing about which of these it built itself
          and an empty group would make the Block throw for a claim it does not make. */}
      <FeedSources />

      {/* 04, the designed pipeline. Six rows, and this is the place the catalogue's
          four-stage rail does not reach: six is a compile error there rather than a
          six-column rail, which is the design system refusing the wrong shape rather than
          a gap this site is working around quietly. So it is a ledger, whose row shape
          carries a name, a state and a detail line, and the words are unchanged. */}
      <StatusLedger01
        eyebrow={SECTIONS[3].index}
        title={sectionTitle(3)}
        description={PIPELINE_DESCRIPTION}
        rows={PIPELINE_ROWS.map((row) => ({
          name: row.agent,
          status: 'designed',
          statusLabel: 'designed',
          detail: row.reads,
          bullets: [row.note],
        }))}
        caption={PIPELINE_NOTE}
      />

      {/* 05, where it goes. Three rows and the same `direction` tier the ledger drew
          for 04, which is a repeated shape on purpose: both sections are inventories of
          state rather than arguments, and the tier is the thing a reader is scanning for.
          The blocker travels in the row's bullet, which is the only part of a research
          direction a reader can act on, and the tier stays in the section title rather
          than beside each row. */}
      <StatusLedger01
        eyebrow={SECTIONS[4].index}
        title={sectionTitle(4)}
        description={DIRECTIONS_DESCRIPTION}
        rows={DIRECTIONS.map((direction) => ({
          name: direction.title,
          status: 'direction',
          statusLabel: STATUS_LABEL[direction.status],
          bullets: [direction.body],
        }))}
        caption={DIRECTIONS_MORE}
      />

      {/* 06, the platform story. One of the two regions that carry a pack: each row's
          mark is its own product's boundary, and a mark is a fully rounded disc, so the
          boundary moves nothing about its shape. */}
      <ProductGrid01
        eyebrow={SECTIONS[5].index}
        title={sectionTitle(5)}
        description={BUILT_ON_NEXUS.lede}
        products={BUILT_ON_NEXUS.products.map((product) => ({
          id: product.id,
          name: product.name,
          pack: markPack(product.id),
          tagline: product.tagline,
          href: product.url,
        }))}
        caption={BUILT_ON_NEXUS.body}
      />

      <Cta01
        headingLevel="h2"
        title={FINAL_CTA.h2}
        description={FINAL_CTA.body}
        action={FINAL_CTA.primary}
        secondaryAction={FINAL_CTA.secondary}
        note={FINAL_CTA.footnote}
      />
    </>
  );
}
