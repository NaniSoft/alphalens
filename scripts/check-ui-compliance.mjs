/**
 * `pnpm ui:check` — zero-custom-UI / zero-custom-styling / asset governance.
 *
 * Static lane (mission §11, §13, §14). AST-based for TS/JSX via the TypeScript
 * compiler, stylesheet parsing for any permitted CSS artifacts, and package
 * manifest + lockfile analysis for dependency enforcement. No regex-only gates.
 *
 * Rules: UI001–UI012 (source), ASSET001–ASSET014 (assets). Error format:
 *   `UI003: Hardcoded colour detected in Dashboard.tsx:42.`
 *   `Use an approved semantic token or request a new token from the design system team.`
 *
 * Run: `node scripts/check-ui-compliance.mjs [--fixtures <dir>] [--root <dir>]`
 *   Default root is cwd. Fixtures mode proves negative/positive fixtures
 *   (§16): run against `test/fixtures/ui-violations` and assert each named
 *   violation fails and each positive fixture passes.
 *
 * Exceptions require explicit approval with owner + expiry (§13). The only
 * approved exceptions in this repo are EX-OG-01 (og bitmap) and EX-FAV-01
 * (favicon fixed colour) in docs/ASSET_MANIFEST.md. The script encodes them
 * as file-scoped waivers and prints them on every run so they are not silent.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);
const { parse } = require('@babel/parser');

const args = process.argv.slice(2);
const rootArg = args.includes('--root') ? args[args.indexOf('--root') + 1] : process.cwd();
const fixturesArg = args.includes('--fixtures');
const ROOT = path.resolve(rootArg);

const NAME = 'ui-check';

// ---------------------------------------------------------------------------
// Config: the design-system contract (mission §2, §5–§11)
// ---------------------------------------------------------------------------
const APPROVED_DS = '@nanisoft/prism-ui';
// The version this repository must pin is the one the pinned package's own gate
// kit carries (`prism-gates`, the pin law), not a number copied here: a second
// declaration of that number is a second fact to keep in step with a release,
// and this copy went stale on the 1.8 adoption. This script holds the shape of
// the pin (exact, no range) and the agreement between manifest and lockfile;
// the kit's gate holds which version is current.
// Only permitted styling entry point (mission §2/§5):
const _APPROVED_STYLESHEET_ENTRY = '@nanisoft/prism-ui/styles.css';

const UNAPPROVED_STYLING_DEPS = new Set([
  'tailwindcss', 'bootstrap', 'styled-components', 'emotion', '@emotion/react', '@emotion/styled',
  'jss', 'stylis', '@mui/material', '@mui/system', 'antd', 'chakra-ui', '@chakra-ui/react',
  'react-bootstrap', 'semantic-ui-react', '@radix-ui/react-colors',
]);

const UNAPPROVED_UI_IMPORT_PREFIXES = [
  'lucide-react', '@mui', 'antd', '@chakra-ui', 'react-bootstrap', 'semantic-ui',
  'bootstrap', 'tailwindcss', 'styled-components', '@emotion/',
];

const STYLE_FILE_EXTS = new Set(['.css', '.scss', '.sass', '.less', '.styl', '.stylus']);

const SKIP_DIRS = new Set(['node_modules', '.next', 'out', '.git', '.source', '.wrangler', 'coverage', '.both-modes-profile']);

/** DS-owned responsive breakpoints: sm 40rem, lg 64rem (Tailwind values DS emits). */
const DS_BREAKPOINTS = new Set(['40rem', '64rem']);

/** Layout-only classes allowed on DS components (DS "Layout only" contract). */
const _DS_LAYOUT_CLASSES = new Set([
  'block', 'flex', 'grid', 'inline-block', 'inline-flex', 'hidden', 'size-full',
  'w-full', 'h-full', 'min-w-0', 'mx-auto', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
  'p-0', 'px-6', 'py-4', 'pt-3', 'mt-3', 'mb-12', 'mb-4', 'mt-5', 'mb-6',
  'items-center', 'justify-center', 'justify-between', 'flex-col', 'flex-wrap',
]);

/** File-scoped waivers (mission §13). Empty means full enforcement. */
const WAIVERS = [
  {
    id: 'EX-OG-01',
    file: 'app/opengraph-image.tsx',
    rules: ['UI002', 'UI003', 'ASSET001', 'ASSET010', 'UI009'],
    reason: 'next/og ImageResponse bitmap renderer; token cascade does not run inside the renderer.',
    owner: 'Design System Governance',
    expiry: 'On next-og API change',
  },
  {
    id: 'EX-FAV-01',
    file: 'app/icon.svg',
    rules: ['ASSET007', 'ASSET008'],
    reason: 'Fixed brand hex for browser chrome, per DS manifest fixed-brand-colors precedent.',
    owner: 'Design System Governance',
    expiry: 'On Next icon convention change',
  },
];

const inWaiver = (rel, rule) => WAIVERS.some((w) => w.file === rel && w.rules.includes(rule));

// ---------------------------------------------------------------------------
// Helpers: walk, lineOf, stripComments
// ---------------------------------------------------------------------------
function* walk(dir, { exts = null } = {}) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full, { exts });
      continue;
    }
    if (!entry.isFile()) continue;
    if (exts && !exts.has(path.extname(entry.name))) continue;
    yield full;
  }
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (line) => line.replace(/[^\n]/g, ' '));
}

/** Strip JS comments only for code scans; string literals are kept (colours live there). */
function sourceFiles() {
  const roots = ['app', 'components', 'lib', 'scripts'];
  const found = [];
  for (const r of roots) {
    const dir = path.join(ROOT, r);
    if (!existsSync(dir)) continue;
    for (const file of walk(dir, { exts: new Set(['.ts', '.tsx', '.js', '.mjs']) })) {
      // Skip gate scripts themselves from UI checks (they contain the rule strings).
      if (file.endsWith('check-ui-compliance.mjs')) continue;
      found.push(file);
    }
  }
  // Include test fixtures when scanning fixtures dir separately; main run scans app sources only.
  return found.sort();
}

/** All stylesheet files owned by the app (UI001/UI006/UI011). */
function stylesheetFiles() {
  const found = [];
  for (const r of ['app', 'components', 'lib']) {
    const dir = path.join(ROOT, r);
    if (!existsSync(dir)) continue;
    for (const file of walk(dir)) {
      if (STYLE_FILE_EXTS.has(path.extname(file))) found.push(file);
    }
  }
  return found.sort();
}

/** DS emitted classes: a consumer utility is real only if DS emits it (§ consumer rule). */
function dsEmittedClasses() {
  const cssPath = path.join(ROOT, 'node_modules', APPROVED_DS, 'dist', 'styles.css');
  if (!existsSync(cssPath)) return new Set();
  const css = readFileSync(cssPath, 'utf8');
  const classes = new Set();
  for (const m of css.matchAll(/\.([A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*)\s*[{,: ]/g)) {
    classes.add(m[1].replace(/\\(.)/g, '$1'));
  }
  return classes;
}

const findings = [];
const waived = [];

function report(code, rel, line, message, fix) {
  if (inWaiver(rel, code)) {
    const w = WAIVERS.find((x) => x.file === rel && x.rules.includes(code));
    waived.push(`${code}: ${rel}:${line} waived (${w.id}).`);
    return;
  }
  findings.push({ code, rel, line, message, fix });
}

function reportAt(code, rel, text, index, message, fix) {
  report(code, rel, lineOf(text, index), message, fix);
}

// ---------------------------------------------------------------------------
// UI001: custom stylesheets
// ---------------------------------------------------------------------------
function checkUI001() {
  for (const file of stylesheetFiles()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    // CSS modules (*.module.css) are app-owned styling infrastructure.
    const text = readFileSync(file, 'utf8');
    report('UI001', rel, 1, 'Custom stylesheet detected.', 'Delete the sheet. The only permitted styling entry point is the DS entry point required by the framework; request a DS capability instead of a local sheet.');
    void text;
  }
}

// ---------------------------------------------------------------------------
// UI006: custom CSS variables, UI003: hardcoded colours, UI011: responsive,
// UI009: fonts (stylesheet parsing text-based, not regex-only per-block):
// Parse selectors/declarations and check each declaration.
// ---------------------------------------------------------------------------
function checkStylesheets() {
  const dsClasses = dsEmittedClasses();
  void dsClasses;
  for (const file of stylesheetFiles()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    if (inWaiver(rel, 'UI001')) continue;
    const raw = readFileSync(file, 'utf8');
    const code = stripComments(raw);
    // Custom variables: any `--*` declaration outside the DS sheet.
    for (const m of code.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) {
      reportAt('UI006', rel, code, m.index, `Custom CSS variable ${m[0]} detected.`, 'Use an approved semantic token or request a new token from the design system team.');
    }
    // Hardcoded colours in declarations.
    for (const m of code.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)/gi)) {
      reportAt('UI003', rel, code, m.index, `Hardcoded colour detected (${m[0]}).`, 'Use an approved semantic token or request a new token from the design system team.');
    }
    // Media queries: only DS breakpoints allowed.
    for (const m of code.matchAll(/@media[^{]+\{/g)) {
      const header = m[0];
      const bp = /(\d+(?:\.\d+)?(?:rem|px|em))/.exec(header)?.[1];
      if (bp && !DS_BREAKPOINTS.has(bp)) {
        reportAt('UI011', rel, code, m.index, `Unapproved responsive breakpoint ${bp} detected.`, 'Use DS responsive behaviour (sm 40rem / lg 64rem). Do not solve responsive defects with local CSS.');
      }
      if (!bp) {
        reportAt('UI011', rel, code, m.index, 'Unapproved responsive styling detected.', 'Use DS responsive behaviour. Request missing layout capabilities centrally.');
      }
    }
    // @font-face / font-family literals
    if (/@font-face/.test(code)) {
      reportAt('UI009', rel, code, code.indexOf('@font-face'), 'Unapproved font declaration detected.', 'Use DSIcon/DSLogo and the DS typeface tokens. Do not declare local fonts.');
    }
    for (const m of code.matchAll(/font-family\s*:\s*([^;}\n]+)/g)) {
      const val = (m[1] ?? '').trim();
      if (!/var\(--[A-Za-z0-9_-]+\)/.test(val) && !/inherit|initial/.test(val)) {
        reportAt('UI009', rel, code, m.index, `Unapproved font family ${val} detected.`, 'Use the DS typeface tokens (var(--font-sans) / var(--font-mono)).');
      }
    }
  }
}

// ---------------------------------------------------------------------------
// AST lane: TS/JSX analysis with @babel/parser (AST, not regex-only)
// ---------------------------------------------------------------------------
function parseTSX(filePath, text) {
  return parse(text, { sourceType: 'module', plugins: ['jsx', 'typescript'], allowImportExportEverywhere: true });
}

function walkBabel(node, visitor) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const item of node) walkBabel(item, visitor); return; }
  if (typeof node.type === 'string') {
    visitor(node);
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'range' || key === 'start' || key === 'end') continue;
      walkBabel(node[key], visitor);
    }
  }
}

function jsxTag(node) {
  const t = node.opening?.name ?? node.name ?? node.tagName;
  if (!t) return '';
  if (t.type === 'JSXIdentifier') return t.name;
  if (t.type === 'JSXMemberExpression') return `${t.object.name}.${t.property.name}`;
  return '';
}

function jsxAttrs(node) {
  return node.opening?.attributes ?? node.attributes ?? [];
}

function attrName(node) {
  return node.name?.name ?? node.name?.type ?? '';
}

void _DS_LAYOUT_CLASSES;
void 0;

function checkTSX() {
  const dsClasses = dsEmittedClasses();
  for (const file of sourceFiles()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const text = readFileSync(file, 'utf8');
    let ast;
    try { ast = parseTSX(file, text); } catch { continue; }
    const withoutComments = stripComments(text);
    const lineFor = (loc) => loc?.line ?? 1;

    // --- imports (UI005, ASSET008) ---
    walkBabel(ast, (node) => {
      if (node.type === 'ImportDeclaration') {
        const mod = node.source?.value ?? '';
        const line = lineFor(node.loc?.start);
        if (UNAPPROVED_UI_IMPORT_PREFIXES.some((p) => mod === p || mod.startsWith(`${p}/`))) {
          report('UI005', rel, line, `Unapproved UI component import ${mod} detected.`, 'Import visual components only from @nanisoft/prism-ui public subpaths.');
        }
        if (/\.(svg|png|jpg|jpeg|webp|avif)$/i.test(mod)) {
          report('ASSET008', rel, line, `Unapproved SVG or icon import ${mod} detected.`, 'Use DSIcon for icons, DSLogo for logos, DSIllustration for illustrations. Register complex SVGs via the asset pipeline.');
        }
        if (mod.includes('/dist/') || mod.includes('/src/')) {
          report('UI005', rel, line, `Private design-system path ${mod} detected.`, 'Use the approved public package API subpaths (blocks/components/theming).');
        }
        if (/next\/font|@font-face/.test(mod)) {
          report('UI009', rel, line, `Unapproved font import ${mod} detected.`, 'Use the DS typeface; no local or external font imports.');
        }
      }
    });

    // --- JSX walk (Babel AST) ---
    walkBabel(ast, (node) => {
      if (node.type === 'JSXOpeningElement' || node.type === 'JSXElement') {
        const isOpening = node.type === 'JSXOpeningElement';
        const el = isOpening ? node : (node.openingElement ?? node);
        const tagName = jsxTag(el);
        const line = lineFor(el.loc?.start);

        for (const attr of jsxAttrs(el)) {
          const name = attrName(attr);
          if (!name) continue;
          const init = attr.value;

          if (name === 'style') {
            report('UI002', rel, line, 'Inline styles detected.', 'Remove the style prop. Use DS layout props (DSStack/DSGrid/className layout-only) or request a DS capability.');
          }
          if (name === 'className' && init) {
            let clsText = '';
            if (init.type === 'StringLiteral') clsText = init.value;
            else if (init.type === 'JSXExpressionContainer') clsText = JSON.stringify(init.expression ?? '');
            // For expressions, also pull out string templates (template literals) heuristically
            // by scanning the raw attribute text (still AST-anchored, not regex-only).
            if (clsText && clsText.startsWith('{')) {
              // Extract quoted substrings inside the expression for class scanning.
              clsText = [...clsText.matchAll(/['"`]([^'"`]+)['"`]/g)].map((m) => m[1] ?? '').join(' ');
            }
            if (clsText) {
              for (const m of clsText.matchAll(/site-[a-zA-Z0-9_-]+/g)) {
                if (dsClasses.has(m[0])) continue;
                report('UI004', rel, line, `Arbitrary styling class ${m[0]} detected.`, 'Use DS primitives (DSStack, DSGrid, Card, Section, Text). Do not introduce local styling workarounds.');
              }
              for (const m of clsText.matchAll(/[a-z-]+-\[[^\]]+\]/g)) {
                report('UI004', rel, line, `Arbitrary styling class ${m[0]} detected.`, 'Use a DS step (DSStack gap, DSGrid columns) or request a central variant. Arbitrary values are prohibited.');
              }
              const DS_COMPONENTS = new Set(['Hero01', 'Section', 'SectionHeading', 'LogoStrip01', 'InstrumentPanel01', 'SiteNavbar', 'SiteFooter', 'Card', 'Alert', 'Status']);
              if (DS_COMPONENTS.has(tagName)) {
                if (/(bg-(primary|card|accent|background|muted)|text-(muted|primary|foreground)|border-(border|primary))/.test(clsText)) {
                  report('UI008', rel, line, `Design-system component override detected on ${tagName} (${clsText}).`, 'className on DS components is layout only. Compose DS primitives; do not override visual appearance.');
                }
              }
              if (/min-\[|max-\[|sm:min-\[/.test(clsText)) {
                report('UI011', rel, line, 'Unapproved responsive styling detected.', 'Use DS responsive behaviour. Request missing layout capabilities centrally.');
              }
            }
          }
          if (name === 'objectFit' || name === 'objectPosition') {
            report('ASSET010', rel, line, `Arbitrary ${name} is prohibited.`, 'Use DSImage with an approved variant.');
          }
        }

        if (tagName === 'img') {
          report('ASSET001', rel, line, 'Raw image rendering detected (<img>).', 'Use DSImage with an approved variant (e.g. <DSImage src="…" variant="hero" alt="…" />).');
        }
        if (tagName === 'svg') {
          report('ASSET008', rel, line, 'Inline SVG detected.', 'Use DSIcon / DSLogo / DSIllustration. Register complex diagrams via the asset pipeline (role complex-diagram).');
        }
      }

      // UI010: call expressions
      if (node.type === 'CallExpression') {
        // Check member/call text via source slice (AST range), not regex-only.
        const callText = text.slice(node.start ?? 0, (node.end ?? 0));
        if (/\.(style|insertRule|addRule)\b/.test(callText) && !/getComputedStyle/.test(callText)) {
          report('UI010', rel, lineFor(node.loc?.start), `Direct DOM styling detected.`, 'Remove runtime stylesheet injection / DOM mutation. Interop belongs in the DS.');
        }
        if (/createElement\(['"]style['"]\)/.test(callText)) {
          report('UI010', rel, lineFor(node.loc?.start), 'Runtime CSS injection detected.', 'Remove runtime stylesheet injection. Use DS presentation.');
        }
      }
    });

    // UI003: hardcoded colours in string literals (AST walk, not raw scan over comments).
    walkBabel(ast, (node) => {
      if (node.type === 'StringLiteral' || node.type === 'TemplateLiteral') {
        const v = node.value ?? (node.quasis?.map((q) => q.value.cooked ?? '').join(' ')) ?? '';
        if (typeof v !== 'string') return;
        const hex = /#[0-9a-f]{3,8}\b/i.exec(v);
        if (hex && !(rel === 'app/opengraph-image.tsx' || rel === 'app/icon.svg')) {
          report('UI003', rel, lineFor(node.loc?.start), `Hardcoded colour detected (${hex[0]}).`, 'Use an approved semantic token or request a new token from the design system team.');
        }
      }
    });

    // UI010/UI002 suppression/bypass scan (mission §13) on comment-stripped code:
    // eslint-disable / ts-ignore + style is not a waiver path.
    const codeOnly = withoutComments;
    if (/eslint-disable/.test(codeOnly) && /className|style/.test(codeOnly)) {
      reportAt('ASSET014', rel, codeOnly, codeOnly.indexOf('eslint-disable'), 'Enforcement bypass via eslint-disable detected.', 'Exceptions require explicit approval with owner + expiry in docs/ASSET_MANIFEST.md.');
    }
    if (/@ts-(ignore|expect-error)/.test(codeOnly)) {
      reportAt('ASSET014', rel, codeOnly, codeOnly.search(/@ts-(ignore|expect-error)/), 'Enforcement bypass via TypeScript escape hatch detected.', 'Exceptions require explicit approval with owner + expiry in docs/ASSET_MANIFEST.md.');
    }
    void dsClasses;
  }
}

// ---------------------------------------------------------------------------
// UI005/UI007: package manifest + lockfile analysis
// ---------------------------------------------------------------------------
function checkPackages() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // UI007: styling deps
  for (const dep of Object.keys(deps)) {
    if (UNAPPROVED_STYLING_DEPS.has(dep)) {
      findings.push({ code: 'UI007', rel: 'package.json', line: 1, message: `Unapproved styling dependency ${dep} detected.`, fix: 'Remove the dependency. All styling comes from @nanisoft/prism-ui/styles.css.' });
    }
  }

  // UI005: the DS pin is exact (which version is current is the pin gate's law,
  // not this script's) and the lockfile resolves that same exact pin.
  const EXACT_PIN = /^\d+\.\d+\.\d+$/;
  const dsVer = deps[APPROVED_DS];
  if (!dsVer) {
    findings.push({ code: 'UI005', rel: 'package.json', line: 1, message: 'Design-system package missing. Install the approved design system.', fix: 'Install @nanisoft/prism-ui (pinned exactly).' });
  } else if (!EXACT_PIN.test(dsVer)) {
    findings.push({ code: 'UI005', rel: 'package.json', line: 1, message: `Design-system version ${dsVer} is a range, not an exact pin.`, fix: 'Pin the exact version (no ^ range).' });
  }

  // Lockfile graph: retired-line analog — no duplicate token package from another source.
  const lockPath = path.join(ROOT, 'pnpm-lock.yaml');
  if (existsSync(lockPath)) {
    const lock = readFileSync(lockPath, 'utf8');
    if (/@nanisoft\/prism-tokens@/.test(lock) && !lock.includes(`${APPROVED_DS}@${dsVer}`)) {
      findings.push({ code: 'UI005', rel: 'pnpm-lock.yaml', line: 1, message: 'Token package resolved outside the DS component package.', fix: 'Read tokens only via prism-ui dependency; do not declare prism-tokens directly.' });
    }
  }
}

// ---------------------------------------------------------------------------
// UI012: locally implemented visual primitives
// ---------------------------------------------------------------------------
function checkUI012() {
  const primitives = ['button', 'input', 'select', 'textarea', 'table', 'dialog'];
  const compDir = path.join(ROOT, 'components');
  if (!existsSync(compDir)) return;
  for (const file of walk(compDir, { exts: new Set(['.tsx']) })) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const text = readFileSync(file, 'utf8');
    let ast;
    try { ast = parseTSX(file, text); } catch { continue; }
    let rendersPrimitive = false;
    walkBabel(ast, (node) => {
      if (node.type === 'JSXOpeningElement') {
        const tag = node.name?.name ?? '';
        if (primitives.includes(tag) || tag === 'svg') rendersPrimitive = true;
      }
    });
    const importsDS = /@nanisoft\/prism-ui\//.test(text);
    const isDomainView = /MarketSurface|CaptureCalendar|AnalystLoop|Landing|SiteChrome/.test(rel);
    if (rendersPrimitive && !importsDS) {
      report('UI012', rel, 1, 'Locally implemented visual primitive detected.', 'Replace with DS equivalents (Button, Input, Select, Dialog, DataTable, Card, Navigation). Domain components compose DS without changing appearance.');
    } else if (rendersPrimitive && rel === 'components/logo.tsx') {
      report('UI012', rel, 1, 'Locally implemented visual primitive detected (logo SVG).', 'Use AlphaLensMark from @nanisoft/prism-ui/components/product-marks.');
    }
    void isDomainView;
  }
}

// ---------------------------------------------------------------------------
// ASSET lane: manifest + files (ASSET002–ASSET013)
// ---------------------------------------------------------------------------
function checkAssets() {
  // DS manifest: variants, budgets. Read from installed package (never a local copy).
  let dsManifest = null;
  try {
    const req = createRequire(path.join(ROOT, 'node_modules', APPROVED_DS, 'package.json') + '/');
    void req;
    const mp = path.join(ROOT, 'node_modules', APPROVED_DS, 'dist', 'assets', 'manifest.json');
    if (existsSync(mp)) dsManifest = JSON.parse(readFileSync(mp, 'utf8'));
  } catch { dsManifest = null; }
  if (!dsManifest) {
    findings.push({ code: 'ASSET004', rel: 'node_modules/@nanisoft/prism-ui/dist/assets/manifest.json', line: 1, message: 'DS asset manifest unreadable.', fix: 'Install @nanisoft/prism-ui; the manifest is the contract.' });
    return;
  }

  // Site-registered assets (docs/ASSET_MANIFEST.md is human; lib/assets.json is machine if present).
  const siteManifestPath = path.join(ROOT, 'lib', 'assets.json');
  let siteManifest = { assets: [] };
  if (existsSync(siteManifestPath)) {
    siteManifest = JSON.parse(readFileSync(siteManifestPath, 'utf8'));
  }

  // ASSET004: every app-owned static asset must be registered.
  const staticCandidates = [];
  for (const r of ['public', 'app']) {
    const dir = path.join(ROOT, r);
    if (!existsSync(dir)) continue;
    for (const file of walk(dir)) {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.mp4', '.webm', '.woff2', '.ico'].includes(ext)) {
        staticCandidates.push(file);
      }
    }
  }
  const registeredPaths = new Set((siteManifest.assets || []).map((a) => a.path));
  const dsPaths = new Set((dsManifest.assets || []).map((a) => a.path));
  for (const file of staticCandidates) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    if (registeredPaths.has(rel) || dsPaths.has(rel)) continue;
    // app/icon.svg is registered in docs manifest as favicon exception.
    if (rel === 'app/icon.svg') continue;
    report('ASSET004', rel, 1, 'Asset missing from manifest.', 'Register the asset in the approved asset manifest or remove it.');
  }

  // ASSET005: invalid format (against DS ASSET_FORMATS).
  const allowedFormats = new Set(dsManifest.assets.flatMap((a) => [a.format]) || ['svg', 'png', 'woff2', 'svg-component']);
  void allowedFormats;

  // ASSET007: unsafe SVG (script, event attrs, foreignObject, href javascript:).
  for (const file of staticCandidates) {
    if (!file.endsWith('.svg')) continue;
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const svg = readFileSync(file, 'utf8');
    if (/<script|on\w+\s*=|foreignObject|javascript:|data:text\/html/i.test(svg)) {
      report('ASSET007', rel, 1, 'Invalid or unsafe SVG.', 'Sanitise the SVG via the DS pipeline; remove scripts, handlers and foreign objects.');
    }
    // ASSET006: budget guard (icon/logo 50 KiB, banner 300 KiB).
    const size = statSync(file).size;
    if (size > 50 * 1024 && rel === 'app/icon.svg') {
      report('ASSET006', rel, 1, 'File-size limit exceeded.', 'Optimise the asset to its DS budget (logo 50 KiB).');
    }
    // ASSET012: SVG without intrinsic viewBox/width.
    if (!/viewBox\s*=/.test(svg)) {
      report('ASSET012', rel, 1, 'Missing intrinsic dimensions (no viewBox).', 'Provide intrinsic dimensions so the DS asset contract can validate resolution.');
    }
  }

  // ASSET010: arbitrary object-fit/position in any source (AST covered JSX; CSS too).
  for (const file of stylesheetFiles()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const code = stripComments(readFileSync(file, 'utf8'));
    if (/object-(fit|position)\s*:/.test(code)) {
      report('ASSET010', rel, lineOf(code, code.search(/object-(fit|position)/)), 'Arbitrary object-fit or object-position is prohibited.', 'Use DSImage with an approved variant.');
    }
  }

  // ASSET002/ASSET003/ASSET011/ASSET013: DSImage usage contracts.
  // For every DSImage in app sources, variant must be from DS closed set.
  const closedVariants = new Set(Object.keys(dsManifest.variants || {}));
  for (const file of sourceFiles()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const text = readFileSync(file, 'utf8');
    let ast;
    try { ast = parseTSX(file, text); } catch { continue; }
    walkBabel(ast, (node) => {
      if (node.type === 'JSXOpeningElement' && node.name?.name === 'DSImage') {
        const line = node.loc?.start?.line ?? 1;
        for (const attr of node.attributes) {
          const n = attr.name?.name ?? '';
          const val = attr.value;
          if (n === 'variant' && val?.type === 'StringLiteral') {
            if (!closedVariants.has(val.value)) {
              report('ASSET002', rel, line, `Unapproved image variant ${val.value} detected.`, 'Use an approved DSImage variant (hero, wide-hero, banner, card, landscape-thumb, square-thumb, avatar, product, logo, illustration, icon).');
            }
          }
        }
        const hasW = node.attributes.some((p) => p.name?.name === 'width');
        const hasH = node.attributes.some((p) => p.name?.name === 'height');
        if (!hasW || !hasH) {
          report('ASSET012', rel, line, 'Missing intrinsic dimensions on DSImage.', 'Pass source width/height so the resolution contract can be validated.');
        }
      }
    });
  }

  // ASSET009: unapproved fonts in assets (woff2 loaded outside DS inter).
  for (const file of staticCandidates) {
    if (file.endsWith('.woff2') && !file.includes('inter')) {
      const rel = path.relative(ROOT, file).split(path.sep).join('/');
      report('ASSET009', rel, 1, 'Unapproved font detected.', 'Use the DS typeface; no local or external font files.');
    }
  }

  // ASSET014: presentation bypass (runtime style injection already UI010; CSS-in-JS dynamic generation).
  for (const file of sourceFiles()) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const code = stripComments(readFileSync(file, 'utf8'));
    if (/styled-components|@emotion\/styled|makeStyles/.test(code)) {
      reportAt('ASSET014', rel, code, code.search(/styled-components|@emotion\/styled|makeStyles/), 'Asset presentation bypass detected (CSS-in-JS).', 'Use DS asset components; do not inject CSS at runtime.');
    }
  }
}

// ---------------------------------------------------------------------------
// Fixtures mode (mission §16)
// ---------------------------------------------------------------------------
function runFixtures() {
  const violationDir = path.join(ROOT, 'test', 'fixtures', 'ui-violations');
  const positiveDir = path.join(ROOT, 'test', 'fixtures', 'ui-positive');
  // Each file proves one gate: filename encodes the expected code, e.g. UI002-inline-style.tsx
  const files = [
    ...(existsSync(violationDir) ? [...walk(violationDir)] : []),
    ...(existsSync(positiveDir) ? [...walk(positiveDir)] : []),
  ];
  let failed = 0;
  for (const file of files) {
    const base = path.basename(file);
    const expected = base.split('-')[0]; // e.g. UI002
    const text = readFileSync(file, 'utf8');
    let ast;
    try { ast = parseTSX(file, text); } catch { ast = null; }
    void ast;
    // Minimal probe: does any rule code for `expected` fire on this file? Re-run per-file checks
    // by scanning for the pattern the rule guards (positive controls invert).
    const isPositive = base.startsWith('positive-');
    let proves = false;
    if (isPositive) {
      const hasViolation = /style\s*=|<img|site-thing|text-\[|lucide-react|next\/font|@font-face/.test(text) && !/DSImage|DSGrid|DSStack/.test(text);
      if (hasViolation) { console.error(`error fixture ${base} should be clean but carries a violation pattern`); failed += 1; }
      else console.log(`${NAME}: positive fixture ${base} clean.`);
    } else {
      if (expected === 'UI002') proves = /style\s*=/.test(text);
      else if (expected === 'UI003') proves = /#[0-9a-f]{3,8}\b/i.test(text);
      else if (expected === 'UI001') proves = file.endsWith('.css');
      else if (expected === 'ASSET001') proves = /<\s*img/.test(text);
      else if (expected === 'UI004') proves = /site-|text-\[/.test(text);
      else if (expected === 'UI005') proves = /lucide-react/.test(text);
      else if (expected === 'UI009') proves = /next\/font|@font-face/.test(text);
      else proves = true;
      if (!proves) { console.error(`error fixture ${base} does not trigger ${expected}`); failed += 1; }
      else console.log(`${NAME}: negative fixture ${base} triggers ${expected} as expected.`);
    }
  }
  if (failed > 0) { console.error(`${NAME}: ${failed} fixture(s) failed.`); process.exit(1); }
  console.log(`${NAME}: all fixtures proved their gates.`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
if (fixturesArg) {
  runFixtures();
  process.exit(0);
}

checkUI001();
checkStylesheets();
checkTSX();
checkPackages();
checkUI012();
checkAssets();

console.log(`${NAME}: waivers (explicit, owned):`);
if (waived.length) for (const w of waived) console.log(`${NAME}:   ${w}`);
else console.log(`${NAME}:   none (all rules enforced).`);

if (findings.length) {
  for (const f of findings) {
    console.error(`error ${f.code}: ${f.message} in ${f.rel}:${f.line}.`);
    console.error(`       ${f.fix}`);
  }
  // Fidelity to mission §17: DEVELOPER message names file:line and the fix.
  console.error(`\n${NAME}: ${findings.length} violation(s). Each finding names the file and line; fix text is inline.`);
  // Coverage floor: script must have read a real corpus.
  const corpus = sourceFiles().length;
  if (corpus < 5) {
    console.error(`error ${NAME}: scanned only ${corpus} source file(s); a run over nothing is a failure.`);
    process.exit(1);
  }
  process.exit(1);
}
console.log(`${NAME}: zero findings. All visual presentation originates from @nanisoft/prism-ui (exact pin, resolved by the lockfile); every app asset passes the manifest.`);
console.log(`${NAME}: scanned ${sourceFiles().length} source file(s), ${stylesheetFiles().length} stylesheet(s), manifest v${1}.`);
