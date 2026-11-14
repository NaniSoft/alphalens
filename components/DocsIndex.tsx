// The `/docs` section index: every corpus page as a DS card, grouped by the
// section it lives in. The frame is the design system's DocsShell; the grid is
// DSGrid + Card (no site stylesheet). Both halves are read from the page tree
// the content pipeline publishes, through `lib/to-prism-tree.ts`.

import type { ReactElement } from 'react';
import type { Root } from 'fumadocs-core/page-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@nanisoft/prism-ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@nanisoft/prism-ui/components/alert';
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid';
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack';
import { Heading, Text } from '@nanisoft/prism-ui/components/typography';
import { DocsShell } from '@nanisoft/prism-ui/pages';
import Link from 'next/link';

import { toIndexSections, toPrismTree } from '@/lib/to-prism-tree';

export interface DocsIndexLabels {
  nav: string;
  toc: string;
  pager: string;
}

export function DocsIndex({ tree, labels }: { tree: Root; labels: DocsIndexLabels }): ReactElement {
  const sections = toIndexSections(tree);

  return (
    <DocsShell
      title="Docs"
      description="AlphaLens in full: the live data platform, the approved data contract, the designed research pipeline, and the engineering story. Every page carries its own status label."
      nav={toPrismTree(tree.children)}
      navLabel={labels.nav}
      tocLabel={labels.toc}
      pagerLabel={labels.pager}
      pagerLabels={{ previous: 'Previous', next: 'Next' }}
    >
      <DSStack gap="lg">
        <Alert>
          <AlertTitle>Status</AlertTitle>
          <AlertDescription>
            {/* The sentence is one `p`: the description is a grid, and an inline
                run laid directly on it becomes a row of its own, which broke the
                sentence into one fragment per line. */}
            <p>
              In active development. Claims are labelled <strong>live</strong>,{" "}
              <strong>approved / designed</strong>, or <strong>research direction</strong>. The
              labels are the contract between this site and the reader.
            </p>
          </AlertDescription>
        </Alert>

        {sections.map((section) => (
          <DSStack gap="md" key={section.title}>
            <Heading as="h2">{section.title}</Heading>
            <DSGrid columns={2} gap="md">
              {section.pages.map((page) => (
                <Card key={page.url}>
                  <CardHeader>
                    <CardTitle as="h3">
                      <Link href={page.url}>{page.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Text tone="muted" size="sm">{page.description}</Text>
                  </CardContent>
                </Card>
              ))}
            </DSGrid>
          </DSStack>
        ))}
      </DSStack>
    </DocsShell>
  );
}
