'use client';

// The AlphaLens landing — ticket 09's "Instrument Bench" template, variant A,
// executed in the rose pack with ticket 08's content: the live data layer
// leads, and "discover and validate" is demoted to destination framing inside
// the research-direction section.
//
// Pack law (site-local packs-as-signal): rose is the only accent ink; washes
// live inside the instrument panels; hairlines come from the pack's own tint.
// Each numbered section index carries its honesty tier — the numbering encodes
// the reading order, the label encodes what may be claimed.

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Button } from '@nanisoft/prism-ui/components/button';
import { prismBrandPacks, type PrismPackId } from '@nanisoft/prism-tokens';

import { ChainInstrument } from '@/components/ChainInstrument';
import { reveal, useRevealRoot } from '@/components/reveal';
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
  HERO_PANEL,
  PATH_FEATURES,
  PIPELINE_NOTE,
  PIPELINE_ROWS,
  STATUS_LABEL,
  TICKER,
  type DirectionStatus,
} from '@/lib/content';

/** The tier each section may claim — rendered beside its number. */
const SECTION_TIERS = {
  capture: 'live',
  path: 'live',
  feed: 'approved',
  pipeline: 'designed, not built',
  directions: 'research direction',
  platform: 'platform',
} as const;

function Section({
  id,
  index,
  label,
  tier,
  children,
}: {
  id: string;
  index: string;
  label: string;
  tier: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="al-section" id={id}>
      <div className="al-shell">
        <div className="al-section__head" {...reveal()}>
          <span className="al-section__index">{index}</span>
          <h2 className="al-section__label">{label}</h2>
          <span className="al-section__tier" data-tier={tier}>
            {tier}
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}

export function Landing(): ReactElement {
  const root = useRevealRoot();

  return (
    <div ref={root} className="al">
      {/* Hero — copy left, the chain in its instrument panel right. */}
      <section className="al-hero">
        <div className="al-shell al-hero__grid">
          <div className="al-hero__copy">
            <p className="al-eyebrow" {...reveal()}>
              {HERO.eyebrow}
            </p>
            <h1 className="al-display" {...reveal(60)}>
              {HERO.h1Leading}
              <em>{HERO.h1Em}</em>
              {HERO.h1Trailing}
            </h1>
            <p className="al-lede" {...reveal(120)}>
              {HERO.sub}
            </p>
            <div className="al-cta-row" {...reveal(180)}>
              <Button type="primary" size="large" href={HERO.primaryCta.href}>
                {HERO.primaryCta.label}
              </Button>
              <Button size="large" href={HERO.secondaryCta.href}>
                {HERO.secondaryCta.label}
              </Button>
            </div>
            <p className="al-hero__status" {...reveal(220)}>
              <span className="al-live-dot" aria-hidden />
              {HERO.status}
            </p>
          </div>

          {/* The instrument panel — definite height in every context. */}
          <div className="al-panel" {...reveal(120)}>
            <div className="al-panel__bar">
              <span className="al-live-dot" aria-hidden />
              <span className="al-panel__label">{HERO_PANEL.label}</span>
              <span className="al-panel__mode">{HERO_PANEL.mode}</span>
            </div>
            <ChainInstrument />
            <p className="al-panel__footnote">{HERO_PANEL.footnote}</p>
          </div>
        </div>

        <div className="al-shell">
          <div className="al-ticker" {...reveal(240)}>
            {TICKER.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 01 — what it captures (live). */}
      <Section id="capture" index="01" label="What it captures" tier={SECTION_TIERS.capture}>
        <p className="al-intro" {...reveal()}>
          One process, one minute, the whole surface: the collector has run live since 26 August 2026
          and on Kubernetes since 8 September. This is the part of AlphaLens that is simply true.
        </p>
        <div className="al-cards">
          {CAPTURE_CARDS.map((card, i) => (
            <div className="al-card" key={card.title} {...reveal(i * 60)}>
              <span className="al-card__no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 02 — the live data path: conveyor rail, then hairline rows. */}
      <Section id="path" index="02" label="The data path" tier={SECTION_TIERS.path}>
        <div className="al-rail" {...reveal()}>
          <div className="al-rail__packet" aria-hidden />
          {DATA_PATH.map((stage, i) => (
            <div className="al-stage" key={stage.title}>
              <span className="al-stage__no">{stage.step}</span>
              <span className="al-stage__name">{stage.title}</span>
              <span className="al-stage__caption">{stage.body}</span>
              {i === DATA_PATH.length - 1 && <span className="al-rail__serving">verified</span>}
            </div>
          ))}
        </div>
        <div className="al-feats">
          {PATH_FEATURES.map((feature, i) => (
            <div className="al-feat" key={feature.title} {...reveal(i * 40)}>
              <h4>{feature.title}</h4>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 03 — one feed for research (approved): survey grid + contract rows. */}
      <Section id="feed" index="03" label="One feed for research" tier={SECTION_TIERS.feed}>
        <p className="al-intro" {...reveal()}>
          The approved unified data contract merges Fyers with the sources Fyers structurally cannot
          provide into one queryable view — <code>data_feed_view</code> — with a single canonical
          timestamp, one symbol form, and a column list pinned by test.
        </p>
        <div className="al-survey">
          {FEED_SOURCES.map((source, i) => (
            <div className="al-tile" key={source.name} data-status={source.status} {...reveal(Math.min(i, 8) * 30)}>
              <span className="al-tile__status">{source.status === 'live' ? 'live' : 'approved'}</span>
              <span className="al-tile__name">{source.name}</span>
              <span className="al-tile__role">{source.role}</span>
              <span className="al-tile__note">{source.note}</span>
            </div>
          ))}
        </div>
        <p className="al-caption" {...reveal()}>
          {FEED_NOTE}
        </p>
        <div className="al-feats al-feats--contract">
          {CONTRACT_FEATURES.map((feature, i) => (
            <div className="al-feat" key={feature.title} {...reveal(i * 40)}>
              <h4>{feature.title}</h4>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 04 — the research pipeline (designed). */}
      <Section id="pipeline" index="04" label="The research pipeline" tier={SECTION_TIERS.pipeline}>
        <p className="al-intro" {...reveal()}>
          TradingAgents’ anatomy — analysts debating into a trader, overseen by risk, with a reflector
          keeping the memory — assessed against Indian markets and mapped onto the feed. This is the
          layer the data platform exists to serve, and it is documented as design because it is design.
        </p>
        <div className="al-ledger al-ledger--pipeline">
          {PIPELINE_ROWS.map((row, i) => (
            <div className="al-row" key={row.agent} data-status="designed" {...reveal(i * 50)}>
              <span className="al-row__name">{row.agent}</span>
              <span className="al-row__reads">{row.reads}</span>
              <span className="al-row__note">{row.note}</span>
              <span className="al-row__status">designed</span>
            </div>
          ))}
        </div>
        <p className="al-caption" {...reveal()}>
          {PIPELINE_NOTE}
        </p>
      </Section>

      {/* 05 — where it's going (research direction): the status ledger. */}
      <Section id="directions" index="05" label="Where it’s going" tier={SECTION_TIERS.directions}>
        <p className="al-intro" {...reveal()}>
          Quantitative trading research is the destination. The data layer has to exist first, because
          a backtester over a broken feed produces confident nonsense. What follows is the trajectory —
          plainly labelled.
        </p>
        <div className="al-ledger">
          {DIRECTIONS.map((direction, i) => (
            <div className="al-row" key={direction.title} data-status={direction.status} {...reveal(i * 60)}>
              <span className="al-row__dot" aria-hidden />
              <span className="al-row__name">{direction.title}</span>
              <span className="al-row__status">{STATUS_LABEL[direction.status as DirectionStatus]}</span>
              <ul className="al-row__bullets">
                {direction.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="al-caption" {...reveal()}>
          {DIRECTIONS_MORE}
        </p>
      </Section>

      {/* 06 — built on Nexus: the platform story, packs as signal. */}
      <Section id="platform" index="06" label="Built on Nexus" tier={SECTION_TIERS.platform}>
        <p className="al-intro" {...reveal()}>
          {BUILT_ON_NEXUS.lede}
        </p>
        <div className="al-bon">
          {BUILT_ON_NEXUS.products.map((product, i) => {
            const ink = prismBrandPacks[product.pack as PrismPackId].ink.dark;
            return (
              <a
                className="al-bon__card"
                key={product.id}
                href={product.url}
                {...reveal(i * 60)}
                style={{ '--al-ink': ink } as CSSProperties}
              >
                <span className="al-bon__dot" aria-hidden />
                <span className="al-bon__name">{product.name}</span>
                <span className="al-bon__tagline">{product.tagline}</span>
              </a>
            );
          })}
        </div>
        <p className="al-caption" {...reveal()}>
          {BUILT_ON_NEXUS.body}
        </p>
      </Section>

      {/* Closing CTA band. */}
      <section className="al-cta">
        <div className="al-shell" {...reveal()}>
          <h2 className="al-display al-display--md">{FINAL_CTA.h2}</h2>
          <p className="al-lede al-lede--center">{FINAL_CTA.body}</p>
          <div className="al-cta-row al-cta-row--center">
            <Button type="primary" size="large" href={FINAL_CTA.primary.href}>
              {FINAL_CTA.primary.label}
            </Button>
            <Button size="large" href={FINAL_CTA.secondary.href}>
              {FINAL_CTA.secondary.label}
            </Button>
          </div>
          <p className="al-caption al-caption--center">{FINAL_CTA.footnote}</p>
        </div>
      </section>
    </div>
  );
}
