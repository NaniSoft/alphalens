/**
 * The app-side `toPrismTree()` adapter: fumadocs' page tree → the Prism-owned
 * `DocsNavEntry[]`. prism-ui never sees a fumadocs type.
 */
import type { DocsNavEntry } from '@nanisoft/prism-ui/pages';
import type { Folder, Item, Node, Separator } from 'fumadocs-core/page-tree';

/**
 * AlphaLens files its documentation as six sections named for subject matter, four of
 * which describe a pipeline rather than a topic rather than for a documentation genre.
 * **A section is a label, not a control.** That is the arrangement Prism's `DocsShell`
 * JSDoc states as its reason for existing, and it is why a group here never carries an
 * `href`.
 *
 * A section's own index page is still in the tree: it is the first page under the
 * section, with its real address, so every route a reader has ever bookmarked is still
 * one click away. What the section heading is *not* is a second link to that same page,
 * because a section is a place in a sequence and a link is an invitation to jump into it
 * out of order. A badge, a count or a collapse control beside the heading would say the
 * same thing again, so there is none; the honesty status is words inside the title, and
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
 * fields, and a page in the navigation always has a destination, because a page that goes
 * nowhere is an entry a reader can focus and not follow.
 */
function nodeName(node: Item | Folder | Separator): string {
  const { name } = node;
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);
  return '';
}

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
