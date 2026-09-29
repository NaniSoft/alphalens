import type { ReactElement } from 'react';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01';
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01';
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01';
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01';
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01';
import { NoteGrid01 } from '@nanisoft/prism-ui/blocks/note-grid-01';
import { ProcessRail01 } from '@nanisoft/prism-ui/blocks/process-rail-01';
import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01';
import { StatusLedger01 } from '@nanisoft/prism-ui/blocks/status-ledger-01';
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph';

import { RevealRoot } from '@/components/RevealRoot';
import {
  BUILT_ON_NEXUS,
  CAPTURE_CARDS,
  CONTRACT_FEATURES,
  DATA_PATH,
  DIRECTIONS,
  DIRECTIONS_MORE,
  FEED_NOTE,
  FEED_SOURCES,
  FINAL_CTA,
  HERO,
  HERO_FIGURE,
  HERO_PANEL,
  PATH_FEATURES,
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
 * The old page was a client subtree: a `'use client'` component, a scroll-reveal
 * observer, a canvas that drew invented open interest from a sine hash, a packet that
 * travelled across a rail on a five-second loop, and 11.5 KB of stylesheet. It is now a
 * server component composed from catalogue items plus the reveal root, which is a small
 * client component that exists only to add a class when a marked element scrolls into
 * view and that can withdraw the hidden state's arming on every path.
 *
 * **Two fabrications are cut rather than relabelled, and the second is the one that
 * matters.** The hero's canvas drew a curve of open interest from `Math.sin` under a bar
 * reading as a live NIFTY feed, with the word "illustrative" in nine-point type
 * underneath; the panel now holds a `Diagram` of the four documented stages, which are
 * published facts. And the rail's travelling packet was a decorative animation rather
 * than state feedback, and the design system cuts those rather than repairing them.
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
 * It is a server component: no hook beyond the reveal root, no context, no mode, and
 * nothing read at runtime. Every colour resolves through the cascade rather than by
 * being read once at mount, which is the class of defect the old page had, where a
 * light-mode reader was served dark-mode ink on a light ground until hydration.
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
        description="The approved unified data contract merges Fyers with the sources Fyers structurally cannot provide into one queryable view — data_feed_view — with a single canonical timestamp, one symbol form, and a column list pinned by test."
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
    <RevealRoot>
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
          of the fifteen that used to vanish. */}
      <Hero01
        headingLevel="h1"
        eyebrow={HERO.eyebrow}
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
      <Section className="site-hero-status">
        <p className="site-status">
          <span className="site-live-dot" aria-hidden />
          {HERO.status}
        </p>
      </Section>

      {/* The honesty model as a strip, which is the transition band between the hero
          and the first numbered section. */}
      <LogoStrip01 items={[...TICKER]} label="What is running and what is design" />

      {/* 01, what it captures. Live, and the only part of this page that is simply
          true. Three capture points, each a title and a sentence, which is what the
          bare feature grid is for: a grid of features with a tile and an icon reads as
          an argument rather than a description. */}
      <FeatureGrid01
        eyebrow={SECTIONS[0].index}
        title={sectionTitle(0)}
        description="One process, one minute, the whole surface: the collector has run live since 26 August 2026 and on Kubernetes since 8 September. This is the part of AlphaLens that is simply true."
        variant="bare"
        numbered
        features={CAPTURE_CARDS.map((card) => ({ title: card.title, body: card.body }))}
      />

      {/* 02, the live data path. Four stages, which is exactly what the catalogue's
          process rail admits: `steps` is a tuple of two, three or four and a fifth is a
          compile error rather than a fifth column, because a rail that quietly dropped a
          stage to fit a width would be a diagram of a process that is not the process.
          The travelling packet that used to cross this rail is gone. */}
      <ProcessRail01
        eyebrow={SECTIONS[1].index}
        title={sectionTitle(1)}
        steps={DATA_PATH_STEPS}
        finalLabel="verified"
      />
      <NoteGrid01
        notes={PATH_FEATURES.map((feature) => ({ title: feature.title, body: feature.body }))}
      />

      {/* 03, the approved contract. Eight sources, each a name and a role, which is
          what the stack grid draws: a survey is a claim that a set of parts is
          sufficient, and both halves of that claim are the caller's. The grid's `own`
          arm is not passed, because this site asserts nothing about which of these it
          built itself and an empty group would make the Block throw for a claim it does
          not make. */}
      <FeedSources />
      <NoteGrid01 notes={CONTRACT_FEATURES.map((feature) => ({ title: feature.title, body: feature.body }))} />

      {/* 04, the designed pipeline. Six rows, and this is the place the catalogue's
          four-stage rail does not reach: six is a compile error there rather than a
          six-column rail, which is the design system refusing the wrong shape rather
          than a gap this site is working around quietly. So it is a ledger, whose row
          shape carries a name, a state and a detail line, and the words are unchanged. */}
      <StatusLedger01
        eyebrow={SECTIONS[3].index}
        title={sectionTitle(3)}
        description="TradingAgents’ anatomy — analysts debating into a trader, overseen by risk, with a reflector keeping the memory — assessed against Indian markets and mapped onto the feed. This is the layer the data platform exists to serve, and it is documented as design because it is design."
        rows={PIPELINE_ROWS.map((row) => ({
          name: row.agent,
          status: 'designed',
          statusLabel: 'designed',
          detail: row.reads,
          bullets: [row.note],
        }))}
        caption={PIPELINE_NOTE}
      />

      {/* 05, where it goes. The same ledger with the `direction` tier, which is one of
          its four, and the bullets the rows carry. */}
      <StatusLedger01
        eyebrow={SECTIONS[4].index}
        title={sectionTitle(4)}
        description="Quantitative trading research is the destination. The data layer has to exist first, because a backtester over a broken feed produces confident nonsense. What follows is the trajectory — plainly labelled."
        rows={DIRECTIONS.map((direction) => ({
          name: direction.title,
          status: 'direction' as const,
          statusLabel: STATUS_LABEL[direction.status],
          bullets: [...direction.bullets],
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
    </RevealRoot>
  );
}
