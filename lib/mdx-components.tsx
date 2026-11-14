// Headless MDX component mapping. Every prose element is plain HTML styled by
// `Prose` inside DocsShell; the one mapping is `<Note>`, now DS Alert.

import type { ComponentType, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@nanisoft/prism-ui/components/alert';

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

function Note(props: { status?: string; children?: ReactNode }) {
  return (
    <Alert>
      {props.status ? <AlertTitle>{props.status}</AlertTitle> : null}
      <AlertDescription>{props.children}</AlertDescription>
    </Alert>
  );
}

export function getMdxComponents(): MdxComponentMap {
  return { Note };
}
