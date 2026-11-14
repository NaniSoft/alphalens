import { Diagram } from '@nanisoft/prism-ui/components/diagram';
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack';
import { Text } from '@nanisoft/prism-ui/components/typography';

/**
 * The research loop: four analysts, a trader, a risk gate and a reflector.
 *
 * DS-only composition (Diagram + DSStack + Text). The hand-drawn 1200x420 SVG
 * and its mobile fallback list are replaced by Diagram, which scrolls sideways
 * at a legible floor on narrow screens and draws the reflector edge as the
 * indirect (dashed) relation that makes a second run differ from the first.
 * No inline style remains (the reflector pulse origin hack is gone).
 */
const NODES = [
  { id: 'market', name: 'Market', subtitle: 'OHLCV, indicators', x: 0, y: 0.3 },
  { id: 'sentiment', name: 'Sentiment', subtitle: 'social posts', x: 0, y: 0.7 },
  { id: 'news', name: 'News', subtitle: 'company and macro', x: 0.5, y: 0.3 },
  { id: 'fundamentals', name: 'Fundamentals', subtitle: 'filings, statements', x: 0.5, y: 0.7 },
  { id: 'trader', name: 'Trader', subtitle: 'one debate round', x: 0.75, y: 0.4 },
  { id: 'risk', name: 'Risk', subtitle: 'oversight', x: 0.95, y: 0.4 },
  { id: 'reflector', name: 'Reflector', subtitle: 'memory', x: 0.95, y: 0.7, emphasis: true },
] as const;

const RELATIONS = [
  { from: 'market', to: 'trader', label: 'context' },
  { from: 'sentiment', to: 'trader', label: 'context' },
  { from: 'news', to: 'trader', label: 'context' },
  { from: 'fundamentals', to: 'trader', label: 'context' },
  { from: 'trader', to: 'risk', label: 'review' },
  { from: 'risk', to: 'reflector', label: 'outcome' },
  { from: 'reflector', to: 'market', label: 'memory', indirect: true },
] as const;

export function AnalystLoop() {
  return (
    <DSStack gap="md">
      <Diagram
        label="The designed research loop: market, sentiment, news and fundamentals analysts feed a trader, a risk gate reviews the trader, and a reflector writes the outcome back to the analysts."
        nodes={[...NODES]}
        relations={[...RELATIONS]}
      />
      <Text tone="muted" size="sm">
        The research pipeline, as designed. No agent runs today, and no research output exists. The
        dashed edge is the memory the reflector writes for the next run.
      </Text>
    </DSStack>
  );
}
