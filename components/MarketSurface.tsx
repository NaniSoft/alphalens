import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid';
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack';
import { FactList } from '@nanisoft/prism-ui/components/fact-list';
import { Status } from '@nanisoft/prism-ui/components/status';
import { Text } from '@nanisoft/prism-ui/components/typography';

/**
 * The hero's market surface: one minute of the capture path, as a contract.
 *
 * DS-only composition (DSStack, DSGrid, FactList, Status, Text). The twelve
 * decorative tick bars (grid-cols-12) were domain geometry the DSGrid count
 * (1–4) cannot express (GAP-03, docs/DS_GAPS.md); the surface now states the
 * same fact in words (11 chain + 1 batched call) and keeps the field contract
 * as a FactList. No prices are drawn, and the disclosure stays visible.
 */
const FIELDS = [
  ['ts_utc', 'one timestamp'],
  ['symbol', 'NSE:NIFTY'],
  ['category', 'price, chain'],
  ['source', 'the collector'],
  ['ltp', 'last traded'],
  ['bid / ask', 'at capture'],
  ['volume', 'traded'],
  ['oi', 'open interest'],
] as const;

export function MarketSurface() {
  return (
    <DSStack gap="md">
      <DSGrid columns={2} gap="sm">
        <Status tone="neutral" label="one market minute" size="sm" />
        <Status tone="neutral" label="11 + 1 calls" size="sm" />
      </DSGrid>

      <FactList
        label="Contract fields"
        facts={FIELDS.map(([field, meaning]) => ({ label: field, value: meaning }))}
      />

      <Text tone="muted" size="sm">
        09:15 to 15:30 IST. The contract, field by field. No market values are drawn.
      </Text>
    </DSStack>
  );
}
