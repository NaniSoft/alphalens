import { DSStack } from '@nanisoft/prism-ui/components/ds-stack';
import { FactList } from '@nanisoft/prism-ui/components/fact-list';
import { Status } from '@nanisoft/prism-ui/components/status';
import { Text } from '@nanisoft/prism-ui/components/typography';

/**
 * The capture calendar: the days the collector has actually run.
 *
 * DS-only composition (DSStack, FactList, Status, Text). The four-month
 * seven-column weekday grids were domain geometry the DSGrid count (1–4)
 * cannot express (GAP-03, docs/DS_GAPS.md); the interactive MiniCalendar is
 * not used because this repository holds no client module of its own.
 * The published facts are preserved as a FactList: live since 26 August,
 * Kubernetes since 8 September, contract approved 19 September. Shading and
 * rings are replaced by Status words (never colour alone).
 */
export function CaptureCalendar() {
  return (
    <DSStack gap="md">
      <FactList
        label="Capture history"
        facts={[
          { label: 'Collector live since', value: '26 August 2026' },
          { label: 'On Kubernetes since', value: '8 September 2026' },
          { label: 'Contract approved', value: '19 September 2026' },
        ]}
      />

      <Status tone="success" label="collector live" size="sm" />
      <Status tone="info" label="8 September, on Kubernetes" size="sm" />
      <Status tone="info" label="19 September, contract approved" size="sm" />

      <Text tone="muted" size="sm">
        The collector has run since 26 August 2026. The second and third dates are the move onto
        Kubernetes and the day the unified contract was approved; the latter is approved and not yet
        collecting.
      </Text>
    </DSStack>
  );
}
