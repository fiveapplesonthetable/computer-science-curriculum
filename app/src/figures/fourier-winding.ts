// Signal Processing, figure: fourier-winding.ts
// 3Blue1Brown-style Fourier winding machine: wraps x(t) = 1 + 0.5 cos(2 pi * 2 t) + 0.4 cos(2 pi * 3 t)
// around the complex origin as x(t) e^{-j 2 pi f_w t} (left panel) and plots center-of-mass magnitude
// |\hat{x}(f_w)| vs winding frequency f_w in [0.5, 4.0] (right panel).

import { responsiveSvg, s, attr, handle, row, button, formula, slider, clamp, scale, label, type Mount } from './lib';

const mount: Mount = (root) => {
  let fw = 2.0; // winding frequency

  const pad = { l: 30, r: 30, t: 30, b: 30 };
  const view = responsiveSvg(root, {
    label: 'Fourier winding machine and frequency spectrum magnitude',
    aspect: 0.45,
    minH: 230,
    maxH: 360,
  });
  const svgEl = view.el;

  const gLeft = s('g', {}, svgEl);
  const gRight = s('g', {}, svgEl);

  // Left panel: Winding
  const axX = s('line', { class: 'ax' }, gLeft);
  const axY = s('line', { class: 'ax' }, gLeft);
  const windingCurve = s('path', { class: 'curve-muted' }, gLeft);
  const comDot = s('circle', { class: 'dot-acc', r: '6' }, gLeft);
  const lblLeft = label(gLeft, 0, 0, 'Winding Plane', 'lbl-fg', 'middle');

  // Right panel: Spectrum
  const rAxX = s('line', { class: 'ax' }, gRight);
  const rAxY = s('line', { class: 'ax' }, gRight);
  const spectrumCurve = s('path', { class: 'curve' }, gRight);
  const specDot = s('circle', { class: 'dot-acc', r: '6' }, gRight);
  const lblRight = label(gRight, 0, 0, 'Center of Mass |x̂(f_w)|', 'lbl-fg', 'middle');

  const hd = handle(svgEl, {
    label: 'Winding frequency f_w',
    x: 0,
    y: 0,
    valueText: () => `f_w ${fw.toFixed(2)} Hz`,
    onDrag: (px) => {
      // map px on right panel to frequency in [0.5, 4.0]
      const x0 = view.W * 0.55;
      const x1 = view.W - pad.r;
      fw = clamp(scale(x0, x1, 0.5, 4.0).invert(px), 0.5, 4.0);
      freqSlider.set(fw);
      draw();
    },
    onKey: (dx, _dy, big) => {
      fw = clamp(fw + dx * (big ? 0.2 : 0.05), 0.5, 4.0);
      freqSlider.set(fw);
      draw();
    },
  });

  const f = formula(root);
  const r = row(root);
  const freqSlider = slider(r, {
    label: 'Winding Freq f_w',
    texLabel: 'f_w',
    min: 0.5,
    max: 4.0,
    step: 0.05,
    value: fw,
    format: (v) => v.toFixed(2) + ' Hz',
    onInput: (v) => { fw = v; draw(); },
  });
  button(r, 'Reset', () => {
    fw = 2.0;
    freqSlider.set(fw);
    draw();
  });

  const xSig = (t: number) => 1.0 + 0.5 * Math.cos(2 * Math.PI * 2 * t) + 0.4 * Math.cos(2 * Math.PI * 3 * t);

  function draw() {
    const W = view.W;
    const H = view.H;

    // Left winding plane
    const cx1 = W * 0.25;
    const cy1 = H * 0.56;
    const r1 = Math.min(W * 0.18, H * 0.32);

    attr(axX, { x1: cx1 - r1 - 12, x2: cx1 + r1 + 12, y1: cy1, y2: cy1 });
    attr(axY, { x1: cx1, x2: cx1, y1: cy1 - r1 - 10, y2: cy1 + r1 + 10 });
    attr(lblLeft, { x: cx1, y: 18 });

    // Compute winding path for x(t) e^{-j 2 pi fw t} over t in [0, 2]
    let sumX = 0;
    let sumY = 0;
    const steps = 150;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2.0; // 2 seconds duration
      const val = xSig(t);
      const angle = -2 * Math.PI * fw * t;
      const wx = val * Math.cos(angle);
      const wy = val * Math.sin(angle);
      sumX += wx;
      sumY += wy;

      const px = cx1 + wx * (r1 / 2.5);
      const py = cy1 - wy * (r1 / 2.5);
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    attr(windingCurve, { d: pts.join(' ') });

    // Center of mass
    const muX = sumX / (steps + 1);
    const muY = sumY / (steps + 1);
    const comPx = cx1 + muX * (r1 / 2.5);
    const comPy = cy1 - muY * (r1 / 2.5);
    attr(comDot, { cx: comPx, cy: comPy });

    // Right spectrum plot
    const x0 = W * 0.55;
    const x1 = W - pad.r;
    const cy2 = H * 0.56;
    const r2H = H * 0.31;

    attr(rAxX, { x1: x0, x2: x1, y1: cy2 + r2H * 0.5, y2: cy2 + r2H * 0.5 });
    attr(rAxY, { x1: x0, x2: x0, y1: cy2 - r2H - 6, y2: cy2 + r2H * 0.6 });
    attr(lblRight, { x: (x0 + x1) / 2, y: 18 });

    // Draw spectrum curve for f in [0.5, 4.0]
    const specPts: string[] = [];
    const specSteps = 100;
    let peakX = x0, peakY = cy2;
    for (let i = 0; i <= specSteps; i++) {
      const fVal = scale(0, specSteps, 0.5, 4.0)(i);
      // numerical center of mass magnitude for fVal
    let sx = 0, sy = 0;
    for (let j = 0; j <= 60; j++) {
      const t = (j / 60) * 2.0;
      const val = xSig(t);
      const angle = -2 * Math.PI * fVal * t;
      sx += val * Math.cos(angle);
      sy += val * Math.sin(angle);
    }
    const mag = Math.sqrt(sx * sx + sy * sy) / 61;
      const px = scale(0.5, 4.0, x0, x1)(fVal);
      const py = (cy2 + r2H * 0.5) - mag * r2H * 1.2;
      if (Math.abs(fVal - fw) < 0.02) {
        peakX = px;
        peakY = py;
      }
      specPts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    attr(spectrumCurve, { d: specPts.join(' ') });
    attr(specDot, { cx: peakX, cy: peakY });
    hd.move(peakX, peakY);

    const currentMag = Math.sqrt(muX * muX + muY * muY);
    f.set(`f_w = ${fw.toFixed(2)}\\text{ Hz},\\quad |\\hat{x}(f_w)| = ${currentMag.toFixed(2)}`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
