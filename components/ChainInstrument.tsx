'use client';

// The AlphaLens hero instrument: the captured option chain as an open-interest
// profile across strikes — calls above the axis, puts below, opacity keyed to
// implied volatility, and a rose reticle sitting on ATM. A minute-scan sweeps
// the panel, one pass per capture minute's worth of patience.
//
// Template law (nanisoft-web ticket 09): the visual slot's height must be
// definite in every context. The host carries min-height in CSS and the canvas
// only ever reads the host's box — it never writes height back, so there is no
// ResizeObserver feedback loop.
//
// Colour comes from the pre-baked prism-rose-* variable rulesets via
// getComputedStyle, so the instrument re-themes with the mode swap. Rose ink
// only — this site's pack is the sole accent.

import { useEffect, useRef } from 'react';

/** A deterministic pseudo-random series — the same profile every render. */
function noise(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function buildProfile(count: number, seed: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const center = (i - (count - 1) / 2) / (count / 2);
    const bell = Math.exp(-(center * center) / 0.42);
    const wobble = 0.62 + 0.38 * noise(i, seed);
    return Math.max(0.06, bell * wobble);
  });
}

export function ChainInstrument(): React.ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let styles = getComputedStyle(host);
    const token = (name: string, fallback: string): string => styles.getPropertyValue(name).trim() || fallback;
    let ink = token('--prism-color-primary', '#F08CB4');
    let text = token('--prism-color-text', '#F5F5F7');
    let hairline = token('--prism-color-border-secondary', 'rgba(240,140,180,0.16)');

    const STRIKES = 25; // odd — there is always an ATM in the middle
    const calls = buildProfile(STRIKES, 3);
    const puts = buildProfile(STRIKES, 11);
    const ivs = Array.from({ length: STRIKES }, (_, i) => 0.42 + 0.58 * Math.abs((i - (STRIKES - 1) / 2) / (STRIKES / 2)));
    const maxOi = Math.max(...calls, ...puts);

    let raf = 0;
    let width = 0;
    let height = 0;

    const readTokens = () => {
      styles = getComputedStyle(host);
      ink = token('--prism-color-primary', ink);
      text = token('--prism-color-text', text);
      hairline = token('--prism-color-border-secondary', hairline);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readTokens();
    };

    const draw = (t: number) => {
      const padX = Math.max(18, width * 0.07);
      const padTop = Math.max(14, height * 0.1);
      const padBottom = Math.max(26, height * 0.14);
      const axisY = padTop + (height - padTop - padBottom) * 0.56;
      const usableW = width - padX * 2;
      const colW = usableW / STRIKES;
      const maxBar = (height - padTop - padBottom) * 0.42;
      const atmi = (STRIKES - 1) / 2;

      ctx.clearRect(0, 0, width, height);

      // Session grid — the minute rows the collector actually walks.
      ctx.strokeStyle = hairline;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      for (let g = 0; g <= 4; g += 1) {
        const y = padTop + ((height - padTop - padBottom) * g) / 4;
        ctx.beginPath();
        ctx.moveTo(padX * 0.4, y);
        ctx.lineTo(width - padX * 0.4, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // The zero axis.
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(padX * 0.4, axisY);
      ctx.lineTo(width - padX * 0.4, axisY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Open-interest profile: calls up, puts down, opacity = IV.
      for (let i = 0; i < STRIKES; i += 1) {
        const callOi = calls[i] ?? 0;
        const putOi = puts[i] ?? 0;
        const iv = ivs[i] ?? 0.42;
        const x = padX + colW * (i + 0.5);
        const barW = Math.max(2, Math.min(9, colW * 0.42));
        const cH = (callOi / maxOi) * maxBar;
        const pH = (putOi / maxOi) * maxBar;
        const a = 0.3 + 0.7 * (1 - Math.abs(iv - 0.42) / 0.58);

        ctx.globalAlpha = a;
        ctx.fillStyle = ink;
        ctx.fillRect(x - barW / 2, axisY - cH, barW, cH);
        ctx.globalAlpha = a * 0.55;
        ctx.fillRect(x - barW / 2, axisY, barW, pH);
      }
      ctx.globalAlpha = 1;

      // The lens — a reticle on ATM. This is the instrument's namesake.
      const atmx = padX + colW * (atmi + 0.5);
      const r = Math.max(12, Math.min(width, height) * 0.11);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(atmx, axisY, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(atmx, axisY, r * 1.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      for (const [dx, dy] of [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(atmx + dx * r * 0.55, axisY + dy * r * 0.55);
        ctx.lineTo(atmx + dx * r * 1.35, axisY + dy * r * 1.35);
        ctx.stroke();
      }

      // The max-OI beacons — the strikes the EOD summary reports.
      const maxCallIdx = calls.indexOf(Math.max(...calls));
      const maxPutIdx = puts.indexOf(Math.max(...puts));
      ctx.fillStyle = ink;
      for (const idx of [maxCallIdx, maxPutIdx]) {
        if (idx === atmi) continue;
        const callOi = calls[idx] ?? 0;
        const putOi = puts[idx] ?? 0;
        const x = padX + colW * (idx + 0.5);
        ctx.beginPath();
        ctx.arc(x, axisY - (callOi / maxOi) * maxBar - 7, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, axisY + (putOi / maxOi) * maxBar + 7, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Strike ticks + the ATM label.
      ctx.fillStyle = text;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < STRIKES; i += 4) {
        const x = padX + colW * (i + 0.5);
        ctx.fillRect(x - 0.5, axisY + Math.max(12, height * 0.06), 1, 4);
      }
      ctx.globalAlpha = 0.75;
      ctx.font = '10px var(--font-jetbrains), ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ATM', atmx, axisY + Math.max(28, height * 0.12));
      ctx.globalAlpha = 0.32;
      ctx.textAlign = 'left';
      ctx.fillText('CALLS', padX * 0.4, padTop - 4);
      ctx.textAlign = 'right';
      ctx.fillText('PUTS', width - padX * 0.4, height - 8);
      ctx.globalAlpha = 1;

      // The minute-scan — the sweep that makes it an instrument, not a chart.
      if (!reduced) {
        const band = 72;
        const period = 6000;
        const p = ((t % period) / period) * (width + band) - band;
        const grad = ctx.createLinearGradient(p - band, 0, p, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, ink);
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = grad;
        ctx.fillRect(p - band, padTop, band, height - padTop - padBottom);
        ctx.globalAlpha = 0.75;
        ctx.fillRect(p, padTop, 1, height - padTop - padBottom);
        ctx.globalAlpha = 1;
      }
    };

    const loop = (t: number) => {
      draw(t);
      if (!reduced) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(host);
    resize();
    raf = requestAnimationFrame(loop);

    // Re-read tokens when the mode class swaps on <html> (the boot script and
    // the toggle both mutate it) so the instrument re-themes without a reload.
    //
    // The re-read is deferred two frames. MutationObserver callbacks run in a
    // microtask, and Chromium has not recalculated style yet at that point: a
    // token read inside the callback still returns the OUTGOING theme, which
    // silently re-arms the old palette (ticket 11 measured it by
    // pixel-sampling; this instrument carried exactly that bug — ticket 17).
    // Two frames land after the recalc. The redraw covers reduced motion,
    // whose settled frame has no loop to pick the new palette up.
    let rethemeRaf = 0;
    const retheme = () => {
      cancelAnimationFrame(rethemeRaf);
      rethemeRaf = requestAnimationFrame(() => {
        rethemeRaf = requestAnimationFrame(() => {
          readTokens();
          draw(performance.now());
        });
      });
    };
    const mo = new MutationObserver(retheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rethemeRaf);
      ro.disconnect();
      mo.disconnect();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="al-instrument" role="img" aria-label="Illustrative open-interest profile across option strikes: call open interest above the axis, put open interest below, a reticle on the at-the-money strike, and a scan line sweeping per capture minute." />;
}
