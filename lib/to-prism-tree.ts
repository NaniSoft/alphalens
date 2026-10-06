/**
 * The app-side reader of fumadocs' page tree, and the only place this repository
 * walks one.
 *
 * `toPrismTree()` maps the tree onto the Prism-owned `DocsNavEntry[]`, so prism-ui
 * never sees a fumadocs type. `toIndexSections()` reads the same tree a second way,
 * for this site's own `/docs` index. They live together because they are two readings
 * of one structure: a place that knows how a fumadocs node states its own words and
 * where it lives belongs in one file, and two files that each walk the tree are two
 * places where the walk can quietly disagree with itself.
 */
import type { DocsNavEntry } from '@nanisoft/prism-ui/pages';
import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import type { ReactNode } from 'react';

/** The file name a folder's own page takes, relative to that folder. */
const FOLDER_PAGE = 'index.mdx';

/**
 * A tree node's own words.
 *
 * A `ReactNode` is not a label, and this is the one place that turns one into a string
 * for both of the tree's readers. A string and a number are the only two things a
 * node's field can hold that a reader reads as words; everything else - a fragment, an
 * element, an array, `null`, `undefined`, a boolean - is either a container or React's
 * own way of writing nothing, and none of it is a name.
 *
 * `String(value)` would print `[object Object]` for the containers, and an empty field
 * resolves here to the empty string, which is the second half of the same defect: the
 * built export's empty `<h2>` and its empty `data-slot="docs-nav-label"` span were both
 * a field the reader was given nothing to print and a template that printed it anyway.
 */
function nodeText(value: ReactNode | undefined): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  return '';
}

/** A node's name, as the words a reader reads. `''` when the tree gives it none. */
export function nodeName(node: { name?: ReactNode }): string {
  return nodeText(node.name);
}

/** A node's description, as the words a reader reads. `''` when the tree gives it none. */
export function nodeDescription(node: { description?: ReactNode }): string {
  return nodeText(node.description);
}

/**
 * The tree as the documentation rail draws it.
 *
 * AlphaLens files its documentation as six sections named for subject matter, four of
 * which describe a pipeline rather than a topic. **A section is a label, not a
 * control.** That is the arrangement Prism's `DocsShell` JSDoc states as its reason for
 * existing, and it is why a group here never carries an `href`.
 *
 * A section's own page is still in the tree: it is the first page under the section,
 * with its real address, so every route a reader has ever bookmarked is still one click
 * away. What the section heading is *not* is a second link to that same page, because a
 * section is a place in a sequence and a link is an invitation to jump into it out of
 * order. A badge, a number beside the heading or a collapse control would say the same
 * thing again, so there is none; the honesty status is words inside the title, and
 * Prism reads no parentheses, matches no vocabulary and renders no pill.
 *
 * The retired line spelled the same fact as `url: ''` and then carried a stylesheet rule
 * styling the resulting anchor-with-no-href back into a label, with `pointer-events:
 * none` to stop it being clickable. That was a control that could not be operated and a
 * destination a reader could reach and not follow, and the pointer-events rule is the
 * clearest evidence that the markup was lying about itself. Naming the case in the type
 * makes those two rules dead rather than load-bearing, and the type is the only place
 * that had to change: `href` is simply absent.
 *
 * The entries are the three shapes Prism renders rather than one shape with optional
 * fields, and a page in the navigation always has a destination, because a page that
 * goes nowhere is an entry a reader can focus and not follow.
 */
export function toPrismTree(children: Node[]): DocsNavEntry[] {
  const entries: DocsNavEntry[] = [];
  for (const node of children) {
    /* A rule between entries, carrying a name that is usually empty. It is a label and
       never a link, which is the one thing it is for. */
    if (node.type === 'separator') {
      entries.push({ type: 'divider', title: nodeName(node) });
      continue;
    }
    if (node.type === 'folder') {
      /* No `href`, ever, and that is the whole arrangement.
       *
       * All six sections here hold an `index.mdx`, so the section's own page is already
       * in `node.children` and is rendered as the first page under the section, with its
       * real address. An `href` on the group would be a *second* link to that same page:
       * the section heading and the section's first entry would both go to
       * `/docs/data-platform`. Two destinations to one place reads as a mistake, and a
       * reader who takes the wrong one cannot tell they were sent somewhere they had
       * already been.
       *
       * So the section heading is a label, and the label says the truth about what a
       * section is: a place in the sequence, not a page a reader can jump into out of
       * order. A group *with* an `href` renders an anchor, which is a control; a group
       * without one renders a span, which is a label. That is the difference, and it is
       * one property's absence.
       */
      entries.push({
        type: 'group',
        title: nodeName(node),
        items: toPrismTree(node.children),
      });
      continue;
    }
    entries.push({ type: 'page', title: nodeName(node), href: node.url });
  }
  return entries;
}

/** One document as the `/docs` index draws a card for it. */
export interface DocsIndexPage {
  title: string;
  description: string;
  url: string;
}

/** One section of the `/docs` index: a label, and the documents filed under it. */
export interface DocsIndexSection {
  title: string;
  pages: DocsIndexPage[];
}

/**
 * The corpus as this site's `/docs` index draws it: one section per folder, in the
 * tree's order, named by the tree.
 *
 * **This is derived from the tree, never from the URL.** The URL is a route and the
 * tree is the structure; a page filed under a section by its path is a page whose
 * section changes when a folder is renamed, and its heading changes with it. Three
 * defects were one line of URL splitting, and all three are named here because each of
 * them is a different way of being wrong:
 *
 *   - **The heading was the slug.** `page.url.split('/')[2]` printed
 *     `data-contract` over a section the rail beside it, and the section's own
 *     `meta.json`, both call `Unified data contract (approved)`. An index whose own
 *     headings are worse names than its own navigation is the index being the worst
 *     label on the page. The name is `nodeName(node)`, and fumadocs fills it from the
 *     folder's `meta.json` title, which is the same string the rail and the breadcrumbs
 *     use. One tree, one name, three surfaces that cannot disagree.
 *   - **The root document produced an empty heading.** `content/docs/index.mdx` routes
 *     at `/docs`, so the segment above is `undefined`, and `?? ''` printed an empty
 *     `<h2>` in the index body and an empty `data-slot="docs-nav-label"` in the rail. A
 *     heading with no words is not a heading, and the `?? ''` is what stopped it from
 *     being a build failure.
 *   - **Every section listed itself.** A folder's own page is the page the folder
 *     routes at, so grouping by path put `Data platform` under `Data platform`, and
 *     six sections each ended in a card that duplicated their own heading. `isFolderPage`
 *     below is the whole of that fix.
 *
 * **A page with no folder above it is not listed.** The section heading is this index's
 * only structure, so a document that is not filed in a section has no heading to sit
 * under and printing it anyway would put it under whatever section happened to come
 * first. In this corpus that document is `content/docs/index.mdx`: it is the
 * Introduction, the route `/docs` is claimed by the section index this very component
 * renders, and `scripts/check-routes.mjs` records that it is deliberately published at
 * no address. So the honest rendering of it is its absence, and the alternative - a card
 * whose `href` is the page the reader is already on - is a link that goes nowhere.
 *
 * **Nothing is sorted.** The corpus is a sequence and this reads it as one: the sections
 * come in the order the root `meta.json` publishes them between its rules, and the
 * documents inside a section in the order that section's own `meta.json` lists them. That
 * is the order every documentation page's rail already uses, so the index and the rail
 * beside it now agree; and it is the order a reader is meant to work in, because four of
 * these six sections are the pipeline the data platform feeds. Sorting the flat list by
 * title before grouping - which is what the caller used to do, and what this component's
 * own comment claimed it did not - produced a section order derived from whichever
 * section happened to hold the alphabetically first title, so `research-directions` came
 * before `data-platform` and the pipeline ran backwards.
 */
export function toIndexSections(tree: Root): DocsIndexSection[] {
  const sections: DocsIndexSection[] = [];
  for (const node of tree.children) {
    /* A rule between sections and a page with no section above it are both not-a-section,
       and this index has one heading per section and nothing to hang a heading-less page
       under. See above for what the root document is and why it is not listed. */
    if (node.type !== 'folder') continue;

    const pages: DocsIndexPage[] = [];
    for (const child of node.children) {
      if (child.type !== 'page') continue;
      if (isFolderPage(node, child)) continue;
      pages.push({
        title: nodeName(child),
        description: nodeDescription(child),
        url: child.url,
      });
    }
    sections.push({ title: nodeName(node), pages });
  }
  return sections;
}

/**
 * Whether a page inside a folder is that folder's own page.
 *
 * Two answers, because fumadocs publishes two. It keeps a folder's own page in
 * `Folder.index` when the folder's `meta.json` does not list it among `pages`, and it
 * puts the same node at the head of `children` instead. Every section here *does* list it,
 * so `Folder.index` is absent and the second answer is the one that runs; both are here
 * because a corpus that stopped listing its folder's own page must not get its own page
 * back as a card under its own heading, and this is the check that decides it either way.
 *
 * The second answer reads the tree's own file path rather than the page's address. The
 * URL would answer a different question - it would say where the page is published, which
 * is the one fact here that is deliberately not derived from the URL - and a slug that
 * happened to equal the folder name would be indistinguishable from a folder index.
 */
function isFolderPage(folder: Folder, page: Item): boolean {
  if (folder.index !== undefined && folder.index === page) return true;
  const folderPath = folder.$ref?.folder;
  return folderPath !== undefined && page.$ref === `${folderPath}/${FOLDER_PAGE}`;
}
