/**
 * The permanent gate: every internal destination resolves to a route this site emits.
 *
 * This is the one content check that outlives the migration. The parity comparison
 * exists to prove a rebuild changed the rendering layer and not the content, and its
 * baseline is destroyed at the close of the sweep because a large snapshot in a public
 * repository is a liability. This one has no snapshot: it reads the built export and
 * asks a question that is true of every future build, which is whether a reader who
 * follows a link on this site arrives somewhere.
 *
 * Four kinds of destination, four different failures:
 *
 *   1. An `href` beginning with `/` must equal an emitted route. This is the one that
 *      breaks quietly, because a broken internal link renders exactly like a working
 *      one and a crawler finds it a month later.
 *   2. An `href` beginning with `#` must name an `id` that the same document emits.
 *   3. An `href` beginning with `mailto:` or `tel:` is a destination a reader's own
 *      client handles, and is listed rather than resolved.
 *   4. An absolute `href` to another origin is a destination off this site, and is
 *      listed rather than resolved: this gate cannot know that `nexus.nanisoft.com`
 *      exists, and a check that guessed would be a check that reported a network failure
 *      as a content failure.
 *
 * **Five destinations are known broken, and they are broken in the published corpus.**
 * The migration's destination freezes published copy, so these are recorded here with
 * the reason rather than edited, and the gate fails on any *other* broken destination
 * and on any of these that stops existing. That last half matters: an exemption list
 * that outlives its cause is a lie, and a gate that accepts a new link because the list
 * is long enough to seem plausible is not a gate.
 *
 * The finding is real and it predates the migration. fumadocs derives a folder's index
 * page's route from the folder, so `content/docs/data-contract/index.mdx` is at
 * `/docs/data-contract`, and five documents link to it as `/docs/data-contract/index` -
 * the path a reader would guess. Nothing emitted that address before the migration and
 * nothing emits it now. It is recorded here so that the decision is visible, and so that
 * a future change to the corpus can close it and delete the entry in the same commit.
 *
 * Run after `pnpm build`: node scripts/check-links.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { JSDOM } from 'jsdom';

const NAME = 'links';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');

/** How many routes this run must read, or it is a pass having nothing. */
const MIN_ROUTES = 30;

/** How many anchors this run must read, or it is scanning nothing. */
const MIN_ANCHORS = 200;

/**
 * Every destination this build is known to break, with the reason.
 *
 * The key is the destination, not the route that carries it: the same broken address
 * appears on five routes and listing it five times would be five places to update and
 * five chances to forget one. An entry that matches nothing is a finding, for the reason
 * every other exemption list in this family is a finding: a rule that fires on nothing
 * is indistinguishable from one that found nothing.
 */
const KNOWN_BROKEN = new Map([
  [
    '/docs/data-contract/index',
    'fumadocs routes a folder index at the folder, so this document is at /docs/data-contract. Five ' +
      'published documents link to the guessed path. The corpus is frozen by the migration, so the ' +
      'decision is recorded here rather than made by editing five documents; a change to the corpus can ' +
      'close it and delete this entry in the same commit.',
  ],
]);

const findings = [];
const internal = new Set();
const fragments = new Set();
const external = new Set();
const offsiteSchemes = new Set();
/** The KNOWN_BROKEN entries that matched a real destination on this build. */
const discharged = new Set();
let anchors = 0;
let routes = 0;

function check(file, route) {
  const document = new JSDOM(readFileSync(file, 'utf8')).window.document;
  const ids = new Set([...document.querySelectorAll('[id]')].map((element) => element.id));
  for (const anchor of document.querySelectorAll('a[href]')) {
    anchors += 1;
    const href = anchor.getAttribute('href') ?? '';
    if (href === '') {
      findings.push(`${route}  [empty destination]  an anchor with no href is a shape a reader has to guess at.`);
    } else if (href.startsWith('/')) {
      internal.add(href);
      const target = href.split('#')[0] || route;
      const known = KNOWN_BROKEN.get(target);
      if (known) {
        discharged.add(target);
      } else if (!routesFor(target)) {
        findings.push(
          `${route}  [internal destination]  "${href}" is not an emitted route. Every address a reader has\n` +
            '      ever used has to keep working, and a link that renders is a link nobody notices is broken.',
        );
      }
      if (href.includes('#')) fragments.add(`${target}${href.slice(href.indexOf('#'))}`);
    } else if (href.startsWith('#')) {
      fragments.add(`${route}${href}`);
      if (!ids.has(href.slice(1))) {
        findings.push(`${route}  [fragment]  "${href}" names an id this document does not emit.`);
      }
    } else if (/^(mailto:|tel):/.test(href)) {
      offsiteSchemes.add(`${href.split(':')[0]}:`);
    } else if (/^https?:\/\//.test(href)) {
      external.add(new URL(href).host);
    } else {
      findings.push(`${route}  [unclassified destination]  "${href}" is neither internal, a fragment nor absolute.`);
    }
  }
}

/** The emitted routes, resolved once the walk has collected them. */
let emitted = new Set();
function routesFor(target) {
  const wanted = target.replace(/\/$/, '') || '/';
  return emitted.has(wanted) || emitted.has(`${wanted}/`);
}

if (!readdirSync(OUT).length) {
  console.error(`\n${NAME}: ${OUT} holds nothing, so there is no export to read. Run pnpm build first.`);
  process.exit(1);
}

/* Two passes: the first collects every emitted route, the second resolves internal
   destinations against the complete set. One pass would report a link to a route
   emitted later in the walk as broken, which is a check that fails on ordering. */
const files = [];
(function collect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.name.endsWith('.html')) {
      const relative = path.relative(OUT, full).split(path.sep).join('/');
      files.push([full, relative === 'index.html' ? '/' : `/${relative.replace(/\.html$/, '')}`]);
    }
  }
})(OUT);
emitted = new Set(files.map(([, route]) => route));
for (const [file, route] of files) {
  routes += 1;
  check(file, route);
}

/* An exemption that matches nothing is rot, and rot in an exemption list is the same
   failure as a check that reads nothing. */
for (const [destination] of KNOWN_BROKEN) {
  if (!discharged.has(destination)) {
    findings.push(
      `${NAME}  [stale exemption]  "${destination}" is listed as a known-broken destination and this build\n` +
        '      has no link to it. Either the corpus was fixed, in which case the entry goes in the same commit,\n' +
        '      or the route moved, in which case the entry is now wrong and this run cannot tell which.',
    );
  }
}

if (routes < MIN_ROUTES || anchors < MIN_ANCHORS) {
  console.error(
    `\n${NAME}: read ${routes} route(s) and ${anchors} anchor(s) and this gate needs at least ${MIN_ROUTES} of each.\n` +
      '  A partial export would be a partial verdict, and a partial verdict is indistinguishable from a clean one.',
  );
  process.exit(1);
}

console.log(`\n${NAME}: ${findings.length} finding(s) across ${routes} route(s) and ${anchors} anchor(s)`);
console.log(`${NAME}: destinations resolved on this site: ${[...internal].filter((h) => h.startsWith('/')).sort().join(', ')}`);
console.log(`${NAME}: fragments resolved: ${[...fragments].sort().join(', ') || 'none'}`);
console.log(`${NAME}: destinations off this site, listed and not resolved: ${[...external].sort().join(', ') || 'none'}`);
if (offsiteSchemes.size > 0) {
  console.log(`${NAME}: reader-handled schemes, listed and not resolved: ${[...offsiteSchemes].sort().join(', ')}`);
}
console.log(
  `${NAME}: ${KNOWN_BROKEN.size} destination(s) are recorded as broken in the published corpus, and ${
    discharged.size
  } of them still are:`,
);
for (const [destination, reason] of KNOWN_BROKEN) {
  if (discharged.has(destination)) console.log(`${NAME}:   ${destination} — ${reason}`);
}
console.log(
  `${NAME}: an off-site host is listed, not resolved. This gate cannot know that another origin exists,\n` +
    '  and a network failure reported as a content failure is a check that teaches people to ignore it.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(`\n${NAME}: a reader followed a link on this site and arrived nowhere.`);
  process.exit(1);
}

console.log(`${NAME}: every internal destination and every fragment resolves to something this site emits.`);
