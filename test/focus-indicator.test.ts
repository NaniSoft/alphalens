import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Zero-custom-UI: the focus indicator belongs to the DS, and this site ships
 * no stylesheet that could compete with it. The absence IS the law now.
 */
const ROOT = path.resolve(__dirname, '..');

function stylesheets(): string[] {
  const found: string[] = [];
  const visit = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) visit(full);
      else if (entry.endsWith('.css')) found.push(full);
    }
  };
  for (const r of ['app', 'components']) visit(path.join(ROOT, r));
  return found;
}

describe('the sitewide focus indicator', () => {
  it('has no site stylesheet that could draw or suppress one', () => {
    expect(stylesheets()).toEqual([]);
  });

  it('has no :focus rule anywhere in app/components source', () => {
    for (const f of ['app', 'components', 'lib'].flatMap((r) => {
      const dir = path.join(ROOT, r);
      const out: string[] = [];
      const visit = (d: string) => {
        if (!existsSync(d)) return;
        for (const e of readdirSync(d)) {
          const full = path.join(d, e);
          if (statSync(full).isDirectory()) visit(full);
          else if (e.endsWith('.css')) out.push(full);
        }
      };
      visit(dir);
      return out;
    })) {
      const css = readFileSync(f, 'utf8');
      expect(css).not.toMatch(/:focus/);
    }
  });
});
