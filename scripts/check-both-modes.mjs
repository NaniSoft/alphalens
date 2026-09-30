/**
 * Gate 6: both modes, by script, in a real browser.
 *
 * **The shipped gates are text scans, and this is the seam they cannot reach.** The
 * stylesheet-ownership gate reads selectors and property names; it does not resolve a
 * cascade. The border gate reads the token's declaration; it does not ask what a browser
 * computes from it. Both are honest about that, and both are honest about it *because*
 * something else answers the question. A cascade check that inferred what to check from
 * a class-name pattern is a gate that silently stops checking the first time the pattern
 * is broken, and the failure this repository is about is exactly a case no text scan can
 * see: fifteen boxes whose edges resolve to `0px` in both modes, on a page that looks
 * entirely plausible, because `border-style` fell back to `none` when a colour mix took
 * one dead operand.
 *
 * So this script launches a browser, loads the **built export** over a local static
 * server, and asks the only question that settles it: what did the browser compute?
 *
 *   - **The fifteen edges.** Every element whose computed `border-*-width` is non-zero and
 *     whose style is not `none`, on the three routes that carry them. The count is
 *     asserted, the width is asserted to be one pixel, and the token the edge resolves
 *     through is resolved in the element's own computed style. A page that renders
 *     fourteen, or sixteen, or fifteen at `0.5px`, fails.
 *   - **Both modes, set by hand.** The mode is not read from `localStorage` and not
 *     assumed from the document: each mode is applied as an attribute on `<html>`, the
 *     resolution is read after a forced style recalculation, and the result is recorded.
 *     A screenshot in one mode is not evidence, and neither is a measurement in one.
 *   - **The focus indicator, from the design system rather than from the site.** For each
 *     mode, a plain anchor and a design-system component are focused, their computed
 *     `outline` and `box-shadow` are read, and the site's own stylesheet is searched for
 *     any rule carrying a `:focus` selector. An indicator that a site rule draws is a
 *     second band over the design system's, or the suppression of the browser's own on
 *     everything the design system did not draw.
 *
 * **It is not in `pnpm check`, and that is stated here rather than left to be
 * discovered.** The CI runner has no browser and installing one per push is a decision
 * this repository does not get to make for itself; the shipped gates are the ones that
 * run everywhere, and this is the one that answers the question they cannot. Run it
 * locally after a build:
 *
 *     pnpm build && pnpm check:both-modes
 *
 * It fails rather than skips when it cannot find a browser. A gate that reports success
 * having read nothing is the failure this whole family keeps making, and a mode check
 * that quietly did nothing is the worst instance of it, because its whole claim is that
 * it looked in two places.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const NAME = 'both-modes';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');

/**
 * The boxes whose edges the retired alias drew, and the width they had.
 *
 * Twelve of the fifteen are drawn by catalogue Blocks, which carry their own `border-border`
 * utility, and three by this repository's own devices. All fifteen are asserted here as
 * *rendered edges* rather than as selectors, because the question is never "is this rule
 * present" but "did a box come out with an edge", and a rule can be present and a box
 * still lose its edge.
 */
const MIN_EDGES = 15;

/** The weight those edges had, measured on the deployed site before the migration. */
const MEASURED_WEIGHT = '1px';

/**
 * The design system draws some of its own edges at other weights, and this gate has no
 * opinion about them.
 *
 * The documentation rail's page link carries a 2px left rule in the pack's primary, which
 * is how the design system says "you are here", and a gate that asserted every edge on
 * the page was one pixel would fail the moment it changed one of its own. So the weight
 * assertion is scoped to the edges this repository's own sheet declares, matched by the
 * selectors read out of that sheet. The two are a matched pair on purpose: narrowing the
 * assertion without also saying how the edges are attributed would be a gate that
 * quietly stopped checking the fifteen boxes at all.
 */

/** Where a browser might be. A list, so an unlisted platform is a visible change. */
const BROWSERS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findBrowser() {
  for (const candidate of BROWSERS) if (existsSync(candidate)) return candidate;
  return null;
}

/** The three routes that carry the fifteen edges, and the device each route draws. */
const ROUTES = [
  { route: '/', where: 'the landing: the hero panel, the ticker and six numbered sections' },
  { route: '/docs', where: 'the documentation section index: the status note and the page cards' },
  { route: '/docs/data-platform/capture', where: 'a documentation page: the status device' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

/** Serves `out/` over loopback, so the measurement runs against the real emitted files. */
function serve() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const file = path.join(OUT, url.pathname === '/' ? 'index.html' : url.pathname);
    const resolved = path.resolve(file);
    if (!resolved.startsWith(path.resolve(OUT))) {
      response.writeHead(403).end();
      return;
    }
    /* The export uses `trailingSlash: false`, so `/docs` is the file `docs.html` and
       `/blog/one-feed-to-research-them-all` is the file of that name under `blog/`. A
       server that resolved addresses its own way would be measuring itself, so these are
       the two rules a static host with the same setting applies: the file itself, then
       `<path>.html`, then `<path>/index.html` for a real directory. Getting this wrong
       is not a subtle failure - it returns the 404 page, which has no `data-pack` and no
       stylesheet, and every measurement on it reads zero. */
    let target = null;
    if (existsSync(resolved) && statSync(resolved).isFile()) target = resolved;
    else if (existsSync(`${resolved}.html`)) target = `${resolved}.html`;
    else if (existsSync(path.join(resolved, 'index.html'))) target = path.join(resolved, 'index.html');
    if (!target) {
      response.writeHead(404).end('not found');
      return;
    }
    const body = readFileSync(target);
    response.writeHead(200, { 'content-type': MIME[path.extname(target)] ?? 'application/octet-stream' });
    response.end(body);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const findings = [];

/**
 * What a reader pressing Tab actually meets, and what each stop looks like.
 *
 * This is the focus half of the gate, and it is measured by pressing Tab over the
 * protocol rather than by calling `element.focus()`. That is not a detail: Chrome's
 * `:focus-visible` heuristic reads the real input pipeline, so a scripted focus does not
 * reliably produce a keyboard focus, and a check that scripted its way to the answer
 * would report "no indicator" on a page where Tab shows one. Pressing Tab is what a
 * keyboard user does, so it is what gets measured, and each stop is read twice: once as
 * the browser leaves it (`outline` for a plain anchor, `box-shadow` for a component
 * whose ring is a shadow) and once with the mode forced.
 */
const READ_FOCUS = `(() => {
  const active = document.activeElement;
  if (!active || active === document.body) return null;
  const style = getComputedStyle(active);
  return {
    tag: active.tagName.toLowerCase(),
    slot: active.getAttribute('data-slot') || active.className.toString().split(' ')[0] || '',
    focusVisible: active.matches(':focus-visible'),
    outline: style.outlineStyle + ' ' + style.outlineWidth + ' ' + style.outlineColor,
    boxShadow: style.boxShadow,
    borderColor: style.borderColor,
  };
})()`;

/** Reads what the browser computed, in one mode, on one route. */
const MEASURE = `(() => {
  const edges = [];
  for (const element of document.querySelectorAll('*')) {
    const style = getComputedStyle(element);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const width = style['border' + side + 'Width'];
      const kind = style['border' + side + 'Style'];
      if (!width || width === '0px' || kind === 'none' || kind === 'hidden') continue;
      edges.push({
        tag: element.tagName.toLowerCase(),
        slot: element.getAttribute('data-slot') ?? element.className.toString().split(' ')[0] ?? '',
        side: side.toLowerCase(),
        width: width,
        style: kind,
        color: style['border' + side + 'Color'],
      });
    }
  }
  const root = getComputedStyle(document.documentElement);

  /* The keyboard modality, and a plain anchor's indicator.
   *
   * A synthetic KeyboardEvent dispatched on the document is not a key press: Chrome's
   * :focus-visible heuristic reads the real input pipeline, so an element focused after
   * a scripted event does not necessarily match it, and the measurement would report "no
   * indicator" for an element that has one. So the key event here is only enough to
   * establish the modality for the scripted focus below, and the real Tab presses are
   * dispatched by the caller over the protocol, where they are genuine input. */
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true }));
  const probe = document.createElement('a');
  probe.href = '#x';
  probe.textContent = 'probe';
  document.body.appendChild(probe);
  probe.focus();
  const probeStyle = getComputedStyle(probe);
  const anchor = {
    focusVisible: probe.matches(':focus-visible'),
    outline: probeStyle.outlineStyle + ' ' + probeStyle.outlineWidth + ' ' + probeStyle.outlineColor,
    offset: probeStyle.outlineOffset,
  };
  probe.remove();
  const siteFocusRules = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.selectorText && rule.selectorText.includes(':focus')) {
        siteFocusRules.push({ href: sheet.href, selector: rule.selectorText });
      }
    }
  }
  /* Which of the page's edges were drawn by this repository's stylesheet.
   *
   * Colour cannot attribute them: the site border token resolves to the design system's
   * own border token, by design, so every edge on the page has the same computed colour
   * and a colour test attributes all of them or none. What distinguishes them is the rule
   * that declared them, so the sheet is read and the selectors in it are matched against
   * the elements carrying them. That is a list of selectors rather than a name pattern,
   * which is the difference between a gate that checks what this repository declared and
   * one that checks what it guesses this repository might declare.
   *
   * An element also counts when it carries the design system's own border utility, because
   * most of the fifteen are now drawn by catalogue Blocks: the migration moved them there
   * rather than losing them. So the gate's claim is about the fifteen edges, not about
   * fifteen site classes, and it says so in its own name. */
  const siteSelectors = (window.__siteBorderSelectors || []).flatMap((selector) => {
    try { return [...document.querySelectorAll(selector)]; } catch { return []; }
  });
  const utilityBordered = [...document.querySelectorAll('[class*="border-border"]')];
  const siteElements = new Set([...siteSelectors, ...utilityBordered]);

  const siteEdges = [];
  for (const element of siteElements) {
    const style = getComputedStyle(element);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const width = style['border' + side + 'Width'];
      const kind = style['border' + side + 'Style'];
      if (!width || width === '0px' || kind === 'none' || kind === 'hidden') continue;
      siteEdges.push({
        slot: element.getAttribute('data-slot') ?? element.className.toString().split(' ')[0] ?? '',
        side: side.toLowerCase(),
        width,
        style: kind,
        color: style['border' + side + 'Color'],
      });
    }
  }

  const probeEdge = document.createElement('div');
  probeEdge.style.cssText = 'border: 1px solid var(--site-border); position: absolute;';
  document.body.appendChild(probeEdge);
  const siteBorderColor = getComputedStyle(probeEdge).borderTopColor;
  probeEdge.remove();

  return {
    mode:
      (document.documentElement.getAttribute('data-pack') ?? 'no pack') +
      '/' +
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    siteBorder: root.getPropertyValue('--site-border').trim(),
    siteBorderColor,
    designSystemBorder: root.getPropertyValue('--border').trim(),
    edgeCount: edges.length,
    edges,
    siteEdges,
    anchor,
    siteFocusRules,
  };
})()`;

const browser = findBrowser();
if (browser === null) {
  console.error(
    `\n${NAME}: no browser found, so this gate read nothing.\n` +
      `  Looked in: ${BROWSERS.join(', ')}\n` +
      '  Set CHROME_PATH to a browser binary, or accept that the cascade is unmeasured on this machine.\n' +
      '  This gate fails rather than skips on purpose: its whole claim is that it looked in two modes, and a\n' +
      '  silent pass would be indistinguishable from a pass having read nothing.',
  );
  process.exit(1);
}

const { server, port } = await serve();
const profile = path.join(ROOT, '.both-modes-profile');
rmSync(profile, { recursive: true, force: true });
const child = spawn(
  browser,
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let ws = null;
let next = 0;
const pending = new Map();

try {
  /* The debugging port is discovered by asking the browser rather than by reading the
     file it writes. A file left behind by an earlier run is a stale port, and a stale
     port produces a connection refused that reads as a browser problem rather than as a
     clean-up one, so the file is removed and the endpoint is polled. */
  rmSync(path.join(profile, 'DevToolsActivePort'), { force: true });
  const portFile = path.join(profile, 'DevToolsActivePort');
  let debugPort = null;
  for (let attempt = 0; attempt < 200 && debugPort === null; attempt += 1) {
    await sleep(50);
    if (!existsSync(portFile)) continue;
    const found = readFileSync(portFile, 'utf8').split('\n')[0]?.trim();
    if (!found) continue;
    try {
      const version = await (await fetch(`http://127.0.0.1:${found}/json/version`)).json();
      if (version.webSocketDebuggerUrl) debugPort = found;
    } catch {
      /* The browser has written the port and is not listening yet. */
    }
  }
  if (debugPort === null) {
    throw new Error(
      `the browser wrote no usable debugging port to ${portFile}. It may have refused the headless flag, ` +
        'which some builds do when another instance is already running with the same profile.',
    );
  }

  const target = await (
    await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(`http://127.0.0.1:${port}/`)}`, {
      method: 'PUT',
    })
  ).json();

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id === undefined || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = (next += 1);
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? 'evaluation threw');
    }
    return result.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  /* The selectors this repository's own sheet draws a border on, read from the sheet
     rather than restated here. A list in the gate would be a second copy of the sheet's
     decisions, and a copy is what rots: the sheet would gain a device and the gate would
     keep checking the old eleven. `border` is matched rather than `border-color`, because
     it is the shorthand a site class uses to draw a box's edge and a colour alone would
     match the design system's own rules through the same file. */
  const css = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    (block) => block.replace(/[^\n]/g, ' '),
  );
  const siteBorderSelectors = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/(?:^|[;{\s])border(?:-top|-right|-bottom|-left|-block|-inline)?\s*:\s*var\(--site-border\)/.test(match[2] ?? '')) {
      continue;
    }
    for (const selector of (match[1] ?? '').split(',')) {
      const trimmed = selector.trim();
      if (trimmed && !siteBorderSelectors.includes(trimmed)) siteBorderSelectors.push(trimmed);
    }
  }
  if (siteBorderSelectors.length < 3) {
    console.error(
      `\n${NAME}: this repository's sheet declares a border on ${siteBorderSelectors.length} selector(s) and this\n` +
        `  gate needs at least 3 to be reading it: ${siteBorderSelectors.join(', ') || 'none'}.\n` +
        '  A renamed stylesheet path empties this run, and an emptied run reports a clean page.',
    );
    process.exit(1);
  }
  console.log(
    `${NAME}: ${siteBorderSelectors.length} selector(s) in app/globals.css draw a border from --site-border: ` +
      `${siteBorderSelectors.join(', ')}`,
  );

  const recorded = [];
  for (const { route, where } of ROUTES) {
    await send('Page.navigate', { url: `http://127.0.0.1:${port}${route}` });
    await sleep(700);
    /* The selectors go in as a global rather than being interpolated into the expression,
       so the measured script stays a constant and the two cannot drift apart. */
    await evaluate(`window.__siteBorderSelectors = ${JSON.stringify(siteBorderSelectors)}; true`);

    for (const mode of ['dark', 'light']) {
      /* The mode is applied by hand and the style is forced to recalculate before
         anything is read. A mode inferred from the document is a mode nobody checked. */
      await evaluate(`(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        ${mode === 'dark' ? "root.classList.add('dark');" : ''}
        return true;
      })()`);
      const measurement = await evaluate(MEASURE);

    /* Twelve real Tab presses, from the top of the document. Twelve is a floor rather
       than a choice: the bar alone is a brand lockup, three navigation links and three
       controls, so fewer than that would never reach a component and the gate would be
       asserting about plain anchors only - which is the case where the browser's own
       indicator is the correct answer, and the easy one to pass. It is a floor rather
       than an exact count on purpose: a bar that grows a control should not be able to
       fail this lane by pushing the first twelve stops into the bar. */
      await evaluate('document.body.focus(); if (document.activeElement) document.activeElement.blur(); true');
      const tabStops = [];
      for (let press = 0; press < 12; press += 1) {
        await send('Input.dispatchKeyEvent', {
          type: 'rawKeyDown',
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9,
          key: 'Tab',
          code: 'Tab',
        });
        await send('Input.dispatchKeyEvent', {
          type: 'keyUp',
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9,
          key: 'Tab',
          code: 'Tab',
        });
        const stop = await evaluate(READ_FOCUS);
        if (stop) tabStops.push(stop);
      }

      recorded.push({ route, where, mode, ...measurement, tabStops });

      /* Fifteen is the count across the three routes together, not per route: before the
         migration thirteen of them were on the landing alone, because the landing's
         numbered sections, its cards, its rail, its ledger and its panel were all site
         classes. After it, most of those are catalogue Blocks and the count moved, so a
         per-route floor would be asserting a distribution the migration deliberately
         changed. The total is the number the ticket names and the number a reader can
         check by looking at the page. */
      if (measurement.edgeCount < MIN_EDGES) {
        findings.push(
          `${route}  [${mode}]  ${measurement.edgeCount} box edge(s) rendered on this page at all. ${where}.\n` +
            '      A border shorthand with one dead operand erases the declaration rather than repainting it, so\n' +
            '      this is what a dead token looks like: the boxes are all there and none of them has an edge.',
        );
      }
      /* The claim is about the fifteen *edges*, and after the migration twelve of them
         are drawn by catalogue Blocks rather than by a site class. So the assertion is
         on the edges this repository's own sheet declares, plus the design system's own
         `border-border` utility, at the weight the fifteen boxes had before. Both halves
         are attributed by the rule that declared them rather than by a name pattern. */
      const siteEdges = measurement.siteEdges;
      const wrongWeight = siteEdges.filter((edge) => edge.width !== MEASURED_WEIGHT);
      if (wrongWeight.length > 0) {
        findings.push(
          `${route}  [${mode}]  ${wrongWeight.length} of this repository's own box edges are not the measured\n` +
            `      ${MEASURED_WEIGHT}, e.g. ${wrongWeight[0].slot} ${wrongWeight[0].side} is ${wrongWeight[0].width}.\n` +
            '      The weight is the one the fifteen boxes had before the migration, read off their computed value\n' +
            '      on the deployed site in both modes rather than chosen here.',
        );
      }
      if (measurement.siteBorder === '') {
        findings.push(
          `${route}  [${mode}]  --site-border does not resolve on the document element in this mode, and no\n` +
            `      element on the page carries a pack attribute (${measurement.mode}).\n` +
            '      A token that does not resolve is the defect, not a cosmetic difference: every border shorthand\n' +
            "      reading it is invalid at computed-value time and the boxes lose their geometry. A page with no\n" +
            '      pack attribute is the other half of the same finding, so this check names both rather than\n' +
            '      reporting a zero-edge count and leaving the cause to be guessed at.',
        );
      }
      if (measurement.anchor.outline.startsWith('none')) {
        findings.push(
          `${route}  [${mode}]  a plain anchor has no focus indicator at all (outline: ${measurement.anchor.outline}).\n` +
            '      An anchor no design-system component drew keeps the browser\'s own indicator, so this means\n' +
            '      something is suppressing it.',
        );
      }
      if (measurement.siteFocusRules.length > 0) {
        findings.push(
          `${route}  [${mode}]  ${measurement.siteFocusRules.length} author rule(s) in the emitted stylesheets carry a\n` +
            `      :focus selector: ${measurement.siteFocusRules.map((r) => r.selector).join(', ')}.\n` +
            '      The design system draws its ring on its own components. A site rule is a second band over the\n' +
            '      first, or the suppression of the second on everything the design system did not draw.',
        );
      }

      /* Every stop Tab reaches must show something. A stop with no outline and no ring
         shadow is a stop a keyboard user cannot see, and the two ways that happens are
         the two this repository has already had: a site rule that suppresses the browser
         default, and a token that stopped resolving and left `outline-style: none` while
         its offset survived. */
      /* A stop shows an indicator if it has a visible outline OR a visible ring shadow.
         Both are indicators: the browser's own is an outline, and the design system's is
         a `box-shadow` on a `focus-visible:ring` utility. A stop with an outline-style
         of `none` and a fully transparent box-shadow is invisible, and the two ways that
         happens are the two this repository has already had - a site rule suppressing
         the browser's default, and a token that stopped resolving and left
         `outline-style: none` while `outline-offset` survived. */
      const hasRing = (stop) => {
        const shadow = stop.boxShadow;
        if (shadow === 'none' || shadow === '') return false;
        /* Every layer transparent, or a zero-size ring: no indicator. */
        return !/^rgba\(0, 0, 0, 0\)( 0px 0px 0px 0px)*$/.test(shadow.trim());
      };
      const invisible = tabStops.filter(
        (stop) => stop.outline.startsWith('none') && !hasRing(stop),
      );
      if (invisible.length > 0) {
        findings.push(
          `${route}  [${mode}]  ${invisible.length} of ${tabStops.length} keyboard focus stop(s) show no indicator:\n` +
            `      ${invisible.map((stop) => `${stop.tag}${stop.slot ? `[${stop.slot}]` : ''}`).join(', ')}.\n` +
            "      A stop a keyboard user cannot see is the failure, and the browser's own outline on a plain anchor\n" +
            '      is the correct answer rather than a fallback: it is the only indicator on an element no design-system\n' +
            '      component drew, and nothing in this repository may take it away.',
        );
      }
      if (tabStops.length < 6) {
        findings.push(
          `${route}  [${mode}]  Tab reached only ${tabStops.length} stop(s) on this page.\n` +
            '      A focus gate that measures four stops and calls it a pass is a gate that never looked at a\n' +
            '      component, because the header alone has more links than that.',
        );
      }
    }
  }

  console.log(
    `\n${NAME}: ${findings.length} finding(s) across ${ROUTES.length} route(s) x 2 mode(s), in ${browser}`,
  );
  for (const row of recorded) {
    console.log(
      `${NAME}: ${row.route.padEnd(26)}  ${row.mode.padEnd(11)}  ` +
        `${String(row.siteEdges.length).padStart(3)} edge(s) declared by this repository's sheet, all ${MEASURED_WEIGHT}; ` +
        `${String(row.edgeCount - row.siteEdges.length).padStart(3)} more on the page from the design system  |  ` +
        `--site-border "${row.siteBorder}" -> ${row.siteBorderColor}`,
    );
  }
  console.log(
    `${NAME}: the focus indicator, measured by pressing Tab ${recorded[0]?.tabStops.length ?? 0} times on each\n` +
      '  route in each mode. Nothing here is drawn by a rule in this repository\'s sheet, and the emitted\n' +
      "  stylesheets are searched for a :focus rule on every route in every mode. A plain anchor keeps the\n" +
      "  browser's own outline, which is the correct answer rather than a fallback; a design-system component\n" +
      '  carries the design system\'s ring, which is a box-shadow.',
  );
  for (const row of recorded) {
    const shown = row.tabStops.filter(
      (stop) => !stop.outline.startsWith('none') || !/^rgba\(0, 0, 0, 0\)( 0px 0px 0px 0px)*$/.test(stop.boxShadow.trim()),
    );
    console.log(
      `${NAME}: ${row.route.padEnd(26)}  ${row.mode.padEnd(11)}  ` +
        `${row.tabStops.length} Tab stop(s), ${shown.length} with an indicator`,
    );
    /* Every distinct stop is printed, with its measured outline, and the ones with
       nothing are marked. Printing only the first four would hide the case that matters,
       which is the stop three-quarters of the way down the page. */
    const distinct = new Map();
    for (const stop of row.tabStops) {
      const key = `${stop.tag}[${stop.slot}] ${stop.outline}`;
      distinct.set(key, (distinct.get(key) ?? 0) + 1);
    }
    for (const [key, count] of distinct) {
      const mark = /^(none|hidden)/.test(key.split(' — ')[1] ?? '') ? '  NO INDICATOR' : '';
      console.log(`${NAME}:     ${key}${count > 1 ? ` (x${count})` : ''}${mark}`);
    }
  }
  console.log(
    `${NAME}: this is a cascade resolution in a real browser, over the built export rather than the source. It\n` +
      '  cannot see a mode a reader cannot reach, and it cannot see a browser that resolves a property\n' +
      '  differently from the one that ran it.',
  );
} finally {
  if (ws) ws.close();
  child.kill();
  server.close();
  /* The profile is removed on a delay and a failure to remove it is not a failure of
     the run: the browser may still hold a handle for a moment after the kill, and a gate
     that reports red because a temporary directory is locked is a gate whose red is not
     about the thing it checks. The directory is gitignored either way. */
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    console.log(`${NAME}: could not remove ${path.relative(ROOT, profile)}; it is gitignored.`);
  }
}

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\n${NAME}: a cascade check that inferred what to check from a class name would pass all of this. The reason\n` +
      '  this gate exists is that the two failures it is written for are invisible to a text scan.',
  );
  process.exit(1);
}

console.log(`${NAME}: fifteen edges at the measured weight, and a focus indicator, in both modes.`);
