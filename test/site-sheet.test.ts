import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Zero-custom-UI retirement: this site ships no stylesheet.
 *
 * The site sheet (`app/globals.css`) is deleted. Every visual presentation is
 * the DS stylesheet (`@nanisoft/prism-ui/styles.css`) plus DS components.
 * jsdom cannot resolve a cascade, so the law is asserted as absence (no sheet,
 * no site classes in source, DS primitives present) rather than geometry.
 */
const ROOT = path.resolve(__dirname, '..');

function stylesheetFiles(): string[] {
  const found: string[] = [];
  const visit = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) visit(full);
      else if (/\.(css|scss|sass|less|styl|stylus)$/.test(entry)) found.push(full);
    }
  };
  for (const r of ['app', 'components', 'lib']) visit(path.join(ROOT, r));
  return found.sort();
}

describe('zero custom stylesheets', () => {
  it('ships no app stylesheet', () => {
    expect(stylesheetFiles().map((f) => path.relative(ROOT, f).split(path.sep).join('/'))).toEqual([]);
  });

  it('imports only the DS entry point in the layout', () => {
    const layout = readFileSync(path.join(ROOT, 'app', 'layout.tsx'), 'utf8');
    expect(layout).toContain('@nanisoft/prism-ui/styles.css');
    expect(layout).not.toContain('./globals.css');
  });
});
