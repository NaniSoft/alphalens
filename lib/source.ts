// Content sources — Fumadocs headless, the prism.nanisoft.com recipe.
//
// The fumadocs-mdx Macro API is compile-time: `defineDocs`/`defineCollections`
// may only appear at top level in this module with literal `dir`s, and the
// module must not re-export the macro. Frontmatter = fumadocs defaults only;
// `description` is required in practice (every page's card/index line).
//
// AlphaLens ships one docs collection (the whole corpus lives under
// `content/docs/`, grouped by `meta.json` separators) and one blog collection
// (folder-per-post under `content/blog/`).

import { defineCollections, defineDocs } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

/** The whole docs corpus (`content/docs/**`). */
export const docs = defineDocs({
  dir: 'content/docs',
});

/** Folder-per-post blog: required ISO date, display-only tags, drafts excluded. */
export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: pageSchema.extend({
    date: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export const blogSource = loader({
  baseUrl: '/blog',
  source: blog.toFumadocsSource(),
});
