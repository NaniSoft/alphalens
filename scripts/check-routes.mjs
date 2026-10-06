/**
 * The route inventory: every address this site emits, and every published document it
 * deliberately does not emit.
 *
 * the links gate in `@nanisoft/prism-ui/gates` resolves every internal destination against the emitted routes. It
 * cannot see the other half of the question, which is the one this file exists for: a
 * **published document with no route**. Every document in `content/` is published, and
 * the destination forbids editing any of them, so a document with no address is a fact
 * about the routing rather than a content bug - and a fact nobody has written down is a
 * fact the next reader "fixes" by renaming the file.
 *
 * **The one that stays unreachable, and why.** `content/docs/index.mdx` is the
 * documentation section's own index page. `app/docs/[[...slug]]/page.tsx` is an optional
 * catch-all, and the optional root is required under `output: export` for the route to be
 * satisfiable at all, so `/docs` renders the section index this site composes in
 * `components/DocsIndex.tsx` and the document at `content/docs/index.mdx` is never
 * rendered at any address.
 *
 * The three fixes all available were rejected, and the reasons are the record:
 *
 *   - **Render the document at `/docs`.** The catch-all's own root arm is what renders
 *     there, so this is a change to the section index: a content and information-
 *     architecture decision, and the destination freezes both.
 *   - **Give the document its own route** (`/docs/introduction`, say). fumadocs gives it
 *     the route `/docs` from its own position in the corpus, and any other address is
 *     either a rewrite, which is a routing change, or a second hand-written route
 *     parallel to a generated one, which is a second place the content tree is described.
 *   - **Delete the document.** It is published copy: thirty-one documents make the
 *     corpus, and the destination says their content is exactly as it is.
 *
 * So it stays, with its frontmatter and its body intact, and the reason lives here where
 * the route inventory is read. A verifier that fixes things is not a verifier.
 *
 * The check is bidirectional, so an exemption cannot rot. Every document under
 * `content/` is either emitted at a route or listed below with a reason, and every route
 * in the inventory is a document or a declared page of this site's own. A document added
 * without a route is a finding; an inventory entry that matches nothing is a finding,
 * because a rule that fires on nothing is indistinguishable from one that found nothing.
 *
 * **A wrong link is not an entry here.** This file is about a document with no address.
 * A document that has an address and a *link* that guesses it wrongly is a different
 * defect, and `links` in the gate kit is what finds it: five documents used to link to
 * `/docs/data-contract/index`, that path was declared broken in `prism-gates.json`, and the
 * gate reported it and passed. An exemption in a data file is a rule held in two places,
 * so the five links were corrected and the entry deleted. What belongs in this file is a
 * fact about routing; what belongs in a document is a link that resolves.
 *
 * Run after `pnpm build`: node scripts/check-routes.mjs
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const NAME = 'routes';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const CONTENT = path.join(ROOT, 'content');

/**
 * Every published document this site deliberately does not emit, with the reason.
 *
 * The reason is required and must be a sentence: an entry with a short reason is a
 * decision nobody made, and this file is the only place the decision is recorded.
 */
const UNREACHABLE = [
  {
    document: 'content/docs/index.mdx',
    claimedBy: '/docs',
    reason:
      'The optional catch-all renders the section index at its own root, and the optional root is ' +
      'required under output: export for the route to be satisfiable at all. The document is published ' +
      'copy and the corpus is frozen, so it stays as a file: rendering it at /docs is a content and ' +
      'information-architecture decision, giving it a second address is a routing change, and deleting ' +
      'it is an edit to published copy. A verifier that fixes things is not a verifier.',
  },
];

/**
 * How many documents this run must read, or it is a pass having read nothing.
 *
 * On the whole corpus rather than on the documents that resolve to a route, because the
 * routed subset shrinks the moment a folder is renamed and a floor on a subset stops
 * biting exactly when the thing it guards is most likely to have moved.
 */
const MIN_DOCUMENTS = 25;

const findings = [];
const routes = new Set();
const documents = new Map();

/** Every emitted HTML file, as its route. */
(function collect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.name.endsWith('.html')) {
      const relative = path.relative(OUT, full).split(path.sep).join('/');
      routes.add(relative === 'index.html' ? '/' : `/${relative.replace(/\.html$/, '')}`);
    }
  }
})(OUT);

/**
 * Every MDX document under `content/`, as `relative path -> the route it would take`.
 *
 * A document is a `.mdx` file, and its route comes from the convention its collection
 * uses: a blog post is `content/blog/<slug>/index.mdx` and reads at `/blog/<slug>`, and a
 * documentation page is `content/docs/<section>/<page>.mdx` and reads at
 * `/docs/<section>/<page>`. Two conventions, both read from the tree rather than
 * inferred from a pattern, because a guess at the convention would answer a different
 * question from the one this gate asks.
 */
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.name.endsWith('.mdx')) continue;
    const relative = path.relative(CONTENT, path.dirname(full)).split(path.sep).join('/');
    /* Two conventions, read from the tree rather than inferred from a pattern: a blog
       post is a folder whose `index.mdx` is the post, and a documentation page is a
       file named after its own slug inside a section folder. Both routes are what the
       content pipeline emits, and guessing at either would answer a different
       question from the one this gate asks. */
    const isBlogPost = relative === 'blog' || relative.startsWith('blog/');
    const slug = entry.name.replace(/\.mdx$/, '');
    const route = isBlogPost
      ? `/${relative}/${slug === 'index' ? '' : slug}`.replace(/\/$/, '')
      : // A documentation section's own page is its folder's `index.mdx`, and the route
        // is the folder: `/docs/data-platform/index.mdx` reads at `/docs/data-platform`.
        // This used to be the reason a fifth document was linked to the guessed path
        // `/docs/data-contract/index`, and the guess was fixed in all five places, so
        // `prism-gates.json` no longer carries a destination declared broken. The
        // convention is read here because this gate is where the route inventory is,
        // not because anything is wrong with it.
        `/${[relative === 'docs' ? '' : relative, slug === 'index' ? '' : slug].filter(Boolean).join('/')}`;
    documents.set(path.relative(ROOT, full).split(path.sep).join('/'), route);
  }
})(CONTENT);

if (documents.size < MIN_DOCUMENTS) {
  console.error(
    `\n${NAME}: content/ holds ${documents.size} document(s) and this gate needs at least ${MIN_DOCUMENTS}.\n` +
      '  A renamed content root empties this run, and an emptied run reports a clean corpus.',
  );
  process.exit(1);
}

const declared = new Map();
for (const entry of UNREACHABLE) {
  if (documents.get(entry.document) === undefined) {
    findings.push(
      `${entry.document}  [stale exemption]  this file no longer holds a document, so the record of why it\n` +
        '      was unreachable is a record of nothing. Delete the entry and let the run fail if the document\n' +
        '      comes back.',
    );
    continue;
  }
  if (declared.has(entry.document)) {
    findings.push(`${entry.document}  [duplicate exemption]  listed twice, so a reader cannot tell which reason is the one.`);
    continue;
  }
  if (!entry.reason || entry.reason.trim().length < 40) {
    findings.push(
      `${entry.document}  [unreasoned exemption]  listed with no reason worth reading.\n` +
        '      This file is the only place the decision is recorded, so a one-word reason is a decision\n' +
        '      nobody made.',
    );
    continue;
  }
  if (!routes.has(entry.claimedBy) && entry.claimedBy !== '/404') {
    findings.push(
      `${entry.document}  [stale claim]  names "${entry.claimedBy}" as the route that claims it, and this\n` +
        '      build emits no such route, so the record points at an address that no longer exists.',
    );
    continue;
  }
  declared.set(entry.document, entry);
}

/* Every document is either declared-unreachable or emitted.
 *
 * The declared case is checked FIRST, deliberately. `content/docs/index.mdx` derives the
 * route `/docs`, and this build emits `/docs` - so a check that asked "is the route
 * emitted?" first would discharge the one document this file exists to record, and the
 * entry would become a decoration. The order is the whole of the assertion: this
 * document is unreachable *because* the route is claimed by something else, and that is
 * only checkable if the declaration is consulted before the route set. */
const resolved = new Set();
const unreachable = new Set();
for (const [document, route] of documents) {
  if (declared.has(document)) {
    unreachable.add(document);
    continue;
  }
  if (routes.has(route)) {
    resolved.add(document);
    continue;
  }
  findings.push(
    `${document}  [unrouted document]  would be read at "${route}" and this build emits no such route, and no\n` +
      '      entry in the inventory says why. Either it is reachable, which is a routing bug, or it is a\n' +
      '      decision, and a decision is written down in scripts/check-routes.mjs with its reason.',
  );
}

/* And every route is a document or one of this site's own pages. */
/**
 * The routes this site publishes that are not a document's route.
 *
 * `/docs` is here and is also the route that claims an unreachable document, which looks
 * like a contradiction and is not: the address is emitted by the catch-all's own root
 * arm, and `UNREACHABLE` says which document that address is *not* showing. Both facts
 * are true at once and each is a different question.
 */
const OWN_ROUTES = new Set(['/', '/about', '/blog', '/docs', '/404', '/_not-found']);
for (const route of [...routes].sort()) {
  if ([...documents.values()].includes(route)) continue;
  if (OWN_ROUTES.has(route)) continue;
  findings.push(
    `${route}  [unlisted route]  this build emits it and the inventory does not know it.\n` +
      '      A route nobody declared is a route nobody can say is supposed to exist.',
  );
}

const claimed = [...declared.entries()].map(
  ([document, entry]) => `      ${document} -> claimed by ${entry.claimedBy}`,
);

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${routes.size} emitted route(s) and ${documents.size} document(s)`,
);
console.log(`${NAME}: ${resolved.size} document(s) resolved to a route, ${unreachable.size} deliberately not`);
console.log(`${NAME}: every route this site publishes, sorted: ${[...routes].sort().join(', ')}`);
if (declared.size > 0) {
  console.log(`${NAME}: the document(s) that are published and unreachable, on purpose:`);
  for (const line of claimed) console.log(`${NAME}:${line}`);
}
console.log(
  `${NAME}: this is a comparison of two sets, so it needs no exemption list beyond the one printed above,\n` +
    '  and an entry that matches nothing is itself a finding.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\n${NAME}: a published document with no route, and a route with no declaration, are the two ways a reader\n` +
      '  arrives somewhere nobody intended. One of them is this repository\'s own recorded decision and the\n' +
      '  other is a bug; this gate tells them apart by requiring a reason.',
  );
  process.exit(1);
}

console.log(`${NAME}: every document resolves, and every exception is a written-down decision.`);
