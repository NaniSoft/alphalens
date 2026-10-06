import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Two things a reader would hit and a build did not stop: a destination the corpus gets
 * wrong, and a check script that runs the wrong thing.
 *
 * **The destination.** `prism-gates.json` carried a `links.knownBroken` entry for
 * `/docs/data-contract/index`, and the `links` gate reported it and passed:
 * "declared broken, and still linked". Five documents linked to it - four in the docs
 * corpus and one in a blog post - and the entry's own reason was that fumadocs routes a
 * folder index at the folder, so the document is at `/docs/data-contract`.
 *
 * That reason is true and it is a reason about *this* corpus being frozen by the migration.
 * It does not cover four of the five: a link to a page that exists, at the address it
 * exists at, is a one-character edit to a path, and a link a reader follows to nothing is
 * not a content question at all. The fifth is a blog post this repository wrote in its
 * own voice. So the five are corrected and the exemption is deleted, and the reason the
 * entry gave for itself is worth keeping in one place: `scripts/check-routes.mjs` reads
 * the route inventory and records what is published at no address, which is a different
 * question from a link that names a folder the way a file is named.
 *
 * An exemption nobody checks is a second place a law is recorded. `prism-gates.json` is
 * this site's half of a contract that is supposed to hold data - which sheets are its own,
 * how much of them counts as read - and an entry naming one destination is a rule, held in
 * a data file, read by nobody. Deleting it is what leaves the file a data file.
 */
const ROOT = path.resolve(__dirname, '..');

/** Every source file this repository owns, plus the files that state its own contract. */
function repositoryFiles(): string[] {
  const found: string[] = [];
  const skip = new Set(['node_modules', '.git', '.next', 'out', '.wrangler', '.source', '.opencode', 'coverage']);
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else found.push(full);
    }
  };
  visit(ROOT);
  return found.sort();
}

describe('this site publishes no destination its own corpus gets wrong', () => {
  it('reads a real corpus, so the scan below is not vacuous', () => {
    const files = repositoryFiles();
    expect(files.length).toBeGreaterThan(60);
    expect(files.some((file) => file.includes(`${path.sep}content${path.sep}`))).toBe(true);
    expect(files.some((file) => file.endsWith('prism-gates.json'))).toBe(true);
  });

  it('names no internal destination that this build does not emit', () => {
    // The route itself is the convention the content pipeline follows and the one
    // `scripts/check-routes.mjs` reads: a folder's `index.mdx` is routed at its folder, so
    // `.../index.mdx` is never an address this site publishes. Asserting the specific path
    // rather than a pattern is deliberate - the path is the fact - and the pattern is what
    // catches the next document written the same way.
    const offenders: string[] = [];
    for (const file of repositoryFiles()) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(/\]\((\/docs\/[^)\s#]*)\)/g)) {
        const target = match[1] ?? '';
        if (/\/index(?:#|$)/.test(target)) {
          offenders.push(`${path.relative(ROOT, file).split(path.sep).join('/')} -> ${target}`);
        }
      }
    }
    expect(offenders, 'a document links to an address that is not a route').toEqual([]);
  });

  it('declares no destination broken, because nothing is broken and an exemption is a rule', () => {
    const gates = JSON.parse(readFileSync(path.join(ROOT, 'prism-gates.json'), 'utf8')) as {
      links?: { knownBroken?: Record<string, string> };
    };
    expect(
      Object.keys(gates.links?.knownBroken ?? {}),
      'prism-gates.json records a destination this repository gets wrong',
    ).toEqual([]);
  });

  it('keeps the routes gate honest about the one document published at no address', () => {
    // The exemption that is legitimate: `content/docs/index.mdx` has no address, because
    // the optional catch-all's root arm claims `/docs` for the section index. That is a
    // fact about this site's routing, it is recorded in the file that reads the route
    // inventory, and it is a different thing from a link pointing at the wrong path.
    const check = readFileSync(path.join(ROOT, 'scripts', 'check-routes.mjs'), 'utf8');
    expect(check, 'the unreachable-document record is gone').toContain('content/docs/index.mdx');
  });
});

describe('the check script runs the checks', () => {
  it('invokes each gate once, by its own name', () => {
    // `pnpm check` read `pnpm check:prism-gates && pnpm pnpm check:routes`. It worked, and
    // it worked by accident: pnpm reads a doubled run keyword as a command named `pnpm`
    // and resolves it, so a typo in the script that every push runs is invisible until the
    // day it is not a typo pnpm can absorb. The routes gate - this repository's own, the
    // one that is not in the kit - was one argument away from never running.
    const scripts = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    const check = scripts.scripts.check ?? '';
    expect(check, 'the check script still doubles a run keyword').not.toMatch(/\bpnpm\s+pnpm\b/);
    expect(check).toBe('pnpm check:prism-gates && pnpm check:routes');

    // And every name it invokes is a script that exists, which is the other half of the
    // same typo class: a name that has been renamed below the caller.
    for (const [, invoked] of check.matchAll(/(?:^|&&\s*)pnpm ([\w:-]+)/g)) {
      expect(Object.hasOwn(scripts.scripts, invoked ?? ''), `pnpm ${invoked} is invoked and does not exist`).toBe(
        true,
      );
    }
  });

  it('keeps the design system pinned exactly, because the gates live inside it', () => {
    // Read rather than restated: the version is another change's business and this file
    // must not become the place that holds it. What is asserted is the shape - an exact
    // version, not a range - and that the pin gate's own subject is untouched by anything
    // this repository does.
    const manifest = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(manifest.dependencies['@nanisoft/prism-ui']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.dependencies, 'the token package is declared here rather than by the component package').not.toHaveProperty(
      '@nanisoft/prism-tokens',
    );
  });
});