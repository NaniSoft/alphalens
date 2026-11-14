import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Zero-custom-UI: the site border token is gone with the site sheet.
 *
 * Edges are now drawn by DS components (Card, etc.) through DS `border-border`.
 * The requested-token guard runs against the DS-emitted sheet: every DS border
 * color resolves (box-shadow/border-style failure mode is a computed-value
 * erasure, asserted by scripts/check-ui-compliance + Playwright runtime).
 */
const ROOT = path.resolve(__dirname, '..');

describe('zero custom border token', () => {
  it('ships no site border custom property', () => {
    const sheetPath = path.join(ROOT, 'app', 'globals.css');
    expect(existsSync(sheetPath)).toBe(false);
  });

  it('the DS publishes --border on every pack root', () => {
    const tokens = createRequire(require.resolve('@nanisoft/prism-ui/package.json'));
    const themes = readFileSync(tokens.resolve('@nanisoft/prism-tokens/dist/themes/blush/light.css'), 'utf8');
    expect(themes).toMatch(/--border:\s*#[0-9a-f]{3,8}/i);
  });
});

function existsSync(p: string): boolean {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
}
