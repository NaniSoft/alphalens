import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid';
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack';
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';
import { Card, CardTitle } from '@nanisoft/prism-ui/components/card';
import { Text } from '@nanisoft/prism-ui/components/typography';

export function Good() {
  return (
    <DSStack>
      <Text tone="muted">Registered asset, approved variant.</Text>
      <DSGrid columns={2}>
        <Card>
          <CardTitle>Feed</CardTitle>
          <DSImage src="/assets/dashboard.webp" variant="hero" alt="Dashboard" width={1152} height={648} />
        </Card>
      </DSGrid>
    </DSStack>
  );
}
